import React, { useState } from 'react';
import { FileText, ExternalLink, HardDrive, CheckCircle, X, Shield, AlertTriangle } from 'lucide-react';
import { QELState, SecurityAlert } from '../types.ts';
import { createThreatIntelGoogleDoc, GoogleDocResult } from '../lib/googleWorkspace.ts';
import { ConfirmationModal } from './ConfirmationModal.tsx';
import { persistReportToFirestore } from '../lib/firebase.ts';
import { soundFx } from '../lib/audio.ts';

interface WorkspaceExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  qelState: QELState;
  accessToken: string | null;
  onRequireLogin: () => void;
  userEmail?: string | null;
}

export const WorkspaceExportModal: React.FC<WorkspaceExportModalProps> = ({
  isOpen,
  onClose,
  qelState,
  accessToken,
  onRequireLogin,
  userEmail,
}) => {
  const [title, setTitle] = useState(
    `QEL Nexus Threat Intelligence Brief - ${new Date().toISOString().slice(0, 10)}`
  );
  const [analystNotes, setAnalystNotes] = useState(
    'All perimeter resonance nodes inspected. Automated SOAR playbooks contained high-entropy assault vectors.'
  );
  const [isExporting, setIsExporting] = useState(false);
  const [exportResult, setExportResult] = useState<GoogleDocResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  if (!isOpen) return null;

  const handleStartExport = () => {
    if (!accessToken) {
      onRequireLogin();
      return;
    }
    setError(null);
    setShowConfirmModal(true);
  };

  const handleConfirmExport = async () => {
    setShowConfirmModal(false);
    setIsExporting(true);
    setError(null);

    try {
      soundFx.playPulse(8);
      const result = await createThreatIntelGoogleDoc(accessToken!, {
        title,
        notes: analystNotes,
        includedAlerts: qelState.alerts.slice(0, 10),
        qelState,
      });

      setExportResult(result);

      // Save report metadata to Firestore for persistent tracking
      await persistReportToFirestore({
        id: `rep-${result.docId}`,
        title: result.title,
        docId: result.docId,
        docUrl: result.url,
        driveFileId: result.driveFolderId,
        summary: analystNotes,
        authorEmail: userEmail || 'analyst@qelnexus.local',
        createdAt: new Date().toISOString(),
      });
    } catch (err: any) {
      console.error('Export error:', err);
      setError(err.message || 'Failed to export to Google Docs.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-150">
        <div className="relative w-full max-w-2xl bg-[#080d1a] border border-cyan-500/40 rounded-lg p-6 shadow-2xl hud-corner">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-cyan-950 pb-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded bg-emerald-950/60 border border-emerald-700/50 text-emerald-400">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white font-heading tracking-wide">
                  Export Threat Brief to Google Workspace
                </h3>
                <p className="text-xs text-slate-400 font-mono">
                  Generates an Executive Report in Google Docs &amp; archives in Google Drive
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {exportResult ? (
            /* Success State */
            <div className="space-y-4 py-4 text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-950/80 border border-emerald-500 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-950/50">
                <CheckCircle className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-base font-bold text-white font-heading">
                  Threat Brief Created Successfully
                </h4>
                <p className="text-xs text-slate-400 font-mono mt-1">
                  Document formatted and linked to your Google Drive account.
                </p>
              </div>

              <div className="bg-black/60 border border-cyan-950 p-4 rounded text-left font-mono text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Document ID:</span>
                  <span className="text-cyan-300">{exportResult.docId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Classification:</span>
                  <span className="text-emerald-400">QEL-SOAR OPERATIONAL</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Drive Folder:</span>
                  <span className="text-slate-300">QEL-Nexus-Threat-Reports</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <a
                  href={exportResult.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2.5 rounded bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs font-mono flex items-center gap-2 shadow-lg shadow-cyan-950/50 transition"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Open in Google Docs</span>
                </a>
                <button
                  onClick={() => {
                    setExportResult(null);
                    onClose();
                  }}
                  className="px-4 py-2.5 rounded bg-slate-800 hover:bg-slate-700 text-white text-xs font-mono transition"
                >
                  Close
                </button>
              </div>
            </div>
          ) : (
            /* Configure Form */
            <div className="space-y-4">
              {!accessToken && (
                <div className="p-3 rounded bg-amber-950/40 border border-amber-800/60 text-amber-300 text-xs font-mono flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                    <span>Please connect your Google Account to export reports to Docs &amp; Drive.</span>
                  </div>
                  <button
                    onClick={onRequireLogin}
                    className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded text-[11px] whitespace-nowrap"
                  >
                    Connect Now
                  </button>
                </div>
              )}

              {error && (
                <div className="p-3 rounded bg-red-950/40 border border-red-800 text-red-300 text-xs font-mono">
                  {error}
                </div>
              )}

              <div className="space-y-1 font-mono text-xs">
                <label className="text-slate-300 block">Report Document Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-black/60 border border-cyan-950 focus:border-cyan-500 px-3 py-2 rounded text-slate-200 font-mono focus:outline-none"
                />
              </div>

              <div className="space-y-1 font-mono text-xs">
                <label className="text-slate-300 block">Analyst Executive Notes</label>
                <textarea
                  rows={3}
                  value={analystNotes}
                  onChange={(e) => setAnalystNotes(e.target.value)}
                  className="w-full bg-black/60 border border-cyan-950 focus:border-cyan-500 px-3 py-2 rounded text-slate-200 font-mono focus:outline-none"
                />
              </div>

              {/* Contents Included Preview */}
              <div className="bg-black/50 border border-cyan-950 p-3 rounded text-xs font-mono space-y-1.5">
                <span className="text-slate-400 font-bold block mb-1">Included Dossier Sections:</span>
                <div className="text-slate-300 flex items-center gap-2">
                  <span className="text-emerald-400">✓</span> 12-Phase Resonance Lattice Telemetry ({qelState.lattice.length} nodes)
                </div>
                <div className="text-slate-300 flex items-center gap-2">
                  <span className="text-emerald-400">✓</span> QEL Derivatives Status Matrix (QEL-A, QEL-T, QEL-S, QEL-X)
                </div>
                <div className="text-slate-300 flex items-center gap-2">
                  <span className="text-emerald-400">✓</span> Active Security Incidents &amp; SOAR Remediations ({qelState.alerts.length} events)
                </div>
                <div className="text-slate-300 flex items-center gap-2">
                  <span className="text-emerald-400">✓</span> Identified Threat Actors Directory ({Object.keys(qelState.profiles).length} entities)
                </div>
                <div className="text-slate-300 flex items-center gap-2">
                  <span className="text-emerald-400">✓</span> SHA-256 Root Witness Cryptographic Signature
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-cyan-950">
                <button
                  onClick={onClose}
                  disabled={isExporting}
                  className="px-4 py-2 rounded border border-slate-700 bg-slate-900 text-slate-300 text-xs font-mono hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  onClick={handleStartExport}
                  disabled={isExporting || !accessToken}
                  className="px-5 py-2 rounded bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs font-mono flex items-center gap-2 shadow-lg shadow-emerald-950/50 transition disabled:opacity-50"
                >
                  {isExporting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      <span>Generating Doc...</span>
                    </>
                  ) : (
                    <>
                      <HardDrive className="w-4 h-4" />
                      <span>Generate Google Doc</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mandatory User Confirmation Dialog */}
      <ConfirmationModal
        isOpen={showConfirmModal}
        title="Confirm Google Workspace Export"
        message="Are you sure you want to create a new Google Doc and store this threat intelligence report in your Google Drive folder 'QEL-Nexus-Threat-Reports'?"
        affectedItemsCount={qelState.alerts.length}
        details={[
          `Target File: ${title}`,
          `Entities included: ${Object.keys(qelState.profiles).length} threat actor profiles`,
          `Lattice reading: Total Entropy ${qelState.entropy.toFixed(2)}`,
        ]}
        confirmButtonText="Yes, Create Google Doc"
        onConfirm={handleConfirmExport}
        onCancel={() => setShowConfirmModal(false)}
        isLoading={isExporting}
      />
    </>
  );
};
