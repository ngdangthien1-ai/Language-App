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
   * Phát âm tối ưu hóa 100% cho mọi thiết bị (Điện thoại iPhone, Android & Máy tính)
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

    // 1. Ưu tiên Web Speech Synthesis trực tiếp (Tương thích 100% không bị chặn bởi bảo mật trên điện thoại)
    if (this.synth) {
      try {
        // Unlock mobile speech state
        if (this.synth.paused) {
          this.synth.resume();
        }

        const utterance = new SpeechSynthesisUtterance(cleanText);

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
          this.notify(true, cleanText);
        };

        utterance.onend = () => {
          this.notify(false, '');
          options?.onEnd?.();
        };

        utterance.onerror = (e) => {
          console.warn('Speech synthesis error, trying online audio fallback:', e);
          this.playOnlineAudioFallback(cleanText, lang, options);
        };

        this.synth.speak(utterance);
        return;
      } catch (err) {
        console.warn('Speech synthesis exception, fallback to online audio:', err);
      }
    }

    // 2. Fallback sang Online Audio
    this.playOnlineAudioFallback(cleanText, lang, options);
  }

  private playOnlineAudioFallback(
    text: string,
    lang: Language,
    options?: {
      rate?: number;
      preferUK?: boolean;
      onEnd?: () => void;
      onError?: () => void;
    }
  ) {
    try {
      const encoded = encodeURIComponent(text);
      const url = lang === 'en'
        ? `https://dict.youdao.com/dictvoice?audio=${encoded}&type=${options?.preferUK ? 1 : 2}`
        : `https://dict.youdao.com/dictvoice?le=zh&audio=${encoded}`;

      const audio = new Audio(url);
      this.currentAudioElement = audio;

      if (options?.rate) {
        audio.playbackRate = options.rate;
      }

      this.notify(true, text);

      audio.onended = () => {
        this.notify(false, '');
        this.currentAudioElement = null;
        options?.onEnd?.();
      };

      audio.onerror = () => {
        this.notify(false, '');
        this.currentAudioElement = null;
        options?.onError?.();
      };

      audio.play().catch(() => {
        this.notify(false, '');
        options?.onError?.();
      });
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
