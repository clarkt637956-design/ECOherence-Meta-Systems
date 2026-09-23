import React, { useState } from 'react';
import {
  BookOpen,
  Search,
  X,
  ShieldAlert,
  HelpCircle,
  Zap,
  RotateCw,
  Clock,
  Layers,
  CheckCircle2,
} from 'lucide-react';
import { THREAT_KNOWLEDGE_BASE, PLAYBOOK_EXPLANATIONS } from '../lib/threatKnowledge.ts';
import { CyberAction } from '../types.ts';
import { soundFx } from '../lib/audio.ts';

interface KnowledgeBaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialVector?: CyberAction;
  onSimulateVector?: (vector: CyberAction) => void;
}

export const KnowledgeBaseModal: React.FC<KnowledgeBaseModalProps> = ({
  isOpen,
  onClose,
  initialVector,
  onSimulateVector,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVector, setSelectedVector] = useState<CyberAction>(
    initialVector || 'ZERO_DAY_DETECTED'
  );
  const [activeTab, setActiveTab] = useState<'VECTORS' | 'PLAYBOOKS' | 'QEL_THEORY'>('VECTORS');

  if (!isOpen) return null;

  const vectorEntries = Object.entries(THREAT_KNOWLEDGE_BASE).filter(([action, data]) => {
    const q = searchTerm.toLowerCase();
    return (
      action.toLowerCase().includes(q) ||
      data.title.toLowerCase().includes(q) ||
      data.mitreId.toLowerCase().includes(q) ||
      data.whatItIs.toLowerCase().includes(q)
    );
  });

  const currentKnowledge = THREAT_KNOWLEDGE_BASE[selectedVector];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-150">
      <div className="relative w-full max-w-4xl bg-[#080d1a] border border-cyan-500/40 rounded-lg p-6 shadow-2xl hud-corner max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-cyan-950 pb-4 mb-4 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded bg-purple-950/70 border border-purple-600/70 text-purple-400">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white font-heading">
                Cyber Defense Academy &amp; Threat Knowledge Base
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                Comprehensive guide to cyber threats, detection physics, and incident remediation
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

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 mb-4 border-b border-cyan-950/60 pb-2 flex-shrink-0 font-mono text-xs">
          <button
            onClick={() => setActiveTab('VECTORS')}
            className={`px-3 py-1.5 rounded transition ${
              activeTab === 'VECTORS'
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-700 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Threat Vectors ({Object.keys(THREAT_KNOWLEDGE_BASE).length})
          </button>
          <button
            onClick={() => setActiveTab('PLAYBOOKS')}
            className={`px-3 py-1.5 rounded transition ${
              activeTab === 'PLAYBOOKS'
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-700 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            SOAR Playbooks Guide (4 Actions)
          </button>
          <button
            onClick={() => setActiveTab('QEL_THEORY')}
            className={`px-3 py-1.5 rounded transition ${
              activeTab === 'QEL_THEORY'
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-700 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            QEL Quantum Theory &amp; Derivatives
          </button>
        </div>

        {/* Tab 1: Threat Vectors */}
        {activeTab === 'VECTORS' && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 flex-1 overflow-hidden">
            {/* Left: Vector List & Search */}
            <div className="md:col-span-4 flex flex-col gap-2 overflow-hidden">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search vector or MITRE ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-black/60 border border-cyan-950 pl-8 pr-3 py-1.5 rounded text-xs text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex-1 overflow-y-auto space-y-1 pr-1">
                {vectorEntries.map(([action, data]) => {
                  const isSelected = selectedVector === action;
                  return (
                    <button
                      key={action}
                      onClick={() => {
                        soundFx.playClick();
                        setSelectedVector(action as CyberAction);
                      }}
                      className={`w-full text-left p-2 rounded text-xs font-mono transition border ${
                        isSelected
                          ? 'bg-cyan-950/80 border-cyan-400 text-white font-bold'
                          : 'bg-black/40 border-slate-900 text-slate-400 hover:text-slate-200 hover:border-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="truncate">{data.title}</span>
                        <span className="text-[10px] text-slate-500">{data.mitreId}</span>
                      </div>
                      <span className="text-[10px] text-slate-500 block truncate">{action}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right: Detailed Vector Guide */}
            <div className="md:col-span-8 overflow-y-auto bg-black/50 border border-cyan-950 p-4 rounded text-xs font-mono space-y-4">
              {currentKnowledge ? (
                <>
                  <div className="flex flex-wrap items-center justify-between border-b border-cyan-950 pb-2 gap-2">
                    <div>
                      <span className="text-[10px] text-cyan-400 font-bold uppercase">
                        MITRE ATT&amp;CK {currentKnowledge.mitreId}
                      </span>
                      <h3 className="text-base font-bold text-white font-heading">
                        {currentKnowledge.title}
                      </h3>
                      <span className="text-[10px] text-slate-500">
                        Category: {currentKnowledge.mitreTactic}
                      </span>
                    </div>

                    {onSimulateVector && (
                      <button
                        onClick={() => {
                          onSimulateVector(currentKnowledge.action);
                          onClose();
                        }}
                        className="px-3 py-1.5 rounded bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/50 text-[11px] font-bold transition flex items-center gap-1.5"
                      >
                        <Zap className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Simulate This Threat</span>
                      </button>
                    )}
                  </div>

                  <div>
                    <h4 className="text-cyan-300 font-bold mb-1">1. What It Is</h4>
                    <p className="text-slate-300 leading-relaxed">{currentKnowledge.whatItIs}</p>
                  </div>

                  <div>
                    <h4 className="text-red-400 font-bold mb-1">2. Why It Is Dangerous</h4>
                    <p className="text-slate-300 leading-relaxed">
                      {currentKnowledge.whyDangerous}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-emerald-400 font-bold mb-1">
                      3. How QEL Detects It (Resonance Physics)
                    </h4>
                    <p className="text-slate-300 leading-relaxed">
                      {currentKnowledge.howQelDetectsIt}
                    </p>
                  </div>

                  <div className="bg-cyan-950/30 border border-cyan-900/60 p-3 rounded space-y-2">
                    <h4 className="text-white font-bold flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Recommended Playbook: {currentKnowledge.recommendedPlaybook}</span>
                    </h4>
                    <p className="text-slate-300 text-[11px] leading-relaxed">
                      <strong className="text-cyan-300">Why Run This:</strong>{' '}
                      {currentKnowledge.remediationRationale}
                    </p>
                  </div>

                  {currentKnowledge.realWorldExample && (
                    <div className="bg-slate-900/60 p-3 rounded border border-slate-800 text-slate-400 text-[11px]">
                      <strong className="text-white block mb-0.5">Real-World Case Study:</strong>
                      {currentKnowledge.realWorldExample}
                    </div>
                  )}
                </>
              ) : null}
            </div>
          </div>
        )}

        {/* Tab 2: SOAR Playbooks Guide */}
        {activeTab === 'PLAYBOOKS' && (
          <div className="overflow-y-auto space-y-4 font-mono text-xs pr-1">
            <p className="text-slate-300">
              Automated Incident Response (SOAR) playbooks empower any operator to eliminate threats in
              seconds. Each action serves a distinct strategic purpose:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(PLAYBOOK_EXPLANATIONS).map(([code, p]) => (
                <div key={code} className="bg-black/50 border border-cyan-950 p-4 rounded space-y-2">
                  <div className="flex items-center justify-between border-b border-cyan-950/80 pb-2">
                    <h4 className="font-bold text-white font-heading text-sm">{p.name}</h4>
                    <span className="text-[10px] text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
                      {code}
                    </span>
                  </div>

                  <div>
                    <span className="text-cyan-300 font-bold block mb-0.5">› What It Does:</span>
                    <p className="text-slate-300 text-[11px]">{p.whatItDoes}</p>
                  </div>

                  <div>
                    <span className="text-emerald-400 font-bold block mb-0.5">› Why Run It:</span>
                    <p className="text-slate-300 text-[11px]">{p.whyRunIt}</p>
                  </div>

                  <div className="pt-2 text-[10px] text-slate-400">
                    <strong>Primary Target Vectors:</strong> {p.bestForVectors.join(', ')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: QEL Quantum Theory */}
        {activeTab === 'QEL_THEORY' && (
          <div className="overflow-y-auto space-y-4 font-mono text-xs text-slate-300 pr-1 leading-relaxed">
            <div className="bg-black/50 border border-cyan-950 p-4 rounded">
              <h4 className="text-sm font-bold text-white font-heading mb-2">
                12-Phase Resonance Lattice &amp; Damping Math
              </h4>
              <p className="mb-2">
                The Quantum Entropy Lattice (QEL) represents network state as an array of 12 resonant
                energy phases L in R^12. When any packet arrives, its IP and
                action are translated into harmonic coordinates:
              </p>
              <pre className="bg-black p-2 rounded border border-slate-800 text-[11px] text-cyan-300 overflow-x-auto mb-2">
{`sig = (sum(ord(c) for c in (ip + action)) % 9) or 9
phase = sum(ord(c) for c in action) % 12
lattice[i] *= 0.963  // Damping decay
lattice[phase] += sig * 3.69  // Resonance excitation`}
              </pre>
              <p>
                Hostile or voluminous activity overloads specific nodes faster than the 0.963
                dissipation rate can absorb it, triggering anomaly flags without relying on brittle
                regex patterns.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-black/50 border border-cyan-950 p-4 rounded">
                <h4 className="font-bold text-emerald-400 font-heading mb-1">
                  QEL-A: Kinetic Deflection Matrix
                </h4>
                <p className="text-[11px]">
                  Calculates perimeter spatial absorption. Higher deflection percentage means
                  the barrier is actively deflecting hostile payloads before they touch internal daemons.
                </p>
              </div>

              <div className="bg-black/50 border border-cyan-950 p-4 rounded">
                <h4 className="font-bold text-cyan-400 font-heading mb-1">
                  QEL-T: Temporal Incident Forensics
                </h4>
                <p className="text-[11px]">
                  Monitors causality coherence over time. Lateral movement or token replay attacks
                  cause temporal phase jitter, dropping coherence and signaling unauthorized traversal.
                </p>
              </div>

              <div className="bg-black/50 border border-cyan-950 p-4 rounded">
                <h4 className="font-bold text-purple-400 font-heading mb-1">
                  QEL-S: Spectral Resonance Sensor
                </h4>
                <p className="text-[11px]">
                  Evaluates Lyapunov stability across phase nodes. Fixed-interval automated C2 beaconing
                  is revealed as unnatural harmonic phase lock.
                </p>
              </div>

              <div className="bg-black/50 border border-cyan-950 p-4 rounded">
                <h4 className="font-bold text-amber-400 font-heading mb-1">
                  QEL-X: Cross-Vector Zero-Day Quarantine
                </h4>
                <p className="text-[11px]">
                  Computes zero-day threat coefficients. Automatically quarantines rogue nodes when
                  unregistered entropy shifts exceed safe tolerances.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
