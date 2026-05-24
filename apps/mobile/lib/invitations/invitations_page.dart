import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../core/app_scope.dart';
import '../core/formatters.dart';
import '../core/models.dart';
import '../core/widgets.dart';

class InvitationsPage extends StatefulWidget {
  const InvitationsPage({super.key});

  @override
  State<InvitationsPage> createState() => _InvitationsPageState();
}

class _InvitationsPageState extends State<InvitationsPage> {
  final _email = TextEditingController();
  String _role = 'WORKER';
  bool _isLoading = true;
  bool _isSubmitting = false;
  String? _error;
  List<Invitation> _invitations = const [];

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _load());
  }

  @override
  void dispose() {
    _email.dispose();
    super.dispose();
  }

  Future<void> _load() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });
    try {
      final invitations = await AppScope.apiOf(context).listInvitations();
      setState(() => _invitations = invitations);
    } catch (error) {
      setState(() => _error = errorMessage(error, 'Failed to load invitations.'));
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _create() async {
    final email = _email.text.trim();
    if (email.isEmpty) return;
    setState(() => _isSubmitting = true);
    try {
      await AppScope.apiOf(context).createInvitation(email: email, role: _role);
      _email.clear();
      _role = 'WORKER';
      await _load();
    } catch (error) {
      if (mounted) showSnack(context, errorMessage(error, 'Failed to send invitation.'));
    } finally {
      if (mounted) setState(() => _isSubmitting = false);
    }
  }

  Future<void> _revoke(Invitation invitation) async {
    await AppScope.apiOf(context).revokeInvitation(invitation.id);
    await _load();
  }

  @override
  Widget build(BuildContext context) {
    return RefreshIndicator(
      onRefresh: _load,
      child: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Text('User Invitations', style: Theme.of(context).textTheme.headlineSmall),
          const SizedBox(height: 4),
          Text(
            'Invite new users by email. Each invitation carries a role and one-time registration link.',
            style: Theme.of(context).textTheme.bodyMedium,
          ),
          const SizedBox(height: 16),
          SectionCard(
            title: 'Invite a new user',
            child: Column(
              children: [
                TextField(
                  controller: _email,
                  keyboardType: TextInputType.emailAddress,
                  decoration: const InputDecoration(labelText: 'Email address'),
                ),
                const SizedBox(height: 12),
                DropdownButtonFormField<String>(
                  initialValue: _role,
                  decoration: const InputDecoration(labelText: 'Role'),
                  items: const [
                    DropdownMenuItem(value: 'WORKER', child: Text('Worker')),
                    DropdownMenuItem(value: 'LEADER', child: Text('Leader')),
                  ],
                  onChanged: (value) => setState(() => _role = value ?? 'WORKER'),
                ),
                const SizedBox(height: 12),
                SizedBox(
                  width: double.infinity,
                  child: FilledButton.icon(
                    onPressed: _isSubmitting ? null : _create,
                    icon: _isSubmitting
                        ? const SizedBox.square(
                            dimension: 18,
                            child: CircularProgressIndicator(strokeWidth: 2),
                          )
                        : const Icon(Icons.send),
                    label: Text(_isSubmitting ? 'Sending...' : 'Send invitation'),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),
          if (_isLoading)
            const LoadingView(label: 'Loading invitations...')
          else if (_error != null)
            ErrorBanner(_error!)
          else if (_invitations.isEmpty)
            const EmptyState(
              icon: Icons.mail_outline,
              title: 'No invitations',
              message: 'Use the form above to invite your first user.',
            )
          else
            ..._invitations.map((invitation) => _InvitationCard(invitation: invitation, onRevoke: _revoke)),
        ],
      ),
    );
  }
}

class _InvitationCard extends StatelessWidget {
  const _InvitationCard({required this.invitation, required this.onRevoke});

  final Invitation invitation;
  final Future<void> Function(Invitation invitation) onRevoke;

  @override
  Widget build(BuildContext context) {
    final canRevoke = invitation.status == 'pending';
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Expanded(
                  child: Text(invitation.email, style: Theme.of(context).textTheme.titleMedium),
                ),
                Chip(label: Text(invitation.status)),
              ],
            ),
            const SizedBox(height: 8),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: [
                Chip(label: Text(invitation.role)),
                Chip(label: Text('Sent ${formatDateTime(invitation.createdAt)}')),
                Chip(label: Text('Expires ${formatDateTime(invitation.expiresAt)}')),
              ],
            ),
            const SizedBox(height: 8),
            Row(
              mainAxisAlignment: MainAxisAlignment.end,
              children: [
                TextButton.icon(
                  onPressed: canRevoke
                      ? () async {
                          await Clipboard.setData(ClipboardData(text: invitation.inviteUrl));
                          if (context.mounted) showSnack(context, 'Invitation link copied.');
                        }
                      : null,
                  icon: const Icon(Icons.copy),
                  label: const Text('Copy link'),
                ),
                TextButton.icon(
                  onPressed: canRevoke ? () => onRevoke(invitation) : null,
                  icon: const Icon(Icons.delete_outline),
                  label: const Text('Revoke'),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

