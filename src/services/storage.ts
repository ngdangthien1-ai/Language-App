import { VocabWord, AppSettings, DailyVocabGroup } from '../types/vocab';
import { DEFAULT_GEMINI_KEY } from './gemini';
import { formatDateVi, getTodayDateString } from '../utils/dates';

const STORAGE_KEYS = {
  WORDS: 'lingua_flow_words_v1',
  SETTINGS: 'lingua_flow_settings_v1',
  API_KEY: 'lingua_flow_gemini_api_key_v1',
};

export const INITIAL_SETTINGS: AppSettings = {
  geminiApiKey: DEFAULT_GEMINI_KEY,
  englishVoicePitch: 1.0,
  englishVoiceRate: 0.95,
  englishVoiceType: 'us',
  chineseVoicePitch: 1.0,
  chineseVoiceRate: 0.9,
  darkMode: false,
  dailyGoal: 5,
};

const SEED_WORDS: VocabWord[] = [
  {
    id: 'seed-en-1',
    word: 'conduct',
    language: 'en',
    phonetic: '/ˈkɒn.dʌkt/ (n) /kənˈdʌkt/ (v)',
    level: 'B2',
    posEntries: [
      {
        id: 'seed-pos-en-1-1',
        pos: 'Verb',
        posVi: 'Động từ',
        phonetic: '/kənˈdʌkt/',
        meaningVi: 'Tiến hành, chỉ đạo, dẫn đường, dẫn điện/nhiệt',
        examples: [
          {
            original: 'The scientists will conduct a series of experiments.',
            translation: 'Các nhà khoa học sẽ tiến hành một loạt các thí nghiệm.'
          },
          {
            original: 'Copper conducts electricity extremely well.',
            translation: 'Đồng dẫn điện cực kỳ tốt.'
          }
        ],
        collocations: ['conduct research', 'conduct an experiment', 'conduct an interview'],
        synonyms: ['carry out', 'organize', 'direct']
      },
      {
        id: 'seed-pos-en-1-2',
        pos: 'Noun',
        posVi: 'Danh từ',
        phonetic: '/ˈkɒn.dʌkt/',
        meaningVi: 'Hành vi, hạnh kiểm, cách cư xử',
        examples: [
          {
            original: 'The code of conduct must be respected by all employees.',
            translation: 'Bộ quy tắc ứng xử phải được tôn trọng bởi tất cả nhân viên.'
          }
        ],
        collocations: ['code of conduct', 'professional conduct', 'improper conduct'],
        synonyms: ['behavior', 'manner', 'deportment']
      }
    ],
    dateAdded: getTodayDateString(),
    timestamp: Date.now() - 1000 * 60 * 30,
    tags: ['Tiếng Anh', 'B2', 'Multi-POS'],
    isStarred: true,
    mastery: 'learning',
  },
  {
    id: 'seed-zh-1',
    word: '行',
    language: 'zh',
    phonetic: 'xíng / háng',
    level: 'HSK 2',
    hanziSimplified: '行',
    hanziTraditional: '行',
    posEntries: [
      {
        id: 'seed-pos-zh-1-1',
        pos: 'Verb / Adj (xíng)',
        posVi: 'Động từ / Tính từ',
        phonetic: 'xíng',
        meaningVi: 'Đi, thực hiện, được, ổn thỏa, giỏi',
        examples: [
          {
            original: '我们明天去公园，你觉得行吗？',
            pinyin: 'Wǒmen míngtiān qù gōngyuán, nǐ juéde xíng ma?',
            translation: 'Ngày mai chúng ta đi công viên, bạn thấy được không?'
          },
          {
            original: '他的汉语说得很行！',
            pinyin: 'Tā de hànyǔ shuō de hěn xíng!',
            translation: 'Tiếng Trung của anh ấy nói rất cừ!'
          }
        ],
        collocations: ['不行 (không được)', '行动 (hành động)', '行人 (người đi bộ)'],
        synonyms: ['可以', '好']
      },
      {
        id: 'seed-pos-zh-1-2',
        pos: 'Noun (háng)',
        posVi: 'Danh từ',
        phonetic: 'háng',
        meaningVi: 'Hàng (lối), dòng kẻ, ngành nghề, ngân hàng',
        examples: [
          {
            original: '请大家排成一行。',
            pinyin: 'Qǐng dàjiā pái chéng yì háng.',
            translation: 'Xin mọi người hãy xếp thành một hàng.'
          },
          {
            original: '中国银行就在前面。',
            pinyin: 'Zhōngguó Yínháng jiù zài qiánmiàn.',
            translation: 'Ngân hàng Trung Quốc ở ngay phía trước.'
          }
        ],
        collocations: ['银行 (ngân hàng)', '行业 (ngành nghề)', '一行字 (một dòng chữ)'],
        synonyms: ['列', '业']
      }
    ],
    dateAdded: getTodayDateString(),
    timestamp: Date.now() - 1000 * 60 * 20,
    tags: ['Tiếng Trung', 'HSK 2', 'Đa âm đa nghĩa'],
    isStarred: true,
    mastery: 'new',
  },
  {
    id: 'seed-en-2',
    word: 'resilient',
    language: 'en',
    phonetic: '/rɪˈzɪl.jənt/',
    level: 'C1',
    posEntries: [
      {
        id: 'seed-pos-en-2-1',
        pos: 'Adjective',
        posVi: 'Tính từ',
        phonetic: '/rɪˈzɪl.jənt/',
        meaningVi: 'Kiên cường, có khả năng phục hồi nhanh chóng sau khó khăn/thất bại',
        examples: [
          {
            original: 'Local communities have been remarkably resilient in overcoming difficulties.',
            translation: 'Các cộng đồng địa phương đã rất kiên cường trong việc vượt qua khó khăn.'
          }
        ],
        collocations: ['resilient economy', 'resilient spirit', 'highly resilient'],
        synonyms: ['tough', 'adaptable', 'flexible']
      }
    ],
    dateAdded: getTodayDateString(),
    timestamp: Date.now() - 1000 * 60 * 10,
    tags: ['Tiếng Anh', 'C1', 'Vocabulary'],
    isStarred: false,
    mastery: 'mastered',
  },
  {
    id: 'seed-zh-2',
    word: '坚持',
    language: 'zh',
    phonetic: 'jiān chí',
    level: 'HSK 3',
    hanziSimplified: '坚持',
    hanziTraditional: '堅持',
    posEntries: [
      {
        id: 'seed-pos-zh-2-1',
        pos: 'Verb',
        posVi: 'Động từ',
        phonetic: 'jiān chí',
        meaningVi: 'Kiên trì, bền bỉ, kiên quyết giữ vững',
        examples: [
          {
            original: '只要坚持每天练习，你的口语一定会提高。',
            pinyin: 'Zhǐyào jiānchí měitiān liànxí, nǐ de kǒuyǔ yídìng huì tígāo.',
            translation: 'Chỉ cần kiên trì luyện tập mỗi ngày, khẩu ngữ của bạn chắc chắn sẽ tiến bộ.'
          }
        ],
        collocations: ['坚持到底 (kiên trì đến cùng)', '坚持不懈 (bền bỉ không ngừng)', '坚持原则 (giữ vững nguyên tắc)'],
        synonyms: ['坚守', '维持']
      }
    ],
    dateAdded: getTodayDateString(),
    timestamp: Date.now() - 1000 * 60 * 5,
    tags: ['Tiếng Trung', 'HSK 3', 'Từ vựng quan trọng'],
    isStarred: false,
    mastery: 'learning',
  }
];

