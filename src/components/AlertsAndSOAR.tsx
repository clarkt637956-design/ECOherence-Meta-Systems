import React, { useState } from 'react';
import {
  AlertTriangle,
  ShieldAlert,
  Play,
  CheckCircle2,
  Lock,
  RotateCw,
  Eye,
  Activity,
  Filter,
  HelpCircle,
  Search,
  Zap,
  Sparkles,
  Check,
} from 'lucide-react';
import { SecurityAlert, ThreatSeverity, AlertStatus, PlaybookExecutionLog } from '../types.ts';
import { PLAYBOOK_EXPLANATIONS, THREAT_KNOWLEDGE_BASE } from '../lib/threatKnowledge.ts';
import { soundFx } from '../lib/audio.ts';

interface AlertsAndSOARProps {
  alerts: SecurityAlert[];
  playbookLogs: PlaybookExecutionLog[];
  onExecutePlaybook: (playbookCode: string, targetIp: string) => void;
  onUpdateAlertStatus: (alertId: string, status: AlertStatus) => void;
  onInvestigateAlert: (alert: SecurityAlert) => void;
  onDissectAlert?: (alert: SecurityAlert) => void;
  onQuickNeutralize?: (alert: SecurityAlert) => void;
  autopilotEnabled?: boolean;
}

const PLAYBOOKS = [
  {
    code: 'ISOLATE_IP',
    name: 'Isolate & Quarantine Ingress IP',
    description: 'Autonomous firewall block & drop at quantum ingress boundary.',
    icon: Lock,
    color: 'text-red-400 border-red-500/40 hover:bg-red-950/40',
  },
  {
    code: 'HARMONIC_FREQUENCY_SHIFT',
    name: 'Harmonic Phase Manifold Shift (+90°)',
    description: 'Re-aligns the 3-6-9 spiral by +90° to desynchronize payload attacks.',
    icon: RotateCw,
    color: 'text-cyan-400 border-cyan-500/40 hover:bg-cyan-950/40',
  },
  {
    code: 'DEPLOY_QUANTUM_HONEYPOT',
    name: 'Deploy Synthetic Honeypot Decoy',
    description: 'Diverts scanner traffic to an isolated telemetry observation silo.',
    icon: Eye,
    color: 'text-amber-400 border-amber-500/40 hover:bg-amber-950/40',
  },
  {
    code: 'KILL_CHAIN_TERMINATE',
    name: 'Terminate Kill-Chain Session Tokens',
    description: 'Instant session token invalidation & socket disconnect.',
    icon: ShieldAlert,
    color: 'text-purple-400 border-purple-500/40 hover:bg-purple-950/40',
  },
];

