import 'package:flutter/material.dart';

import '../core/dates.dart';
import '../core/gamification.dart';
import '../core/journal_style.dart';
import '../state/app_model.dart';
import 'home_shell.dart';

class TodayScreen extends StatefulWidget {
  final AppModel model;
  const TodayScreen({super.key, required this.model});

  @override
  State<TodayScreen> createState() => _TodayScreenState();
}

class _TodayScreenState extends State<TodayScreen> {
  Map<String, dynamic>? _devotion;
  List<Map<String, dynamic>> _quizzes = [];
  final Map<String, int> _answered = {}; // quiz id -> chosen index
  bool _loading = true;
  bool _devotionRead = false;
  bool _soakOpen = false;
  bool _saving = false;

  final _scripture = TextEditingController();
  final _observation = TextEditingController();
  final _application = TextEditingController();
  final _kneel = TextEditingController();

  // Journal styling
  String _paper = 'plain';
  List<Sticker> _stickers = [];
  int? _selectedSticker; // index of sticker showing its remove button

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    final today = todayLocal();
    final devotion = await widget.model.backend.getDevotion(today);
    final quizzes = await widget.model.backend.getDailyQuizzes(today);
    if (!mounted) return;
    setState(() {
      _devotion = devotion;
      _quizzes = quizzes;
      _loading = false;
    });
  }

  Map<String, dynamic>? get _todayEntry {
    final today = todayLocal();
    final entries = widget.model.state?.entries ?? [];
    for (final e in entries) {
      if (e['entry_date'] == today) return e;
    }
    return null;
  }

  Future<void> _markDevotionRead() async {
    setState(() => _devotionRead = true);
    final r = await widget.model.game
        .markDevotionRead(widget.model.userId!, todayLocal());
    await widget.model.refresh();
    if (mounted) showResultSnacks(context, xpEarned: r.xpEarned);
  }

  void _openSoak() {
    final entry = _todayEntry;
    _scripture.text = (entry?['scripture_ref'] as String?) ??
        (_devotion?['scripture_ref'] as String?) ??
        '';
    _observation.text = (entry?['observation'] as String?) ?? '';
    _application.text = (entry?['application'] as String?) ?? '';
    _kneel.text = (entry?['kneel'] as String?) ?? '';
    final style = JournalStyle.fromJson(entry?['style']);
    _paper = style.paper;
    _stickers = style.stickers;
    _selectedSticker = null;
    setState(() => _soakOpen = true);
  }

  Future<void> _completeSoak() async {
    if (_scripture.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Please enter the scripture reference.')));
      return;
    }
    setState(() => _saving = true);
    try {
      final r = await widget.model.game.completeSoak(widget.model.userId!, {
        'scripture_ref': _scripture.text.trim(),
        'observation': _observation.text.trim(),
        'application': _application.text.trim(),
        'kneel': _kneel.text.trim(),
        'style': JournalStyle(_paper, _stickers).toJson(),
      });
      await widget.model.refresh();
      if (!mounted) return;
      setState(() => _soakOpen = false);
      showResultSnacks(context,
          xpEarned: r.xpEarned,
          newBadges: r.newBadges,
          usedFreezes: r.usedFreezes);
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  Future<void> _answerQuiz(Map<String, dynamic> quiz, int index) async {
    setState(() => _answered[quiz['id'].toString()] = index);
    final r = await widget.model.game.answerQuiz(widget.model.userId!, quiz, index);
    await widget.model.refresh();
    if (!mounted) return;
    if (r.isCorrect) {
      showResultSnacks(context, xpEarned: r.xpEarned, newBadges: r.newBadges);
    } else {
      ScaffoldMessenger.of(context)
          .showSnackBar(const SnackBar(content: Text('Not quite — read the passage again!')));
    }
  }

  void _addSticker(String e) {
    final n = _stickers.length;
    setState(() => _stickers.add(Sticker(e, 0.2 + ((n * 0.13) % 0.6), 0.12)));
  }

  // Paper picker + emoji tray.
  Widget _buildStyleControls(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Wrap(
          spacing: 6,
          children: [
            for (final p in papers)
              ChoiceChip(
                label: Text(paperLabels[p]!),
                selected: _paper == p,
                onSelected: (_) => setState(() => _paper = p),
              ),
          ],
        ),
        const SizedBox(height: 6),
        Wrap(
          spacing: 2,
          children: [
            for (final e in stickerSet)
              IconButton(
                iconSize: 22,
                visualDensity: VisualDensity.compact,
                onPressed: () => _addSticker(e),
                icon: Text(e, style: const TextStyle(fontSize: 22)),
              ),
          ],
        ),
        Text('Tap an emoji to add it, then drag to place. Tap a sticker to remove.',
            style: Theme.of(context).textTheme.bodySmall),
      ],
    );
  }

  // Paper-backed canvas holding O/A/K with a draggable sticker overlay.
  Widget _buildPaperCanvas(BuildContext context) {
    final onSurface = Theme.of(context).colorScheme.onSurface;
    return LayoutBuilder(
      builder: (context, constraints) {
        final w = constraints.maxWidth;
        return ClipRRect(
          borderRadius: BorderRadius.circular(12),
          child: Container(
            decoration: (paperDecoration(_paper) ?? const BoxDecoration())
                .copyWith(
              border: Border.all(color: Theme.of(context).dividerColor),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Stack(
              children: [
                if (paperPainter(_paper, onSurface) != null)
                  Positioned.fill(
                    child: CustomPaint(painter: paperPainter(_paper, onSurface)),
                  ),
                Padding(
                  padding: const EdgeInsets.all(12),
                  child: Column(
                    children: [
                      TextField(
                        controller: _observation,
                        maxLines: 3,
                        decoration: const InputDecoration(
                            labelText: 'O · Observation',
                            hintText: 'What stands out? What is God saying?',
                            border: OutlineInputBorder(),
                            filled: true),
                      ),
                      const SizedBox(height: 10),
                      TextField(
                        controller: _application,
                        maxLines: 3,
                        decoration: const InputDecoration(
                            labelText: 'A · Application',
                            hintText: 'One concrete act of obedience today',
                            border: OutlineInputBorder(),
                            filled: true),
                      ),
                      const SizedBox(height: 10),
                      TextField(
                        controller: _kneel,
                        maxLines: 3,
                        decoration: const InputDecoration(
                            labelText: 'K · Kneel (prayer)',
                            hintText: 'Lord, today…',
                            border: OutlineInputBorder(),
                            filled: true),
                      ),
                    ],
                  ),
                ),
                // Draggable sticker layer.
                for (var i = 0; i < _stickers.length; i++)
                  _buildSticker(i, w),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildSticker(int i, double canvasWidth) {
    final s = _stickers[i];
    // Height isn't known precisely; approximate with the same width scale is
    // fine because drag updates use the actual box via local position.
    return Positioned(
      left: s.x * canvasWidth - 18,
      top: s.y * kJournalCanvasHeight - 18,
      child: GestureDetector(
        onPanUpdate: (d) {
          setState(() {
            s.x = ((s.x * canvasWidth) + d.delta.dx).clamp(0, canvasWidth) /
                canvasWidth;
            s.y = ((s.y * kJournalCanvasHeight) + d.delta.dy)
                    .clamp(0, kJournalCanvasHeight) /
                kJournalCanvasHeight;
          });
        },
        onTap: () => setState(
            () => _selectedSticker = _selectedSticker == i ? null : i),
        child: Stack(
          clipBehavior: Clip.none,
          children: [
            Text(s.e, style: const TextStyle(fontSize: 32)),
            if (_selectedSticker == i)
              Positioned(
                right: -8,
                top: -8,
                child: GestureDetector(
                  onTap: () => setState(() {
                    _stickers.removeAt(i);
                    _selectedSticker = null;
                  }),
                  child: const CircleAvatar(
                    radius: 9,
                    backgroundColor: Colors.red,
                    child: Icon(Icons.close, size: 12, color: Colors.white),
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final state = widget.model.state;
    final streak = effectiveStreak(state?.streak, todayLocal());
    final level = levelForXp(state?.xp.total ?? 0);

    return RefreshIndicator(
      onRefresh: () async {
        await widget.model.refresh();
        await _load();
      },
      child: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Text(formatDateLong(todayLocal()),
              style: Theme.of(context).textTheme.bodySmall),
          const SizedBox(height: 4),
          Text('Hello, ${state?.profile?['name'] ?? 'friend'} 👋',
              style: Theme.of(context)
                  .textTheme
                  .titleLarge
                  ?.copyWith(fontWeight: FontWeight.bold)),
          const SizedBox(height: 12),

          // ------------------------------------------------ Stats header
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceAround,
                    children: [
                      _Stat(
                          label: 'Streak',
                          value: '🔥 ${streak.current}',
                          warn: streak.atRisk),
                      _Stat(label: 'XP', value: '${state?.xp.total ?? 0}'),
                      _Stat(
                          label: 'Freezes',
                          value:
                              '❄️ ${state?.streak?.freezesAvailable ?? maxFreezes}'),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      Text('Lv ${level.current.level} · ${level.current.name}',
                          style: Theme.of(context).textTheme.bodySmall),
                      const SizedBox(width: 8),
                      Expanded(
                        child: LinearProgressIndicator(
                            value: level.progress.clamp(0.0, 1.0)),
                      ),
                      if (level.next != null) ...[
                        const SizedBox(width: 8),
                        Text('${level.next!.minXp} XP',
                            style: Theme.of(context).textTheme.bodySmall),
                      ],
                    ],
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 12),

          // ------------------------------------------------ Devotion
          if (_loading)
            const Center(
                child: Padding(
                    padding: EdgeInsets.all(24),
                    child: CircularProgressIndicator()))
          else ...[
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('TODAY\'S DEVOTION',
                        style: Theme.of(context)
                            .textTheme
                            .labelSmall
                            ?.copyWith(letterSpacing: 1.2)),
                    const SizedBox(height: 8),
                    Text(_devotion?['title'] ?? 'Spend time in the Word',
                        style: Theme.of(context)
                            .textTheme
                            .titleMedium
                            ?.copyWith(fontWeight: FontWeight.bold)),
                    Text(_devotion?['scripture_ref'] ?? 'Psalm 1:1-3',
                        style: TextStyle(
                            color: Theme.of(context).colorScheme.primary)),
                    const SizedBox(height: 8),
                    Text(
                      _devotion?['body'] ??
                          'No devotion published today — open your Bible in the Read tab and let the Word speak.',
                    ),
                    const SizedBox(height: 12),
                    if (!_devotionRead)
                      OutlinedButton(
                        onPressed: _markDevotionRead,
                        child: const Text('Mark devotion as read  ·  +15 XP'),
                      )
                    else
                      const Text('✅ Devotion read'),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 12),

            // ------------------------------------------------ SOAK
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    Text('SOAK JOURNAL',
                        style: Theme.of(context)
                            .textTheme
                            .labelSmall
                            ?.copyWith(letterSpacing: 1.2)),
                    const SizedBox(height: 8),
                    if (!_soakOpen) ...[
                      if (_todayEntry != null)
                        const Text('✅ Today\'s SOAK is complete. Well done!'),
                      const SizedBox(height: 8),
                      FilledButton(
                        onPressed: _openSoak,
                        child: Text(_todayEntry == null
                            ? "Start today's SOAK  ·  +50 XP"
                            : "Edit today's SOAK"),
                      ),
                    ] else ...[
                      TextField(
                        controller: _scripture,
                        decoration: const InputDecoration(
                            labelText: 'S · Scripture',
                            hintText: 'John 3:16',
                            border: OutlineInputBorder()),
                      ),
                      const SizedBox(height: 12),
                      _buildStyleControls(context),
                      const SizedBox(height: 10),
                      _buildPaperCanvas(context),
                      const SizedBox(height: 12),
                      FilledButton(
                        onPressed: _saving ? null : _completeSoak,
                        child: Text(
                            _saving ? 'Saving…' : "Complete today's SOAK"),
                      ),
                      TextButton(
                        onPressed: () => setState(() => _soakOpen = false),
                        child: const Text('Cancel'),
                      ),
                    ],
                  ],
                ),
              ),
            ),
            const SizedBox(height: 12),

            // ------------------------------------------------ Quizzes
            if (_quizzes.isNotEmpty)
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('DAILY QUIZ  ·  +5 XP each',
                          style: Theme.of(context)
                              .textTheme
                              .labelSmall
                              ?.copyWith(letterSpacing: 1.2)),
                      const SizedBox(height: 8),
                      for (var i = 0; i < _quizzes.length; i++)
                        _QuizTile(
                          index: i,
                          quiz: _quizzes[i],
                          chosen: _answered[_quizzes[i]['id'].toString()],
                          onChoose: (idx) => _answerQuiz(_quizzes[i], idx),
                        ),
                    ],
                  ),
                ),
              ),
          ],
          const SizedBox(height: 24),
        ],
      ),
    );
  }
}

class _Stat extends StatelessWidget {
  final String label;
  final String value;
  final bool warn;
  const _Stat({required this.label, required this.value, this.warn = false});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Text(value,
            style: Theme.of(context).textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.bold,
                color: warn ? Colors.orange : null)),
        Text(label, style: Theme.of(context).textTheme.bodySmall),
      ],
    );
  }
}

class _QuizTile extends StatelessWidget {
  final int index;
  final Map<String, dynamic> quiz;
  final int? chosen;
  final void Function(int) onChoose;
  const _QuizTile(
      {required this.index,
      required this.quiz,
      required this.chosen,
      required this.onChoose});

  @override
  Widget build(BuildContext context) {
    final choices = List<String>.from(quiz['choices'] as List);
    final correct = quiz['correct_index'] as int;
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('${index + 1}. ${quiz['question']}',
              style: const TextStyle(fontWeight: FontWeight.w600)),
          const SizedBox(height: 6),
          for (var i = 0; i < choices.length; i++)
            Padding(
              padding: const EdgeInsets.only(bottom: 4),
              child: OutlinedButton(
                onPressed: chosen == null ? () => onChoose(i) : null,
                style: OutlinedButton.styleFrom(
                  alignment: Alignment.centerLeft,
                  // Translucent tints read correctly in light and dark.
                  backgroundColor: chosen == null
                      ? null
                      : i == correct
                          ? Colors.green.withOpacity(0.25)
                          : i == chosen
                              ? Colors.red.withOpacity(0.25)
                              : null,
                ),
                child: Text(choices[i]),
              ),
            ),
        ],
      ),
    );
  }
}
