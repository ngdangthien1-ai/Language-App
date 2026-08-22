import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import { VocabWord } from '../types/vocab';

const SUPABASE_CONFIG_KEY = 'lingua_flow_supabase_config_v1';

// Default / fallback Supabase credentials (or user can configure their own project in Settings)
export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

export const DEFAULT_SUPABASE_CONFIG: SupabaseConfig = {
  url: (import.meta as any).env?.VITE_SUPABASE_URL || 'https://vkwljwsqvwhbkvwqvhwk.supabase.co',
  anonKey: (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummy_key_placeholder',
};

class SupabaseService {
  private client: SupabaseClient | null = null;
  private currentUser: User | null = null;
  private isConfigured: boolean = false;

  constructor() {
    this.initClient();
  }

  public getConfig(): SupabaseConfig {
    try {
      const raw = localStorage.getItem(SUPABASE_CONFIG_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      // ignore
    }
    return DEFAULT_SUPABASE_CONFIG;
  }

  public saveConfig(config: SupabaseConfig) {
    try {
      localStorage.setItem(SUPABASE_CONFIG_KEY, JSON.stringify(config));
      this.initClient();
    } catch (e) {
      console.error('Failed to save Supabase config', e);
    }
  }

  public initClient() {
    const config = this.getConfig();
    if (config.url && config.anonKey && !config.anonKey.includes('dummy_key')) {
      try {
        this.client = createClient(config.url, config.anonKey, {
          auth: {
            persistSession: true,
            autoRefreshToken: true,
          }
        });
        this.isConfigured = true;

        // Check active session
        this.client.auth.getUser().then(({ data }) => {
          this.currentUser = data.user || null;
        });
      } catch (e) {
        console.warn('Supabase initialization failed:', e);
        this.client = null;
        this.isConfigured = false;
      }
    } else {
      this.client = null;
      this.isConfigured = false;
    }
  }

  public isReady(): boolean {
    return this.isConfigured && this.client !== null;
  }

  public getClient(): SupabaseClient | null {
    return this.client;
  }

  public async getCurrentUser(): Promise<User | null> {
    if (!this.client) return null;
    const { data } = await this.client.auth.getUser();
    this.currentUser = data.user || null;
    return this.currentUser;
  }

  public onAuthStateChange(callback: (user: User | null) => void) {
    if (!this.client) return () => {};
    const { data: { subscription } } = this.client.auth.onAuthStateChange((_event, session) => {
      this.currentUser = session?.user || null;
      callback(this.currentUser);
    });
    return () => subscription.unsubscribe();
  }

  public async signUp(email: string, password: string): Promise<{ user: User | null; error: Error | null }> {
    if (!this.client) {
      return { user: null, error: new Error('Dịch vụ Supabase chưa được cấu hình.') };
    }
    const { data, error } = await this.client.auth.signUp({
      email,
      password,
    });
    if (error) return { user: null, error };
    this.currentUser = data.user;
    return { user: data.user, error: null };
  }

  public async signIn(email: string, password: string): Promise<{ user: User | null; error: Error | null }> {
    if (!this.client) {
      return { user: null, error: new Error('Dịch vụ Supabase chưa được cấu hình.') };
    }
    const { data, error } = await this.client.auth.signInWithPassword({
      email,
      password,
    });
    if (error) return { user: null, error };
    this.currentUser = data.user;
    return { user: data.user, error: null };
  }

  public async signOut(): Promise<void> {
    if (this.client) {
      await this.client.auth.signOut();
      this.currentUser = null;
    }
  }

  // Database Sync Operations
  public async fetchCloudWords(userId: string): Promise<VocabWord[]> {
    if (!this.client) return [];
    try {
      const { data, error } = await this.client
        .from('vocab_words')
        .select('*')
        .eq('user_id', userId)
        .order('timestamp', { ascending: false });

      if (error) {
        console.error('Error fetching cloud words:', error);
        return [];
      }

      return (data || []).map(row => ({
        id: row.id,
        word: row.word,
        language: row.language,
        phonetic: row.phonetic,
        level: row.level,
        hanziSimplified: row.hanzi_simplified,
        hanziTraditional: row.hanzi_traditional,
        posEntries: row.pos_entries || [],
        dateAdded: row.date_added,
        timestamp: row.timestamp || Date.now(),
        tags: row.tags || [],
        isStarred: row.is_starred || false,
        mastery: row.mastery || 'new',
        userNotes: row.user_notes,
      }));
    } catch (e) {
      console.error('Fetch cloud words exception:', e);
      return [];
    }
  }

  public async saveCloudWord(word: VocabWord, userId: string): Promise<boolean> {
    if (!this.client) return false;
    try {
      const payload = {
        id: word.id,
        user_id: userId,
        word: word.word,
        language: word.language,
        phonetic: word.phonetic,
        level: word.level,
        hanzi_simplified: word.hanziSimplified,
        hanzi_traditional: word.hanziTraditional,
        pos_entries: word.posEntries,
        date_added: word.dateAdded,
        timestamp: word.timestamp,
        tags: word.tags,
        is_starred: word.isStarred,
        mastery: word.mastery,
        user_notes: word.userNotes,
        updated_at: new Date().toISOString(),
      };

      const { error } = await this.client
        .from('vocab_words')
        .upsert(payload);

      if (error) {
        console.error('Error saving cloud word:', error);
        return false;
      }
      return true;
    } catch (e) {
      console.error('Save cloud word exception:', e);
      return false;
    }
  }

  public async deleteCloudWord(wordId: string, userId: string): Promise<boolean> {
    if (!this.client) return false;
    try {
      const { error } = await this.client
        .from('vocab_words')
        .delete()
        .eq('id', wordId)
        .eq('user_id', userId);

      if (error) {
        console.error('Error deleting cloud word:', error);
        return false;
      }
      return true;
    } catch (e) {
      return false;
    }
  }

  public async syncLocalWordsToCloud(localWords: VocabWord[], userId: string): Promise<number> {
    if (!this.client || localWords.length === 0) return 0;
    try {
      const payloads = localWords.map(word => ({
        id: word.id,
        user_id: userId,
        word: word.word,
        language: word.language,
        phonetic: word.phonetic,
        level: word.level,
        hanzi_simplified: word.hanziSimplified,
        hanzi_traditional: word.hanziTraditional,
        pos_entries: word.posEntries,
        date_added: word.dateAdded,
        timestamp: word.timestamp,
        tags: word.tags,
        is_starred: word.isStarred,
        mastery: word.mastery,
        user_notes: word.userNotes,
        updated_at: new Date().toISOString(),
      }));

      const { error } = await this.client
        .from('vocab_words')
        .upsert(payloads);

      if (error) {
        console.error('Sync batch error:', error);
        return 0;
      }
      return payloads.length;
    } catch (e) {
      console.error('Sync local to cloud exception:', e);
      return 0;
    }
  }

  public subscribeToRealtime(userId: string, onUpdate: () => void) {
    if (!this.client) return () => {};
    try {
      const channel = this.client
        .channel('realtime_vocab_changes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'vocab_words', filter: `user_id=eq.${userId}` },
          () => {
            onUpdate();
          }
        )
        .subscribe();

      return () => {
        this.client?.removeChannel(channel);
      };
    } catch (e) {
      return () => {};
    }
  }
}

export const supabaseService = new SupabaseService();
