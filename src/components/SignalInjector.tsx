import React, { useState } from 'react';
import {
  Send,
  Flame,
  ShieldAlert,
  Cpu,
  Sparkles,
  RefreshCw,
  HelpCircle,
  BookOpen,
  Zap,
  Globe,
} from 'lucide-react';
import { CyberAction } from '../types.ts';
import { THREAT_KNOWLEDGE_BASE } from '../lib/threatKnowledge.ts';
import { soundFx } from '../lib/audio.ts';

interface SignalInjectorProps {
  onInjectSignal: (ip: string, action: string) => void;
  isStressTesting: boolean;
  onToggleStressTest: () => void;
  lastPulseInfo?: {
    sig: number;
    phase: number;
    entropy: number;
    action: string;
    ip: string;
    hash: string;
  } | null;
  onOpenKnowledgeBase?: (vector: CyberAction) => void;
}

interface QuickScenario {
  id: string;
  title: string;
  action: CyberAction;
  ip: string;
  badge: string;
  description: string;
  danger: boolean;
}

const QUICK_SCENARIOS: QuickScenario[] = [
  {
    id: 'zero-day',
    title: 'Zero-Day Infiltration',
    action: 'ZERO_DAY_DETECTED',
    ip: '185.220.101.5',
    badge: 'CRITICAL',
    description: 'Simulates unauthorized quantum memory execution bypass.',
    danger: true,
  },
  {
    id: 'ddos',
    title: 'Volumetric DDoS Surge',
    action: 'DDOS_SURGE',
    ip: '203.0.113.88',
    badge: 'HIGH',
    description: 'Floods resonance lattice nodes with packet bursts.',
    danger: true,
  },
  {
    id: 'sqli',
    title: 'SQL Injection Exfiltration',
    action: 'SQL_INJECTION',
    ip: '198.51.100.99',
    badge: 'HIGH',
    description: 'Injects time-based SQL payload into database ingress.',
    danger: true,
  },
  {
    id: 'lateral',
    title: 'Lateral Movement Probe',
    action: 'LATERAL_MOVEMENT',
    ip: '10.0.4.15',
    badge: 'HIGH',
    description: 'Attempts Kerberoast token traversal across subnets.',
    danger: true,
  },
  {
    id: 'recon',
    title: 'Reconnaissance Scan',
    action: 'SCAN',
    ip: '192.168.1.42',
    badge: 'MEDIUM',
    description: 'Maps open ports and lattice phase boundary nodes.',
    danger: false,
  },
  {
    id: 'normal',
    title: 'Legitimate Handshake',
    action: 'AUTH',
    ip: '192.168.1.100',
    badge: 'LOW',
    description: 'Normal authenticated protocol handshake.',
    danger: false,
  },
];

const ACTION_OPTIONS: { label: string; action: CyberAction; desc: string; danger?: boolean }[] = [
  { label: 'AUTH', action: 'AUTH', desc: 'Credential handshake verification' },
  { label: 'SCAN', action: 'SCAN', desc: 'Port / lattice manifold reconnaissance' },
  { label: 'PULL', action: 'PULL', desc: 'Data ingress telemetry extraction' },
  { label: 'PUSH', action: 'PUSH', desc: 'Outbound command payload burst' },
  { label: 'EXPLOIT_ATTEMPT', action: 'EXPLOIT_ATTEMPT', desc: 'Buffer overflow / RCE probe', danger: true },
  { label: 'SQL_INJECTION', action: 'SQL_INJECTION', desc: 'Blind time-based SQL payload attack', danger: true },
  { label: 'DDOS_SURGE', action: 'DDOS_SURGE', desc: 'Volumetric packet flood on resonance nodes', danger: true },
  { label: 'ZERO_DAY_DETECTED', action: 'ZERO_DAY_DETECTED', desc: 'Unregistered quantum state exploit', danger: true },
  { label: 'LATERAL_MOVEMENT', action: 'LATERAL_MOVEMENT', desc: 'Subnet hopping / Kerberoast probe', danger: true },
];

