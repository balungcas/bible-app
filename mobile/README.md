# RTCM Bible — Flutter app

Native Android/iOS app for RTCM Bible. It talks to the **same Supabase backend**
as the web app, so members share one account, one streak, and one leaderboard
across web and mobile — logging in with the same name resumes the same profile.

## Features

- **Name-only login** (church fixed to RTCM-Tunasan), same account scheme as the web app
- **Today**: daily devotion (+15 XP), SOAK journal (+50 XP, streak + freezes), 3 daily quizzes (+5 XP each)
- **Read**: all 66 books, KJV / Tagalog / Parallel view, verses loaded from Supabase, mark-chapter-read (+10 XP, 5/day cap)
- **Journal**: private SOAK history (RLS-protected)
- **Community**: church leaderboard (Consistency / Points tabs) and badges

## Getting started

Requires the [Flutter SDK](https://docs.flutter.dev/get-started/install) (3.19+).

```bash
cd mobile

# 1. Generate the android/ and ios/ platform folders (first time only).
#    This does NOT overwrite the existing lib/ code or pubspec.yaml.
flutter create . --org ph.rtcm --project-name rtcm_bible --platforms android,ios

# 2. Install dependencies
flutter pub get

# 3. Run on a connected device or emulator
flutter run
```

## Release builds

```bash
# Android APK (share directly or upload to Play Console)
flutter build apk --release
# → build/app/outputs/flutter-apk/app-release.apk

# iOS (requires macOS + Xcode)
flutter build ios --release
```

## Configuration

All backend settings live in `lib/config.dart` (Supabase URL, publishable key,
and the RTCM-Tunasan church id). The publishable key is safe to ship — all data
access is enforced by Row Level Security in Postgres.

## Code map

| Path | Purpose |
| --- | --- |
| `lib/config.dart` | Supabase credentials + church constants |
| `lib/core/` | Pure logic ported from the web app: dates, XP/levels/streaks/badges, book registry |
| `lib/data/backend.dart` | Supabase data layer (same interface as web `backend/supabase.js`) |
| `lib/data/game_service.dart` | XP caps, streak advancement, badge awards (port of web `game.js`) |
| `lib/state/app_model.dart` | App-wide state (signed-in user + loaded game state) |
| `lib/screens/` | Auth, Today, Read, Journal, Community |
