import React, { useState } from 'react';
import { 
  X, 
  Key, 
  Volume2, 
  Download, 
  Upload, 
  RotateCcw, 
  Check, 
  AlertCircle, 
  Loader2, 
  Sparkles,
  FileSpreadsheet,
  FileCode
} from 'lucide-react';
import { AppSettings } from '../../types/vocab';
import { audioService } from '../../services/audio';
import { lookupWordWithGemini } from '../../services/gemini';
import { storageService } from '../../services/storage';

interface SettingsModalProps {
  settings: AppSettings;
  onSaveSettings: (settings: AppSettings) => void;
  onClose: () => void;
  onDataImported: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  onSaveSettings,
  onClose,
  onDataImported,
}) => {
  const [formData, setFormData] = useState<AppSettings>(settings);
  const [isTestingApi, setIsTestingApi] = useState(false);
  const [apiTestStatus, setApiTestStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [apiTestMessage, setApiTestMessage] = useState('');
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const handleTestApi = async () => {
    setIsTestingApi(true);
    setApiTestStatus('idle');
    setApiTestMessage('');

    try {
      // Test lookup with a simple word
      const result = await lookupWordWithGemini('hello', 'en', formData.geminiApiKey);
      if (result && result.word) {
        setApiTestStatus('success');
        setApiTestMessage('Kết nối Gemini AI thành công! Phản hồi JSON đa từ loại hoàn hảo.');
      } else {
        throw new Error('Không nhận được dữ liệu hợp lệ từ AI.');
      }
    } catch (err: any) {
      setApiTestStatus('error');
      setApiTestMessage(err.message || 'Lỗi kết nối API. Vui lòng kiểm tra lại API Key.');
    } finally {
      setIsTestingApi(false);
    }
  };

  const handleTestVoice = (lang: 'en' | 'zh') => {
    if (lang === 'en') {
      audioService.speak('Welcome to LinguaFlow vocabulary notebook!', 'en', {
        rate: formData.englishVoiceRate,
        pitch: formData.englishVoicePitch,
      });
    } else {
      audioService.speak('欢迎使用双语智能生词本！', 'zh', {
        rate: formData.chineseVoiceRate,
        pitch: formData.chineseVoicePitch,
      });
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const success = storageService.importFromJSON(content);
        if (success) {
          setImportStatus('Nhập dữ liệu thành công!');
          onDataImported();
          setTimeout(() => setImportStatus(null), 3000);
        } else {
          setImportStatus('File JSON không đúng định dạng!');
        }
      }
    };
    reader.readAsText(file);
  };

  const handleSave = () => {
    onSaveSettings(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-800 my-8 p-6 sm:p-7 space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-brand-100 dark:bg-brand-950 text-brand-600 dark:text-brand-400">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Cài Đặt & Cấu Hình</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Quản lý API Key, Giọng đọc Audio & Sao lưu dữ liệu</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Settings Form */}
        <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-1">
          
          {/* Section 1: Gemini AI API Key */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider flex items-center">
                <Sparkles className="w-4 h-4 mr-1.5 text-amber-500" />
                Google Gemini API Key
              </label>

              <button
                type="button"
                onClick={handleTestApi}
                disabled={isTestingApi || !formData.geminiApiKey.trim()}
                className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline flex items-center space-x-1 disabled:opacity-50"
              >
                {isTestingApi ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                <span>Kiểm tra kết nối AI</span>
              </button>
            </div>

            <input
              type="text"
              value={formData.geminiApiKey}
              onChange={(e) => setFormData({ ...formData, geminiApiKey: e.target.value })}
              placeholder="AQ.Ab8RN6LOUzyUHn9x..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs sm:text-sm font-mono text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />

            {apiTestStatus === 'success' && (
              <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 text-xs text-emerald-700 dark:text-emerald-300 flex items-center space-x-2 animate-fade-in">
                <Check className="w-4 h-4 flex-shrink-0" />
                <span>{apiTestMessage}</span>
              </div>
            )}

            {apiTestStatus === 'error' && (
              <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 text-xs text-rose-700 dark:text-rose-300 flex items-center space-x-2 animate-fade-in">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{apiTestMessage}</span>
              </div>
            )}
          </div>

          {/* Section 2: Audio Voice Speed & Pitch */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-4">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider flex items-center">
              <Volume2 className="w-4 h-4 mr-1.5 text-indigo-500" />
              Tốc độ & Cao độ phát âm (Web Speech Synthesis)
            </span>

            {/* English audio */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700 dark:text-slate-300">🇬🇧 Tốc độ đọc Tiếng Anh ({formData.englishVoiceRate}x)</span>
                <button
                  type="button"
                  onClick={() => handleTestVoice('en')}
                  className="text-xs font-bold text-brand-600 hover:underline"
                >
                  Thử giọng đọc
                </button>
              </div>
              <input
                type="range"
                min="0.6"
                max="1.4"
                step="0.05"
                value={formData.englishVoiceRate}
                onChange={(e) => setFormData({ ...formData, englishVoiceRate: parseFloat(e.target.value) })}
                className="w-full accent-brand-600"
              />
            </div>

            {/* Chinese audio */}
            <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700 dark:text-slate-300">🇨🇳 Tốc độ đọc Tiếng Trung ({formData.chineseVoiceRate}x)</span>
                <button
                  type="button"
                  onClick={() => handleTestVoice('zh')}
                  className="text-xs font-bold text-chinese-600 hover:underline"
                >
                  Thử giọng đọc
                </button>
              </div>
              <input
                type="range"
                min="0.6"
                max="1.4"
                step="0.05"
                value={formData.chineseVoiceRate}
                onChange={(e) => setFormData({ ...formData, chineseVoiceRate: parseFloat(e.target.value) })}
                className="w-full accent-chinese-600"
              />
            </div>
          </div>

          {/* Section 3: Export / Import Backup */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-3">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider flex items-center">
              <Download className="w-4 h-4 mr-1.5 text-emerald-500" />
              Sao Lưu & Phục Hồi Dữ Liệu
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
              
              <button
                type="button"
                onClick={() => storageService.exportToJSON()}
                className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold flex flex-col items-center justify-center space-y-1.5 transition-colors cursor-pointer"
              >
                <FileCode className="w-5 h-5 text-indigo-500" />
                <span>Xuất file JSON</span>
              </button>

              <button
                type="button"
                onClick={() => storageService.exportToCSV()}
                className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold flex flex-col items-center justify-center space-y-1.5 transition-colors cursor-pointer"
              >
                <FileSpreadsheet className="w-5 h-5 text-emerald-500" />
                <span>Xuất Excel (CSV)</span>
              </button>

              <label className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold flex flex-col items-center justify-center space-y-1.5 transition-colors cursor-pointer">
                <Upload className="w-5 h-5 text-amber-500" />
                <span>Phục hồi từ JSON</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

            </div>

            {importStatus && (
              <p className="text-xs font-bold text-emerald-600 text-center">{importStatus}</p>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Hủy
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 text-white text-sm font-bold shadow-md shadow-brand-500/25 hover:from-brand-700 hover:to-indigo-700 transition-all cursor-pointer"
          >
            Lưu cài đặt
          </button>
        </div>

      </div>
    </div>
  );
};
