import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Volume2, Mic, Play, Trash2, Calendar, Award, RotateCcw, CheckCircle2, Flame, History, Sparkles, Activity, Database } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { oxford3000Data } from '../data/oxford3000Data';
import { playWordAudio } from '../services/audioService';
import { evaluateSpeech } from '../services/speechEvaluation';
import { playSuccessChime } from '../services/soundEffects';
import { saveVoiceRecording, getAllVoiceRecordings, deleteVoiceRecording, clearAllVoiceRecordings } from '../services/indexedDbService';
import ElectromagneticMic from './ElectromagneticMic';
import LiveEqualizer from './LiveEqualizer';

export default function VoiceArchiveStudio() {
  const { voicePreset, audioSpeed, addNotification } = useApp();
  const [selectedWordObj, setSelectedWordObj] = useState(oxford3000Data[0]);
  const [isRecording, setIsRecording] = useState(false);
  const [isNativePlaying, setIsNativePlaying] = useState(false);
  const [isUserPlaying, setIsUserPlaying] = useState(null);
  const [recordings, setRecordings] = useState([]);
  const [loading, setLoading] = useState(true);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  // Load from IndexedDB on mount
  useEffect(() => {
    let isMounted = true;
    const fetchRecordings = async () => {
      try {
        const idbRecords = await getAllVoiceRecordings();
        if (isMounted) {
          if (idbRecords && idbRecords.length > 0) {
            setRecordings(idbRecords);
          } else {
            // Fallback check from localStorage for initial migration
            try {
              const saved = localStorage.getItem('oxford3000_voice_archive');
              if (saved) {
                const parsed = JSON.parse(saved);
                setRecordings(parsed);
                // Save to IndexedDB
                for (const item of parsed) {
                  await saveVoiceRecording(item);
                }
              }
            } catch (e) {}
          }
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) setLoading(false);
      }
    };

    fetchRecordings();
    return () => {
      isMounted = false;
    };
  }, []);

  // Handle Native Play
  const playNativeAudio = async (word) => {
    setIsNativePlaying(true);
    await playWordAudio(word || selectedWordObj.word, { preset: voicePreset, speed: audioSpeed });
    setIsNativePlaying(false);
  };

  // Start Voice Recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64Audio = reader.result;
          
          const mockScore = Math.floor(75 + Math.random() * 25);

          const newRecord = {
            id: Date.now().toString() + Math.random().toString(36).substring(2, 6),
            word: selectedWordObj.word,
            arabic: selectedWordObj.arabic,
            cefr: selectedWordObj.cefr,
            ipa: selectedWordObj.ipa,
            score: mockScore,
            audioData: base64Audio,
            timestamp: Date.now(),
            dateStr: new Date().toLocaleDateString('ar-SA', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            }),
          };

          // Save to persistent IndexedDB
          await saveVoiceRecording(newRecord);

          setRecordings((prev) => [newRecord, ...prev]);
          addNotification(`تم حفظ تسجيلك الصوتي لكلمة "${selectedWordObj.word}" في قاعدة البيانات!`, 'success');
          try {
            playSuccessChime();
          } catch (e) {}
        };

        // Stop all audio tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      addNotification('تعذر الوصول إلى الميكروفون، يرجى منح الإذن', 'error');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const playRecordedAudio = (recId, audioBase64) => {
    if (!audioBase64) return;
    setIsUserPlaying(recId);
    const audio = new Audio(audioBase64);
    audio.onended = () => setIsUserPlaying(null);
    audio.onerror = () => setIsUserPlaying(null);
    audio.play();
  };

  const handleDeleteRecord = async (id) => {
    await deleteVoiceRecording(id);
    setRecordings((prev) => prev.filter((r) => r.id !== id));
    addNotification('تم حذف التسجيل الصوتي', 'info');
  };

  const handleClearAllRecordings = async () => {
    if (window.confirm('هل أنت متأكد من مسح جميع التسجيلات المحفوظة من الذاكرة الدائمة؟')) {
      await clearAllVoiceRecordings();
      setRecordings([]);
      try {
        localStorage.removeItem('oxford3000_voice_archive');
      } catch (e) {}
      addNotification('تم تفريغ الأرشيف الصوتي بالكامل', 'info');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="glass-panel p-6 rounded-3xl border shadow-xl card-theme-target space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-500 flex items-center justify-center font-bold text-xl">
              🎙️
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black font-arabic flex items-center gap-2">
                <span>أرشيف التطور والتسجيل الصوتي</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-500 font-mono font-bold flex items-center gap-1">
                  <Database className="w-3 h-3" />
                  <span>IndexedDB Powered</span>
                </span>
              </h2>
              <p className="text-xs sm:text-sm opacity-75 font-arabic">
                سجّل صوتك بلا حدود، قارنه بنطق المتحدث الأصلي، وراقب تحسن نطقك بمرور الوقت
              </p>
            </div>
          </div>

          {recordings.length > 0 && (
            <button
              onClick={handleClearAllRecordings}
              className="px-3 py-1.5 rounded-xl border text-xs font-bold text-rose-500 border-rose-500/30 hover:bg-rose-500/10 flex items-center gap-1 font-arabic"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>تفريغ الأرشيف</span>
            </button>
          )}
        </div>
      </div>

      {/* Recording Studio Workbench Card */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border shadow-2xl space-y-6 card-theme-target">
        {/* Word Selector Bar */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="space-y-1">
            <span className="text-xs opacity-70 font-arabic">اختر الكلمة للتسجيل:</span>
            <select
              value={selectedWordObj.word}
              onChange={(e) => {
                const found = oxford3000Data.find((w) => w.word === e.target.value);
                if (found) setSelectedWordObj(found);
              }}
              className="glass-input px-3 py-1.5 rounded-xl text-sm font-bold border"
            >
              {oxford3000Data.slice(0, 100).map((w) => (
                <option key={w.id} value={w.word}>
                  {w.word} ({w.cefr}) - {w.arabic}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono px-2.5 py-1 rounded-xl bg-cyan-500/10 text-cyan-400 font-bold border">
              {selectedWordObj.cefr}
            </span>
            <span className="text-xs font-mono opacity-80">{selectedWordObj.pos}</span>
          </div>
        </div>

        {/* Big Word Display & Dual Play / Record Area */}
        <div className="p-6 rounded-3xl bg-black/5 dark:bg-white/5 border text-center space-y-4">
          <div className="space-y-1">
            <h1 className="text-3xl sm:text-4xl font-black font-mono tracking-tight ltr-token">
              {selectedWordObj.word}
            </h1>
            <div className="text-sm font-mono text-cyan-400">{selectedWordObj.ipa}</div>
            <div className="text-base font-bold font-arabic text-emerald-500">{selectedWordObj.arabic}</div>
          </div>

          {/* Dual Action Buttons */}
          <div className="flex items-center justify-center gap-6 pt-4 flex-wrap">
            {/* 1. Native Speaker Audio */}
            <div className="flex flex-col items-center gap-1.5">
              <button
                onClick={() => playNativeAudio(selectedWordObj.word)}
                disabled={isNativePlaying}
                className="w-14 h-14 rounded-full theme-btn-secondary flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 cursor-pointer"
                title="استمع للمتحدث الأصلي"
              >
                <Volume2 className="w-6 h-6 text-cyan-400" />
              </button>
              <div className="flex items-center gap-1">
                <LiveEqualizer isPlaying={isNativePlaying} barColor="bg-cyan-400" />
                <span className="text-[11px] font-bold font-arabic opacity-80">المتحدث الأصلي</span>
              </div>
            </div>

            {/* 2. Electromagnetic Record Button */}
            <div className="flex flex-col items-center gap-1.5">
              <ElectromagneticMic
                isRecording={isRecording}
                onClick={isRecording ? stopRecording : startRecording}
                size="md"
                label={isRecording ? 'انقر لإنهاء التسجيل' : 'انقر لتسجيل صوتك'}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Recordings Archive List */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 px-1">
          <History className="w-4 h-4 text-rose-500" />
          <h3 className="text-sm font-black font-arabic">
            سجل التسجيلات الصوتية في الذاكرة الدائمة ({recordings.length})
          </h3>
        </div>

        {loading ? (
          <div className="p-8 rounded-3xl glass-panel border text-center opacity-70 font-arabic text-sm">
            جاري قراءة الأرشيف الصوتي من قاعدة البيانات...
          </div>
        ) : recordings.length === 0 ? (
          <div className="p-8 rounded-3xl glass-panel border text-center opacity-70 font-arabic text-sm space-y-2">
            <p>لا توجد تسجيلات بعد في أرشيفك الصوتي.</p>
            <p className="text-xs">سجّل أول نطق لك لتتمكن من سماع ومقارنة تطورك مع الوقت!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {recordings.map((rec) => (
              <div
                key={rec.id}
                className="glass-panel p-4 rounded-2xl border shadow-md card-theme-target flex items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-base ltr-token">{rec.word}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-cyan-500/10 text-cyan-500 font-mono font-bold">
                      {rec.cefr || 'A1'}
                    </span>
                  </div>
                  <div className="text-xs font-bold font-arabic opacity-80">{rec.arabic}</div>
                  <div className="text-[10px] opacity-60 font-mono flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>{rec.dateStr || rec.timestamp}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Score badge */}
                  <span
                    className={`text-xs font-mono font-black px-2 py-1 rounded-xl ${
                      rec.score >= 85
                        ? 'bg-emerald-500/20 text-emerald-500'
                        : rec.score >= 65
                        ? 'bg-amber-500/20 text-amber-500'
                        : 'bg-rose-500/20 text-rose-500'
                    }`}
                  >
                    {rec.score}%
                  </span>

                  {/* Play user recording button */}
                  <button
                    onClick={() => playRecordedAudio(rec.id, rec.audioData || rec.audioDataUrl)}
                    className="p-2 rounded-xl theme-btn-primary active:scale-95 cursor-pointer"
                    title="تشغيل تسجيلك"
                  >
                    <Play className="w-4 h-4 fill-current" />
                  </button>

                  {/* Play native side-by-side */}
                  <button
                    onClick={() => playNativeAudio(rec.word)}
                    className="p-2 rounded-xl theme-btn-secondary active:scale-95 cursor-pointer"
                    title="مقارنة بالمتحدث الأصلي"
                  >
                    <Volume2 className="w-4 h-4 text-cyan-400" />
                  </button>

                  {/* Delete record */}
                  <button
                    onClick={() => handleDeleteRecord(rec.id)}
                    className="p-2 rounded-xl hover:bg-rose-500/10 text-rose-500 active:scale-95 cursor-pointer"
                    title="حذف التسجيل"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
