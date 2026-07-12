import 'package:flutter/material.dart';

// Highlight palette shared by the reader. Colors match the web app's five
// highlight options. Backgrounds are translucent so they read on light + dark.

const highlightColors = ['yellow', 'green', 'blue', 'pink', 'orange'];

const _swatch = {
  'yellow': Color(0xFFFACC15),
  'green': Color(0xFF4ADE80),
  'blue': Color(0xFF38BDF8),
  'pink': Color(0xFFF472B6),
  'orange': Color(0xFFFB923C),
};

/// Solid swatch color for the picker dots.
Color highlightSwatch(String color) => _swatch[color] ?? Colors.yellow;

/// Translucent background painted behind highlighted verse text.
Color highlightBackground(String color) =>
    (_swatch[color] ?? Colors.yellow).withOpacity(0.35);
