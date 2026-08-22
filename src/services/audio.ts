import { Language } from '../types/vocab';

class AudioService {
  private synth: SpeechSynthesis | null = null;
  private voices: SpeechSynthesisVoice[] = [];
  private isLoaded = false;
  private currentAudioElement: HTMLAudioElement | null = null;
  private onStateChangeListeners: Array<(isSpeaking: boolean, currentText: string) => void> = [];
  private currentSpeakingText: string = '';

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      this.initVoices();
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => this.initVoices();
      }
    }
  }

  private initVoices() {
    if (!this.synth) return;
    this.voices = this.synth.getVoices();
    this.isLoaded = this.voices.length > 0;
  }

  public subscribe(callback: (isSpeaking: boolean, currentText: string) => void) {
    this.onStateChangeListeners.push(callback);
    return () => {
      this.onStateChangeListeners = this.onStateChangeListeners.filter(cb => cb !== callback);
    };
  }

  private notify(isSpeaking: boolean, text: string) {
    this.currentSpeakingText = isSpeaking ? text : '';
    this.onStateChangeListeners.forEach(cb => cb(isSpeaking, this.currentSpeakingText));
  }

  /**
   * Phát âm chuẩn bản xứ 100% cho cả Tiếng Anh và Tiếng Trung
   */
  public speak(
    text: string,
    lang: Language,
    options?: {
      rate?: number;
      pitch?: number;
      preferUK?: boolean;
      onEnd?: () => void;
      onError?: () => void;
    }
  ) {
    this.stop();

    const cleanText = text.trim();
    if (!cleanText) return;

    // Tự động nhận diện chữ Hán để luôn phát đúng giọng Tiếng Trung Bắc Kinh
    const hasChineseChars = /[\u4e00-\u9fa5]/.test(cleanText);
    const targetLang: Language = hasChineseChars ? 'zh' : lang;

    // 1. Thử phát bằng Audio chất lượng phòng thu (Youdao Dictionary Voice)
    try {
      const encoded = encodeURIComponent(cleanText);
      const audioUrl = targetLang === 'en'
        ? `https://dict.youdao.com/dictvoice?audio=${encoded}&type=${options?.preferUK ? 1 : 2}`
        : `https://dict.youdao.com/dictvoice?le=zh&audio=${encoded}`;

      const audio = new Audio(audioUrl);
      this.currentAudioElement = audio;

      if (options?.rate) {
        audio.playbackRate = options.rate;
      }

      this.notify(true, cleanText);

      audio.onended = () => {
        this.notify(false, '');
        this.currentAudioElement = null;
        options?.onEnd?.();
      };

      audio.onerror = () => {
        console.warn('Native audio stream error, falling back to Web Speech');
        this.fallbackSpeechSynthesis(cleanText, targetLang, options);
      };

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.warn('Audio play prevented, fallback to Web Speech:', err);
          this.fallbackSpeechSynthesis(cleanText, targetLang, options);
        });
      }
      return;
    } catch (e) {
      this.fallbackSpeechSynthesis(cleanText, targetLang, options);
    }
  }

  private fallbackSpeechSynthesis(
    text: string,
    lang: Language,
    options?: {
      rate?: number;
      pitch?: number;
      preferUK?: boolean;
      onEnd?: () => void;
      onError?: () => void;
    }
  ) {
    if (!this.synth) {
      this.notify(false, '');
      options?.onError?.();
      return;
    }

    try {
      if (this.synth.paused) {
        this.synth.resume();
      }

      const utterance = new SpeechSynthesisUtterance(text);

      if (lang === 'en') {
        utterance.lang = options?.preferUK ? 'en-GB' : 'en-US';
        const enVoices = this.voices.filter(v => 
          options?.preferUK
            ? (v.lang.includes('GB') || v.name.includes('UK') || v.name.includes('British') || v.name.includes('Oliver') || v.name.includes('Kate') || v.name.includes('Daniel'))
            : (v.name.includes('Google US') || v.name.includes('Samantha') || v.name.includes('Alex') || v.name.includes('Ava') || v.name.includes('Natural') || v.lang.includes('US') || v.lang.startsWith('en'))
        );
        if (enVoices.length > 0) {
          utterance.voice = enVoices[0];
        }
      } else {
        utterance.lang = 'zh-CN';
        const zhVoices = this.voices.filter(v => 
          v.name.includes('Google 普通话') || v.name.includes('Ting-Ting') || v.name.includes('Sin-ji') || v.name.includes('Mei-Jia') || v.name.includes('Chinese') || v.name.includes('Mandarin') || v.lang.includes('zh') || v.lang.includes('cmn')
        );
        if (zhVoices.length > 0) {
          utterance.voice = zhVoices[0];
        }
      }

      utterance.rate = options?.rate ?? (lang === 'zh' ? 0.85 : 0.9);
      utterance.pitch = options?.pitch ?? 1.0;

      utterance.onstart = () => {
        this.notify(true, text);
      };

      utterance.onend = () => {
        this.notify(false, '');
        options?.onEnd?.();
      };

      utterance.onerror = () => {
        this.notify(false, '');
        options?.onError?.();
      };

      this.synth.speak(utterance);
    } catch (e) {
      this.notify(false, '');
      options?.onError?.();
    }
  }

  public stop() {
    if (this.currentAudioElement) {
      try {
        this.currentAudioElement.pause();
        this.currentAudioElement.currentTime = 0;
      } catch (e) {
        // ignore
      }
      this.currentAudioElement = null;
    }

    if (this.synth) {
      try {
        this.synth.cancel();
      } catch (e) {
        // ignore
      }
    }

    this.notify(false, '');
  }

  public isCurrentlySpeaking(text?: string): boolean {
    if (text) {
      return this.currentSpeakingText === text.trim();
    }
    return this.currentSpeakingText !== '';
  }
}

export const audioService = new AudioService();
