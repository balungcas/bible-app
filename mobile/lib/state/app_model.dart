// App-wide state: the signed-in user and their loaded game state.
// Kept deliberately simple — one ChangeNotifier, no state-management package.

import 'package:flutter/foundation.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import '../data/backend.dart';
import '../data/game_service.dart';

class AppModel extends ChangeNotifier {
  late final Backend backend;
  late final GameService game;

  String? userId;
  AppState? state;
  bool booting = true;

  AppModel() {
    backend = Backend(Supabase.instance.client);
    game = GameService(backend);
  }

  Future<void> init() async {
    try {
      userId = backend.currentUserId;
      if (userId != null) state = await game.loadState(userId!);
    } finally {
      booting = false;
      notifyListeners();
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
