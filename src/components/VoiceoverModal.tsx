import React, { useState, useRef, useEffect } from 'react';
import { X, Mic, Square, Check, AlertCircle } from 'lucide-react';
import { AudioClip } from '../types/editor';
import { getAudioContext, extractWaveform } from '../utils/audioGenerator';

interface VoiceoverModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveVoiceover: (clip: AudioClip) => void;
  currentTime: number;
}

export const VoiceoverModal: React.FC<VoiceoverModalProps> = ({
  isOpen,
  onClose,
  onSaveVoiceover,
  currentTime,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlobUrl, setRecordedBlobUrl] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [audioMeter, setAudioMeter] = useState<number[]>(new Array(16).fill(10));

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<number | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const recordedBufferRef = useRef<AudioBuffer | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  if (!isOpen) return null;

  const startRecording = async () => {
    setErrorMessage(null);
    setRecordedBlobUrl(null);
    chunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Audio visualizer setup
      const audioCtx = getAudioContext();
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      source.connect(analyser);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const updateMeter = () => {
        analyser.getByteFrequencyData(dataArray);
        const sliced = Array.from(dataArray.slice(0, 16)).map((v) => Math.max(10, (v / 255) * 100));
        setAudioMeter(sliced);
        animFrameRef.current = requestAnimationFrame(updateMeter);
      };
      updateMeter();

      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setRecordedBlobUrl(url);

        try {
          const arrayBuffer = await audioBlob.arrayBuffer();
          const buffer = await audioCtx.decodeAudioData(arrayBuffer);
          recordedBufferRef.current = buffer;
        } catch {
          // fallback
        }
      };

      recorder.start(100);
      setIsRecording(true);
      setDuration(0);

      timerRef.current = window.setInterval(() => {
        setDuration((prev) => prev + 0.1);
      }, 100);
    } catch (err) {
      setErrorMessage('Permiso de micrófono denegado o no disponible en este dispositivo.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    }
  };

  const handleSave = () => {
    if (!recordedBlobUrl) return;

    const waveform = recordedBufferRef.current
      ? extractWaveform(recordedBufferRef.current, 40)
      : [0.3, 0.6, 0.9, 0.7, 0.4];

    const clip: AudioClip = {
      id: `voiceover-${Date.now()}`,
      title: `Voz Grabada (${duration.toFixed(1)}s)`,
      src: recordedBlobUrl,
      start: currentTime,
      duration: Math.max(0.5, duration),
      volume: 1.0,
      fadeIn: 0.1,
      fadeOut: 0.1,
      category: 'voiceover',
      waveform,
      audioBuffer: recordedBufferRef.current || undefined,
    };

    onSaveVoiceover(clip);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-0 sm:p-4">
      <div className="w-full max-w-md bg-[#0e121a] border border-slate-800 rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Mic className="w-5 h-5 text-rose-500" />
            <h3 className="text-sm font-bold text-white font-['Syne']">
              Grabar Voz en Off
            </h3>
          </div>
          <button
            onClick={() => {
              if (isRecording) stopRecording();
              onClose();
            }}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col items-center justify-center space-y-6">
          {errorMessage && (
            <div className="p-3 bg-rose-950/60 border border-rose-800 rounded-xl flex items-center gap-2 text-rose-300 text-xs text-left w-full">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Time Counter */}
          <div className="text-center font-['JetBrains_Mono']">
            <span className="text-3xl font-bold text-white tracking-wider">
              {duration.toFixed(1)}s
            </span>
            <span className="block text-[11px] text-slate-400 mt-1">
              Se insertará en el segundo {currentTime.toFixed(1)}s
            </span>
          </div>

          {/* Live Waveform Meter */}
          <div className="h-14 w-full flex items-center justify-center gap-1.5 px-4 bg-slate-900/80 rounded-2xl border border-slate-800">
            {audioMeter.map((height, i) => (
              <div
                key={i}
                style={{ height: `${height}%` }}
                className={`w-1.5 rounded-full transition-all duration-75 ${
                  isRecording ? 'bg-rose-500' : 'bg-slate-700'
                }`}
              />
            ))}
          </div>

          {/* Action Trigger Buttons */}
          <div className="flex items-center gap-4">
            {!isRecording ? (
              <button
                onClick={startRecording}
                className="w-16 h-16 rounded-full bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center shadow-lg shadow-rose-600/30 transition-transform active:scale-95"
                title="Comenzar a grabar"
              >
                <Mic className="w-7 h-7" />
              </button>
            ) : (
              <button
                onClick={stopRecording}
                className="w-16 h-16 rounded-full bg-slate-900 border-2 border-rose-500 text-rose-400 flex items-center justify-center shadow-lg animate-pulse"
                title="Detener grabación"
              >
                <Square className="w-6 h-6 fill-rose-500" />
              </button>
            )}
          </div>

          {/* If recorded and ready */}
          {recordedBlobUrl && !isRecording && (
            <div className="w-full pt-2 flex flex-col gap-3">
              <audio src={recordedBlobUrl} controls className="w-full h-9 rounded-lg" />
              <button
                onClick={handleSave}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 shadow-lg transition-colors"
              >
                <Check className="w-4 h-4" />
                <span>Insertar en la Línea de Tiempo</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
