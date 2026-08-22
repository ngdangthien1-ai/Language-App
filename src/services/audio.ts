import { Language } from '../types/vocab';

class AudioService {
  private synth: SpeechSynthesis | null = null;
  private voices: SpeechSynthesisVoice[] = [];
  private isLoaded = false;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
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

  public getAvailableVoices(lang: Language): SpeechSynthesisVoice[] {
    if (!this.synth) return [];
    if (!this.isLoaded) this.initVoices();
    const prefix = lang === 'en' ? 'en' : 'zh';
    return this.voices.filter(v => v.lang.toLowerCase().startsWith(prefix));
  }

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
    if (!this.synth) {
      console.warn('Speech synthesis is not supported in this browser.');
      options?.onError?.();
      return;
    }

    // Stop current speech
    this.stop();

    const cleanText = text.trim();
    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    
    // Set speech language & voice
    if (lang === 'en') {
      utterance.lang = options?.preferUK ? 'en-GB' : 'en-US';
      const preferredVoices = this.voices.filter(v => 
        options?.preferUK 
          ? (v.lang === 'en-GB' || v.name.includes('UK') || v.name.includes('British'))
          : (v.lang === 'en-US' || v.name.includes('US') || v.name.includes('Google US') || v.name.includes('Natural'))
      );
      if (preferredVoices.length > 0) {
        utterance.voice = preferredVoices[0];
      }
    } else {
      utterance.lang = 'zh-CN';
      const zhVoices = this.voices.filter(v => 
        v.lang === 'zh-CN' || v.lang === 'zh' || v.name.includes('Chinese') || v.name.includes('Mandarin')
      );
      if (zhVoices.length > 0) {
        utterance.voice = zhVoices[0];
      }
    }

    utterance.rate = options?.rate ?? (lang === 'zh' ? 0.9 : 0.95);
    utterance.pitch = options?.pitch ?? 1.0;

    utterance.onstart = () => {
      this.notify(true, cleanText);
    };

    utterance.onend = () => {
      this.notify(false, '');
      this.currentUtterance = null;
      options?.onEnd?.();
    };

    utterance.onerror = (e) => {
      console.error('Speech synthesis error:', e);
      this.notify(false, '');
      this.currentUtterance = null;
      options?.onError?.();
    };

    this.currentUtterance = utterance;
    this.synth.speak(utterance);
  }

  public stop() {
    if (this.synth) {
      this.synth.cancel();
      this.notify(false, '');
      this.currentUtterance = null;
    }
  }

  public isCurrentlySpeaking(text?: string): boolean {
    if (!this.synth) return false;
    if (text) {
      return this.synth.speaking && this.currentSpeakingText === text.trim();
    }
    return this.synth.speaking;
  }
}

export const audioService = new AudioService();
