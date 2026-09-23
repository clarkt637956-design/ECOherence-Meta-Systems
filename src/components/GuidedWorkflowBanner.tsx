import React from 'react';
import {
  Radar,
  Search,
  ShieldCheck,
  FileCheck,
  Zap,
  PlayCircle,
  HelpCircle,
  AlertTriangle,
  ChevronRight,
  BookOpen,
  CheckCircle2,
  Activity,
} from 'lucide-react';
import { SecurityAlert } from '../types.ts';
import { soundFx } from '../lib/audio.ts';

interface GuidedWorkflowBannerProps {
  alerts: SecurityAlert[];
  onInvestigateAlert: (alert: SecurityAlert) => void;
  onQuickNeutralize?: (alert: SecurityAlert) => void;
  onOpenKnowledgeBase: () => void;
  onOpenDrills: () => void;
  onOpenExportModal: () => void;
  onOpenEntropyDashboard?: () => void;
  onSimulateThreat: () => void;
}

export const GuidedWorkflowBanner: React.FC<GuidedWorkflowBannerProps> = ({
  alerts,
  onInvestigateAlert,
  onQuickNeutralize,
  onOpenKnowledgeBase,
  onOpenDrills,
  onOpenExportModal,
  onOpenEntropyDashboard,
  onSimulateThreat,
}) => {
  const activeAlert = alerts.find((a) => a.status === 'OPEN' || a.status === 'INVESTIGATING');
  const criticalCount = alerts.filter(
    (a) => a.severity === 'CRITICAL' && a.status !== 'RESOLVED'
  ).length;

  return (
    <div className="bg-[#060a16] border border-cyan-500/30 rounded-lg p-3 sm:p-4 hud-corner shadow-lg space-y-3">
      {/* Active Incident Urgent Callout if present */}
      {activeAlert ? (
        <div className="p-3 rounded bg-red-950/40 border border-red-500/80 flex flex-wrap items-center justify-between gap-3 shadow-lg shadow-red-950/50 animate-in fade-in duration-200">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded bg-red-900/80 text-red-100 flex-shrink-0 animate-pulse">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold bg-red-950 text-red-300 border border-red-500 px-2 py-0.5 rounded">
                  ACTIVE {activeAlert.severity} THREAT
                </span>
                <span className="text-sm font-bold text-white font-heading">
                  {activeAlert.title}
                </span>
              </div>
              <p className="text-xs text-slate-300 font-mono mt-0.5">
                Target: <strong className="text-cyan-300">{activeAlert.targetIp}</strong> —{' '}
                {activeAlert.description}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={() => {
                soundFx.playClick();
                onInvestigateAlert(activeAlert);
              }}
              className="px-3 py-1.5 rounded bg-black/60 hover:bg-black/90 border border-cyan-500/60 text-cyan-300 font-mono text-xs font-semibold flex items-center gap-1.5 transition"
              title="Learn why this happened and see MITRE breakdown"
            >
              <Search className="w-3.5 h-3.5 text-cyan-400" />
              <span>Understand Why</span>
            </button>

            {onQuickNeutralize && (
              <button
                onClick={() => {
                  soundFx.playAlert();
                  onQuickNeutralize(activeAlert);
                }}
                className="px-4 py-1.5 rounded bg-red-600 hover:bg-red-500 text-white font-bold text-xs font-mono flex items-center gap-1.5 shadow-md shadow-red-950 transition"
                title="Execute optimal SOAR playbook immediately"
              >
                <Zap className="w-3.5 h-3.5 text-yellow-300 fill-yellow-300" />
                <span>1-Click Neutralize</span>
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="p-2.5 rounded bg-emerald-950/30 border border-emerald-500/40 flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-emerald-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>
              <strong>Perimeter Nominal:</strong> All 12 quantum resonance nodes balanced. Zero
              uncontained anomalies.
            </span>
          </div>
          <button
            onClick={() => {
              soundFx.playPulse();
              onSimulateThreat();
            }}
            className="px-2.5 py-1 rounded bg-cyan-950/60 hover:bg-cyan-900 border border-cyan-700/50 text-cyan-300 text-[11px] font-semibold flex items-center gap-1 transition ml-auto"
          >
            <Zap className="w-3 h-3 text-cyan-400" />
            <span>Inject Test Threat</span>
          </button>
        </div>
      )}

      {/* 4-Stage Interactive Lifecycle Stepper */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs font-mono">
        {/* Stage 1: DETECT */}
        <button
          onClick={() => {
            soundFx.playClick();
            onSimulateThreat();
          }}
          className="p-2.5 rounded bg-black/40 hover:bg-cyan-950/30 border border-cyan-950/80 hover:border-cyan-500/60 flex items-start gap-2.5 text-left transition group"
        >
          <div className="p-1 rounded bg-cyan-950 text-cyan-400 mt-0.5 group-hover:bg-cyan-900">
            <Radar className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] text-cyan-400 font-bold uppercase flex items-center justify-between">
              <span>01. DETECT</span>
              <span className="text-[9px] text-slate-500 group-hover:text-cyan-400">Simulate →</span>
            </div>
            <div className="text-white font-semibold text-[11px]">Resonance Telemetry</div>
            <p className="text-[10px] text-slate-400 leading-snug">
              12-phase lattice monitors phase jitter &amp; entropy anomalies.
            </p>
          </div>
        </button>

        {/* Stage 2: UNDERSTAND */}
        <button
          onClick={() => {
            soundFx.playClick();
            if (activeAlert) {
              onInvestigateAlert(activeAlert);
            } else {
              onOpenKnowledgeBase();
            }
          }}
          className="p-2.5 rounded bg-black/40 hover:bg-purple-950/30 border border-cyan-950/80 hover:border-purple-500/60 flex items-start gap-2.5 text-left transition group"
        >
          <div className="p-1 rounded bg-purple-950 text-purple-400 mt-0.5 group-hover:bg-purple-900">
            <Search className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] text-purple-400 font-bold uppercase flex items-center justify-between">
              <span>02. UNDERSTAND</span>
              <span className="text-[9px] text-slate-500 group-hover:text-purple-400">Root Cause →</span>
            </div>
            <div className="text-white font-semibold text-[11px]">MITRE &amp; Root Cause</div>
            <p className="text-[10px] text-slate-400 leading-snug">
              Deep explainability: know what the vector is and why it tripped alarms.
            </p>
          </div>
        </button>

        {/* Stage 3: ELIMINATE */}
        <button
          onClick={() => {
            soundFx.playClick();
            if (activeAlert && onQuickNeutralize) {
              onQuickNeutralize(activeAlert);
            } else {
              onOpenDrills();
            }
          }}
          className="p-2.5 rounded bg-black/40 hover:bg-red-950/30 border border-cyan-950/80 hover:border-red-500/60 flex items-start gap-2.5 text-left transition group"
        >
          <div className="p-1 rounded bg-red-950 text-red-400 mt-0.5 group-hover:bg-red-900">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] text-red-400 font-bold uppercase flex items-center justify-between">
              <span>03. ELIMINATE</span>
              <span className="text-[9px] text-slate-500 group-hover:text-red-400">SOAR →</span>
            </div>
            <div className="text-white font-semibold text-[11px]">Targeted SOAR Playbook</div>
            <p className="text-[10px] text-slate-400 leading-snug">
              Execute optimal containment actions with clear rationales.
            </p>
          </div>
        </button>

        {/* Stage 4: REPORT */}
        <button
          onClick={() => {
            soundFx.playClick();
            onOpenExportModal();
          }}
          className="p-2.5 rounded bg-black/40 hover:bg-emerald-950/30 border border-cyan-950/80 hover:border-emerald-500/60 flex items-start gap-2.5 text-left transition group"
        >
          <div className="p-1 rounded bg-emerald-950 text-emerald-400 mt-0.5 group-hover:bg-emerald-900">
            <FileCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] text-emerald-400 font-bold uppercase flex items-center justify-between">
              <span>04. REPORT</span>
              <span className="text-[9px] text-slate-500 group-hover:text-emerald-400">Google Docs →</span>
            </div>
            <div className="text-white font-semibold text-[11px]">Google Workspace Brief</div>
            <p className="text-[10px] text-slate-400 leading-snug">
              Compile executive dossiers into Google Docs &amp; Drive with full audit trail.
            </p>
          </div>
        </button>
      </div>

      {/* Quick Navigation Footer */}
      <div className="flex flex-wrap items-center justify-between border-t border-cyan-950/70 pt-2 text-xs font-mono gap-2">
        <div className="flex items-center gap-2 text-slate-400 text-[11px]">
          <span className="inline-block w-2 h-2 rounded-full bg-cyan-400"></span>
          <span>Click any stage above to execute that step directly or explore drill tactics.</span>
        </div>

        <div className="flex items-center gap-2">
          {onOpenEntropyDashboard && (
            <button
              onClick={() => {
                soundFx.playClick();
                onOpenEntropyDashboard();
              }}
              className="px-2.5 py-1 rounded bg-purple-950/80 hover:bg-purple-900 border border-purple-500/60 text-purple-200 text-[11px] font-semibold flex items-center gap-1.5 transition"
            >
              <Activity className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
              <span>Entropy Analytics (60m)</span>
            </button>
          )}

          <button
            onClick={() => {
              soundFx.playClick();
              onOpenDrills();
            }}
            className="px-2.5 py-1 rounded bg-cyan-950/60 hover:bg-cyan-900 border border-cyan-700/50 text-cyan-300 text-[11px] font-semibold flex items-center gap-1.5 transition"
          >
            <PlayCircle className="w-3.5 h-3.5 text-cyan-400" />
            <span>Practice Defense Drills</span>
          </button>

          <button
            onClick={() => {
              soundFx.playClick();
              onOpenKnowledgeBase();
            }}
            className="px-2.5 py-1 rounded bg-purple-950/60 hover:bg-purple-900 border border-purple-700/50 text-purple-300 text-[11px] font-semibold flex items-center gap-1.5 transition"
          >
            <BookOpen className="w-3.5 h-3.5 text-purple-400" />
            <span>Threat Academy</span>
          </button>
        </div>
      </div>
    </div>
  );
};
