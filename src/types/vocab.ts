export type Language = 'en' | 'zh';

export type UserMode = 'guest' | 'authenticated';

export interface UserAccount {
  email: string;
  fullName?: string;
  isApproved: boolean;
  registeredAt: string;
  geminiApiKey?: string;
}

export interface ExampleSentence {
  original: string;
  translation: string;
  pinyin?: string; // For Chinese
}

export interface PartOfSpeechEntry {
  id: string;
  pos: string; // e.g. "Noun", "Verb", "Adjective", "Idiom", "名", "动", "形"
  posVi: string; // e.g. "Danh từ", "Động từ", "Tính từ", "Thành ngữ"
  phonetic?: string; // specific IPA or pinyin for this POS if different
  meaningVi: string; // Meaning in Vietnamese
  definitionsEn?: string; // English definition (if helpful)
  examples: ExampleSentence[];
  collocations?: string[];
  synonyms?: string[];
}

export interface VocabWord {
  id: string;
  word: string;
  language: Language;
  phonetic: string; // IPA for English (e.g. /ˈrek.ɔːd/) or Pinyin for Chinese (e.g. nǐ hǎo)
  level?: string; // e.g. "B1", "C2" or "HSK 3", "HSK 5"
  hanziTraditional?: string; // For Chinese
  hanziSimplified?: string;  // For Chinese
  posEntries: PartOfSpeechEntry[];
  dateAdded: string; // YYYY-MM-DD
  timestamp: number;
  tags: string[];
  isStarred: boolean;
  mastery: 'new' | 'learning' | 'mastered';
  userNotes?: string;
}

export interface DailyVocabGroup {
  date: string; // YYYY-MM-DD
  formattedDate: string; // "Hôm nay, 22 Tháng 8, 2026"
  words: VocabWord[];
}

export type QuizMode = 'flashcard' | 'multiple_choice' | 'listening' | 'fill_blank';

export interface QuizQuestion {
  id: string;
  wordId: string;
  word: string;
  language: Language;
  phonetic: string;
  posVi: string;
  correctMeaning: string;
  options?: string[]; // 4 options for multiple choice
  correctAnswer: string;
  exampleSentence?: ExampleSentence;
  audioPromptText: string;
}

export interface QuizResult {
  total: number;
  correct: number;
  incorrectWords: VocabWord[];
  timeSpentSeconds: number;
  date: string;
}

export interface AppSettings {
  geminiApiKey: string;
  englishVoicePitch: number;
  englishVoiceRate: number;
  englishVoiceType: 'us' | 'uk';
  chineseVoicePitch: number;
  chineseVoiceRate: number;
  darkMode: boolean;
  dailyGoal: number; // e.g. 5 words/day
}