export const storageService = {
  getWords(): VocabWord[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.WORDS);
      if (!data) {
        this.saveWords(SEED_WORDS);
        return SEED_WORDS;
      }
      const parsed: VocabWord[] = JSON.parse(data);
      return Array.isArray(parsed) ? parsed : SEED_WORDS;
    } catch (e) {
      console.error('Failed to load words from localStorage', e);
      return SEED_WORDS;
    }
  },

  saveWords(words: VocabWord[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.WORDS, JSON.stringify(words));
    } catch (e) {
      console.error('Failed to save words to localStorage', e);
    }
  },

  addWord(word: VocabWord): VocabWord[] {
    const words = this.getWords();
    const existingIndex = words.findIndex(w => w.word.toLowerCase() === word.word.toLowerCase() && w.language === word.language);
    
    let updated: VocabWord[];
    if (existingIndex >= 0) {
      updated = [...words];
      updated[existingIndex] = { ...word, id: words[existingIndex].id, timestamp: Date.now() };
    } else {
      updated = [word, ...words];
    }
    
    this.saveWords(updated);
    return updated;
  },

  deleteWord(id: string): VocabWord[] {
    const words = this.getWords();
    const updated = words.filter(w => w.id !== id);
    this.saveWords(updated);
    return updated;
  },

  toggleStar(id: string): VocabWord[] {
    const words = this.getWords();
    const updated = words.map(w => (w.id === id ? { ...w, isStarred: !w.isStarred } : w));
    this.saveWords(updated);
    return updated;
  },

  setMastery(id: string, mastery: VocabWord['mastery']): VocabWord[] {
    const words = this.getWords();
    const updated = words.map(w => (w.id === id ? { ...w, mastery } : w));
    this.saveWords(updated);
    return updated;
  },

  getGroupedByDate(words: VocabWord[]): DailyVocabGroup[] {
    const map = new Map<string, VocabWord[]>();
    
    // Sort words by timestamp descending
    const sorted = [...words].sort((a, b) => b.timestamp - a.timestamp);

    sorted.forEach(word => {
      const dateKey = word.dateAdded || getTodayDateString();
      if (!map.has(dateKey)) {
        map.set(dateKey, []);
      }
      map.get(dateKey)!.push(word);
    });

    const groups: DailyVocabGroup[] = [];
    map.forEach((groupedWords, dateKey) => {
      groups.push({
        date: dateKey,
        formattedDate: formatDateVi(dateKey),
        words: groupedWords,
      });
    });

    // Sort groups descending by date
    groups.sort((a, b) => b.date.localeCompare(a.date));
    return groups;
  },

  getSettings(): AppSettings {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      const customKey = localStorage.getItem(STORAGE_KEYS.API_KEY);
      const parsed = data ? JSON.parse(data) : {};
      return { 
        ...INITIAL_SETTINGS, 
        ...parsed,
        geminiApiKey: customKey || parsed.geminiApiKey || DEFAULT_GEMINI_KEY
      };
    } catch (e) {
      return INITIAL_SETTINGS;
    }
  },

  saveSettings(settings: AppSettings): void {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
      if (settings.geminiApiKey) {
        localStorage.setItem(STORAGE_KEYS.API_KEY, settings.geminiApiKey);
      }
    } catch (e) {
      console.error('Failed to save settings', e);
    }
  },

  exportToJSON(): void {
    const words = this.getWords();
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(words, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `linguaflow_backup_${getTodayDateString()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  },

  importFromJSON(jsonString: string): VocabWord[] {
    try {
      const imported: VocabWord[] = JSON.parse(jsonString);
      if (Array.isArray(imported)) {
        this.saveWords(imported);
        return imported;
      }
      throw new Error('Định dạng file không hợp lệ.');
    } catch (e) {
      throw new Error('Không thể đọc file JSON.');
    }
  },

  exportToCSV(): void {
    const words = this.getWords();
    const headers = ['Từ', 'Ngôn ngữ', 'Phiên âm', 'Trình độ', 'Từ loại & Nghĩa tiếng Việt', 'Câu ví dụ', 'Ngày lưu'];
    const rows = words.map(w => [
      `"${w.word.replace(/"/g, '""')}"`,
      `"${w.language === 'en' ? 'Tiếng Anh' : 'Tiếng Trung'}"`,
      `"${(w.phonetic || '').replace(/"/g, '""')}"`,
      `"${w.level || ''}"`,
      `"${w.posEntries.map(p => `[${p.posVi || p.pos}] ${p.meaningVi}`).join(' | ').replace(/"/g, '""')}"`,
      `"${w.posEntries.flatMap(p => p.examples.map(e => `${e.original} -> ${e.translation}`)).join(' | ').replace(/"/g, '""')}"`,
      `"${w.dateAdded || ''}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `linguaflow_vocab_${getTodayDateString()}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  }
};
