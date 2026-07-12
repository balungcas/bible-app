import 'package:flutter/material.dart';

import '../core/gamification.dart';
import '../state/app_model.dart';
import 'community_screen.dart';
import 'journal_screen.dart';
import 'reader_screen.dart';
import 'today_screen.dart';

class HomeShell extends StatefulWidget {
  final AppModel model;
  const HomeShell({super.key, required this.model});

  @override
  State<HomeShell> createState() => _HomeShellState();
}

class _HomeShellState extends State<HomeShell> {
  int _tab = 0;

  @override
  Widget build(BuildContext context) {
    final screens = [
      TodayScreen(model: widget.model),
      ReaderScreen(model: widget.model),
      JournalScreen(model: widget.model),
      CommunityScreen(model: widget.model),
    ];
    return Scaffold(
      body: SafeArea(child: IndexedStack(index: _tab, children: screens)),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _tab,
        onDestinationSelected: (i) => setState(() => _tab = i),
        destinations: const [
          NavigationDestination(icon: Icon(Icons.wb_sunny_outlined), selectedIcon: Icon(Icons.wb_sunny), label: 'Today'),
          NavigationDestination(icon: Icon(Icons.menu_book_outlined), selectedIcon: Icon(Icons.menu_book), label: 'Read'),
          NavigationDestination(icon: Icon(Icons.edit_note_outlined), selectedIcon: Icon(Icons.edit_note), label: 'Journal'),
          NavigationDestination(icon: Icon(Icons.groups_outlined), selectedIcon: Icon(Icons.groups), label: 'Community'),
        ],
      ),
    );
  }
}

/// Shared snack helper for XP / badge / freeze feedback.
void showResultSnacks(BuildContext context, {int xpEarned = 0, List<String> newBadges = const [], int usedFreezes = 0}) {
  final messenger = ScaffoldMessenger.of(context);
  if (xpEarned > 0) {
    messenger.showSnackBar(SnackBar(content: Text('+$xpEarned XP')));
  }
  for (final code in newBadges) {
    final b = badgeByCode[code];
    messenger.showSnackBar(
        SnackBar(content: Text('${b?.icon ?? '🏅'} Badge earned: ${b?.name ?? code}')));
  }
  if (usedFreezes > 0) {
    messenger.showSnackBar(const SnackBar(content: Text('❄️ A streak freeze kept your streak safe')));
  }
}
