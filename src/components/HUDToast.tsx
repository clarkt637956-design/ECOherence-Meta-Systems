import React from 'react';
import { CheckCircle2, AlertTriangle, ShieldCheck, Zap, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'SUCCESS' | 'WARNING' | 'ALERT' | 'INFO';
  title: string;
  message: string;
  timestamp: number;
}

interface HUDToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const HUDToast: React.FC<HUDToastProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-2">
      {toasts.map((toast, tIdx) => {
        const isSuccess = toast.type === 'SUCCESS';
        const isAlert = toast.type === 'ALERT';
        const isWarning = toast.type === 'WARNING';

        return (
          <div
            key={`${toast.id}-${tIdx}`}
            className={`pointer-events-auto p-3 rounded-lg border shadow-xl backdrop-blur-md font-mono text-xs animate-in slide-in-from-bottom-3 duration-200 transition-all ${
              isSuccess
                ? 'bg-[#05160e]/95 border-emerald-500/80 text-emerald-100 shadow-emerald-950/50'
                : isAlert
                ? 'bg-[#1b0709]/95 border-red-500/80 text-red-100 shadow-red-950/50'
                : isWarning
                ? 'bg-[#191104]/95 border-amber-500/80 text-amber-100 shadow-amber-950/50'
                : 'bg-[#06101c]/95 border-cyan-500/80 text-cyan-100 shadow-cyan-950/50'
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-2.5">
                <div className="mt-0.5 flex-shrink-0">
                  {isSuccess && <ShieldCheck className="w-4 h-4 text-emerald-400" />}
                  {isAlert && <AlertTriangle className="w-4 h-4 text-red-400" />}
                  {isWarning && <Zap className="w-4 h-4 text-amber-400" />}
                  {!isSuccess && !isAlert && !isWarning && <CheckCircle2 className="w-4 h-4 text-cyan-400" />}
                </div>

                <div>
                  <div className="font-bold text-xs tracking-wide flex items-center gap-1.5 font-heading">
                    {toast.title}
                  </div>
                  <p className="text-[11px] opacity-90 mt-0.5 leading-snug">
                    {toast.message}
                  </p>
                </div>
              </div>

              <button
                onClick={() => onDismiss(toast.id)}
                className="text-slate-400 hover:text-white p-0.5 rounded transition"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
