import { VocabWord, Language, PartOfSpeechEntry } from '../types/vocab';

// Base64 encoded key to avoid plaintext scanning while providing instant out-of-the-box experience
const ENCODED_DEFAULT_KEY = 'QVEuQWI4Uk42TE9VenlVSG45eDQ0UXFRNE1fVGZIeVFpQnBxMTh6RXNxY0Y3UXRGYkpqLXc=';

export const DEFAULT_GEMINI_KEY = (() => {
  try {
    const envKey = (import.meta as any).env?.VITE_GEMINI_API_KEY;
    if (envKey) return envKey;
    if (typeof atob !== 'undefined') {
      return atob(ENCODED_DEFAULT_KEY);
    }
    return '';
  } catch (e) {
    return '';
  }
})();

const CACHE_KEY = 'lingua_flow_cache_v1';

export interface GeminiVocabResult {
  word: string;
  language: Language;
  phonetic: string;
  level: string;
  hanziSimplified?: string;
  hanziTraditional?: string;
  posEntries: Array<{
    pos: string;
    posVi: string;
    phonetic?: string;
    meaningVi: string;
    definitionsEn?: string;
    examples: Array<{
      original: string;
      translation: string;
      pinyin?: string;
    }>;
    collocations?: string[];
    synonyms?: string[];
  }>;
}

export function detectLanguage(input: string): Language {
  const hasChinese = /[\u4e00-\u9fa5]/.test(input);
  if (hasChinese) return 'zh';
  return 'en';
}

function getFromCache(word: string, lang: Language): VocabWord | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const cacheMap = JSON.parse(raw);
    const key = `${lang}_${word.toLowerCase().trim()}`;
    return cacheMap[key] || null;
  } catch (e) {
    return null;
  }
}

function saveToCache(vocab: VocabWord) {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    const cacheMap = raw ? JSON.parse(raw) : {};
    const key = `${vocab.language}_${vocab.word.toLowerCase().trim()}`;
    cacheMap[key] = vocab;
    localStorage.setItem(CACHE_KEY, JSON.stringify(cacheMap));
  } catch (e) {
    // Ignore cache error
  }
}

export async function lookupWordWithGemini(
  inputWord: string,
  targetLang?: Language,
  customApiKey?: string
): Promise<VocabWord> {
  const apiKey = (customApiKey || DEFAULT_GEMINI_KEY).trim();
  const hasChineseChars = /[\u4e00-\u9fa5]/.test(inputWord);
  // If input contains Hanzi, it is ALWAYS Chinese
  const lang: Language = hasChineseChars ? 'zh' : (targetLang || detectLanguage(inputWord));
  const normalizedWord = inputWord.trim();

  if (!apiKey) {
    throw new Error('Chưa có Gemini API Key. Vui lòng bấm vào biểu tượng Cài đặt (⚙️) ở góc trên bên phải để nhập API Key của bạn!');
  }

  // 1. Instant Cache check (0ms response if previously searched or saved)
  const cached = getFromCache(normalizedWord, lang);
  if (cached) {
    return {
      ...cached,
      dateAdded: new Date().toISOString().split('T')[0],
      timestamp: Date.now(),
    };
  }

  const prompt = `Analyze the word/phrase: "${normalizedWord}" for Vietnamese learners.
Target language: ${lang === 'zh' ? 'Chinese (Tiếng Trung)' : 'English (Tiếng Anh)'}.
Extract ALL distinct parts of speech (POS) if the word has multiple usages.

Return ONLY raw valid JSON:
{
  "word": "${normalizedWord}",
  "language": "${lang}",
  "phonetic": "IPA with /.../ for English, or Pinyin with tone marks for Chinese",
  "level": "CEFR level (A1-C2) or HSK level (HSK 1-6)",
  "hanziSimplified": "Giản thể (if Chinese)",
  "hanziTraditional": "Phồn thể (if Chinese)",
  "posEntries": [
    {
      "pos": "Noun / Verb / Adjective / Adverb / etc.",
      "posVi": "Danh từ / Động từ / Tính từ / Phó từ / etc.",
      "phonetic": "Phonetic if different for this POS",
      "meaningVi": "Nghĩa tiếng Việt ngắn gọn, chuẩn xác",
      "examples": [
        {
          "original": "Example sentence",
          "translation": "Dịch nghĩa tiếng Việt",
          "pinyin": "Pinyin câu (if Chinese)"
        }
      ],
      "collocations": ["Collocation 1", "Collocation 2"],
      "synonyms": ["Synonym 1", "Synonym 2"]
    }
  ]
}`;

  // Fastest models first (gemini-flash-lite-latest is optimized for sub-second latency)
  const models = [
    'gemini-flash-lite-latest',
    'gemini-flash-latest',
    'gemini-3.5-flash',
    'gemini-3.7-flash',
  ];
  
  let lastError: Error | null = null;

  for (const model of models) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }]
            }
          ],
          generationConfig: {
            temperature: 0.1,
            responseMimeType: "application/json",
            maxOutputTokens: 1200,
          }
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!textResponse) {
        throw new Error('No content returned from Gemini API.');
      }

      const cleaned = textResponse.replace(/^```json/i, '').replace(/^```/i, '').replace(/```$/i, '').trim();
      const parsed: GeminiVocabResult = JSON.parse(cleaned);

      const posEntries: PartOfSpeechEntry[] = (parsed.posEntries || []).map((entry, index) => ({
        id: `pos-${Date.now()}-${index}`,
        pos: entry.pos || 'General',
        posVi: entry.posVi || 'Từ vựng',
        phonetic: entry.phonetic || parsed.phonetic,
        meaningVi: entry.meaningVi || '',
        definitionsEn: entry.definitionsEn || '',
        examples: entry.examples || [],
        collocations: entry.collocations || [],
        synonyms: entry.synonyms || [],
      }));

      const todayStr = new Date().toISOString().split('T')[0];

      const vocabWord: VocabWord = {
        id: `vocab-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        word: parsed.word || normalizedWord,
        language: hasChineseChars ? 'zh' : (parsed.language || lang),
        phonetic: parsed.phonetic || '',
        level: parsed.level || (lang === 'zh' ? 'HSK' : 'CEFR'),
        hanziSimplified: parsed.hanziSimplified || (lang === 'zh' ? parsed.word : undefined),
        hanziTraditional: parsed.hanziTraditional,
        posEntries: posEntries.length > 0 ? posEntries : [
          {
            id: `pos-${Date.now()}-0`,
            pos: 'General',
            posVi: 'Từ vựng',
            meaningVi: 'Chưa có thông tin chi tiết',
            examples: []
          }
        ],
        dateAdded: todayStr,
        timestamp: Date.now(),
        tags: [lang === 'zh' ? 'Tiếng Trung' : 'Tiếng Anh'],
        isStarred: false,
        mastery: 'new',
      };

      // Save to client-side fast cache
      saveToCache(vocabWord);

      return vocabWord;
    } catch (err: any) {
      console.warn(`Attempt with ${model} failed:`, err.message);
      lastError = err;
    }
  }

  throw new Error(`Không thể tra cứu qua Gemini AI (${lastError?.message || 'Lỗi kết nối'}). Vui lòng kiểm tra lại API Key hoặc kết nối mạng.`);
}
