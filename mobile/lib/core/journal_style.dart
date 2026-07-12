import 'package:flutter/material.dart';

// Shared SOAK journal styling model — mirrors the web app's src/lib/journalStyle.js
// so entries decorated on either client render the same. Persisted in
// soak_entries.style (jsonb):
//   { paper: 'plain'|'lined'|'parchment'|'dotted', stickers: [{ e, x, y }] }
// x/y are 0..1 fractional coordinates so stickers land right at any width.

// Shared vertical reference for sticker placement so a sticker saved in the
// editor lands at the same offset in the read-only viewer (their content
// heights differ; a fixed reference keeps placement consistent).
const kJournalCanvasHeight = 260.0;

const papers = ['plain', 'lined', 'parchment', 'dotted'];
const paperLabels = {
  'plain': 'Plain',
  'lined': 'Lined',
  'parchment': 'Parchment',
  'dotted': 'Dotted',
};

const stickerSet = ['🙏', '✝️', '🕊️', '❤️', '🔥', '⭐', '📖', '🌱', '💡', '🎯', '😊', '🌿'];

class Sticker {
  final String e;
  double x;
  double y;
  Sticker(this.e, this.x, this.y);

  factory Sticker.fromMap(Map<String, dynamic> m) => Sticker(
        m['e'] as String,
        (m['x'] as num).toDouble(),
        (m['y'] as num).toDouble(),
      );

  Map<String, dynamic> toMap() => {'e': e, 'x': x, 'y': y};
}

class JournalStyle {
  final String paper;
  final List<Sticker> stickers;
  JournalStyle(this.paper, this.stickers);

  factory JournalStyle.fromJson(dynamic raw) {
    if (raw is! Map) return JournalStyle('plain', []);
    final paper = papers.contains(raw['paper']) ? raw['paper'] as String : 'plain';
    final list = raw['stickers'];
    final stickers = <Sticker>[];
    if (list is List) {
      for (final s in list) {
        if (s is Map) stickers.add(Sticker.fromMap(Map<String, dynamic>.from(s)));
      }
    }
    return JournalStyle(paper, stickers);
  }

  Map<String, dynamic> toJson() =>
      {'paper': paper, 'stickers': stickers.map((s) => s.toMap()).toList()};
}

/// Background decoration for a paper style. Uses gradients only (no assets),
/// layered over the card surface so it works in light and dark.
BoxDecoration? paperDecoration(String paper) {
  switch (paper) {
    case 'parchment':
      return BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            const Color(0xFFD6BB8C).withOpacity(0.22),
            const Color(0xFFB48E5C).withOpacity(0.15),
          ],
        ),
      );
    default:
      return null;
  }
}

/// Optional foreground painter for line/dot patterns.
CustomPainter? paperPainter(String paper, Color color) {
  switch (paper) {
    case 'lined':
      return _LinedPainter(color.withOpacity(0.25));
    case 'dotted':
      return _DottedPainter(color.withOpacity(0.35));
    default:
      return null;
  }
}

class _LinedPainter extends CustomPainter {
  final Color color;
  _LinedPainter(this.color);
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = color
      ..strokeWidth = 1;
    for (double y = 28; y < size.height; y += 28) {
      canvas.drawLine(Offset(0, y), Offset(size.width, y), paint);
    }
  }

  @override
  bool shouldRepaint(covariant _LinedPainter old) => old.color != color;
}

class _DottedPainter extends CustomPainter {
  final Color color;
  _DottedPainter(this.color);
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()..color = color;
    for (double y = 12; y < size.height; y += 18) {
      for (double x = 12; x < size.width; x += 18) {
        canvas.drawCircle(Offset(x, y), 1.5, paint);
      }
    }
  }

  @override
  bool shouldRepaint(covariant _DottedPainter old) => old.color != color;
}
