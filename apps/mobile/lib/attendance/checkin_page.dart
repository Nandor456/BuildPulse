import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../core/app_scope.dart';
import '../core/formatters.dart';
import '../core/models.dart';
import '../core/widgets.dart';

class CheckinPage extends StatefulWidget {
  const CheckinPage({required this.qrToken, super.key});

  final String qrToken;

  @override
  State<CheckinPage> createState() => _CheckinPageState();
}

class _CheckinPageState extends State<CheckinPage> {
  bool _isLoading = true;
  String? _error;
  ScanResult? _result;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _scan());
  }

  Future<void> _scan() async {
    if (widget.qrToken.isEmpty) {
      setState(() {
        _isLoading = false;
        _error = 'Invalid QR code.';
      });
      return;
    }

    setState(() {
      _isLoading = true;
      _error = null;
      _result = null;
    });

    try {
      final result = await AppScope.apiOf(context).checkin(widget.qrToken);
      setState(() => _result = result);
    } catch (error) {
      setState(() => _error = errorMessage(error, 'Unable to record attendance.'));
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final result = _result;
    final icon = _error != null
        ? Icons.cancel_outlined
        : result != null
            ? Icons.check_circle_outline
            : Icons.schedule;

    return Scaffold(
      appBar: AppBar(title: const Text('Attendance scan')),
      body: Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(20),
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 440),
            child: Card(
              child: Padding(
                padding: const EdgeInsets.all(20),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(icon, size: 52, color: Theme.of(context).colorScheme.primary),
                    const SizedBox(height: 12),
                    Text('Attendance scan', style: Theme.of(context).textTheme.headlineSmall),
                    const SizedBox(height: 4),
                    Text(
                      _isLoading ? 'Recording attendance...' : result?.workPointName ?? 'Scan result',
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 20),
                    if (_isLoading)
                      const LoadingView()
                    else if (_error != null) ...[
                      ErrorBanner(_error!),
                      const SizedBox(height: 12),
                      FilledButton.icon(
                        onPressed: _scan,
                        icon: const Icon(Icons.refresh),
                        label: const Text('Try again'),
                      ),
                    ] else if (result != null) ...[
                      _ResultDetails(result: result),
                      const SizedBox(height: 16),
                      FilledButton(
                        onPressed: () => context.go('/messages'),
                        child: const Text('Done'),
                      ),
                    ],
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class _ResultDetails extends StatelessWidget {
  const _ResultDetails({required this.result});

  final ScanResult result;

  @override
  Widget build(BuildContext context) {
    final label = switch (result.event) {
      'CHECK_IN' => 'Checked in',
      'CHECK_OUT' => 'Checked out',
      'ALREADY_COMPLETED' => 'Already completed today',
      _ => result.event,
    };

    return Column(
      children: [
        Chip(label: Text(label)),
        const SizedBox(height: 12),
        _DetailRow(label: 'Workpoint', value: result.workPointName),
        _DetailRow(label: 'Date', value: formatDate(result.date)),
        _DetailRow(label: 'Checked in', value: formatDateTime(result.checkedInAt)),
        if (result.isCompleted) ...[
          _DetailRow(label: 'Checked out', value: formatDateTime(result.checkedOutAt)),
          _DetailRow(label: 'Hours', value: formatHours(result.hours)),
          _DetailRow(label: 'Earnings', value: formatMoney(result.earnings)),
        ],
        if (result.checkoutSource == 'AUTO') ...[
          const SizedBox(height: 8),
          const ErrorBanner('This attendance was automatically closed at 22:00 and may need review.'),
        ],
      ],
    );
  }
}

class _DetailRow extends StatelessWidget {
  const _DetailRow({required this.label, required this.value});

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        children: [
          Expanded(child: Text(label, style: Theme.of(context).textTheme.bodySmall)),
          const SizedBox(width: 12),
          Flexible(
            child: Text(
              value,
              textAlign: TextAlign.right,
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(fontWeight: FontWeight.w600),
            ),
          ),
        ],
      ),
    );
  }
}

