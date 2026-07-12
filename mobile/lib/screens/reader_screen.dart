import 'package:flutter/material.dart';

import '../core/books.dart';
import '../state/app_model.dart';
import 'home_shell.dart';

// Book list → chapter grid → verse view (KJV / Tagalog / Parallel), with
// "Mark chapter as read" wired to reading progress + XP.
class ReaderScreen extends StatefulWidget {
  final AppModel model;
  const ReaderScreen({super.key, required this.model});

  @override
  State<ReaderScreen> createState() => _ReaderScreenState();
}

class _ReaderScreenState extends State<ReaderScreen> {
  Book? _book;
  int? _chapter;
  String _version = 'KJV'; // 'KJV' | 'TAGALOG' | 'PARALLEL'
  List<Map<String, dynamic>> _versesKjv = [];
  List<Map<String, dynamic>> _versesTl = [];
  bool _loading = false;
  bool _marking = false;

  Set<String> get _readChapters => {
        for (final p in widget.model.state?.progress ?? [])
          '${p['book_code']} ${p['chapter']}'
      };

  Future<void> _openChapter(Book book, int chapter) async {
    setState(() {
      _book = book;
      _chapter = chapter;
      _loading = true;
    });
    await _fetch();
  }

  Future<void> _fetch() async {
    final backend = widget.model.backend;
    final kjv = await backend.getChapter('KJV', _book!.code, _chapter!);
    final tl = _version == 'KJV'
        ? <Map<String, dynamic>>[]
        : await backend.getChapter('TAGALOG', _book!.code, _chapter!);
    if (!mounted) return;
    setState(() {
      _versesKjv = kjv;
      _versesTl = tl;
      _loading = false;
    });
  }

  Future<void> _markRead() async {
    setState(() => _marking = true);
    try {
      final r = await widget.model.game.markChapterRead(
          widget.model.userId!,
          _version == 'PARALLEL' ? 'KJV' : _version,
          _book!.code,
          _chapter!);
      await widget.model.refresh();
      if (!mounted) return;
      if (r.firstTime) {
        showResultSnacks(context, xpEarned: r.xpEarned, newBadges: r.newBadges);
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Already marked as read.')));
      }
    } finally {
      if (mounted) setState(() => _marking = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_book == null) return _bookList(context);
    if (_chapter == null) return _chapterGrid(context);
    return _chapterView(context);
  }

  // ------------------------------------------------------------- Book list
  Widget _bookList(BuildContext context) {
    final ot = books.where((b) => b.testament == 'OT').toList();
    final nt = books.where((b) => b.testament == 'NT').toList();
    Widget section(String title, List<Book> list) => Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Padding(
              padding: const EdgeInsets.symmetric(vertical: 8),
              child: Text(title,
                  style: Theme.of(context)
                      .textTheme
                      .labelLarge
                      ?.copyWith(letterSpacing: 1.2)),
            ),
            for (final b in list)
              ListTile(
                dense: true,
                title: Text(b.nameEn),
                subtitle: Text('${b.nameTl} · ${b.chapters} chapters'),
                trailing: const Icon(Icons.chevron_right),
                onTap: () => setState(() {
                  _book = b;
                  _chapter = null;
                }),
              ),
          ],
        );
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Text('Read the Bible',
            style: Theme.of(context)
                .textTheme
                .titleLarge
                ?.copyWith(fontWeight: FontWeight.bold)),
        section('OLD TESTAMENT', ot),
        section('NEW TESTAMENT', nt),
      ],
    );
  }

  // ----------------------------------------------------------- Chapter grid
  Widget _chapterGrid(BuildContext context) {
    final read = _readChapters;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        ListTile(
          leading: BackButton(onPressed: () => setState(() => _book = null)),
          title: Text(_book!.nameEn,
              style: const TextStyle(fontWeight: FontWeight.bold)),
          subtitle: Text(_book!.nameTl),
        ),
        Expanded(
          child: GridView.count(
            padding: const EdgeInsets.all(16),
            crossAxisCount: 5,
            mainAxisSpacing: 8,
            crossAxisSpacing: 8,
            children: [
              for (var c = 1; c <= _book!.chapters; c++)
                OutlinedButton(
                  onPressed: () => _openChapter(_book!, c),
                  style: OutlinedButton.styleFrom(
                    padding: EdgeInsets.zero,
                    backgroundColor: read.contains('${_book!.code} $c')
                        ? Colors.green.shade50
                        : null,
                  ),
                  child: Text('$c'),
                ),
            ],
          ),
        ),
      ],
    );
  }

  // ------------------------------------------------------------ Verse view
  Widget _chapterView(BuildContext context) {
    final isRead = _readChapters.contains('${_book!.code} $_chapter');
    return Column(
      children: [
        ListTile(
          leading: BackButton(onPressed: () => setState(() => _chapter = null)),
          title: Text('${_book!.nameEn} $_chapter',
              style: const TextStyle(fontWeight: FontWeight.bold)),
        ),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          child: SegmentedButton<String>(
            segments: const [
              ButtonSegment(value: 'KJV', label: Text('KJV')),
              ButtonSegment(value: 'TAGALOG', label: Text('Tagalog')),
              ButtonSegment(value: 'PARALLEL', label: Text('Parallel')),
            ],
            selected: {_version},
            onSelectionChanged: (s) {
              setState(() {
                _version = s.first;
                _loading = true;
              });
              _fetch();
            },
          ),
        ),
        Expanded(
          child: _loading
              ? const Center(child: CircularProgressIndicator())
              : ListView(
                  padding: const EdgeInsets.all(16),
                  children: [
                    if (_version == 'PARALLEL')
                      for (var i = 0; i < _versesKjv.length; i++) ...[
                        _Verse(
                            n: _versesKjv[i]['verse'] as int,
                            text: _versesKjv[i]['text'] as String),
                        if (i < _versesTl.length)
                          Padding(
                            padding: const EdgeInsets.only(left: 24, bottom: 8),
                            child: Text(_versesTl[i]['text'] as String,
                                style: TextStyle(
                                    color: Colors.indigo.shade700,
                                    fontStyle: FontStyle.italic)),
                          ),
                      ]
                    else
                      for (final v in _version == 'KJV' ? _versesKjv : _versesTl)
                        _Verse(n: v['verse'] as int, text: v['text'] as String),
                    const SizedBox(height: 16),
                    FilledButton(
                      onPressed: _marking || isRead ? null : _markRead,
                      child: Text(isRead
                          ? '✅ Chapter read'
                          : _marking
                              ? 'Saving…'
                              : 'Mark chapter as read  ·  +10 XP'),
                    ),
                    const SizedBox(height: 24),
                  ],
                ),
        ),
      ],
    );
  }
}

class _Verse extends StatelessWidget {
  final int n;
  final String text;
  const _Verse({required this.n, required this.text});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: RichText(
        text: TextSpan(
          style: DefaultTextStyle.of(context)
              .style
              .copyWith(fontSize: 16, height: 1.5),
          children: [
            TextSpan(
                text: '$n ',
                style: TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.bold,
                    color: Theme.of(context).colorScheme.primary)),
            TextSpan(text: text),
          ],
        ),
      ),
    );
  }
}
