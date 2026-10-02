import React from 'react';
import { Download, Sparkles, Smartphone, Monitor, Undo2, Redo2, HelpCircle } from 'lucide-react';
import { AspectRatio } from '../types/editor';
import { usePWA } from '../hooks/usePWA';

interface HeaderProps {
  aspectRatio: AspectRatio;
  onAspectRatioChange: (ratio: AspectRatio) => void;
  isAndroidFrame: boolean;
  onToggleAndroidFrame: () => void;
  onOpenExport: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onOpenHelp: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  aspectRatio,
  onAspectRatioChange,
  isAndroidFrame,
  onToggleAndroidFrame,
  onOpenExport,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onOpenHelp,
}) => {
  const { isInstallable, install } = usePWA();

  const ratios: { label: string; value: AspectRatio; icon: string }[] = [
    { label: '9:16 (Reels/TikTok)', value: '9:16', icon: '📱' },
    { label: '16:9 (YouTube)', value: '16:9', icon: '🎬' },
    { label: '1:1 (Post)', value: '1:1', icon: '⏹️' },
    { label: '4:5 (Feed)', value: '4:5', icon: '📸' },
  ];

  return (
    <header className="h-14 bg-[#0d1017] border-b border-slate-800/80 px-3 md:px-5 flex items-center justify-between z-30 select-none">
      {/* Zone 1: Single element brand mark */}
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-600/30">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        <div>
          <span className="text-base font-bold tracking-tight text-white font-['Syne']">
            NovaCut <span className="text-indigo-400 text-xs font-semibold uppercase tracking-wider">Pro</span>
          </span>
        </div>
      </div>

      {/* Zone 2: Navigation / Controls */}
      <div className="flex items-center gap-1.5 md:gap-3">
        {/* Undo / Redo */}
        <div className="flex items-center bg-slate-900/90 rounded-lg p-0.5 border border-slate-800">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            title="Deshacer (Ctrl+Z)"
            className="p-1.5 text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400 rounded-md transition-colors"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            title="Rehacer (Ctrl+Y)"
            className="p-1.5 text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400 rounded-md transition-colors"
          >
            <Redo2 className="w-4 h-4" />
          </button>
        </div>

        {/* Aspect Ratio Selector */}
        <div className="hidden sm:flex items-center bg-slate-900/90 rounded-lg p-1 border border-slate-800">
          {ratios.map((r) => (
            <button
              key={r.value}
              onClick={() => onAspectRatioChange(r.value)}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all whitespace-nowrap ${
                aspectRatio === r.value
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span className="mr-1">{r.icon}</span>
              {r.value}
            </button>
          ))}
        </div>

        {/* Device Frame Toggle */}
        <button
          onClick={onToggleAndroidFrame}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-all ${
            isAndroidFrame
              ? 'bg-indigo-950/80 border-indigo-700 text-indigo-300'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
          }`}
          title={isAndroidFrame ? 'Cambiar a vista completa' : 'Simular marco Android'}
        >
          {isAndroidFrame ? (
            <>
              <Smartphone className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden md:inline">Vista Android</span>
            </>
          ) : (
            <>
              <Monitor className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Pantalla Completa</span>
            </>
          )}
        </button>

        {/* Help button */}
        <button
          onClick={onOpenHelp}
          className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          title="Guía rápida"
        >
          <HelpCircle className="w-4 h-4" />
        </button>
      </div>

      {/* Zone 3: Primary Action buttons */}
      <div className="flex items-center gap-2">
        {isInstallable && (
          <button
            onClick={install}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-400 bg-emerald-950/50 border border-emerald-800/60 rounded-lg hover:bg-emerald-900/50 transition-colors whitespace-nowrap"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Instalar App</span>
          </button>
        )}

        <button
          onClick={onOpenExport}
          className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 active:scale-95 rounded-lg shadow-lg shadow-indigo-600/30 transition-all whitespace-nowrap"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Exportar 4K</span>
        </button>
      </div>
    </header>
  );
};
