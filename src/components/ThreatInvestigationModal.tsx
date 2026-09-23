import React, { useState } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle,
  HelpCircle,
  ArrowRight,
  Lock,
  RotateCw,
  Eye,
  ShieldCheck,
  X,
  ExternalLink,
  BookOpen,
  Activity,
} from 'lucide-react';
import { SecurityAlert, CyberAction } from '../types.ts';
import { THREAT_KNOWLEDGE_BASE, PLAYBOOK_EXPLANATIONS } from '../lib/threatKnowledge.ts';
import { soundFx } from '../lib/audio.ts';

interface ThreatInvestigationModalProps {
  alert: SecurityAlert | null;
  onClose: () => void;
  onExecutePlaybook: (playbookCode: string, targetIp: string) => void;
  onOpenKnowledgeBase?: (vector: CyberAction) => void;
  onOpenDissector?: (alert: SecurityAlert) => void;
}

export const ThreatInvestigationModal: React.FC<ThreatInvestigationModalProps> = ({
  alert,
  onClose,
  onExecutePlaybook,
  onOpenKnowledgeBase,
  onOpenDissector,
}) => {
  const [selectedPlaybook, setSelectedPlaybook] = useState<string>('ISOLATE_IP');
  const [isExecuting, setIsExecuting] = useState(false);
  const [executedSuccess, setExecutedSuccess] = useState(false);

  if (!alert) return null;

  const vector = (alert.vector || 'EXPLOIT_ATTEMPT') as CyberAction;
  const kb = THREAT_KNOWLEDGE_BASE[vector] || THREAT_KNOWLEDGE_BASE.EXPLOIT_ATTEMPT;
  const recommendedCode = alert.recommendedPlaybook || kb.recommendedPlaybook || 'ISOLATE_IP';

  const handleEliminateThreat = () => {
    setIsExecuting(true);
    soundFx.playAlert();
    setTimeout(() => {
      onExecutePlaybook(selectedPlaybook, alert.targetIp);
      setIsExecuting(false);
      setExecutedSuccess(true);
      soundFx.playPulse(9);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-150">
      <div className="relative w-full max-w-3xl bg-[#080d1a] border border-cyan-500/40 rounded-lg p-6 shadow-2xl hud-corner max-h-[90vh] overflow-y-auto">
        {/* Top Header */}
        <div className="flex items-start justify-between border-b border-cyan-950 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div
              className={`p-2.5 rounded border ${
                alert.severity === 'CRITICAL'
                  ? 'bg-red-950/70 border-red-600/70 text-red-400'
                  : alert.severity === 'HIGH'
                  ? 'bg-amber-950/70 border-amber-600/70 text-amber-400'
                  : 'bg-cyan-950/70 border-cyan-600/70 text-cyan-400'
              }`}
            >
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span
                  className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                    alert.severity === 'CRITICAL'
                      ? 'bg-red-900/60 text-red-200 border-red-500'
                      : 'bg-amber-900/60 text-amber-200 border-amber-500'
                  }`}
                >
                  {alert.severity} THREAT
                </span>
                <span className="text-xs font-mono text-slate-400">
                  Target IP: <strong className="text-white">{alert.targetIp}</strong>
                </span>
                {alert.mitreId && (
                  <span className="text-[10px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-800 px-1.5 py-0.5 rounded">
                    MITRE {alert.mitreId}
                  </span>
                )}
              </div>
              <h2 className="text-lg font-bold text-white font-heading mt-1">
                {alert.title}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Banner if eliminated */}
        {executedSuccess ? (
          <div className="p-4 rounded bg-emerald-950/60 border border-emerald-500 text-emerald-300 font-mono text-xs mb-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              <div>
                <strong className="text-white block">Threat Successfully Eliminated!</strong>
                <span>
                  Playbook <strong>{selectedPlaybook}</strong> executed. Target{' '}
                  <strong>{alert.targetIp}</strong> contained and lattice stabilized.
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs"
            >
              Done
            </button>
          </div>
        ) : null}

        {/* Visual Incident Dissector CTA Banner */}
        {onOpenDissector && (
          <div className="p-3 rounded-lg bg-purple-950/40 border border-purple-500/60 flex flex-wrap items-center justify-between gap-3 text-xs font-mono mb-4 shadow-lg shadow-purple-950/40">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded bg-purple-900/80 text-purple-300">
                <Activity className="w-4 h-4 animate-pulse" />
              </div>
              <div>
                <span className="text-white font-bold block">
                  Visual Incident Dissector &amp; Resonance Waveform
                </span>
                <span className="text-[11px] text-purple-300">
                  Observe millisecond temporal forensics &amp; 3-6-9 harmonic oscilloscope wave.
                </span>
              </div>
            </div>
            <button
              onClick={() => {
                soundFx.playClick();
                onOpenDissector(alert);
              }}
              className="px-3 py-1.5 rounded bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-purple-950 transition ml-auto"
            >
              <span>Launch Dissector</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* 4-Pillar Pedagogical Breakdown */}
        <div className="space-y-4 text-xs font-mono">
          {/* 1. What is this threat? */}
          <div className="bg-black/50 border border-cyan-950/80 p-3.5 rounded">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-cyan-400 font-bold uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400"></span> 1. What Is Happening?
              </span>
              <span className="text-[10px] text-slate-500">
                Vector: <strong className="text-cyan-300">{vector}</strong>
              </span>
            </div>
            <p className="text-slate-200 leading-relaxed">{kb.whatItIs}</p>
            {kb.realWorldExample && (
              <div className="mt-2 text-[11px] text-slate-400 bg-slate-900/60 p-2 rounded border border-slate-800">
                <strong className="text-cyan-300">Historical Example:</strong> {kb.realWorldExample}
              </div>
            )}
          </div>

          {/* 2. Why was it detected? (Math & Lattice Physics) */}
          <div className="bg-black/50 border border-cyan-950/80 p-3.5 rounded">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-emerald-400 font-bold uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span> 2. Why Did QEL Detect
                It?
              </span>
              <span className="text-[10px] text-slate-500">Quantum Resonance Mechanics</span>
            </div>
            <p className="text-slate-200 leading-relaxed">
              {alert.whyDetected || kb.howQelDetectsIt}
            </p>
            <div className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-2 text-[10px] text-slate-400 pt-1">
              <div className="bg-slate-900/70 p-1.5 rounded border border-slate-800">
                Entropy Trigger: <strong className="text-white">{alert.entropyTrigger || '380+'}</strong>
              </div>
              <div className="bg-slate-900/70 p-1.5 rounded border border-slate-800">
                MITRE Tactic: <strong className="text-cyan-300">{kb.mitreTactic}</strong>
              </div>
              <div className="bg-slate-900/70 p-1.5 rounded border border-slate-800">
                Detection Mode: <strong className="text-emerald-400">Non-Signature Phase Jitter</strong>
              </div>
            </div>
          </div>

          {/* 3. Threat Impact & Risk */}
          <div className="bg-black/50 border border-cyan-950/80 p-3.5 rounded">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-amber-400 font-bold uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400"></span> 3. What Is The Risk If
                Ignored?
              </span>
              <span className="text-[10px] text-red-400 font-semibold">Operational Consequence</span>
            </div>
            <p className="text-slate-200 leading-relaxed">
              {alert.threatImpact || kb.whyDangerous}
            </p>
          </div>

          {/* 4. Elimination & Playbook Choice (Know what you're doing & why!) */}
          <div className="bg-black/60 border border-cyan-500/40 p-4 rounded hud-corner">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white font-bold uppercase tracking-wider text-xs flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse"></span> 4.
                Eliminate Threat: Choose Playbook &amp; Understand Why
              </span>
              <span className="text-[10px] text-emerald-400 font-semibold">
                Recommended: {recommendedCode}
              </span>
            </div>

            <p className="text-slate-300 text-xs mb-3">
              Select an automated remediation action below to see exactly{' '}
              <strong className="text-white">what it does</strong> and{' '}
              <strong className="text-white">why you should run it</strong>:
            </p>

            {/* Playbook Selection Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
              {Object.entries(PLAYBOOK_EXPLANATIONS).map(([code, info]) => {
                const isSelected = selectedPlaybook === code;
                const isRec = code === recommendedCode;
                return (
                  <button
                    key={code}
                    onClick={() => {
                      soundFx.playClick();
                      setSelectedPlaybook(code);
                    }}
                    className={`p-2.5 rounded text-left border transition-all ${
                      isSelected
                        ? 'bg-cyan-950/80 border-cyan-400 text-white shadow-md shadow-cyan-950'
                        : 'bg-black/40 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs">{info.name}</span>
                      {isRec && (
                        <span className="text-[9px] bg-emerald-950 text-emerald-300 border border-emerald-600 px-1 py-0.2 rounded font-semibold">
                          BEST MATCH
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400 block truncate">
                      {info.whatItDoes}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Deep Explanation of Selected Action */}
            {PLAYBOOK_EXPLANATIONS[selectedPlaybook as keyof typeof PLAYBOOK_EXPLANATIONS] && (
              <div className="bg-cyan-950/30 border border-cyan-900/60 p-3 rounded space-y-2 mb-4">
                <div>
                  <span className="text-cyan-300 font-bold block mb-0.5 text-[11px]">
                    › What This Action Does:
                  </span>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    {
                      PLAYBOOK_EXPLANATIONS[selectedPlaybook as keyof typeof PLAYBOOK_EXPLANATIONS]
                        .whatItDoes
                    }
                  </p>
                </div>
                <div>
                  <span className="text-emerald-400 font-bold block mb-0.5 text-[11px]">
                    › Why You Should Run It Now:
                  </span>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    {
                      PLAYBOOK_EXPLANATIONS[selectedPlaybook as keyof typeof PLAYBOOK_EXPLANATIONS]
                        .whyRunIt
                    }
                  </p>
                </div>
              </div>
            )}

            {/* Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-cyan-950">
              {onOpenKnowledgeBase && (
                <button
                  onClick={() => onOpenKnowledgeBase(vector)}
                  className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-mono"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Read Full Vector Encyclopedia</span>
                </button>
              )}

              <div className="flex items-center gap-2 ml-auto">
                <button
                  onClick={onClose}
                  className="px-3.5 py-2 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs transition"
                >
                  Close
                </button>
                <button
                  onClick={handleEliminateThreat}
                  disabled={isExecuting || executedSuccess}
                  className="px-5 py-2 rounded bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-red-950/50 transition disabled:opacity-50"
                >
                  {isExecuting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Neutralizing Target...</span>
                    </>
                  ) : executedSuccess ? (
                    <>
                      <ShieldCheck className="w-4 h-4 text-emerald-300" />
                      <span>Threat Eliminated</span>
                    </>
                  ) : (
                    <>
                      <ShieldAlert className="w-4 h-4" />
                      <span>Execute {selectedPlaybook}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