export const AlertsAndSOAR: React.FC<AlertsAndSOARProps> = ({
  alerts,
  playbookLogs,
  onExecutePlaybook,
  onUpdateAlertStatus,
  onInvestigateAlert,
  onDissectAlert,
  onQuickNeutralize,
  autopilotEnabled,
}) => {
  const [selectedSeverity, setSelectedSeverity] = useState<string>('ALL');
  const [activeTab, setActiveTab] = useState<'ALERTS' | 'PLAYBOOKS'>('ALERTS');
  const [manualIp, setManualIp] = useState<string>('198.51.100.42');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'RESOLVED'>('ACTIVE');

  const filteredAlerts = alerts.filter((a) => {
    if (selectedSeverity !== 'ALL' && a.severity !== selectedSeverity) return false;
    if (statusFilter === 'ACTIVE' && (a.status === 'RESOLVED' || a.status === 'CONTAINED'))
      return false;
    if (statusFilter === 'RESOLVED' && a.status !== 'RESOLVED') return false;
    return true;
  });

  const handle1ClickNeutralize = (alert: SecurityAlert) => {
    soundFx.playAlert();
    if (onQuickNeutralize) {
      onQuickNeutralize(alert);
    } else {
      const code = alert.recommendedPlaybook || 'ISOLATE_IP';
      onExecutePlaybook(code, alert.targetIp);
      onUpdateAlertStatus(alert.id, 'RESOLVED');
    }
  };

  return (
    <div className="bg-[#070b18]/90 border border-cyan-500/30 rounded-lg p-4 hud-corner shadow-xl space-y-3">
      {/* Header and Tab Bar */}
      <div className="flex flex-wrap items-center justify-between border-b border-cyan-950 pb-3 gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-red-400" />
            <h2 className="text-sm sm:text-base font-bold tracking-wider text-white font-heading uppercase">
              Incident Response &amp; SOAR Engine
            </h2>
          </div>

          <div className="flex items-center bg-black/50 border border-cyan-950 rounded p-0.5 text-xs font-mono">
            <button
              onClick={() => setActiveTab('ALERTS')}
              className={`px-3 py-1 rounded transition ${
                activeTab === 'ALERTS'
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-700/60 font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Alert Feed ({alerts.length})
            </button>
            <button
              onClick={() => setActiveTab('PLAYBOOKS')}
              className={`px-3 py-1 rounded transition ${
                activeTab === 'PLAYBOOKS'
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-700/60 font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              SOAR Playbooks ({playbookLogs.length})
            </button>
          </div>
        </div>

        {/* Autopilot Status Indicator & Filter */}
        <div className="flex items-center gap-2 text-xs font-mono">
          {autopilotEnabled && (
            <div className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500 text-[10px] flex items-center gap-1 font-bold">
              <Sparkles className="w-3 h-3 text-emerald-400 animate-spin" />
              <span>AUTOPILOT ARMED</span>
            </div>
          )}

          {activeTab === 'ALERTS' && (
            <div className="flex items-center gap-1.5 bg-black/50 border border-cyan-950 rounded p-0.5 text-[11px]">
              <button
                onClick={() => setStatusFilter('ACTIVE')}
                className={`px-2 py-0.5 rounded transition ${
                  statusFilter === 'ACTIVE'
                    ? 'bg-cyan-900 text-cyan-200 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Active ({alerts.filter((a) => a.status === 'OPEN' || a.status === 'INVESTIGATING').length})
              </button>
              <button
                onClick={() => setStatusFilter('ALL')}
                className={`px-2 py-0.5 rounded transition ${
                  statusFilter === 'ALL'
                    ? 'bg-cyan-900 text-cyan-200 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                All ({alerts.length})
              </button>
              <button
                onClick={() => setStatusFilter('RESOLVED')}
                className={`px-2 py-0.5 rounded transition ${
                  statusFilter === 'RESOLVED'
                    ? 'bg-cyan-900 text-cyan-200 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Resolved
              </button>
            </div>
          )}
        </div>
      </div>

      {activeTab === 'ALERTS' ? (
        <div className="space-y-3">
          {filteredAlerts.length === 0 ? (
            <div className="text-center py-10 text-slate-500 font-mono text-xs border border-dashed border-slate-800 rounded bg-black/30">
              <CheckCircle2 className="w-6 h-6 text-emerald-500/70 mx-auto mb-2" />
              <div className="text-slate-300 font-semibold mb-1">Perimeter Secure &amp; Contained</div>
              <p className="text-slate-500 max-w-sm mx-auto">
                No active security incidents matching current filter. All resonance nodes operating within safety parameters.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
              {filteredAlerts.map((alert, alertIdx) => {
                const isCrit = alert.severity === 'CRITICAL';
                const isHigh = alert.severity === 'HIGH';
                const isResolved = alert.status === 'RESOLVED';
                const isContained = alert.status === 'CONTAINED';
                const recPb = alert.recommendedPlaybook || 'ISOLATE_IP';
                const recPbInfo = PLAYBOOK_EXPLANATIONS[recPb as keyof typeof PLAYBOOK_EXPLANATIONS];

                return (
                  <div
                    key={`${alert.id}-${alertIdx}`}
                    className={`p-3.5 rounded-lg border transition-all ${
                      isResolved
                        ? 'bg-black/30 border-slate-900 opacity-70 hover:opacity-100'
                        : isCrit
                        ? 'bg-red-950/25 border-red-600/70 hover:border-red-400 shadow-md shadow-red-950/30'
                        : isHigh
                        ? 'bg-amber-950/20 border-amber-600/60 hover:border-amber-400'
                        : 'bg-slate-950/60 border-cyan-950 hover:border-cyan-700'
                    }`}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="space-y-1.5 max-w-xl flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border ${
                              isCrit
                                ? 'bg-red-900/80 text-red-100 border-red-500'
                                : isHigh
                                ? 'bg-amber-900/80 text-amber-100 border-amber-500'
                                : 'bg-cyan-950 text-cyan-300 border-cyan-800'
                            }`}
                          >
                            {alert.severity}
                          </span>

                          <span className="text-sm font-bold text-white font-heading tracking-wide">
                            {alert.title}
                          </span>

                          {alert.mitreId && (
                            <span className="text-[9px] font-mono text-cyan-400 bg-cyan-950/90 px-1.5 py-0.5 rounded border border-cyan-800">
                              {alert.mitreId}
                            </span>
                          )}

                          <span
                            className={`text-[9px] font-mono px-1.5 py-0.2 rounded ${
                              isResolved
                                ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                                : isContained
                                ? 'bg-amber-950 text-amber-300 border border-amber-700'
                                : 'bg-red-950 text-red-300 border border-red-700'
                            }`}
                          >
                            {alert.status}
                          </span>
                        </div>

                        <p className="text-xs text-slate-300 font-mono leading-relaxed">
                          {alert.description}
                        </p>

                        {/* Explainability & Rationale preview */}
                        {alert.remediationRationale && (
                          <div className="text-[11px] text-emerald-300/90 font-mono bg-emerald-950/20 p-2 rounded border border-emerald-900/40">
                            <strong>Recommended Playbook ({recPb}):</strong>{' '}
                            {alert.remediationRationale}
                          </div>
                        )}

                        <div className="flex flex-wrap items-center gap-3 text-[10px] text-slate-400 font-mono pt-1">
                          <span>
                            Target IP:{' '}
                            <strong className="text-cyan-300 font-bold">{alert.targetIp}</strong>
                          </span>
                          <span>•</span>
                          <span>Detected: {new Date(alert.createdAt).toLocaleTimeString()}</span>
                          {alert.playbookExecuted && (
                            <>
                              <span>•</span>
                              <span className="text-emerald-400 font-bold">
                                Remediated via: {alert.playbookExecuted}
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Action Hub: 1-Click Neutralize & Investigate */}
                      <div className="flex items-center gap-2 self-start sm:self-center">
                        {!isResolved && (
                          <button
                            onClick={() => handle1ClickNeutralize(alert)}
                            className="text-xs font-mono font-bold px-3 py-1.5 rounded bg-red-600 hover:bg-red-500 text-white flex items-center gap-1.5 shadow-md shadow-red-950 transition"
                            title={`Instantly execute recommended playbook: ${recPb}`}
                          >
                            <Zap className="w-3.5 h-3.5 fill-yellow-300 text-yellow-300" />
                            <span>1-Click Neutralize</span>
                          </button>
                        )}

                        <button
                          onClick={() => {
                            soundFx.playClick();
                            onInvestigateAlert(alert);
                          }}
                          className="text-xs font-mono px-2.5 py-1.5 rounded bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/60 text-cyan-200 flex items-center gap-1.5 transition"
                          title="Investigate root cause and understand remediation options"
                        >
                          <Search className="w-3.5 h-3.5 text-cyan-400" />
                          <span>Understand Why</span>
                        </button>

                        {onDissectAlert && (
                          <button
                            onClick={() => {
                              soundFx.playClick();
                              onDissectAlert(alert);
                            }}
                            className="text-xs font-mono px-2.5 py-1.5 rounded bg-purple-950/80 hover:bg-purple-900 border border-purple-500/60 text-purple-200 flex items-center gap-1.5 transition"
                            title="Interactive Visual Waveform & Kill-Chain Dissector"
                          >
                            <Activity className="w-3.5 h-3.5 text-purple-400" />
                            <span>Dissect</span>
                          </button>
                        )}

                        <select
                          value={alert.status}
                          onChange={(e) => {
                            soundFx.playClick();
                            onUpdateAlertStatus(alert.id, e.target.value as AlertStatus);
                          }}
                          className="bg-black/90 border border-slate-700 text-slate-300 px-2 py-1.5 rounded text-[11px] font-mono cursor-pointer"
                        >
                          <option value="OPEN">OPEN</option>
                          <option value="INVESTIGATING">INVESTIGATING</option>
                          <option value="CONTAINED">CONTAINED</option>
                          <option value="RESOLVED">RESOLVED</option>
                        </select>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* SOAR Playbooks Execution Center */
        <div className="space-y-4 font-mono text-xs">
          <div className="bg-black/40 border border-cyan-950 p-2.5 rounded flex flex-wrap items-center justify-between gap-2">
            <span className="text-slate-300">Target Host IP for Manual Playbook Execution:</span>
            <input
              type="text"
              value={manualIp}
              onChange={(e) => setManualIp(e.target.value)}
              className="bg-black/80 border border-cyan-900 px-2.5 py-1 rounded text-cyan-300 text-xs font-mono focus:outline-none focus:border-cyan-500"
              placeholder="e.g. 198.51.100.42"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {PLAYBOOKS.map((pb) => {
              const Icon = pb.icon;
              const expl = PLAYBOOK_EXPLANATIONS[pb.code as keyof typeof PLAYBOOK_EXPLANATIONS];
              return (
                <div
                  key={pb.code}
                  className="bg-black/50 border border-cyan-950 p-3.5 rounded-lg flex flex-col justify-between space-y-2.5"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4 text-cyan-400" />
                        <span className="text-xs font-bold text-white font-heading">{pb.name}</span>
                      </div>
                      <span className="text-[9px] text-cyan-400 bg-cyan-950 px-1.5 py-0.5 rounded border border-cyan-800 font-bold">
                        {pb.code}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-300 mb-2">{pb.description}</p>

                    {expl && (
                      <div className="bg-slate-900/60 p-2.5 rounded border border-slate-800 text-[11px] space-y-1">
                        <div>
                          <strong className="text-cyan-300">Action:</strong> {expl.whatItDoes}
                        </div>
                        <div>
                          <strong className="text-emerald-400">Why Run This:</strong> {expl.whyRunIt}
                        </div>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      soundFx.playClick();
                      onExecutePlaybook(pb.code, manualIp);
                    }}
                    className={`w-full py-2 px-3 rounded text-xs font-bold border flex items-center justify-center gap-1.5 transition ${pb.color}`}
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>Trigger Playbook for {manualIp}</span>
                  </button>
                </div>
              );
            })}
          </div>

          {/* Execution History Table with RATIONALE */}
          <div className="border-t border-cyan-950 pt-3">
            <span className="text-xs font-bold text-slate-300 block mb-2">
              Recent Automated Response Executions (with Operational Rationales):
            </span>
            <div className="space-y-1.5 max-h-40 overflow-y-auto text-xs">
              {playbookLogs.length === 0 ? (
                <div className="text-slate-500 text-[11px] py-2">No playbooks triggered yet.</div>
              ) : (
                playbookLogs.map((log, logIdx) => (
                  <div
                    key={`${log.id}-${logIdx}`}
                    className="p-2.5 rounded bg-black/40 border border-slate-800/80 flex flex-col sm:flex-row items-start justify-between gap-2"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                        <span className="text-cyan-300 font-bold">{log.playbookName}</span>
                        <span className="text-slate-500">›</span>
                        <span className="text-white">{log.targetIp}</span>
                      </div>
                      <p className="text-[11px] text-slate-300">{log.details}</p>
                      {log.rationale && (
                        <p className="text-[10px] text-emerald-400/90 italic">
                          Rationale: {log.rationale}
                        </p>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-500 whitespace-nowrap self-start">
                      {new Date(log.executedAt).toLocaleTimeString()}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
