import React, { useState, useEffect } from 'react';
import { Wifi, BatteryMedium, RotateCcw } from 'lucide-react';

interface AndroidFrameProps {
  children: React.ReactNode;
  isFrameActive: boolean;
  aspectRatio: string;
}

export const AndroidFrame: React.FC<AndroidFrameProps> = ({
  children,
  isFrameActive,
  aspectRatio,
}) => {
  const [currentTimeStr, setCurrentTimeStr] = useState('12:45');
  const [isLandscape, setIsLandscape] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTimeStr(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  if (!isFrameActive) {
    return <div className="w-full h-full flex flex-col relative">{children}</div>;
  }

  return (
    <div className="w-full h-full flex items-center justify-center p-2 sm:p-4 bg-[#06070a] overflow-hidden">
      {/* Device Chassis */}
      <div
        className={`relative flex flex-col bg-[#090b10] border-[8px] border-[#1e2330] rounded-[44px] shadow-2xl shadow-indigo-950/40 transition-all duration-300 overflow-hidden ${
          isLandscape
            ? 'w-[780px] max-w-[96vw] h-[440px] max-h-[92vh]'
            : 'w-[420px] max-w-[94vw] h-[720px] max-h-[94vh]'
        }`}
      >
        {/* Subtle camera punch-hole */}
        <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-3.5 h-3.5 bg-black rounded-full z-40 border border-slate-800 shadow-inner flex items-center justify-center">
          <div className="w-1 h-1 bg-indigo-950/60 rounded-full" />
        </div>

        {/* Android Status Bar */}
        <div className="h-7 w-full px-5 flex items-center justify-between text-[11px] font-medium text-slate-300 z-30 select-none bg-gradient-to-b from-black/80 to-transparent">
          <span className="font-['JetBrains_Mono'] tracking-tight">{currentTimeStr}</span>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-indigo-400">5G</span>
            <Wifi className="w-3 h-3 text-slate-300" />
            <div className="flex items-center gap-1">
              <span className="text-[10px]">98%</span>
              <BatteryMedium className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            {/* Quick Rotate toggle */}
            <button
              onClick={() => setIsLandscape(!isLandscape)}
              title="Girar orientación de pantalla"
              className="ml-1 p-0.5 hover:text-white transition-colors"
            >
              <RotateCcw className="w-3 h-3 text-slate-400 hover:text-indigo-300" />
            </button>
          </div>
        </div>

        {/* Main Content inside Android Screen */}
        <div className="flex-1 w-full h-[calc(100%-44px)] overflow-hidden flex flex-col relative">
          {children}
        </div>

        {/* Android Gesture Bar */}
        <div className="h-4 w-full flex items-center justify-center pb-1 bg-black/60 z-30">
          <div className="w-28 h-1 bg-slate-500/70 rounded-full" />
        </div>
      </div>
    </div>
  );
};
