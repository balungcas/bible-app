// Canonical 66-book registry — mirrors supabase/seed.sql and the web app's
// src/lib/books.js. Kept static so the Read tab renders instantly offline.

class Book {
  final String code;
  final String testament; // 'OT' | 'NT'
  final String nameEn;
  final String nameTl;
  final int chapters;
  const Book(this.code, this.testament, this.nameEn, this.nameTl, this.chapters);
}

const books = [
  Book('GEN', 'OT', 'Genesis', 'Genesis', 50),
  Book('EXO', 'OT', 'Exodus', 'Exodo', 40),
  Book('LEV', 'OT', 'Leviticus', 'Levitico', 27),
  Book('NUM', 'OT', 'Numbers', 'Mga Bilang', 36),
  Book('DEU', 'OT', 'Deuteronomy', 'Deuteronomio', 34),
  Book('JOS', 'OT', 'Joshua', 'Josue', 24),
  Book('JDG', 'OT', 'Judges', 'Mga Hukom', 21),
  Book('RUT', 'OT', 'Ruth', 'Ruth', 4),
  Book('1SA', 'OT', '1 Samuel', '1 Samuel', 31),
  Book('2SA', 'OT', '2 Samuel', '2 Samuel', 24),
  Book('1KI', 'OT', '1 Kings', '1 Mga Hari', 22),
  Book('2KI', 'OT', '2 Kings', '2 Mga Hari', 25),
  Book('1CH', 'OT', '1 Chronicles', '1 Mga Cronica', 29),
  Book('2CH', 'OT', '2 Chronicles', '2 Mga Cronica', 36),
  Book('EZR', 'OT', 'Ezra', 'Ezra', 10),
  Book('NEH', 'OT', 'Nehemiah', 'Nehemias', 13),
  Book('EST', 'OT', 'Esther', 'Ester', 10),
  Book('JOB', 'OT', 'Job', 'Job', 42),
  Book('PSA', 'OT', 'Psalms', 'Mga Awit', 150),
  Book('PRO', 'OT', 'Proverbs', 'Mga Kawikaan', 31),
  Book('ECC', 'OT', 'Ecclesiastes', 'Eclesiastes', 12),
  Book('SNG', 'OT', 'Song of Solomon', 'Ang Awit ni Solomon', 8),
  Book('ISA', 'OT', 'Isaiah', 'Isaias', 66),
  Book('JER', 'OT', 'Jeremiah', 'Jeremias', 52),
  Book('LAM', 'OT', 'Lamentations', 'Mga Panaghoy', 5),
  Book('EZK', 'OT', 'Ezekiel', 'Ezekiel', 48),
  Book('DAN', 'OT', 'Daniel', 'Daniel', 12),
  Book('HOS', 'OT', 'Hosea', 'Oseas', 14),
  Book('JOL', 'OT', 'Joel', 'Joel', 3),
  Book('AMO', 'OT', 'Amos', 'Amos', 9),
  Book('OBA', 'OT', 'Obadiah', 'Obadias', 1),
  Book('JON', 'OT', 'Jonah', 'Jonas', 4),
  Book('MIC', 'OT', 'Micah', 'Mikas', 7),
  Book('NAM', 'OT', 'Nahum', 'Nahum', 3),
  Book('HAB', 'OT', 'Habakkuk', 'Habacuc', 3),
  Book('ZEP', 'OT', 'Zephaniah', 'Sofonias', 3),
  Book('HAG', 'OT', 'Haggai', 'Hagai', 2),
  Book('ZEC', 'OT', 'Zechariah', 'Zacarias', 14),
  Book('MAL', 'OT', 'Malachi', 'Malakias', 4),
  Book('MAT', 'NT', 'Matthew', 'Mateo', 28),
  Book('MRK', 'NT', 'Mark', 'Marcos', 16),
  Book('LUK', 'NT', 'Luke', 'Lucas', 24),
  Book('JHN', 'NT', 'John', 'Juan', 21),
  Book('ACT', 'NT', 'Acts', 'Mga Gawa', 28),
  Book('ROM', 'NT', 'Romans', 'Mga Taga-Roma', 16),
  Book('1CO', 'NT', '1 Corinthians', '1 Mga Taga-Corinto', 16),
  Book('2CO', 'NT', '2 Corinthians', '2 Mga Taga-Corinto', 13),
  Book('GAL', 'NT', 'Galatians', 'Mga Taga-Galacia', 6),
  Book('EPH', 'NT', 'Ephesians', 'Mga Taga-Efeso', 6),
  Book('PHP', 'NT', 'Philippians', 'Mga Taga-Filipos', 4),
  Book('COL', 'NT', 'Colossians', 'Mga Taga-Colosas', 4),
  Book('1TH', 'NT', '1 Thessalonians', '1 Mga Taga-Tesalonica', 5),
  Book('2TH', 'NT', '2 Thessalonians', '2 Mga Taga-Tesalonica', 3),
  Book('1TI', 'NT', '1 Timothy', '1 Timoteo', 6),
  Book('2TI', 'NT', '2 Timothy', '2 Timoteo', 4),
  Book('TIT', 'NT', 'Titus', 'Tito', 3),
  Book('PHM', 'NT', 'Philemon', 'Filemon', 1),
  Book('HEB', 'NT', 'Hebrews', 'Mga Hebreo', 13),
  Book('JAS', 'NT', 'James', 'Santiago', 5),
  Book('1PE', 'NT', '1 Peter', '1 Pedro', 5),
  Book('2PE', 'NT', '2 Peter', '2 Pedro', 3),
  Book('1JN', 'NT', '1 John', '1 Juan', 5),
  Book('2JN', 'NT', '2 John', '2 Juan', 1),
  Book('3JN', 'NT', '3 John', '3 Juan', 1),
  Book('JUD', 'NT', 'Jude', 'Judas', 1),
  Book('REV', 'NT', 'Revelation', 'Pahayag', 22),
];

final bookByCode = {for (final b in books) b.code: b};
