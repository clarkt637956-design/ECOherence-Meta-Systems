import React from 'react';
import { AlertTriangle, ShieldCheck, X } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  affectedItemsCount?: number;
  details?: string[];
  confirmButtonText?: string;
  confirmButtonVariant?: 'primary' | 'danger';
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  title,
  message,
  affectedItemsCount,
  details,
  confirmButtonText = 'Confirm Action',
  confirmButtonVariant = 'primary',
  onConfirm,
  onCancel,
  isLoading = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-[#080d1a] border border-cyan-500/40 rounded-lg p-6 shadow-2xl shadow-cyan-950/50 hud-corner">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-cyan-950 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded ${confirmButtonVariant === 'danger' ? 'bg-red-950/60 text-red-400 border border-red-700/50' : 'bg-cyan-950/60 text-cyan-400 border border-cyan-700/50'}`}>
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold tracking-wide text-white font-heading">
                {title}
              </h3>
              <p className="text-xs text-slate-400">Confirmation Required for Workspace Mutation</p>
            </div>
          </div>
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message */}
        <div className="space-y-3 mb-6">
          <p className="text-sm text-slate-200 leading-relaxed">
            {message}
          </p>

          {affectedItemsCount !== undefined && (
            <div className="flex items-center gap-2 text-xs font-mono bg-cyan-950/30 text-cyan-300 border border-cyan-800/40 px-3 py-2 rounded">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span>Target records affected: <strong>{affectedItemsCount}</strong></span>
            </div>
          )}

          {details && details.length > 0 && (
            <div className="bg-black/50 border border-slate-800 p-3 rounded text-xs space-y-1 max-h-36 overflow-y-auto">
              <span className="text-slate-400 font-semibold block mb-1">Execution Details:</span>
              {details.map((item, idx) => (
                <div key={idx} className="text-slate-300 font-mono flex items-center gap-1.5">
                  <span className="text-cyan-400">›</span> {item}
                </div>
              ))}
            </div>
          )}

          <p className="text-[11px] text-amber-400/80 bg-amber-950/20 border border-amber-900/30 p-2 rounded">
            ⚠️ This operation mutates content in your connected Google Drive / Google Docs with your explicit permission.
          </p>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 text-xs font-medium rounded border border-slate-700 bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-5 py-2 text-xs font-semibold rounded flex items-center gap-2 transition disabled:opacity-50 ${
              confirmButtonVariant === 'danger'
                ? 'bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-900/40'
                : 'bg-cyan-500 hover:bg-cyan-400 text-black shadow-lg shadow-cyan-900/40'
            }`}
          >
            {isLoading ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                <span>Executing...</span>
              </>
            ) : (
              confirmButtonText
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
