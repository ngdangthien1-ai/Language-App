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
   * Tạo URL phát âm người bản xứ (Studio Quality MP3)
   */
  private getNativeAudioUrl(text: string, lang: Language, preferUK?: boolean): string {
    const encoded = encodeURIComponent(text.trim());
    if (lang === 'en') {
      // 1 = UK, 2 = US English studio native dictionary audio
      const type = preferUK ? 1 : 2;
      return `https://dict.youdao.com/dictvoice?audio=${encoded}&type=${type}`;
    } else {
      // Standard Mandarin (Beijing Accent) Native Studio Audio
      return `https://dict.youdao.com/dictvoice?le=zh&audio=${encoded}`;
    }
  }

  private getGoogleTTSUrl(text: string, lang: Language, preferUK?: boolean): string {
    const encoded = encodeURIComponent(text.trim());
    const tl = lang === 'zh' ? 'zh-CN' : preferUK ? 'en-GB' : 'en-US';
    return `https://translate.google.com/translate_tts?ie=UTF-8&tl=${tl}&client=tw-ob&q=${encoded}`;
  }

  /**
   * Phát âm chuẩn bản xứ (Tối ưu cho cả điện thoại & máy tính)
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
    // Stop any existing playback
    this.stop();

    const cleanText = text.trim();
    if (!cleanText) return;

    // 1. Thử phát bằng Native Studio Human Audio (Chất lượng 100% người bản xứ)
    try {
      const isShort = cleanText.split(/\s+/).length <= 12;
      const audioUrl = isShort 
        ? this.getNativeAudioUrl(cleanText, lang, options?.preferUK)
        : this.getGoogleTTSUrl(cleanText, lang, options?.preferUK);

      const audio = new Audio(audioUrl);
      this.currentAudioElement = audio;

      if (options?.rate) {
        audio.playbackRate = Math.max(0.7, Math.min(1.5, options.rate));
      }

      this.notify(true, cleanText);

      audio.onended = () => {
        this.notify(false, '');
        this.currentAudioElement = null;
        options?.onEnd?.();
      };

      audio.onerror = () => {
        // Nếu lỗi mạng, fallback về SpeechSynthesis
        console.warn('Native audio stream error, falling back to Web Speech Synthesis');
        this.fallbackSpeechSynthesis(cleanText, lang, options);
      };

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.warn('Audio play prevented or failed, fallback to SpeechSynthesis:', err);
          this.fallbackSpeechSynthesis(cleanText, lang, options);
        });
      }
    } catch (e) {
      this.fallbackSpeechSynthesis(cleanText, lang, options);
    }
  }

  /**
   * Fallback Web Speech Synthesis khi Offline
   */
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

    const utterance = new SpeechSynthesisUtterance(text);

    if (lang === 'en') {
      utterance.lang = options?.preferUK ? 'en-GB' : 'en-US';
      const preferredVoices = this.voices.filter(v => 
        options?.preferUK 
          ? (v.lang === 'en-GB' || v.name.includes('UK') || v.name.includes('British') || v.name.includes('Oliver') || v.name.includes('Kate'))
          : (v.name.includes('Google US') || v.name.includes('Natural') || v.name.includes('Samantha') || v.name.includes('Alex') || v.lang === 'en-US')
      );
      if (preferredVoices.length > 0) {
        utterance.voice = preferredVoices[0];
      }
    } else {
      utterance.lang = 'zh-CN';
      const zhVoices = this.voices.filter(v => 
        v.name.includes('Google 普通话') || v.name.includes('Ting-Ting') || v.name.includes('Sin-ji') || v.name.includes('Mei-Jia') || v.lang === 'zh-CN' || v.lang === 'zh'
      );
      if (zhVoices.length > 0) {
        utterance.voice = zhVoices[0];
      }
    }

    utterance.rate = options?.rate ?? (lang === 'zh' ? 0.9 : 0.95);
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
      this.synth.cancel();
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
