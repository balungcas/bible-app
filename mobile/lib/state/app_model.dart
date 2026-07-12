// App-wide state: the signed-in user and their loaded game state.
// Kept deliberately simple — one ChangeNotifier, no state-management package.

import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import '../data/backend.dart';
import '../data/game_service.dart';

class AppModel extends ChangeNotifier {
  late final Backend backend;
  late final GameService game;

  String? userId;
  AppState? state;
  bool booting = true;

  // Theme is a device preference (shared_preferences), applied before any
  // Supabase call so it never flashes. 'system' follows the OS.
  ThemeMode themeMode = ThemeMode.system;
  static const _themeKey = 'rtcm-bible.theme';

  AppModel() {
    backend = Backend(Supabase.instance.client);
    game = GameService(backend);
  }

  Future<void> init() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      themeMode = _parseTheme(prefs.getString(_themeKey));
      userId = backend.currentUserId;
      if (userId != null) state = await game.loadState(userId!);
    } finally {
      booting = false;
      notifyListeners();
    }
  }

  Future<void> setThemeMode(ThemeMode mode) async {
    themeMode = mode;
    notifyListeners();
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_themeKey, mode.name);
  }

  ThemeMode _parseTheme(String? v) {
    switch (v) {
      case 'light':
        return ThemeMode.light;
      case 'dark':
        return ThemeMode.dark;
      default:
        return ThemeMode.system;
    }
  }

  Future<void> signIn(String name) async {
    userId = await backend.signIn(name: name);
    state = await game.loadState(userId!);
    notifyListeners();
  }

  Future<void> signOut() async {
    await backend.signOut();
    userId = null;
    state = null;
    notifyListeners();
  }

  Future<void> refresh() async {
    if (userId == null) return;
    state = await game.loadState(userId!);
    notifyListeners();
  }
}
