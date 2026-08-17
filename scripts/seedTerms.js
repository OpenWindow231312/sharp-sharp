// One-off script to bulk-load starter slang terms into Firestore.
// Run with: node scripts/seedTerms.js
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

// Dedicated technical account, created manually in the Firebase Console
// (Authentication → Users → Add user), used only to satisfy
// "request.auth != null" so this script can write under the real
// security rules. Not a real user — just lets us seed content.
const SEED_EMAIL = "seed@sharpsharp.local";
const SEED_PASSWORD = "seed@sharpsharp";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

const SEED_TERMS = [
  // --- English ---
  {
    term: "Eish",
    meaning: "Exclamation of frustration, surprise, or resignation.",
    examples: ["Eish, the taxi was late again."],
    language: "English",
  },
  {
    term: "Lekker",
    meaning: "Great, nice, enjoyable — used to describe almost anything good.",
    examples: ["That braai was lekker!"],
    language: "English",
  },
  {
    term: "Howzit",
    meaning: "A casual greeting, short for 'how is it going'.",
    examples: ["Howzit, long time no see!"],
    language: "English",
  },
  {
    term: "Just now",
    meaning: "Means 'soon' or 'later' — notoriously vague on actual timing.",
    examples: ["I'll do it just now."],
    language: "English",
  },
  {
    term: "Robot",
    meaning: "A traffic light.",
    examples: ["Turn left at the next robot."],
    language: "English",
  },
  {
    term: "Shame",
    meaning: "An expression of sympathy, or used to describe something cute.",
    examples: ["Shame, that puppy is so small!"],
    language: "English",
  },

  // --- Afrikaans ---
  {
    term: "Sjoe",
    meaning:
      'Interjection meaning "whew," "phew," or "wow" — shows shock, relief, wonder, or tiredness.',
    examples: ["Sjoe, ek is bly dis verby!"],
    language: "Afrikaans",
  },
  {
    term: "Boet",
    meaning: "Brother, or a friendly term for a close male friend.",
    examples: ["Thanks boet, I appreciate it."],
    language: "Afrikaans",
  },
  {
    term: "Lank",
    meaning: "Slang for 'a lot' or 'very'.",
    examples: ["That movie was lank good."],
    language: "Afrikaans",
  },
  {
    term: "Ag",
    meaning: "A filler exclamation, like 'oh well' or 'ah'.",
    examples: ["Ag, don't worry about it."],
    language: "Afrikaans",
  },
  {
    term: "Bakkie",
    meaning: "A pickup truck.",
    examples: ["We loaded the furniture onto the bakkie."],
    language: "Afrikaans",
  },

  // --- Zulu ---
  {
    term: "Yebo",
    meaning: "An informal, enthusiastic way of saying 'yes'.",
    examples: ["Yebo, let's go!"],
    language: "Zulu",
  },
  {
    term: "Sho",
    meaning: "An expression of agreement or approval, like 'cool' or 'okay'.",
    examples: ["Sho, I'll see you there."],
    language: "Zulu",
  },
  {
    term: "Hhayi",
    meaning: "An informal way to say 'no' or express disagreement.",
    examples: ["Hhayi, that's not right."],
    language: "Zulu",
  },

  // --- Xhosa ---
  {
    term: "Eita",
    meaning: "A casual greeting, similar to 'hey' or 'what's up'.",
    examples: ["Eita, how's it going?"],
    language: "Xhosa",
  },
  {
    term: "Yhu",
    meaning: "An exclamation of surprise or disbelief.",
    examples: ["Yhu, I didn't expect that!"],
    language: "Xhosa",
  },

  // --- Sotho ---
  {
    term: "Heita",
    meaning: "A casual greeting used across South African townships.",
    examples: ["Heita, long time!"],
    language: "Sotho",
  },
  {
    term: "Ausi",
    meaning: "An informal, respectful term for a young woman or older sister.",
    examples: ["Ask ausi over there for help."],
    language: "Sotho",
  },

  // --- Tsotsitaal ---
  {
    term: "Kasi",
    meaning: "Short for 'lokasie' — refers to a township.",
    examples: ["I grew up in the kasi."],
    language: "Tsotsitaal",
  },
  {
    term: "Zol",
    meaning: "A hand-rolled cigarette or joint.",
    examples: ["He was rolling a zol outside."],
    language: "Tsotsitaal",
  },
  {
    term: "Skhokho",
    meaning: "A smart, sharp, or well-respected person.",
    examples: ["She's a real skhokho at her job."],
    language: "Tsotsitaal",
  },

  // --- Sepedi ---
  {
    term: "Aowa",
    meaning: "An informal way to say 'no'.",
    examples: ["Aowa, I'm not going."],
    language: "Sepedi",
  },

  // --- Setswana ---
  {
    term: "Rra",
    meaning:
      "A respectful, informal way to address a man, like 'sir' or 'mister'.",
    examples: ["Thanks, rra."],
    language: "Setswana",
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
    console.log(`  added "${t.term}" (${t.language}) -> ${docRef.id}`);
  }
  console.log("Done!");
  process.exit(0);
}

seed().catch((error) => {
  console.error("Seeding failed:", error);
  process.exit(1);
});
