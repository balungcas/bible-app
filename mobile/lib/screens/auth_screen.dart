import 'package:flutter/material.dart';

import '../config.dart' as config;
import '../state/app_model.dart';

// Name only, hardcoded church (RTCM-Tunasan). Entering the same name always
// resumes the same profile.
class AuthScreen extends StatefulWidget {
  final AppModel model;
  const AuthScreen({super.key, required this.model});

  @override
  State<AuthScreen> createState() => _AuthScreenState();
}

class _AuthScreenState extends State<AuthScreen> {
  final _name = TextEditingController();
  String? _error;
  bool _busy = false;

  Future<void> _submit() async {
    final name = _name.text.trim();
    if (name.isEmpty) {
      setState(() => _error = 'Please enter your name.');
      return;
    }
    setState(() {
      _busy = true;
      _error = null;
    });
    try {
      await widget.model.signIn(name);
    } catch (e) {
      setState(() => _error = e.toString().replaceFirst('Exception: ', ''));
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(24),
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 420),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  const Text('📖', textAlign: TextAlign.center, style: TextStyle(fontSize: 40)),
                  const SizedBox(height: 8),
                  Text(
                    'RTCM Bible',
                    textAlign: TextAlign.center,
                    style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                          fontWeight: FontWeight.bold,
                          color: const Color(0xFF312E81),
                        ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'Daily Scripture · Observation · Application · Kneel',
                    textAlign: TextAlign.center,
                    style: Theme.of(context).textTheme.bodySmall,
                  ),
                  const SizedBox(height: 32),
                  Card(
                    child: Padding(
                      padding: const EdgeInsets.all(20),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.stretch,
                        children: [
                          TextField(
                            controller: _name,
                            textInputAction: TextInputAction.done,
                            onSubmitted: (_) => _submit(),
                            decoration: const InputDecoration(
                              labelText: 'Your name',
                              hintText: 'Juan dela Cruz',
                              border: OutlineInputBorder(),
                            ),
                          ),
                          const SizedBox(height: 12),
                          Container(
                            padding: const EdgeInsets.all(12),
                            decoration: BoxDecoration(
                              color: const Color(0xFFF5F5F4),
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: const Text('Church: ${config.churchName}'),
                          ),
                          if (_error != null) ...[
                            const SizedBox(height: 12),
                            Text(_error!, style: const TextStyle(color: Colors.red)),
                          ],
                          const SizedBox(height: 16),
                          FilledButton(
                            onPressed: _busy ? null : _submit,
                            child: Text(_busy ? 'Please wait…' : 'Start'),
                          ),
                          const SizedBox(height: 12),
                          Text(
                            'Enter the same name each time to continue your progress.',
                            textAlign: TextAlign.center,
                            style: Theme.of(context).textTheme.bodySmall,
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
