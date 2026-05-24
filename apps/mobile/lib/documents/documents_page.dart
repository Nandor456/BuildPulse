import 'package:flutter/material.dart';
import 'package:open_filex/open_filex.dart';

import '../core/app_scope.dart';
import '../core/formatters.dart';
import '../core/models.dart';
import '../core/widgets.dart';

class DocumentsPage extends StatefulWidget {
  const DocumentsPage({super.key});

  @override
  State<DocumentsPage> createState() => _DocumentsPageState();
}

class _DocumentsPageState extends State<DocumentsPage> {
  bool _isLoading = true;
  String? _error;
  List<WorkerDocumentSummary> _documents = const [];
  WorkerDocumentSummary? _selected;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _load());
  }

  Future<void> _load() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });
    try {
      final documents = await AppScope.apiOf(context).listMyDocuments();
      setState(() {
        _documents = documents;
        _selected = _selected == null && documents.isNotEmpty ? documents.first : _selected;
      });
    } catch (error) {
      setState(() => _error = errorMessage(error, 'Failed to load your documents.'));
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _open(WorkerDocumentSummary document) async {
    final file = await AppScope.apiOf(context).downloadWorkerDocument(document);
    await OpenFilex.open(file.path);
  }

  @override
  Widget build(BuildContext context) {
    return RefreshIndicator(
      onRefresh: _load,
      child: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Text('Documents', style: Theme.of(context).textTheme.headlineSmall),
          const SizedBox(height: 4),
          Text(
            'Preview and download documents shared with your worker profile.',
            style: Theme.of(context).textTheme.bodyMedium,
          ),
          const SizedBox(height: 16),
          if (_isLoading)
            const LoadingView(label: 'Loading documents...')
          else if (_error != null)
            ErrorBanner(_error!)
          else if (_documents.isEmpty)
            const EmptyState(
              icon: Icons.description_outlined,
              title: 'No documents',
              message: 'No documents have been shared with you yet.',
            )
          else ...[
            SectionCard(
              title: 'Your documents',
              child: Column(
                children: _documents
                    .map(
                      (document) => ListTile(
                        contentPadding: EdgeInsets.zero,
                        selected: _selected?.id == document.id,
                        leading: CircleAvatar(
                          child: Icon(document.isImage ? Icons.image_outlined : Icons.description_outlined),
                        ),
                        title: Text(document.originalName, maxLines: 1, overflow: TextOverflow.ellipsis),
                        subtitle: Text('${_kind(document)} · ${formatFileSize(document.sizeBytes)}'),
                        onTap: () => setState(() => _selected = document),
                        trailing: IconButton(
                          tooltip: 'Open',
                          onPressed: () => _open(document),
                          icon: const Icon(Icons.open_in_new),
                        ),
                      ),
                    )
                    .toList(),
              ),
            ),
            const SizedBox(height: 16),
            if (_selected != null) _DocumentPreview(document: _selected!, onOpen: () => _open(_selected!)),
          ],
        ],
      ),
    );
  }

  String _kind(WorkerDocumentSummary document) {
    if (document.isPdf) return 'PDF';
    if (document.isImage) return 'Image';
    return 'File';
  }
}

class _DocumentPreview extends StatelessWidget {
  const _DocumentPreview({required this.document, required this.onOpen});

  final WorkerDocumentSummary document;
  final VoidCallback onOpen;

  @override
  Widget build(BuildContext context) {
    return SectionCard(
      title: document.originalName,
      subtitle: 'Uploaded ${formatDateTime(document.createdAt)}',
      trailing: IconButton.filledTonal(
        tooltip: 'Open',
        onPressed: onOpen,
        icon: const Icon(Icons.open_in_new),
      ),
      child: document.isImage
          ? FutureBuilder(
              future: AppScope.apiOf(context).workerDocumentBytes(document.id),
              builder: (context, snapshot) {
                if (!snapshot.hasData) return const LoadingView(label: 'Loading preview...');
                return ClipRRect(
                  borderRadius: BorderRadius.circular(12),
                  child: Image.memory(snapshot.data!, fit: BoxFit.contain),
                );
              },
            )
          : Text(document.isPdf ? 'Tap Open to preview this PDF.' : 'Preview is not available for this file.'),
    );
  }
}

