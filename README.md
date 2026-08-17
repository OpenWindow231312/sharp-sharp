# Sharp Sharp 🇿🇦

**Real slang. Real South Africa.**

Sharp Sharp is a mobile app that teaches the real, _spoken_ slang, idioms, and everyday phrases of South Africa's local languages — the version people actually use, not the textbook one. Formal language learning teaches grammatically "correct" Zulu, Afrikaans, Xhosa, and others; real conversation is full of informal slang that varies by community and is rarely documented anywhere.

Sharp Sharp turns learning this informal layer into a swipe-based, gamified experience: users swipe through a live-updating feed of slang terms submitted by other users, save the ones they want to learn, and contribute words of their own.

Built for **Interactive Development 300** at Open Window, structured around three randomly-drawn inspiration cards:

| Inspiration Card                        | How Sharp Sharp answers it                                                                                      |
| --------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| **Learn Something** (goal)              | Teaches real, spoken SA slang across multiple languages                                                         |
| **Real-Time Data** (device interaction) | Live-updating term feed via Firestore `onSnapshot` — new submissions from other users appear without refreshing |
| **Landscape Support** (constraint)      | Dedicated "Learn Mode" flashcard study screen is landscape-locked                                               |

---

## ✨ Features

- **Authentication** — email/password sign-up and login via Firebase Auth, with persistent sessions (stays logged in between app opens)
- **Onboarding** — first-time flow: pick the languages you're interested in, then your reason for learning
- **Swipeable Feed** — live Firestore-backed deck of slang terms; swipe right to save (+5 XP), swipe left to skip, with haptic feedback on both
- **Add a Term** — 5-step guided wizard for submitting your own slang term (word → language → meaning → example sentences → preview), rewarded with +20 XP and a celebration screen
- **Saved Terms** — your personal dictionary of everything you've swiped right on
- **Learn Mode** — landscape-locked flashcard study screen that quizzes you on your saved terms
- **My Terms (Profile)** — full CRUD on your own submissions: view, edit, and delete any term you've added
- **XP & Levelling** — a 5-tier rank system (Newbie → Sharp Sharp) driven by an XP economy tied to swiping and contributing
- **Badges** — unlockable achievement medallions (four distinct shapes escalating by tier) tied to real usage stats — no extra data fields required
- **Micro-interactions** — animated progress bars, XP toasts, swipe-card physics, wizard step transitions, and a celebration screen on term submission

---

## 📱 Screenshots

> _TODO: add screenshots/mockups here before submission — the brief requires visual mockups or diagrams in the README. Recommended: one screenshot per major screen (Login, Onboarding, Feed, Add, Saved, Learn Mode, Profile), plus a simple user-flow diagram._

---

## 🛠 Tech Stack

- **Framework:** [React Native](https://reactnative.dev/) (TypeScript) via [Expo](https://expo.dev) (SDK 54), [Expo Router](https://docs.expo.dev/router/introduction/) for file-based navigation
- **Backend:** [Firebase](https://firebase.google.com/) — Authentication (email/password), Firestore (real-time data), with Firebase Storage available if needed
- **Key libraries:**
  - `react-native-deck-swiper` — swipeable card feed
  - `expo-haptics` — tactile feedback on swipe/save actions
  - `expo-screen-orientation` — landscape lock for Learn Mode
  - `react-native-reanimated` + `react-native-svg` — animations and badge medallion graphics
  - `phosphor-react-native` — icon set
  - `@react-native-async-storage/async-storage` — persists Firebase Auth sessions between app launches
  - `@expo-google-fonts/*` (Baloo 2, IBM Plex Mono, Plus Jakarta Sans) — custom type system
- **Design system:** a lightweight custom theme (`constants/designTheme.ts`) with reusable `Button`, `Text`, `Card`, `Input`, and `Chip` components — deliberately wireframe-styled while the functional core is built out; visual branding is layered in afterward
- **Version control:** Git via GitHub Desktop

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (LTS recommended)
- [Expo Go](https://expo.dev/go) app on your iOS or Android device, **or** an iOS Simulator / Android Emulator set up locally
- A [Firebase](https://firebase.google.com/) project (or use the local emulator — see below)

### 1. Clone and install

```bash
git clone <your-repo-url>
cd sharp-sharp
npm install
```

### 2. Set up environment variables

Create a `.env` file in the project root with your Firebase project's config values:
EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id

You'll find these values in your Firebase project settings under **Project settings → General → Your apps**.

### 3. Run the app

```bash
npx expo start
```

Scan the QR code with **Expo Go** (physical device) or press `i` / `a` in the terminal to launch the iOS Simulator / Android Emulator.

### Optional: run against the local Firebase Emulator instead of the cloud project

For offline development without touching real production data:

```bash
firebase emulators:start
```

Leave that running in its own terminal tab, then run `npx expo start` in a separate tab as normal. The app auto-detects and connects to the emulator when running in development mode — no config changes needed. Note: emulator data is **not persisted** between restarts unless exported manually.

---

## 📂 Project Structure (high level)

app/
auth/ → login, signup
onboarding/ → language picker, motivation step
(tabs)/ → Feed, Add, Saved, Profile (bottom tab navigation)
learn.tsx → landscape-locked flashcard study mode
edit-term.tsx → edit screen for user-submitted terms
constants/ → design theme, XP levels, badge definitions, mock data
components/ui/ → reusable design system components
context/ → Auth and Onboarding React context providers
services/ → Firebase config + Firestore read/write helpers
scripts/ → one-off utilities (e.g. Firestore seed script)

---

## ⚠️ Known Limitations / Roadmap

Being upfront about what's still in progress:

- **Dashboard Summary screen** — not yet implemented as a dedicated screen (currently, level/badge info lives inside the Profile tab)
- **Android testing** — primarily tested on a physical iPhone via Expo Go so far; Android-specific testing in progress
- **Google Sign-In** — button is present on the login screen but currently disabled ("coming soon")
- **App icon & splash screen** — currently using Expo's default placeholders; custom branding is planned
- **Firestore security rules** — current rules are permissive for development (`allow read, write: if request.auth != null`); tightened, production-ready rules are planned before any public launch
- **Language coverage** — Zulu, Afrikaans, and Xhosa are the most reliably sourced languages in the seed data. Sepedi, Setswana, Sesotho, Xitsonga, siSwati, and Tshivenda terms were intentionally excluded from the seed set where accuracy couldn't be verified, rather than risk teaching incorrect slang
- **Streak tracking** — not yet implemented (would require an additional `lastActiveDate` field on the user profile)

---

## 👥 Contributions

Built solo by **Anika** as a final assignment for Interactive Development 300 at Open Window.

---

## 🙏 Acknowledgements

- Open Window, Lecturer Tsungai Katsuro
- [Expo](https://expo.dev) and [Firebase](https://firebase.google.com) documentation
- Everyone who contributed real, spoken slang terms to the seed data
