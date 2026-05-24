import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../core/app_scope.dart';
import '../core/widgets.dart';

class LoginPage extends StatefulWidget {
  const LoginPage({this.redirectPath, super.key});

  final String? redirectPath;

  @override
  State<LoginPage> createState() => _LoginPageState();
}

class _LoginPageState extends State<LoginPage> {
  final _formKey = GlobalKey<FormState>();
  final _username = TextEditingController();
  final _password = TextEditingController();
  bool _isSubmitting = false;
  String? _error;

  @override
  void dispose() {
    _username.dispose();
    _password.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() {
      _isSubmitting = true;
      _error = null;
    });
    try {
      await AppScope.authOf(context).login(
        username: _username.text.trim(),
        password: _password.text,
      );
      if (!mounted) return;
      final destination = widget.redirectPath?.startsWith('/') == true ? widget.redirectPath! : '/';
      context.go(destination);
    } catch (error) {
      setState(() => _error = errorMessage(error, 'Login failed'));
    } finally {
      if (mounted) setState(() => _isSubmitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return _AuthScaffold(
      title: 'Sign in',
      subtitle: 'Welcome back to BuildPulse',
      child: Form(
        key: _formKey,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            TextFormField(
              key: const Key('login-username'),
              controller: _username,
              autofillHints: const [AutofillHints.username],
              decoration: const InputDecoration(labelText: 'Username'),
              validator: (value) =>
                  (value ?? '').trim().length >= 3 ? null : 'Please enter a username.',
            ),
            const SizedBox(height: 14),
            TextFormField(
              key: const Key('login-password'),
              controller: _password,
              obscureText: true,
              autofillHints: const [AutofillHints.password],
              decoration: const InputDecoration(labelText: 'Password'),
              validator: (value) => (value ?? '').isNotEmpty ? null : 'Password is required.',
              onFieldSubmitted: (_) => _submit(),
            ),
            if (_error != null) ...[
              const SizedBox(height: 14),
              ErrorBanner(_error!),
            ],
            const SizedBox(height: 20),
            FilledButton.icon(
              key: const Key('login-submit'),
              onPressed: _isSubmitting ? null : _submit,
              icon: _isSubmitting
                  ? const SizedBox.square(
                      dimension: 18,
                      child: CircularProgressIndicator(strokeWidth: 2),
                    )
                  : const Icon(Icons.login),
              label: Text(_isSubmitting ? 'Signing in...' : 'Sign in'),
            ),
            TextButton(
              onPressed: _isSubmitting ? null : () => context.go('/register'),
              child: const Text('No account? Register'),
            ),
          ],
        ),
      ),
    );
  }
}

class RegisterPage extends StatefulWidget {
  const RegisterPage({this.token, this.prefilledEmail, super.key});

  final String? token;
  final String? prefilledEmail;

  @override
  State<RegisterPage> createState() => _RegisterPageState();
}

class _RegisterPageState extends State<RegisterPage> {
  final _formKey = GlobalKey<FormState>();
  final _username = TextEditingController();
  final _email = TextEditingController();
  final _password = TextEditingController();
  bool _isSubmitting = false;
  String? _error;

  static final _passwordPattern = RegExp(r'^[A-Z].{5,}$');

  @override
  void initState() {
    super.initState();
    _email.text = widget.prefilledEmail ?? '';
  }

  @override
  void dispose() {
    _username.dispose();
    _email.dispose();
    _password.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() {
      _isSubmitting = true;
      _error = null;
    });
    try {
      await AppScope.authOf(context).register(
        username: _username.text.trim(),
        email: _email.text.trim(),
        password: _password.text,
        token: widget.token,
      );
      if (mounted) context.go('/');
    } catch (error) {
      setState(() => _error = errorMessage(error, 'Registration failed'));
    } finally {
      if (mounted) setState(() => _isSubmitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final invited = widget.token?.isNotEmpty == true;
    return _AuthScaffold(
      title: 'Create your account',
      subtitle: 'Join the Construction ERP system',
      child: Form(
        key: _formKey,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            if (invited) ...[
              const ErrorBanner('You are accepting an invitation. Your role will be assigned.'),
              const SizedBox(height: 14),
            ],
            TextFormField(
              key: const Key('register-username'),
              controller: _username,
              decoration: const InputDecoration(labelText: 'Username'),
              validator: (value) =>
                  (value ?? '').trim().length >= 3 ? null : 'Username must be at least 3 characters.',
            ),
            const SizedBox(height: 14),
            TextFormField(
              key: const Key('register-email'),
              controller: _email,
              enabled: widget.prefilledEmail == null,
              autofillHints: const [AutofillHints.email],
              keyboardType: TextInputType.emailAddress,
              decoration: const InputDecoration(labelText: 'Email address'),
              validator: (value) => (value ?? '').trim().contains('@') ? null : 'Email is required.',
            ),
            const SizedBox(height: 14),
            TextFormField(
              key: const Key('register-password'),
              controller: _password,
              obscureText: true,
              decoration: const InputDecoration(
                labelText: 'Password',
                helperText: 'Must start with an uppercase letter and be at least 6 characters.',
              ),
              validator: (value) =>
                  _passwordPattern.hasMatch(value ?? '') ? null : 'Password does not match the rules.',
              onFieldSubmitted: (_) => _submit(),
            ),
            if (_error != null) ...[
              const SizedBox(height: 14),
              ErrorBanner(_error!),
            ],
            const SizedBox(height: 20),
            FilledButton.icon(
              key: const Key('register-submit'),
              onPressed: _isSubmitting ? null : _submit,
              icon: _isSubmitting
                  ? const SizedBox.square(
                      dimension: 18,
                      child: CircularProgressIndicator(strokeWidth: 2),
                    )
                  : const Icon(Icons.person_add_alt),
              label: Text(_isSubmitting ? 'Creating account...' : 'Create account'),
            ),
            TextButton(
              onPressed: _isSubmitting ? null : () => context.go('/login'),
              child: const Text('Already have an account? Sign in'),
            ),
          ],
        ),
      ),
    );
  }
}

class _AuthScaffold extends StatelessWidget {
  const _AuthScaffold({
    required this.title,
    required this.subtitle,
    required this.child,
  });

  final String title;
  final String subtitle;
  final Widget child;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(20),
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 420),
              child: Column(
                children: [
                  Image.asset('assets/images/buildpulselogo.png', width: 72, height: 72),
                  const SizedBox(height: 16),
                  Text(title, style: Theme.of(context).textTheme.headlineSmall),
                  const SizedBox(height: 4),
                  Text(subtitle, style: Theme.of(context).textTheme.bodyMedium),
                  const SizedBox(height: 24),
                  Card(
                    child: Padding(
                      padding: const EdgeInsets.all(20),
                      child: child,
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

