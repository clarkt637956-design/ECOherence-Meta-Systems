import React, { useState } from 'react';
import {
  Swords,
  Shield,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Clock,
  DollarSign,
  Cpu,
  Layers,
  Sparkles,
  Play,
  RotateCcw,
  Flame,
  ArrowRight,
  Network,
  BarChart3,
} from 'lucide-react';
import {
  COMPETITOR_COMPARISONS,
  SIMULATION_ATTACK_PRESETS,
  runCompetitiveBattle,
} from '../lib/integrationsData.ts';
import { LiveBattleResult } from '../types.ts';
import { soundFx } from '../lib/audio.ts';
import { KillChainTopologyVisualizer } from './KillChainTopologyVisualizer.tsx';
import { ExecutiveTcoCalculator } from './ExecutiveTcoCalculator.tsx';

interface CompetitorBattlecardProps {
  onInjectLivePulse?: (ip: string, action: string) => void;
  onTriggerNotification?: (title: string, msg: string, type?: 'SUCCESS' | 'ALERT' | 'INFO') => void;
  onOpenExportModal?: () => void;
}

export const CompetitorBattlecard: React.FC<CompetitorBattlecardProps> = ({
  onInjectLivePulse,
  onTriggerNotification,
  onOpenExportModal,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'RACE' | 'TOPOLOGY' | 'TCO' | 'BENCHMARK'>('RACE');
  const [selectedPresetId, setSelectedPresetId] = useState<string>(
    SIMULATION_ATTACK_PRESETS[0].id
  );
  const [battleResult, setBattleResult] = useState<LiveBattleResult | null>(() =>
    runCompetitiveBattle(SIMULATION_ATTACK_PRESETS[0].id)
  );
  const [isRunningBattle, setIsRunningBattle] = useState(false);

  const handleRunBattle = (presetId: string) => {
    setIsRunningBattle(true);
    soundFx.playAlert();

    const selected =
      SIMULATION_ATTACK_PRESETS.find((p) => p.id === presetId) || SIMULATION_ATTACK_PRESETS[0];

    // Inject into actual QEL engine live state too!
    if (onInjectLivePulse) {
      onInjectLivePulse(selected.ip, selected.vector);
    }

    setTimeout(() => {
      const res = runCompetitiveBattle(presetId);
      setBattleResult(res);
      setIsRunningBattle(false);
      soundFx.playSuccess();
      if (onTriggerNotification) {
        onTriggerNotification(
          `Adversary Battle Completed: QEL Neutralized Threat in ${res.qel.detectionMs}ms`,
          `Traditional SIEM/EDR delayed by up to 5 minutes. QEL severed kill-chain autonomously.`,
          'SUCCESS'
        );
      }
    }, 600);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#060a16] border border-cyan-500/30 rounded-lg p-5 hud-corner shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Swords className="w-5 h-5 text-red-400" />
            <h2 className="text-base sm:text-lg font-bold text-white font-heading uppercase tracking-wider">
              Competitor Benchmark &amp; Live Adversary Simulator
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-950 text-red-300 border border-red-700 font-bold">
              QEL NEXUS VS INDUSTRY SIEM / EDR
            </span>
          </div>
          <p className="text-xs text-slate-300 font-mono max-w-3xl leading-relaxed">
            Head-to-head empirical testing comparing QEL’s continuous 12-phase resonance lattice
            against CrowdStrike Falcon, Splunk Enterprise Security, Palo Alto Cortex XSOAR, and
            Microsoft Sentinel.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleRunBattle(selectedPresetId)}
            disabled={isRunningBattle}
            className="px-4 py-2.5 rounded bg-red-600 hover:bg-red-500 text-white font-bold text-xs font-mono flex items-center gap-2 shadow-lg shadow-red-950 transition disabled:opacity-50"
          >
            <Flame className="w-4 h-4 text-yellow-300 fill-yellow-300" />
            <span>{isRunningBattle ? 'Simulating Multi-Vector Attack...' : 'Simulate Live Battle'}</span>
          </button>
        </div>
      </div>

      {/* Sub-Tab Navigation Bar */}
      <div className="flex flex-wrap items-center gap-2 bg-[#050914] p-1.5 rounded-lg border border-cyan-950 font-mono text-xs">
        <button
          onClick={() => {
            soundFx.playClick();
            setActiveSubTab('RACE');
          }}
          className={`px-3 py-1.5 rounded flex items-center gap-1.5 font-bold transition ${
            activeSubTab === 'RACE'
              ? 'bg-red-600 text-white shadow-md shadow-red-950'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Swords className="w-3.5 h-3.5" />
          <span>Live Detection Race</span>
        </button>

        <button
          onClick={() => {
            soundFx.playClick();
            setActiveSubTab('TOPOLOGY');
          }}
          className={`px-3 py-1.5 rounded flex items-center gap-1.5 font-bold transition ${
            activeSubTab === 'TOPOLOGY'
              ? 'bg-cyan-600 text-white shadow-md shadow-cyan-950'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Network className="w-3.5 h-3.5" />
          <span>Kill-Chain Boundary Topology</span>
        </button>

        <button
          onClick={() => {
            soundFx.playClick();
            setActiveSubTab('TCO');
          }}
          className={`px-3 py-1.5 rounded flex items-center gap-1.5 font-bold transition ${
            activeSubTab === 'TCO'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <DollarSign className="w-3.5 h-3.5" />
          <span>Executive TCO &amp; ROI ($ Savings)</span>
        </button>

        <button
          onClick={() => {
            soundFx.playClick();
            setActiveSubTab('BENCHMARK');
          }}
          className={`px-3 py-1.5 rounded flex items-center gap-1.5 font-bold transition ${
            activeSubTab === 'BENCHMARK'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-950'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span>Architectural Matrix</span>
        </button>
      </div>

      {/* SUB-VIEW 1: TOPOLOGY VISUALIZER */}
      {activeSubTab === 'TOPOLOGY' && (
        <KillChainTopologyVisualizer
          onInjectLivePulse={onInjectLivePulse}
          onTriggerNotification={onTriggerNotification}
        />
      )}

      {/* SUB-VIEW 2: EXECUTIVE TCO CALCULATOR */}
      {activeSubTab === 'TCO' && (
        <ExecutiveTcoCalculator
          onOpenExportModal={onOpenExportModal}
          onTriggerNotification={onTriggerNotification}
        />
      )}

      {/* SUB-VIEW 3: LIVE ATTACK RACE */}
      {activeSubTab === 'RACE' && (
        <div className="space-y-6">
          {/* Interactive Battle Sandbox Card */}
          <div className="bg-[#070b18]/95 border border-cyan-500/30 rounded-lg p-5 hud-corner shadow-xl space-y-4 font-mono text-xs">
            <div className="flex flex-wrap items-center justify-between border-b border-cyan-950 pb-3 gap-2">
              <span className="text-sm font-bold text-white font-heading uppercase flex items-center gap-2">
                <Zap className="w-4 h-4 text-cyan-400" />
                <span>Select Attack Vector for Parallel Execution:</span>
              </span>
              <span className="text-slate-400 text-[11px]">Real-time detection race</span>
            </div>

            {/* Preset Attack Vector Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              {SIMULATION_ATTACK_PRESETS.map((preset) => {
                const isSelected = selectedPresetId === preset.id;
                return (
                  <button
                    key={preset.id}
                    onClick={() => {
                      soundFx.playClick();
                      setSelectedPresetId(preset.id);
                      handleRunBattle(preset.id);
                    }}
                    className={`p-3 rounded-lg border text-left transition flex flex-col justify-between ${
                      isSelected
                        ? 'bg-red-950/40 border-red-500 shadow-md shadow-red-950'
                        : 'bg-black/50 border-slate-800/80 hover:border-cyan-800 hover:bg-slate-900/40'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-xs text-white mb-1">{preset.name}</div>
                      <p className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed">
                        {preset.description}
                      </p>
                    </div>

                    <div className="mt-2 pt-2 border-t border-slate-800 flex items-center justify-between text-[10px]">
                      <span className="text-cyan-400 font-bold">{preset.vector}</span>
                      <span className="text-slate-500">{preset.ip}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Live Race Bars Comparison */}
            {battleResult && (
              <div className="pt-4 border-t border-cyan-950 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-white font-bold font-heading text-sm">
                    Detection &amp; Containment Race Results:
                  </span>
                  <span className="text-emerald-400 font-bold">
                    QEL Outperformed Industry Average by{' '}
                    {(
                      (battleResult.competitors.splunk.detectionMs / (battleResult.qel.detectionMs || 0.04))
                    ).toFixed(0)}
                    x
                  </span>
                </div>

                <div className="space-y-3">
                  {/* QEL Nexus Bar */}
                  <div className="p-3.5 rounded bg-emerald-950/30 border border-emerald-500/80 shadow-md shadow-emerald-950/40 space-y-1.5">
                    <div className="flex flex-wrap items-center justify-between text-emerald-300 text-xs">
                      <span className="font-bold font-heading flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-emerald-400" />
                        <span>QEL Nexus v13.0 (Echo &amp; Witness Protocol)</span>
                      </span>
                      <span className="font-bold text-white font-mono bg-emerald-950 px-2 py-0.5 rounded border border-emerald-600">
                        {battleResult.qel.detectionMs} ms (Sub-millisecond)
                      </span>
                    </div>
                    <div className="w-full bg-black/80 rounded-full h-2 overflow-hidden border border-emerald-800">
                      <div className="h-full bg-emerald-400 rounded-full w-[4%] animate-pulse"></div>
                    </div>
                    <div className="flex flex-wrap items-center justify-between text-[11px] text-emerald-200/90 pt-0.5">
                      <span>Autonomous SOAR: {battleResult.qel.actionTaken}</span>
                      <span className="font-bold text-emerald-400">Data Loss: 0 bytes</span>
                    </div>
                  </div>

                  {/* CrowdStrike Falcon */}
                  <div className="p-3 rounded bg-black/50 border border-slate-800/80 space-y-1">
                    <div className="flex flex-wrap items-center justify-between text-slate-300 text-[11px]">
                      <span className="font-bold text-white">CrowdStrike Falcon Insight XDR</span>
                      <span className="text-amber-400 font-mono">
                        Detection Delay: {(battleResult.competitors.crowdstrike.detectionMs / 1000).toFixed(1)}s
                      </span>
                    </div>
                    <div className="w-full bg-black/80 rounded-full h-1.5 overflow-hidden border border-slate-800">
                      <div className="h-full bg-amber-500 rounded-full w-[35%]"></div>
                    </div>
                    <p className="text-[10px] text-slate-400">
                      {battleResult.competitors.crowdstrike.delayReason}
                    </p>
                  </div>

                  {/* Splunk ES */}
                  <div className="p-3 rounded bg-black/50 border border-slate-800/80 space-y-1">
                    <div className="flex flex-wrap items-center justify-between text-slate-300 text-[11px]">
                      <span className="font-bold text-white">Splunk Enterprise Security + Phantom</span>
                      <span className="text-red-400 font-mono">
                        Detection Delay: {(battleResult.competitors.splunk.detectionMs / 60000).toFixed(1)} minutes
                      </span>
                    </div>
                    <div className="w-full bg-black/80 rounded-full h-1.5 overflow-hidden border border-slate-800">
                      <div className="h-full bg-red-600 rounded-full w-[85%]"></div>
                    </div>
                    <p className="text-[10px] text-slate-400">
                      {battleResult.competitors.splunk.delayReason}
                    </p>
                  </div>

                  {/* Palo Alto Cortex */}
                  <div className="p-3 rounded bg-black/50 border border-slate-800/80 space-y-1">
                    <div className="flex flex-wrap items-center justify-between text-slate-300 text-[11px]">
                      <span className="font-bold text-white">Palo Alto Cortex XSOAR</span>
                      <span className="text-amber-400 font-mono">
                        Detection Delay: {(battleResult.competitors.cortex.detectionMs / 1000).toFixed(1)}s
                      </span>
                    </div>
                    <div className="w-full bg-black/80 rounded-full h-1.5 overflow-hidden border border-slate-800">
                      <div className="h-full bg-amber-500 rounded-full w-[45%]"></div>
                    </div>
                    <p className="text-[10px] text-slate-400">
                      {battleResult.competitors.cortex.delayReason}
                    </p>
                  </div>

                  {/* Microsoft Sentinel */}
                  <div className="p-3 rounded bg-black/50 border border-slate-800/80 space-y-1">
                    <div className="flex flex-wrap items-center justify-between text-slate-300 text-[11px]">
                      <span className="font-bold text-white">Microsoft Sentinel (Azure Cloud SIEM)</span>
                      <span className="text-red-400 font-mono">
                        Detection Delay: {(battleResult.competitors.sentinel.detectionMs / 60000).toFixed(1)} minutes
                      </span>
                    </div>
                    <div className="w-full bg-black/80 rounded-full h-1.5 overflow-hidden border border-slate-800">
                      <div className="h-full bg-red-500 rounded-full w-[95%]"></div>
                    </div>
                    <p className="text-[10px] text-slate-400">
                      {battleResult.competitors.sentinel.delayReason}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUB-VIEW 4: ARCHITECTURAL BENCHMARK TABLE */}
      {(activeSubTab === 'BENCHMARK' || activeSubTab === 'RACE') && (
        <div className="bg-[#070b18]/95 border border-cyan-500/30 rounded-lg p-5 hud-corner shadow-xl space-y-4 font-mono text-xs">
          <div className="border-b border-cyan-950 pb-3 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white font-heading uppercase">
                Head-to-Head Architectural Battlecard
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Key operational metrics where QEL Nexus outperforms traditional enterprise solutions
              </p>
            </div>
            <button
              onClick={() => setActiveSubTab('TCO')}
              className="px-2.5 py-1 rounded bg-emerald-950 hover:bg-emerald-900 border border-emerald-700/60 text-emerald-300 text-[11px] font-bold transition flex items-center gap-1"
            >
              <DollarSign className="w-3.5 h-3.5" />
              <span>Calculate Custom TCO Savings →</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-[11px]">
              <thead>
                <tr className="border-b border-cyan-950 text-slate-400 bg-black/50">
                  <th className="p-2.5">Platform / Build</th>
                  <th className="p-2.5">Detection Latency</th>
                  <th className="p-2.5">Zero-Day Defense</th>
                  <th className="p-2.5">SOAR MTTR</th>
                  <th className="p-2.5">Pricing / Ingest Tax</th>
                  <th className="p-2.5">Quantum Cryptography</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900">
                {/* QEL Row */}
                <tr className="bg-emerald-950/20 text-emerald-200 font-bold">
                  <td className="p-2.5 flex items-center gap-1.5 text-emerald-300 font-heading text-xs">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                    <span>QEL NEXUS v13.0</span>
                  </td>
                  <td className="p-2.5 text-emerald-400">0.04 ms (Microsecond)</td>
                  <td className="p-2.5 text-emerald-400">99.4% (Resonance Jitter)</td>
                  <td className="p-2.5 text-emerald-400">&lt; 0.4s (Autonomous)</td>
                  <td className="p-2.5 text-emerald-400">$0 / O(1) Fixed Lattice</td>
                  <td className="p-2.5 text-emerald-300">
                    <span className="px-1.5 py-0.2 rounded bg-emerald-950 border border-emerald-600 text-[10px]">
                      POST-QUANTUM NATIVE
                    </span>
                  </td>
                </tr>

                {/* Competitors */}
                {COMPETITOR_COMPARISONS.map((comp) => (
                  <tr key={comp.id} className="text-slate-300 hover:bg-slate-900/30 transition">
                    <td className="p-2.5 font-semibold text-white">
                      {comp.name}
                      <span className="text-[10px] text-slate-500 block">{comp.vendor}</span>
                    </td>
                    <td className="p-2.5 text-amber-300">{comp.detectionLatency}</td>
                    <td className="p-2.5 text-slate-400">{comp.zeroDayEfficacy}%</td>
                    <td className="p-2.5 text-slate-400">{comp.mttr}</td>
                    <td className="p-2.5 text-red-300/90">{comp.ingestionPricing}</td>
                    <td className="p-2.5">
                      <span
                        className={`px-1.5 py-0.2 rounded text-[10px] border ${
                          comp.quantumResilience === 'VULNERABLE'
                            ? 'bg-red-950 text-red-300 border-red-700'
                            : 'bg-amber-950 text-amber-300 border-amber-700'
                        }`}
                      >
                        {comp.quantumResilience}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Why QEL Wins Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
            {COMPETITOR_COMPARISONS.map((comp) => (
              <div
                key={comp.id}
                className="p-3 rounded-lg bg-black/40 border border-slate-900 space-y-1"
              >
                <div className="text-cyan-300 font-bold text-xs flex items-center justify-between">
                  <span>vs. {comp.name}</span>
                  <span className="text-[10px] text-slate-500">{comp.category}</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">{comp.qelAdvantage}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
