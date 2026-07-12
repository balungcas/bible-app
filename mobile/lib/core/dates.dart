// All date math runs in the USER'S LOCAL timezone. entry_date is a calendar
// date string ('YYYY-MM-DD'), never a timestamp — deriving the day server-side
// is the #1 source of streak bugs around midnight.

String localDateString([DateTime? d]) {
  final t = d ?? DateTime.now();
  final m = t.month.toString().padLeft(2, '0');
  final day = t.day.toString().padLeft(2, '0');
  return '${t.year}-$m-$day';
}

String todayLocal() => localDateString();

/// Days between two 'YYYY-MM-DD' local dates (b - a). DST-safe: compares at noon.
int daysBetween(String a, String b) {
  final pa = a.split('-').map(int.parse).toList();
  final pb = b.split('-').map(int.parse).toList();
  final da = DateTime(pa[0], pa[1], pa[2], 12);
  final db = DateTime(pb[0], pb[1], pb[2], 12);
  return (db.difference(da).inHours / 24).round();
}

String monthStartLocal([DateTime? d]) {
  final t = d ?? DateTime.now();
  return localDateString(DateTime(t.year, t.month, 1));
}

const _months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const _weekdays = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday',
];

String formatDateLong(String dateStr) {
  final p = dateStr.split('-').map(int.parse).toList();
  final d = DateTime(p[0], p[1], p[2], 12);
  return '${_weekdays[d.weekday - 1]}, ${_months[d.month - 1]} ${d.day}, ${d.year}';
}
