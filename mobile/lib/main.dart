import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import 'config.dart' as config;
import 'screens/auth_screen.dart';
import 'screens/home_shell.dart';
import 'state/app_model.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Supabase.initialize(
      url: config.supabaseUrl, publishableKey: config.supabaseKey);
  final model = AppModel();
  model.init();
  runApp(RtcmBibleApp(model: model));
}

class RtcmBibleApp extends StatelessWidget {
  final AppModel model;
  const RtcmBibleApp({super.key, required this.model});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'RTCM Bible',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        useMaterial3: true,
        colorScheme: ColorScheme.fromSeed(seedColor: const Color(0xFF4338CA)),
        scaffoldBackgroundColor: const Color(0xFFFAFAF9),
      ),
      home: ListenableBuilder(
        listenable: model,
        builder: (context, _) {
          if (model.booting) {
            return const Scaffold(
              body: Center(child: CircularProgressIndicator()),
            );
          }
          return model.userId == null
              ? AuthScreen(model: model)
              : HomeShell(model: model);
        },
      ),
    );
  }
}
