import type { SlangTerm } from '@/types/slangTerm';

const now = new Date();

export const MOCK_TERMS: SlangTerm[] = [
  // --- English ---
  { id: 'mock-1', term: 'Eish', meaning: 'Exclamation of frustration, surprise, or resignation.', examples: ['Eish, the taxi was late again.'], language: 'English', submittedBy: 'mock-data', submittedByName: 'Sharp Sharp Team', createdAt: now },
  { id: 'mock-2', term: 'Lekker', meaning: 'Great, nice, enjoyable — used to describe almost anything good.', examples: ['That braai was lekker!'], language: 'English', submittedBy: 'mock-data', submittedByName: 'Sharp Sharp Team', createdAt: now },
  { id: 'mock-3', term: 'Howzit', meaning: "A casual greeting, short for 'how is it going'.", examples: ['Howzit, long time no see!'], language: 'English', submittedBy: 'mock-data', submittedByName: 'Sharp Sharp Team', createdAt: now },
  { id: 'mock-4', term: 'Just now', meaning: "Means 'soon' or 'later' — notoriously vague on actual timing.", examples: ["I'll do it just now."], language: 'English', submittedBy: 'mock-data', submittedByName: 'Sharp Sharp Team', createdAt: now },
  { id: 'mock-5', term: 'Robot', meaning: 'A traffic light.', examples: ['Turn left at the next robot.'], language: 'English', submittedBy: 'mock-data', submittedByName: 'Sharp Sharp Team', createdAt: now },
  { id: 'mock-6', term: 'Shame', meaning: 'An expression of sympathy, or used to describe something cute.', examples: ['Shame, that puppy is so small!'], language: 'English', submittedBy: 'mock-data', submittedByName: 'Sharp Sharp Team', createdAt: now },
  { id: 'mock-7', term: 'Now now', meaning: "Sooner than 'just now', but still not immediate.", examples: ["I'll be there now now."], language: 'English', submittedBy: 'mock-data', submittedByName: 'Sharp Sharp Team', createdAt: now },

  // --- Afrikaans ---
  { id: 'mock-8', term: 'Sjoe', meaning: 'Interjection meaning "whew," "phew," or "wow" — shows shock, relief, wonder, or tiredness.', examples: ['Sjoe, ek is bly dis verby!'], language: 'Afrikaans', submittedBy: 'mock-data', submittedByName: 'Sharp Sharp Team', createdAt: now },
  { id: 'mock-9', term: 'Boet', meaning: 'Brother, or a friendly term for a close male friend.', examples: ['Thanks boet, I appreciate it.'], language: 'Afrikaans', region: 'Nationwide', submittedBy: 'mock-data', submittedByName: 'Sharp Sharp Team', createdAt: now },
  { id: 'mock-10', term: 'Lank', meaning: "Slang for 'a lot' or 'very'.", examples: ['That movie was lank good.'], language: 'Afrikaans', submittedBy: 'mock-data', submittedByName: 'Sharp Sharp Team', createdAt: now },
  { id: 'mock-11', term: 'Ag', meaning: "A filler exclamation, like 'oh well' or 'ah'.", examples: ["Ag, don't worry about it."], language: 'Afrikaans', submittedBy: 'mock-data', submittedByName: 'Sharp Sharp Team', createdAt: now },
  { id: 'mock-12', term: 'Bakkie', meaning: 'A pickup truck.', examples: ['We loaded the furniture onto the bakkie.'], language: 'Afrikaans', submittedBy: 'mock-data', submittedByName: 'Sharp Sharp Team', createdAt: now },
  { id: 'mock-13', term: 'Moerse', meaning: "An intensifier meaning 'huge' or 'extreme'.", examples: ['That was a moerse party.'], language: 'Afrikaans', submittedBy: 'mock-data', submittedByName: 'Sharp Sharp Team', createdAt: now },

  // --- Zulu ---
  { id: 'mock-14', term: 'Yebo', meaning: "An informal, enthusiastic way of saying 'yes'.", examples: ["Yebo, let's go!"], language: 'Zulu', submittedBy: 'mock-data', submittedByName: 'Sharp Sharp Team', createdAt: now },
  { id: 'mock-15', term: 'Sho', meaning: "An expression of agreement or approval, like 'cool' or 'okay'.", examples: ["Sho, I'll see you there."], language: 'Zulu', submittedBy: 'mock-data', submittedByName: 'Sharp Sharp Team', createdAt: now },
  { id: 'mock-16', term: 'Hhayi', meaning: "An informal way to say 'no' or express disagreement.", examples: ["Hhayi, that's not right."], language: 'Zulu', submittedBy: 'mock-data', submittedByName: 'Sharp Sharp Team', createdAt: now },
  { id: 'mock-17', term: 'Sawubona', meaning: "A warm, informal greeting meaning 'I see you'.", examples: ['Sawubona, how are you today?'], language: 'Zulu', submittedBy: 'mock-data', submittedByName: 'Sharp Sharp Team', createdAt: now },

  // --- Xhosa ---
  { id: 'mock-18', term: 'Eita', meaning: "A casual greeting, similar to 'hey' or 'what's up'.", examples: ["Eita, how's it going?"], language: 'Xhosa', submittedBy: 'mock-data', submittedByName: 'Sharp Sharp Team', createdAt: now },
  { id: 'mock-19', term: 'Yhu', meaning: 'An exclamation of surprise or disbelief.', examples: ["Yhu, I didn't expect that!"], language: 'Xhosa', submittedBy: 'mock-data', submittedByName: 'Sharp Sharp Team', createdAt: now },
  { id: 'mock-20', term: 'Molo', meaning: "An informal singular greeting, meaning 'hello'.", examples: ['Molo, nice to meet you.'], language: 'Xhosa', submittedBy: 'mock-data', submittedByName: 'Sharp Sharp Team', createdAt: now },

  // --- Sotho ---
  { id: 'mock-21', term: 'Heita', meaning: 'A casual greeting used across South African townships.', examples: ['Heita, long time!'], language: 'Sotho', submittedBy: 'mock-data', submittedByName: 'Sharp Sharp Team', createdAt: now },
  { id: 'mock-22', term: 'Ausi', meaning: 'An informal, respectful term for a young woman or older sister.', examples: ['Ask ausi over there for help.'], language: 'Sotho', submittedBy: 'mock-data', submittedByName: 'Sharp Sharp Team', createdAt: now },
  { id: 'mock-23', term: 'Abuti', meaning: 'An informal, respectful term for a young man or older brother.', examples: ['Abuti helped me carry the bags.'], language: 'Sotho', submittedBy: 'mock-data', submittedByName: 'Sharp Sharp Team', createdAt: now },

  // --- Tsotsitaal ---
  { id: 'mock-24', term: 'Kasi', meaning: "Short for 'lokasie' — refers to a township.", examples: ['I grew up in the kasi.'], language: 'Tsotsitaal', region: 'Cape Flats', submittedBy: 'mock-data', submittedByName: 'Sharp Sharp Team', createdAt: now },
  { id: 'mock-25', term: 'Zol', meaning: 'A hand-rolled cigarette or joint.', examples: ['He was rolling a zol outside.'], language: 'Tsotsitaal', submittedBy: 'mock-data', submittedByName: 'Sharp Sharp Team', createdAt: now },
  { id: 'mock-26', term: 'Skhokho', meaning: 'A smart, sharp, or well-respected person.', examples: ["She's a real skhokho at her job."], language: 'Tsotsitaal', submittedBy: 'mock-data', submittedByName: 'Sharp Sharp Team', createdAt: now },
  { id: 'mock-27', term: 'Bru', meaning: "Friend or mate, similar to 'boet' but more township/street slang.", examples: ["What's up, bru?"], language: 'Tsotsitaal', submittedBy: 'mock-data', submittedByName: 'Sharp Sharp Team', createdAt: now },

  // --- Sepedi ---
  { id: 'mock-28', term: 'Aowa', meaning: "An informal way to say 'no'.", examples: ["Aowa, I'm not going."], language: 'Sepedi', submittedBy: 'mock-data', submittedByName: 'Sharp Sharp Team', createdAt: now },
  { id: 'mock-29', term: 'Ee', meaning: "An informal way to say 'yes'.", examples: ['Ee, that sounds good.'], language: 'Sepedi', submittedBy: 'mock-data', submittedByName: 'Sharp Sharp Team', createdAt: now },

  // --- Setswana ---
  { id: 'mock-30', term: 'Rra', meaning: "A respectful, informal way to address a man, like 'sir' or 'mister'.", examples: ['Thanks, rra.'], language: 'Setswana', submittedBy: 'mock-data', submittedByName: 'Sharp Sharp Team', createdAt: now },
];
