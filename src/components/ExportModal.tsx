import React, { useState } from 'react';
import { X, Download, Share2, CheckCircle2, Film, Sparkles, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { VideoProject, Resolution } from '../types/editor';
import { exportVideo, ExportProgress } from '../utils/videoExporter';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: VideoProject;
  onUpdateResolution: (res: Resolution) => void;
  onUpdateFps: (fps: number) => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  project,
  onUpdateResolution,
  onUpdateFps,
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState<ExportProgress | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleStartExport = async () => {
    setIsExporting(true);
    setDownloadUrl(null);
    setErrorMsg(null);

    try {
      const result = await exportVideo(project, (prog) => {
        setProgress(prog);
      });

      setDownloadUrl(result.url);
      setIsExporting(false);

      // Trigger celebration confetti
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch (err: unknown) {
      setIsExporting(false);
      setErrorMsg((err as Error)?.message || 'Error durante la exportación del video.');
    }
  };

  const handleShare = async () => {
    if (!downloadUrl) return;

    if (navigator.share) {
      try {
        const response = await fetch(downloadUrl);
        const blob = await response.blob();
        const file = new File([blob], `${project.name.replace(/\s+/g, '_')}.webm`, { type: blob.type });

        await navigator.share({
          title: project.name,
          text: 'Video editado con NovaCut Pro para Android',
          files: [file],
        });
      } catch (err) {
        // user cancelled or unsupported
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-md p-0 sm:p-4">
      <div className="w-full max-w-lg bg-[#0e121a] border border-slate-800 rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Film className="w-5 h-5 text-indigo-400" />
            <h3 className="text-sm font-bold text-white font-['Syne']">
              Exportar Video Profesional
            </h3>
          </div>
          <button
            onClick={() => {
              if (!isExporting) onClose();
            }}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {errorMsg && (
            <div className="p-3 bg-rose-950/60 border border-rose-800 rounded-xl flex items-center gap-2 text-rose-300 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Configuration when not exported */}
          {!downloadUrl && !isExporting && (
            <>
              {/* Resolution options */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300">
                  Resolución de Salida
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  {(['720p', '1080p', '4K'] as Resolution[]).map((res) => (
                    <button
                      key={res}
                      type="button"
                      onClick={() => onUpdateResolution(res)}
                      className={`p-3 rounded-xl border text-center transition-all ${
                        project.resolution === res
                          ? 'border-indigo-500 bg-indigo-950/60 shadow-md ring-1 ring-indigo-500'
                          : 'border-slate-800 bg-slate-900 hover:border-slate-700'
                      }`}
                    >
                      <span className="text-sm font-bold text-white font-['JetBrains_Mono'] block">
                        {res}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {res === '4K' ? 'Ultra HD' : res === '1080p' ? 'Full HD' : 'Estándar'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Framerate options */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300">
                  Cuadros por Segundo (FPS)
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  {[30, 60].map((fps) => (
                    <button
                      key={fps}
                      type="button"
                      onClick={() => onUpdateFps(fps)}
                      className={`p-2.5 rounded-xl border text-center transition-all ${
                        project.fps === fps
                          ? 'border-indigo-500 bg-indigo-950/60 shadow-md'
                          : 'border-slate-800 bg-slate-900 hover:border-slate-700'
                      }`}
                    >
                      <span className="text-xs font-bold text-white font-['JetBrains_Mono'] block">
                        {fps} FPS
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {fps === 60 ? 'Máxima fluidez' : 'Estándar de cine'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Summary spec pills */}
              <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 flex items-center justify-around text-center text-xs">
                <div>
                  <span className="text-slate-400 text-[10px] block">Formato</span>
                  <span className="font-semibold text-white">{project.aspectRatio}</span>
                </div>
                <div className="w-[1px] h-6 bg-slate-800" />
                <div>
                  <span className="text-slate-400 text-[10px] block">Pistas de Video</span>
                  <span className="font-semibold text-white">{project.videoClips.length} clips</span>
                </div>
                <div className="w-[1px] h-6 bg-slate-800" />
                <div>
                  <span className="text-slate-400 text-[10px] block">Audio</span>
                  <span className="font-semibold text-white">{project.audioClips.length} pistas</span>
                </div>
              </div>
            </>
          )}

          {/* Progress rendering state */}
          {isExporting && progress && (
            <div className="py-6 flex flex-col items-center justify-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-indigo-950/80 border-2 border-indigo-500 flex items-center justify-center text-indigo-400 animate-spin">
                <Sparkles className="w-6 h-6" />
              </div>

              <div className="text-center font-['JetBrains_Mono']">
                <span className="text-3xl font-bold text-white">
                  {progress.progress}%
                </span>
                <span className="block text-xs text-slate-400 mt-1">
                  Renderizando fotograma {progress.currentFrame} de {progress.totalFrames}
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  style={{ width: `${progress.progress}%` }}
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-150 rounded-full"
                />
              </div>

              <span className="text-[11px] text-slate-500">
                Procesando composición multicapa, filtros y mezcla de audio...
              </span>
            </div>
          )}

          {/* Completed State */}
          {downloadUrl && (
            <div className="py-2 flex flex-col items-center justify-center space-y-4 text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-950/80 border border-emerald-500 text-emerald-400 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>

              <div>
                <h4 className="text-base font-bold text-white font-['Syne']">
                  ¡Video Renderizado con Éxito!
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  Tu video está listo en resolución {project.resolution} a {project.fps} FPS
                </p>
              </div>

              {/* Video Player */}
              <div className="w-full max-h-52 bg-black rounded-xl overflow-hidden border border-slate-800 shadow-lg">
                <video
                  src={downloadUrl}
                  controls
                  autoPlay
                  playsInline
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Download and Share buttons */}
              <div className="w-full grid grid-cols-2 gap-3 pt-2">
                <a
                  href={downloadUrl}
                  download={`${project.name.replace(/\s+/g, '_')}_${project.resolution}.webm`}
                  className="py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 shadow-lg transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Descargar</span>
                </a>

                <button
                  onClick={handleShare}
                  className="py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Compartir</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {!downloadUrl && !isExporting && (
          <div className="p-4 border-t border-slate-800 bg-[#0c0f16]">
            <button
              onClick={handleStartExport}
              className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all active:scale-98"
            >
              <Download className="w-4 h-4" />
              <span>Iniciar Renderizado ({project.resolution})</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
