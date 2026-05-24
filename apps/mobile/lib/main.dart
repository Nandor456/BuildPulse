import 'package:flutter/material.dart';

import 'auth/auth_controller.dart';
import 'core/api/api_client.dart';
import 'core/api/buildpulse_api.dart';
import 'core/app_config.dart';
import 'core/app_router.dart';
import 'core/app_scope.dart';
import 'core/theme_controller.dart';
import 'messaging/messaging_controller.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await AppConfig.load();

  final apiClient = await ApiClient.create();
  final api = BuildPulseApi(apiClient);
  final auth = AuthController(api);
  await auth.bootstrap();
  final messaging = MessagingController(api, auth);
  final theme = ThemeController();

  runApp(
    AppScope(
      api: api,
      auth: auth,
      messaging: messaging,
      theme: theme,
      child: BuildPulseApp(auth: auth),
    ),
  );
}

class BuildPulseApp extends StatefulWidget {
  const BuildPulseApp({required this.auth, super.key});

  final AuthController auth;

  @override
  State<BuildPulseApp> createState() => _BuildPulseAppState();
}

class _BuildPulseAppState extends State<BuildPulseApp> {
  late final _router = createAppRouter(widget.auth);

  @override
  Widget build(BuildContext context) {
    final theme = AppScope.themeOf(context);

    return AnimatedBuilder(
      animation: theme,
      builder: (context, _) {
        return MaterialApp.router(
          title: 'BuildPulse',
          debugShowCheckedModeBanner: false,
          themeMode: theme.mode,
          theme: buildPulseTheme(Brightness.light),
          darkTheme: buildPulseTheme(Brightness.dark),
          routerConfig: _router,
        );
      },
    );
  }
}
