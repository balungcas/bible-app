import 'package:flutter/material.dart';

import '../config.dart' as config;
import '../state/app_model.dart';

// Theme control + app info + sign out.
class SettingsScreen extends StatelessWidget {
  final AppModel model;
  const SettingsScreen({super.key, required this.model});

  @override
  Widget build(BuildContext context) {
    final name = model.state?.profile?['name'] as String? ?? '';
    return Scaffold(
      appBar: AppBar(title: const Text('Settings')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          if (name.isNotEmpty)
            Padding(
              padding: const EdgeInsets.only(bottom: 12),
              child: Text('Signed in as $name',
                  style: Theme.of(context).textTheme.bodyMedium),
            ),

          // Appearance
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('APPEARANCE',
                      style: Theme.of(context)
                          .textTheme
                          .labelSmall
                          ?.copyWith(letterSpacing: 1.2)),
                  const SizedBox(height: 4),
                  Text('Choose how RTCM Bible looks on this device.',
                      style: Theme.of(context).textTheme.bodySmall),
                  const SizedBox(height: 12),
                  SegmentedButton<ThemeMode>(
                    segments: const [
                      ButtonSegment(
                          value: ThemeMode.light,
                          icon: Icon(Icons.light_mode),
                          label: Text('Light')),
                      ButtonSegment(
                          value: ThemeMode.dark,
                          icon: Icon(Icons.dark_mode),
                          label: Text('Dark')),
                      ButtonSegment(
                          value: ThemeMode.system,
                          icon: Icon(Icons.brightness_auto),
                          label: Text('System')),
                    ],
                    selected: {model.themeMode},
                    onSelectionChanged: (s) => model.setThemeMode(s.first),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 12),

          // About
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('ABOUT',
                      style: Theme.of(context)
                          .textTheme
                          .labelSmall
                          ?.copyWith(letterSpacing: 1.2)),
                  const SizedBox(height: 6),
                  const Text('RTCM Bible'),
                  Text('Church: ${config.churchName}',
                      style: Theme.of(context).textTheme.bodySmall),
                  const SizedBox(height: 6),
                  Text('Scripture · Observation · Application · Kneel',
                      style: Theme.of(context).textTheme.bodySmall),
                ],
              ),
            ),
          ),
          const SizedBox(height: 20),

          OutlinedButton.icon(
            icon: const Icon(Icons.logout),
            label: const Text('Sign out'),
            style: OutlinedButton.styleFrom(foregroundColor: Colors.red),
            onPressed: () {
              Navigator.of(context).pop();
              model.signOut();
            },
          ),
        ],
      ),
    );
  }
}
