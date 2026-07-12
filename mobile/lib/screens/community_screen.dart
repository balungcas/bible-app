import 'package:flutter/material.dart';

import '../config.dart' as config;
import '../core/gamification.dart';
import '../state/app_model.dart';

// Church-scoped leaderboard (Consistency = streak, Points = monthly XP),
// plus the member's badges and sign-out.
class CommunityScreen extends StatefulWidget {
  final AppModel model;
  const CommunityScreen({super.key, required this.model});

  @override
  State<CommunityScreen> createState() => _CommunityScreenState();
}

class _CommunityScreenState extends State<CommunityScreen> {
  String _tab = 'consistency';
  List<Map<String, dynamic>>? _rows;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    final rows = await widget.model.backend.getLeaderboard(config.churchId);
    if (mounted) setState(() => _rows = rows);
  }

  @override
  Widget build(BuildContext context) {
    final rows = [...?_rows];
    if (_tab == 'consistency') {
      rows.sort((a, b) =>
          (b['current_streak'] as int).compareTo(a['current_streak'] as int));
    } else {
      rows.sort(
          (a, b) => (b['month_xp'] as num).compareTo(a['month_xp'] as num));
    }
    final myBadges = widget.model.state?.badges ?? [];

    return RefreshIndicator(
      onRefresh: () async {
        await widget.model.refresh();
        await _load();
      },
      child: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Text(config.churchName,
              style: Theme.of(context)
                  .textTheme
                  .titleLarge
                  ?.copyWith(fontWeight: FontWeight.bold)),
          Text('Church leaderboard',
              style: Theme.of(context).textTheme.bodySmall),
          const SizedBox(height: 12),
          SegmentedButton<String>(
            segments: const [
              ButtonSegment(
                  value: 'consistency', label: Text('🔥 Consistency')),
              ButtonSegment(value: 'points', label: Text('⭐ Points')),
            ],
            selected: {_tab},
            onSelectionChanged: (s) => setState(() => _tab = s.first),
          ),
          const SizedBox(height: 12),
          if (_rows == null)
            const Center(
                child: Padding(
                    padding: EdgeInsets.all(24),
                    child: CircularProgressIndicator()))
          else
            Card(
              child: Column(
                children: [
                  for (var i = 0; i < rows.length; i++)
                    ListTile(
                      dense: true,
                      leading: Text(
                          i == 0
                              ? '🥇'
                              : i == 1
                                  ? '🥈'
                                  : i == 2
                                      ? '🥉'
                                      : '${i + 1}',
                          style: const TextStyle(fontSize: 18)),
                      title: Text(
                        rows[i]['name'] as String? ?? 'Member',
                        style: rows[i]['id'] == widget.model.userId
                            ? const TextStyle(fontWeight: FontWeight.bold)
                            : null,
                      ),
                      trailing: Text(
                        _tab == 'consistency'
                            ? '🔥 ${rows[i]['current_streak']} days'
                            : '⭐ ${rows[i]['month_xp']} XP this month',
                      ),
                    ),
                ],
              ),
            ),
          const SizedBox(height: 20),

          Text('MY BADGES',
              style: Theme.of(context)
                  .textTheme
                  .labelSmall
                  ?.copyWith(letterSpacing: 1.2)),
          const SizedBox(height: 8),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: [
              for (final b in badges)
                Chip(
                  avatar: Text(b.icon),
                  label: Text(b.name),
                  backgroundColor: myBadges.contains(b.code)
                      ? Colors.amber.shade100
                      : Colors.grey.shade200,
                  labelStyle: TextStyle(
                      color: myBadges.contains(b.code)
                          ? Colors.black
                          : Colors.grey),
                ),
            ],
          ),
          const SizedBox(height: 24),
          OutlinedButton.icon(
            icon: const Icon(Icons.logout),
            label: const Text('Sign out'),
            onPressed: () => widget.model.signOut(),
          ),
          const SizedBox(height: 24),
        ],
      ),
    );
  }
}
