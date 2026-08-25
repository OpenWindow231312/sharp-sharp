// One-off script to add a second batch of starter slang terms, each
// attributed to a distinct fake contributor name (via authorDisplayName)
// instead of the uniform "Sharp Sharp Team" credit scripts/seedTerms.js
// uses. Run with: node scripts/seedContributorTerms.js
// (Uses the same public Firebase config values already in your .env —
// hardcoded here since this script runs outside Expo, which is what
// normally reads .env for you.)

const { initializeApp } = require("firebase/app");
const {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
} = require("firebase/firestore");
const { getAuth, signInWithEmailAndPassword } = require("firebase/auth");

const firebaseConfig = {
  apiKey: "AIzaSyDhhEP4hBhxJaZ0x4L_6iQqYi5T5R8deog",
  authDomain: "sharp-sharp-2f95c.firebaseapp.com",
  projectId: "sharp-sharp-2f95c",
  storageBucket: "sharp-sharp-2f95c.firebasestorage.app",
  messagingSenderId: "632353288731",
  appId: "1:632353288731:web:1e0ed2e297b10f4efdfebe",
};

// Same dedicated technical account scripts/seedTerms.js uses, created
// manually in the Firebase Console (Authentication -> Users -> Add user),
// used only to satisfy "request.auth != null" so this script can write
// under the real security rules. Not a real user — just lets us seed
// content.
const SEED_EMAIL = "seed@sharpsharp.local";
const SEED_PASSWORD = "seed@sharpsharp";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Yebo (Zulu), Robot (English), Just now (English), and Boet (Afrikaans)
// from the original brief were skipped here — scripts/seedTerms.js
// already seeded those exact words under the same language.
const SEED_TERMS = [
  {
    term: "Now now",
    meaning: "Sooner than \"just now,\" but still not instant.",
    examples: [
      {
        sentence: "I'm coming now now.",
        context:
          "One step more urgent than \"just now,\" but still gives some wiggle room.",
      },
    ],
    language: "English",
    authorDisplayName: "Kagiso",
  },
  {
    term: "Bru",
    meaning: "Friend, mate.",
    examples: [
      {
        sentence: "Howzit, bru?",
        context:
          "A casual greeting between friends, similar energy to \"bro\" elsewhere.",
      },
    ],
    language: "English",
    authorDisplayName: "Sipho M.",
  },
  {
    term: "Jol",
    meaning: "To party, or a party/outing itself.",
    examples: [
      {
        sentence: "We're having a jol this weekend.",
        context:
          "Can describe the event itself or the act of going out and having fun.",
      },
    ],
    language: "English",
    authorDisplayName: "Lerato",
  },
  {
    term: "Kif",
    meaning: "Cool, great, awesome.",
    examples: [
      {
        sentence: "That movie was so kif.",
        context: "An easy word to drop into almost any sentence of approval.",
      },
    ],
    language: "English",
    authorDisplayName: "Kagiso",
  },
  {
    term: "Ekse",
    meaning:
      'An exclamation, roughly "hey" or "excuse me" — often used to get someone\'s attention.',
    examples: [
      {
        sentence: "Ekse, wait up!",
        context: "Sharp and direct — a way to interrupt or call out to someone quickly.",
      },
    ],
    language: "Tsotsitaal",
    authorDisplayName: "Sipho M.",
  },
  {
    term: "Mzansi",
    meaning: "An affectionate nickname for South Africa itself.",
    examples: [
      {
        sentence: "Proudly Mzansi.",
        context: "Used with pride, especially around national identity or local products.",
      },
    ],
    language: "English",
    authorDisplayName: "Thandi K.",
  },
];

async function seed() {
  console.log("Signing in as seed account...");
  await signInWithEmailAndPassword(auth, SEED_EMAIL, SEED_PASSWORD);
  console.log("Signed in. Seeding terms...");

  console.log(`Seeding ${SEED_TERMS.length} terms into slang_terms...`);
  for (const t of SEED_TERMS) {
    const docRef = await addDoc(collection(db, "slang_terms"), {
      ...t,
      submittedBy: "seed-data",
      submittedByName: "Sharp Sharp Team",
      createdAt: serverTimestamp(),
    });
    console.log(
      `  added "${t.term}" (${t.language}) by ${t.authorDisplayName} -> ${docRef.id}`,
    );
  }
  console.log("Done!");
  process.exit(0);
}

seed().catch((error) => {
  console.error("Seeding failed:", error);
  process.exit(1);
});
