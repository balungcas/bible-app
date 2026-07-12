import 'package:flutter/material.dart';

import '../core/dates.dart';
import '../state/app_model.dart';

// Private SOAK journal history. RLS guarantees only the owner can read these.
class JournalScreen extends StatelessWidget {
  final AppModel model;
  const JournalScreen({super.key, required this.model});

  @override
  Widget build(BuildContext context) {
    final entries = model.state?.entries ?? [];
    return RefreshIndicator(
      onRefresh: model.refresh,
      child: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Text('My SOAK Journal',
              style: Theme.of(context)
                  .textTheme
                  .titleLarge
                  ?.copyWith(fontWeight: FontWeight.bold)),
          const SizedBox(height: 4),
          Text('${entries.length} entries · private to you',
              style: Theme.of(context).textTheme.bodySmall),
          const SizedBox(height: 12),
          if (entries.isEmpty)
            const Card(
              child: Padding(
                padding: EdgeInsets.all(24),
                child: Text(
                    'No entries yet. Complete your first SOAK from the Today tab. 🌱'),
              ),
            ),
          for (final e in entries)
            Card(
              child: ExpansionTile(
                title: Text(e['scripture_ref'] as String? ?? '—',
                    style: const TextStyle(fontWeight: FontWeight.w600)),
                subtitle: Text(formatDateLong(e['entry_date'] as String)),
                childrenPadding:
                    const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                expandedCrossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _Section(label: 'Observation', text: e['observation'] as String?),
                  _Section(label: 'Application', text: e['application'] as String?),
                  _Section(label: 'Kneel', text: e['kneel'] as String?),
                ],
              ),
            ),
        ],
      ),
    );
  }
}

class _Section extends StatelessWidget {
  final String label;
  final String? text;
  const _Section({required this.label, required this.text});

  @override
  Widget build(BuildContext context) {
    if (text == null || text!.isEmpty) return const SizedBox.shrink();
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label.toUpperCase(),
              style: Theme.of(context)
                  .textTheme
                  .labelSmall
                  ?.copyWith(letterSpacing: 1.2)),
          Text(text!),
        ],
      ),
    );
  }
}