export const SignalInjector: React.FC<SignalInjectorProps> = ({
  onInjectSignal,
  isStressTesting,
  onToggleStressTest,
  lastPulseInfo,
  onOpenKnowledgeBase,
}) => {
  const [ip, setIp] = useState('192.168.1.77');
  const [action, setAction] = useState<CyberAction>('SCAN');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const kb = THREAT_KNOWLEDGE_BASE[action];

  const generateRandomIp = () => {
    const o1 = 192;
    const o2 = 168;
    const o3 = Math.floor(Math.random() * 5) + 1;
    const o4 = Math.floor(Math.random() * 254) + 1;
    setIp(`${o1}.${o2}.${o3}.${o4}`);
  };

  const handleSend = () => {
    soundFx.playPulse();
    onInjectSignal(ip.trim() || '192.168.1.1', action);
  };

  const handleExecuteScenario = (scenario: QuickScenario) => {
    soundFx.playPulse();
    setIp(scenario.ip);
    setAction(scenario.action);
    onInjectSignal(scenario.ip, scenario.action);
  };

  return (
    <div className="bg-[#070b18]/90 border border-cyan-500/30 rounded-lg p-4 hud-corner shadow-xl space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between border-b border-cyan-950 pb-3 gap-2">
        <div className="flex items-center gap-2">
          <Cpu className="w-5 h-5 text-cyan-400" />
          <h2 className="text-sm sm:text-base font-bold tracking-wider text-white font-heading uppercase">
            Signal Ingestion &amp; Threat Injection
          </h2>
        </div>

        <div className="flex items-center gap-2">
          {/* Toggle Advanced Form */}
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="px-2.5 py-1 rounded bg-black/50 border border-cyan-950 text-slate-400 hover:text-white text-xs font-mono transition"
          >
            {showAdvanced ? 'Simple Scenarios' : 'Custom IP / Vector Builder'}
          </button>

          {/* Continuous Stress Test Daemon */}
          <button
            onClick={() => {
              soundFx.playClick();
              onToggleStressTest();
            }}
            className={`px-3 py-1 rounded text-xs font-mono font-bold flex items-center gap-1.5 transition border ${
              isStressTesting
                ? 'bg-red-950/80 text-red-300 border-red-500 animate-pulse'
                : 'bg-slate-900 text-slate-400 border-slate-700 hover:text-white'
            }`}
          >
            <Flame className={`w-3.5 h-3.5 ${isStressTesting ? 'text-red-400' : 'text-slate-500'}`} />
            <span>{isStressTesting ? 'Stress Daemon Running' : 'Start Stress Daemon'}</span>
          </button>
        </div>
      </div>

      {/* 1-Click Attack Scenarios for Fast & Intuitive Testing */}
      <div>
        <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2">
          <span className="font-bold text-slate-300 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            <span>1-Click Test Scenarios (Click to simulate attack &amp; verify response):</span>
          </span>
          <span className="text-[10px] text-slate-500">Zero setup required</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {QUICK_SCENARIOS.map((sc) => {
            const isSelected = action === sc.action && ip === sc.ip;
            return (
              <button
                key={sc.id}
                onClick={() => handleExecuteScenario(sc)}
                className={`p-2.5 rounded-lg border text-left transition flex flex-col justify-between font-mono ${
                  isSelected
                    ? 'bg-cyan-950/90 border-cyan-400 shadow-md shadow-cyan-950'
                    : sc.danger
                    ? 'bg-black/50 border-slate-800/80 hover:border-red-500/60 hover:bg-red-950/20'
                    : 'bg-black/50 border-slate-800/80 hover:border-cyan-500/60 hover:bg-cyan-950/20'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`text-[8px] font-bold px-1 py-0.2 rounded border ${
                        sc.badge === 'CRITICAL'
                          ? 'bg-red-950 text-red-300 border-red-600'
                          : sc.badge === 'HIGH'
                          ? 'bg-amber-950 text-amber-300 border-amber-600'
                          : sc.badge === 'MEDIUM'
                          ? 'bg-cyan-950 text-cyan-300 border-cyan-800'
                          : 'bg-emerald-950 text-emerald-300 border-emerald-800'
                      }`}
                    >
                      {sc.badge}
                    </span>
                    <span className="text-[9px] text-slate-500">⚡ Test</span>
                  </div>
                  <div className="text-xs font-bold text-white truncate">{sc.title}</div>
                  <p className="text-[10px] text-slate-400 line-clamp-2 mt-1 leading-snug">
                    {sc.description}
                  </p>
                </div>

                <div className="text-[9px] text-cyan-400/80 pt-2 border-t border-slate-800/60 mt-2 truncate">
                  IP: {sc.ip}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Advanced Builder (Expandable) & Live Math Card */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start pt-2 border-t border-cyan-950">
        {/* Form Inputs */}
        <div className={`space-y-3 font-mono text-xs ${showAdvanced ? 'md:col-span-7' : 'md:col-span-6'}`}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span>Target Entity IP</span>
                <button
                  onClick={generateRandomIp}
                  className="text-[10px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                >
                  <RefreshCw className="w-2.5 h-2.5" />
                  <span>Randomize</span>
                </button>
              </div>
              <input
                type="text"
                value={ip}
                onChange={(e) => setIp(e.target.value)}
                className="w-full bg-black/70 border border-cyan-950 focus:border-cyan-500 px-3 py-1.5 rounded text-slate-200 font-mono focus:outline-none text-xs"
                placeholder="e.g. 192.168.1.15"
              />
            </div>

            <div>
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span>Threat Vector</span>
                {onOpenKnowledgeBase && (
                  <button
                    onClick={() => onOpenKnowledgeBase(action)}
                    className="text-[10px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                  >
                    <BookOpen className="w-2.5 h-2.5" />
                    <span>Explain</span>
                  </button>
                )}
              </div>
              <select
                value={action}
                onChange={(e) => setAction(e.target.value as CyberAction)}
                className="w-full bg-black/70 border border-cyan-950 focus:border-cyan-500 px-3 py-1.5 rounded text-slate-200 font-mono focus:outline-none cursor-pointer text-xs"
              >
                {ACTION_OPTIONS.map((opt) => (
                  <option key={opt.action} value={opt.action}>
                    {opt.label} — {opt.desc} {opt.danger ? '⚠️' : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Educational Inline Context Card */}
          {kb && (
            <div className="bg-slate-950/80 border border-cyan-950 p-2.5 rounded text-[11px] space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-cyan-400 font-bold">Anatomy: {kb.title}</span>
                <span className="text-[10px] text-slate-500 font-bold">{kb.mitreId}</span>
              </div>
              <p className="text-slate-300 text-[10px] leading-snug">{kb.whatItIs}</p>
              <div className="text-[10px] text-emerald-400 font-semibold pt-0.5">
                › Recommended Defense: {kb.recommendedPlaybook}
              </div>
            </div>
          )}

          <button
            onClick={handleSend}
            className="w-full py-2 px-4 rounded bg-cyan-500 hover:bg-cyan-400 text-black font-bold flex items-center justify-center gap-2 shadow-lg shadow-cyan-950/50 transition font-heading tracking-wider"
          >
            <Send className="w-4 h-4 text-black" />
            <span>TRANSMIT RESONANCE PULSE</span>
          </button>
        </div>

        {/* Real-time Math Output Card */}
        <div
          className={`bg-black/60 border border-cyan-950 p-3 rounded font-mono text-xs ${
            showAdvanced ? 'md:col-span-5' : 'md:col-span-6'
          }`}
        >
          <div className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider mb-2 border-b border-cyan-950 pb-1 flex items-center justify-between">
            <span>LAST COMPUTED QUANTUM PULSE</span>
            <span className="text-slate-500">v13.0 MATH</span>
          </div>

          {lastPulseInfo ? (
            <div className="space-y-1.5 text-[11px]">
              <div className="flex justify-between">
                <span className="text-slate-400">Target Vector:</span>
                <span className="text-cyan-300 font-bold">{lastPulseInfo.action}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Harmonic Signal (sig):</span>
                <span className="text-emerald-400 font-bold">
                  {lastPulseInfo.sig} <span className="text-slate-600">(1-9)</span>
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Lattice Phase:</span>
                <span className="text-emerald-400 font-bold">
                  Node [{lastPulseInfo.phase.toString().padStart(2, '0')}]
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Resulting Entropy:</span>
                <span className="text-white font-bold">{lastPulseInfo.entropy.toFixed(2)}</span>
              </div>
              <div className="pt-1 border-t border-cyan-950/60">
                <span className="text-slate-500 text-[10px] block">Cryptographic Witness Signature:</span>
                <span className="text-cyan-400 text-[10px] break-all font-mono">
                  {lastPulseInfo.hash}
                </span>
              </div>
            </div>
          ) : (
            <div className="py-6 text-center text-slate-500 text-[11px]">
              Click any scenario or transmit pulse to observe live quantum resonance math.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
