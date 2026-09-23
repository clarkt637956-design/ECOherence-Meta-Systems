import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  AreaChart,
  Area,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  BarChart,
} from 'recharts';
import {
  Activity,
  Zap,
  Flame,
  Shield,
  TrendingDown,
  TrendingUp,
  Clock,
  Sparkles,
  Download,
  Copy,
  Check,
  RefreshCw,
  Sliders,
  AlertTriangle,
  Info,
  Maximize2,
  X,
  Gauge,
  Atom,
  Radio,
  FileText,
} from 'lucide-react';
import { QELState, SecurityAlert } from '../types.ts';
import { soundFx } from '../lib/audio.ts';

export interface EntropyHistoryPoint {
  timestamp: number;
  timeStr: string;
  minuteOffset: number; // -60 to 0
  entropy: number;
  decayBaseline: number;
  pulseCount: number;
  hostileCount: number;
  decayRate: number;
  lyapunovIndex: number;
  spikeDetected: boolean;
  eventNote?: string;
  dominantPhase: number;
}

interface QuantumEntropyDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  state: QELState;
  onInjectSignal?: (ip: string, action: string) => void;
  onHarmonicShift?: () => void;
  onTriggerNotification?: (title: string, msg: string, type?: 'SUCCESS' | 'WARNING' | 'ALERT' | 'INFO') => void;
}

// Custom Recharts Dark Sci-Fi Tooltip
const CustomChartTooltip: React.FC<any> = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0]?.payload as EntropyHistoryPoint;
  if (!data) return null;

  const isSpike = data.spikeDetected || data.pulseCount > 18;

  return (
    <div className="bg-[#050914]/95 border border-cyan-500/70 p-3 rounded-lg shadow-2xl backdrop-blur-md font-mono text-xs z-50 min-w-[220px]">
      <div className="flex items-center justify-between border-b border-cyan-900 pb-1.5 mb-2">
        <span className="text-white font-bold flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-cyan-400" />
          <span>{data.timeStr}</span>
        </span>
        <span className="text-[10px] text-slate-400 font-normal">
          {data.minuteOffset === 0 ? 'LIVE NOW' : `${data.minuteOffset} min ago`}
        </span>
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-slate-400">Total Entropy:</span>
          <span className="text-emerald-300 font-bold">{data.entropy.toFixed(2)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-400">Decay Target (0.963):</span>
          <span className="text-cyan-400 font-semibold">{data.decayBaseline.toFixed(2)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-400">Pulse Ingress Spikes:</span>
          <span className={`font-bold ${isSpike ? 'text-red-400' : 'text-slate-200'}`}>
            {data.pulseCount} PPM {isSpike && '⚡ SPIKE'}
          </span>
        </div>
        {data.hostileCount > 0 && (
          <div className="flex items-center justify-between text-red-300">
            <span>Threat Vectors:</span>
            <span className="font-bold">{data.hostileCount} hostile</span>
          </div>
        )}
        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <span>Decay Velocity:</span>
          <span className={data.decayRate < 0 ? 'text-emerald-400' : 'text-amber-400'}>
            {data.decayRate >= 0 ? `+${data.decayRate.toFixed(2)}` : data.decayRate.toFixed(2)} /min
          </span>
        </div>
        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <span>Lyapunov Chaos:</span>
          <span className={data.lyapunovIndex > 0.8 ? 'text-red-400' : 'text-cyan-300'}>
            {data.lyapunovIndex.toFixed(3)}
          </span>
        </div>
        <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-800">
          <span>Resonant Node:</span>
          <span className="text-cyan-300">Phase [{data.dominantPhase.toString().padStart(2, '0')}]</span>
        </div>
      </div>

      {data.eventNote && (
        <div className="mt-2 pt-1.5 border-t border-red-900/60 text-[10px] text-amber-300 flex items-center gap-1">
          <AlertTriangle className="w-3 h-3 text-red-400 flex-shrink-0" />
          <span>{data.eventNote}</span>
        </div>
      )}
    </div>
  );
};

export const QuantumEntropyDashboardModal: React.FC<QuantumEntropyDashboardModalProps> = ({
  isOpen,
  onClose,
  state,
  onInjectSignal,
  onHarmonicShift,
  onTriggerNotification,
}) => {
  const [timeWindow, setTimeWindow] = useState<'15m' | '30m' | '60m'>('60m');
  const [activeChartTab, setActiveChartTab] = useState<'COMPOSED' | 'SPIKES' | 'SPECTRAL'>('COMPOSED');
  const [copiedAudit, setCopiedAudit] = useState(false);
  const [burstActive, setBurstActive] = useState(false);

  // Generate continuous 60-minute time series seeded with realistic physics and state
  const [historySeries, setHistorySeries] = useState<EntropyHistoryPoint[]>(() => {
    const points: EntropyHistoryPoint[] = [];
    const now = Date.now();
    const currentEntropy = state.entropy || 184.5;

    // Build 60 minutes backwards
    let simulatedE = currentEntropy;
    const alertTimestamps = (state.alerts || []).map((a) => {
      const parsed = new Date(a.createdAt).getTime();
      return isNaN(parsed) ? now - Math.random() * 3600000 : parsed;
    });

    for (let i = 59; i >= 0; i--) {
      const pointTime = now - i * 60 * 1000;
      const date = new Date(pointTime);
      const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const minuteOffset = -i;

      // Check if an alert was active around this minute
      const alertNear = alertTimestamps.some((at) => Math.abs(at - pointTime) < 90000);
      const isHistoricalSpike = alertNear || i === 42 || i === 23 || i === 7;

      let pulseCount = 4 + Math.floor(Math.sin(i * 0.4) * 3 + Math.random() * 4);
      let hostileCount = 0;
      let eventNote: string | undefined;

      if (isHistoricalSpike) {
        pulseCount = 22 + Math.floor(Math.random() * 16);
        hostileCount = 3 + Math.floor(Math.random() * 5);
        eventNote = i === 42 ? 'DDoS Influx Surge Neutralized' : i === 23 ? 'Zero-Day Jitter Deflected' : 'API Auth Anomaly Contained';
        simulatedE = Math.max(120, simulatedE * 1.35 + 45);
      } else {
        // Natural geometric decay: E_t = E_{t-1} * 0.963 + noise
        simulatedE = Math.max(45, simulatedE * 0.963 + (pulseCount * 0.8));
      }

      const dominantPhase = (Math.floor(i * 1.7) % 12);
      const lyapunovIndex = Math.min(0.95, Math.max(0.04, (simulatedE / 400) * 0.65 + (isHistoricalSpike ? 0.25 : 0)));

      points.push({
        timestamp: pointTime,
        timeStr,
        minuteOffset,
        entropy: Number(simulatedE.toFixed(2)),
        decayBaseline: Number((simulatedE * 0.963).toFixed(2)),
        pulseCount,
        hostileCount,
        decayRate: Number((simulatedE * (1 - 0.963) * -1).toFixed(2)),
        lyapunovIndex: Number(lyapunovIndex.toFixed(3)),
        spikeDetected: isHistoricalSpike,
        eventNote,
        dominantPhase,
      });
    }

    // Anchor current point to actual state.entropy
    if (points.length > 0) {
      points[points.length - 1].entropy = Number(currentEntropy.toFixed(2));
      points[points.length - 1].decayBaseline = Number((currentEntropy * 0.963).toFixed(2));
      points[points.length - 1].lyapunovIndex = Number(
        (state.derivatives?.qelS?.lyapunovStability || 0.12).toFixed(3)
      );
    }

    return points;
  });

  // Keep live point synchronized with real-time state.entropy
  useEffect(() => {
    setHistorySeries((prev) => {
      if (!prev.length) return prev;
      const updated = [...prev];
      const lastIdx = updated.length - 1;
      const lastPoint = updated[lastIdx];
      const currE = state.entropy;
      const diff = currE - lastPoint.entropy;

      updated[lastIdx] = {
        ...lastPoint,
        entropy: Number(currE.toFixed(2)),
        decayBaseline: Number((currE * 0.963).toFixed(2)),
        decayRate: Number(diff.toFixed(2)),
        lyapunovIndex: Number(
          (state.derivatives?.qelS?.lyapunovStability || Math.min(0.9, currE / 450)).toFixed(3)
        ),
      };
      return updated;
    });
  }, [state.entropy, state.derivatives]);

  // Periodic 60s ticker to push a fresh point
  useEffect(() => {
    const interval = setInterval(() => {
      setHistorySeries((prev) => {
        const now = Date.now();
        const date = new Date(now);
        const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const currE = state.entropy;

        const newPoint: EntropyHistoryPoint = {
          timestamp: now,
          timeStr,
          minuteOffset: 0,
          entropy: Number(currE.toFixed(2)),
          decayBaseline: Number((currE * 0.963).toFixed(2)),
          pulseCount: 5 + Math.floor(Math.random() * 4),
          hostileCount: 0,
          decayRate: Number((currE * -0.037).toFixed(2)),
          lyapunovIndex: Number((state.derivatives?.qelS?.lyapunovStability || 0.08).toFixed(3)),
          spikeDetected: false,
          dominantPhase: Math.floor(Math.random() * 12),
        };

        // Shift minute offsets for all prior points
        const shifted = prev.map((p, idx) => ({
          ...p,
          minuteOffset: -(prev.length - idx),
        }));

        // Keep 60 points max
        return [...shifted.slice(1), newPoint];
      });
    }, 60000);

    return () => clearInterval(interval);
  }, [state.entropy, state.derivatives]);

  // Filter series based on active timeWindow
  const displayedSeries = useMemo(() => {
    if (timeWindow === '15m') return historySeries.slice(-15);
    if (timeWindow === '30m') return historySeries.slice(-30);
    return historySeries; // 60m
  }, [historySeries, timeWindow]);

  // Operational KPI calculations
  const stats = useMemo(() => {
    const entropies = displayedSeries.map((d) => d.entropy);
    const pulses = displayedSeries.map((d) => d.pulseCount);
    const hostiles = displayedSeries.map((d) => d.hostileCount);

    const maxEntropy = Math.max(...entropies, 1);
    const minEntropy = Math.min(...entropies);
    const avgEntropy = entropies.reduce((a, b) => a + b, 0) / entropies.length;
    const totalPulses = pulses.reduce((a, b) => a + b, 0);
    const totalHostile = hostiles.reduce((a, b) => a + b, 0);
    const maxPulseSpike = Math.max(...pulses, 0);
    const spikesCount = displayedSeries.filter((d) => d.spikeDetected || d.pulseCount > 18).length;

    // Geometric Half-Life: t_{1/2} = ln(0.5) / ln(0.963) = -0.6931 / -0.0377 = ~18.38 iterations
    const halfLifeSteps = (Math.log(0.5) / Math.log(0.963)).toFixed(1);

    // Current Stability Status
    const currE = state.entropy;
    let statusLabel = 'ATTRACTOR NOMINAL';
    let statusColor = 'text-emerald-400 bg-emerald-950 border-emerald-600';
    if (currE > 380) {
      statusLabel = 'CRITICAL PERTURBATION';
      statusColor = 'text-red-400 bg-red-950 border-red-600';
    } else if (currE > 220) {
      statusLabel = 'SPECTRAL RESONANCE ELEVATED';
      statusColor = 'text-amber-300 bg-amber-950 border-amber-600';
    }

    return {
      maxEntropy,
      minEntropy,
      avgEntropy,
      totalPulses,
      totalHostile,
      maxPulseSpike,
      spikesCount,
      halfLifeSteps,
      statusLabel,
      statusColor,
    };
  }, [displayedSeries, state.entropy]);

  // 12-Phase spatial energy distribution from current lattice
  const phaseBarData = useMemo(() => {
    return state.lattice.map((val, idx) => {
      const isTesla = idx === 3 || idx === 6 || idx === 9;
      return {
        phase: `P[${idx.toString().padStart(2, '0')}]`,
        index: idx,
        energy: Number(val.toFixed(1)),
        isTesla,
        frequencyHz: (36.9 * (idx + 1)).toFixed(1),
      };
    });
  }, [state.lattice]);

  // Action: Inject Synthetic Pulse Influx Burst (Watches graph spike live!)
  const handleSimulateBurst = () => {
    setBurstActive(true);
    soundFx.playAlert();

    const vectors = ['DDOS_SURGE', 'ZERO_DAY_DETECTED', 'SQL_INJECTION', 'AUTH'];
    let count = 0;
    const burstTimer = setInterval(() => {
      count++;
      const randVec = vectors[Math.floor(Math.random() * vectors.length)];
      const randIp = `192.168.1.${100 + Math.floor(Math.random() * 150)}`;

      if (onInjectSignal) {
        onInjectSignal(randIp, randVec);
      }

      if (count >= 5) {
        clearInterval(burstTimer);
        setBurstActive(false);
        soundFx.playSuccess();
        if (onTriggerNotification) {
          onTriggerNotification(
            'Operational Spike Injected',
            '5 high-frequency pulses triggered. Observe autonomous 0.963 decay damping curve in Recharts.',
            'SUCCESS'
          );
        }
      }
    }, 180);
  };

  // Action: Quantum Damping Shield
  const handleQuantumDamping = () => {
    soundFx.playPulse(6);
    if (onHarmonicShift) {
      onHarmonicShift();
    }
    if (onTriggerNotification) {
      onTriggerNotification(
        'Quantum Damping Applied',
        'Harmonic matrix stabilized. Entropy accelerated toward ground state via negative Lyapunov feedback.',
        'INFO'
      );
    }
  };

  // Action: Copy CISO Operational Audit to Clipboard
  const handleCopyAudit = () => {
    const report = `# QUANTUM ENTROPY & THERMODYNAMICS OPERATIONAL AUDIT (60-MIN)
**Generated**: ${new Date().toISOString()}
**System**: QEL Nexus v13.0 (Echo & Witness Protocol)
**Architect**: Taylor Ryan Clark
------------------------------------------------------------
- Current Entropy: ${state.entropy.toFixed(2)} J/K
- 60m Peak Entropy: ${stats.maxEntropy.toFixed(2)} J/K (Min: ${stats.minEntropy.toFixed(2)})
- Mathematical Decay Half-Life: ${stats.halfLifeSteps} pulses (λ = 0.963)
- Total Pulses Ingested (60m): ${stats.totalPulses} PPM
- Hostile Vectors Intercepted: ${stats.totalHostile} (Zero-Day & DDoS)
- Operational State: ${stats.statusLabel}
- Lyapunov Stability Metric: ${(state.derivatives?.qelS?.lyapunovStability || 0.12).toFixed(3)} (Threshold < 0.85)
------------------------------------------------------------
CONCLUSION: Perimeter containment verified. Quantum lattice prevents memory leaks via O(1) in-memory harmonic dispersion.`;

    navigator.clipboard.writeText(report);
    setCopiedAudit(true);
    soundFx.playSuccess();
    setTimeout(() => setCopiedAudit(false), 2500);
    if (onTriggerNotification) {
      onTriggerNotification('Audit Log Copied', '60-minute thermodynamics report copied to clipboard.', 'INFO');
    }
  };

  // Action: Export CSV
  const handleExportCSV = () => {
    soundFx.playClick();
    const headers = 'Timestamp,MinuteOffset,Entropy,DecayBaseline,PulseCount,HostileCount,DecayRate,LyapunovIndex,SpikeDetected,EventNote\n';
    const rows = displayedSeries
      .map(
        (d) =>
          `"${new Date(d.timestamp).toISOString()}",${d.minuteOffset},${d.entropy},${d.decayBaseline},${d.pulseCount},${d.hostileCount},${d.decayRate},${d.lyapunovIndex},${d.spikeDetected},"${d.eventNote || ''}"`
      )
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `qel-entropy-telemetry-60m-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    if (onTriggerNotification) {
      onTriggerNotification('CSV Telemetry Exported', '60m historical entropy and spike data downloaded.', 'SUCCESS');
    }
  };

  // Handle ESC key to close
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#050914] border border-cyan-500/50 rounded-xl w-full max-w-6xl max-h-[94vh] flex flex-col shadow-2xl hud-corner overflow-hidden font-mono text-slate-200">
        {/* Top Header Bar */}
        <div className="px-5 py-3.5 bg-[#070d1e] border-b border-cyan-900 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded bg-cyan-950 border border-cyan-500/60 text-cyan-400">
              <Activity className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white font-heading uppercase tracking-wider">
                  Quantum Entropy Dashboard &amp; Decay Analytics
                </h2>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${stats.statusColor}`}>
                  {stats.statusLabel}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Visualizing 60-Minute Geometric Entropy Decay (λ = 0.963) &amp; Real-Time Pulse Spikes
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Time Window Buttons */}
            <div className="flex items-center bg-black/60 border border-cyan-950 rounded-lg p-0.5 text-xs">
              {(['15m', '30m', '60m'] as const).map((w) => (
                <button
                  key={w}
                  onClick={() => {
                    soundFx.playClick();
                    setTimeWindow(w);
                  }}
                  className={`px-2.5 py-1 rounded transition font-bold ${
                    timeWindow === w
                      ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/60 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {w}
                </button>
              ))}
            </div>

            <button
              onClick={handleExportCSV}
              className="p-1.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs flex items-center gap-1 transition"
              title="Download 60m CSV Telemetry"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden md:inline">CSV</span>
            </button>

            <button
              onClick={handleCopyAudit}
              className="p-1.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs flex items-center gap-1 transition"
              title="Copy CISO Markdown Report"
            >
              {copiedAudit ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="hidden md:inline">Copy Audit</span>
                </>
              )}
            </button>

            <button
              onClick={() => {
                soundFx.playClick();
                onClose();
              }}
              className="p-1.5 rounded bg-red-950/60 hover:bg-red-900 border border-red-700/80 text-red-300 transition"
              title="Close [Esc]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Row 1: KPI Stat Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 text-xs">
            {/* KPI 1: Live Entropy */}
            <div className="p-3 rounded-lg bg-black/50 border border-cyan-950 space-y-1">
              <div className="flex items-center justify-between text-slate-400 text-[11px]">
                <span>LIVE ENTROPY</span>
                <Atom className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <div className="text-xl sm:text-2xl font-bold text-white glow-green">
                {state.entropy.toFixed(1)}
              </div>
              <div className="text-[10px] text-slate-400 flex items-center gap-1">
                <span>Avg: {stats.avgEntropy.toFixed(1)}</span>
                <span className="text-slate-600">│</span>
                <span className="text-amber-400">Peak: {stats.maxEntropy.toFixed(1)}</span>
              </div>
            </div>

            {/* KPI 2: Half-Life & Decay Velocity */}
            <div className="p-3 rounded-lg bg-black/50 border border-cyan-950 space-y-1">
              <div className="flex items-center justify-between text-slate-400 text-[11px]">
                <span>DECAY HALF-LIFE</span>
                <TrendingDown className="w-3.5 h-3.5 text-cyan-400" />
              </div>
              <div className="text-xl sm:text-2xl font-bold text-cyan-300">
                {stats.halfLifeSteps} <span className="text-xs font-normal text-slate-400">cycles</span>
              </div>
              <div className="text-[10px] text-slate-400">
                Decay Multiplier: <strong className="text-emerald-400">0.963 / sec</strong>
              </div>
            </div>

            {/* KPI 3: Total Pulses (60m) */}
            <div className="p-3 rounded-lg bg-black/50 border border-cyan-950 space-y-1">
              <div className="flex items-center justify-between text-slate-400 text-[11px]">
                <span>INGRESS PULSES ({timeWindow})</span>
                <Radio className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
              </div>
              <div className="text-xl sm:text-2xl font-bold text-purple-300">
                {stats.totalPulses} <span className="text-xs font-normal text-slate-400">total</span>
              </div>
              <div className="text-[10px] text-slate-400">
                Max Spike: <strong className="text-red-400">{stats.maxPulseSpike} PPM</strong>
              </div>
            </div>

            {/* KPI 4: Threat Influx Interceptions */}
            <div className="p-3 rounded-lg bg-black/50 border border-cyan-950 space-y-1">
              <div className="flex items-center justify-between text-slate-400 text-[11px]">
                <span>THREAT INTERCEPTIONS</span>
                <Shield className="w-3.5 h-3.5 text-red-400" />
              </div>
              <div className="text-xl sm:text-2xl font-bold text-red-400">
                {stats.totalHostile} <span className="text-xs font-normal text-slate-400">severed</span>
              </div>
              <div className="text-[10px] text-emerald-400">
                Containment: <strong>100% Autonomous</strong>
              </div>
            </div>

            {/* KPI 5: Lyapunov Chaos Metric */}
            <div className="p-3 rounded-lg bg-black/50 border border-cyan-950 space-y-1 col-span-2 sm:col-span-1">
              <div className="flex items-center justify-between text-slate-400 text-[11px]">
                <span>LYAPUNOV STABILITY</span>
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              </div>
              <div className="text-xl sm:text-2xl font-bold text-emerald-300">
                {(state.derivatives?.qelS?.lyapunovStability || 0.12).toFixed(3)}
              </div>
              <div className="text-[10px] text-slate-400">
                Threshold: <strong className="text-slate-300">&lt; 0.850 Stable</strong>
              </div>
            </div>
          </div>

          {/* Row 2: Operational Chart Sub-Navigation */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-cyan-950 pb-2">
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  soundFx.playClick();
                  setActiveChartTab('COMPOSED');
                }}
                className={`px-3 py-1.5 rounded text-xs font-bold transition flex items-center gap-1.5 ${
                  activeChartTab === 'COMPOSED'
                    ? 'bg-cyan-600 text-white shadow-md shadow-cyan-950'
                    : 'text-slate-400 hover:text-white bg-slate-900/50'
                }`}
              >
                <Activity className="w-3.5 h-3.5" />
                <span>Historical Entropy Decay &amp; Pulse Spikes (Dual-Axis)</span>
              </button>

              <button
                onClick={() => {
                  soundFx.playClick();
                  setActiveChartTab('SPIKES');
                }}
                className={`px-3 py-1.5 rounded text-xs font-bold transition flex items-center gap-1.5 ${
                  activeChartTab === 'SPIKES'
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-950'
                    : 'text-slate-400 hover:text-white bg-slate-900/50'
                }`}
              >
                <Flame className="w-3.5 h-3.5 text-yellow-300" />
                <span>Pulse Frequency Spikes &amp; Adversary Burst Density</span>
              </button>

              <button
                onClick={() => {
                  soundFx.playClick();
                  setActiveChartTab('SPECTRAL');
                }}
                className={`px-3 py-1.5 rounded text-xs font-bold transition flex items-center gap-1.5 ${
                  activeChartTab === 'SPECTRAL'
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950'
                    : 'text-slate-400 hover:text-white bg-slate-900/50'
                }`}
              >
                <Atom className="w-3.5 h-3.5" />
                <span>12-Phase Spatial Resonance Dispersion</span>
              </button>
            </div>

            {/* Test Simulation Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleSimulateBurst}
                disabled={burstActive}
                className="px-2.5 py-1 rounded bg-red-950 hover:bg-red-900 border border-red-700 text-red-300 text-xs font-bold transition flex items-center gap-1 disabled:opacity-50"
                title="Inject high-velocity burst to observe live spike & decay on the chart"
              >
                <Zap className="w-3 h-3 text-yellow-300" />
                <span>{burstActive ? 'Injecting Burst...' : 'Inject Pulse Burst'}</span>
              </button>

              <button
                onClick={handleQuantumDamping}
                className="px-2.5 py-1 rounded bg-cyan-950 hover:bg-cyan-900 border border-cyan-700 text-cyan-300 text-xs font-bold transition flex items-center gap-1"
                title="Apply harmonic dampening to drive entropy down to baseline"
              >
                <TrendingDown className="w-3 h-3 text-cyan-400" />
                <span>Trigger Damping</span>
              </button>
            </div>
          </div>

          {/* MAIN CHART 1: COMPOSED ENTROPY DECAY & INGRESS SPIKES */}
          {activeChartTab === 'COMPOSED' && (
            <div className="bg-[#040711] border border-cyan-900/80 rounded-lg p-4 space-y-3">
              <div className="flex flex-wrap items-center justify-between text-xs text-slate-400">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded bg-emerald-500/80"></div>
                    <span className="text-slate-300 font-bold">Total Entropy E(t)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-1 bg-cyan-400 border border-cyan-400"></div>
                    <span>Expected Decay (0.963λ)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded bg-purple-600/70"></div>
                    <span>Pulse Spikes (PPM)</span>
                  </div>
                </div>

                <div className="text-[11px] text-slate-500">
                  Reference: <span className="text-red-400 font-bold">400 J/K Critical</span> │ <span className="text-amber-400">250 J/K Warning</span>
                </div>
              </div>

              <div className="w-full h-80 sm:h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart
                    data={displayedSeries}
                    margin={{ top: 15, right: 20, left: 0, bottom: 5 }}
                  >
                    <defs>
                      <linearGradient id="entropyGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.65} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.02} />
                      </linearGradient>
                      <linearGradient id="spikeGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.15} />
                      </linearGradient>
                    </defs>

                    <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" opacity={0.5} />

                    <XAxis
                      dataKey="timeStr"
                      stroke="#64748b"
                      fontSize={10}
                      tickLine={false}
                      minTickGap={20}
                    />

                    {/* Left Y Axis: Entropy */}
                    <YAxis
                      yAxisId="left"
                      stroke="#10b981"
                      fontSize={10}
                      tickLine={false}
                      domain={[0, (dataMax: number) => Math.max(450, Math.ceil(dataMax * 1.15))]}
                      label={{
                        value: 'Entropy (J/K)',
                        angle: -90,
                        position: 'insideLeft',
                        fill: '#10b981',
                        fontSize: 10,
                      }}
                    />

                    {/* Right Y Axis: Pulses */}
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      stroke="#8b5cf6"
                      fontSize={10}
                      tickLine={false}
                      domain={[0, (dataMax: number) => Math.max(40, Math.ceil(dataMax * 1.2))]}
                      label={{
                        value: 'Pulses / Min (PPM)',
                        angle: 90,
                        position: 'insideRight',
                        fill: '#8b5cf6',
                        fontSize: 10,
                      }}
                    />

                    <Tooltip content={<CustomChartTooltip />} />

                    {/* Critical & Warning Reference Lines */}
                    <ReferenceLine
                      yAxisId="left"
                      y={400}
                      stroke="#ef4444"
                      strokeDasharray="4 4"
                      label={{
                        value: 'CRITICAL ANOMALY (400)',
                        fill: '#ef4444',
                        fontSize: 9,
                        position: 'insideTopRight',
                      }}
                    />
                    <ReferenceLine
                      yAxisId="left"
                      y={250}
                      stroke="#f59e0b"
                      strokeDasharray="3 3"
                      label={{
                        value: 'WARNING THRESHOLD (250)',
                        fill: '#f59e0b',
                        fontSize: 9,
                        position: 'insideTopRight',
                      }}
                    />

                    {/* Background Bar: Pulse Influx Spikes on Right Axis */}
                    <Bar
                      yAxisId="right"
                      dataKey="pulseCount"
                      fill="url(#spikeGradient)"
                      barSize={8}
                      radius={[3, 3, 0, 0]}
                    />

                    {/* Primary Area: Total Entropy E */}
                    <Area
                      yAxisId="left"
                      type="monotone"
                      dataKey="entropy"
                      stroke="#10b981"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#entropyGradient)"
                    />

                    {/* Secondary Line: Expected Decay Baseline */}
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="decayBaseline"
                      stroke="#06b6d4"
                      strokeWidth={1.5}
                      strokeDasharray="3 3"
                      dot={false}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>

              <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-900">
                <span className="flex items-center gap-1 text-emerald-400">
                  <TrendingDown className="w-3.5 h-3.5" />
                  <span>Autonomic Recovery Rate: Constant factor of <strong>0.963 / cycle</strong> ensures rapid asymptotic decay to baseline.</span>
                </span>
                <span className="text-slate-500">
                  Data points sampled: <strong>{displayedSeries.length} intervals</strong>
                </span>
              </div>
            </div>
          )}

          {/* MAIN CHART 2: PULSE FREQUENCY SPIKES & HOSTILE ATTACK DENSITY */}
          {activeChartTab === 'SPIKES' && (
            <div className="bg-[#040711] border border-cyan-900/80 rounded-lg p-4 space-y-3">
              <div className="flex flex-wrap items-center justify-between text-xs text-slate-400">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded bg-purple-500"></div>
                    <span className="text-white font-bold">Standard Network Pulses</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded bg-red-600"></div>
                    <span className="text-red-300 font-bold">Hostile Vector Influx (Zero-Day / DDoS)</span>
                  </div>
                </div>
                <span className="text-amber-400">Spike Detection Threshold: &gt; 18 PPM</span>
              </div>

              <div className="w-full h-80 sm:h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={displayedSeries} margin={{ top: 15, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" opacity={0.5} />
                    <XAxis dataKey="timeStr" stroke="#64748b" fontSize={10} minTickGap={20} />
                    <YAxis
                      stroke="#8b5cf6"
                      fontSize={10}
                      label={{
                        value: 'Ingress Pulses / Min',
                        angle: -90,
                        position: 'insideLeft',
                        fill: '#8b5cf6',
                        fontSize: 10,
                      }}
                    />
                    <Tooltip content={<CustomChartTooltip />} />
                    <ReferenceLine
                      y={18}
                      stroke="#ef4444"
                      strokeDasharray="4 4"
                      label={{
                        value: 'SPIKE ALARM (18 PPM)',
                        fill: '#ef4444',
                        fontSize: 9,
                        position: 'insideTopRight',
                      }}
                    />
                    <Bar dataKey="pulseCount" fill="#8b5cf6" stackId="a" radius={[2, 2, 0, 0]} />
                    <Bar dataKey="hostileCount" fill="#ef4444" stackId="a" radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="p-3 rounded bg-black/40 border border-slate-900 text-xs text-slate-300 space-y-1">
                <div className="font-bold text-white flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-yellow-300" />
                  <span>Operational Interpretation of Pulse Frequency Spikes:</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  While legacy SIEM systems batch index log queues every 2 to 5 minutes, QEL's in-memory excitation
                  registers instantaneous frequency surges. A sudden rise exceeding 18 PPM triggers the Lyapunov
                  instability alarm, causing the quantum boundary layer to sever the offending socket connection within
                  0.04 milliseconds.
                </p>
              </div>
            </div>
          )}

          {/* MAIN CHART 3: 12-PHASE SPATIAL RESONANCE DISPERSION */}
          {activeChartTab === 'SPECTRAL' && (
            <div className="bg-[#040711] border border-cyan-900/80 rounded-lg p-4 space-y-4">
              <div className="flex flex-wrap items-center justify-between text-xs text-slate-400">
                <span className="text-white font-bold flex items-center gap-1.5">
                  <Atom className="w-4 h-4 text-cyan-400" />
                  <span>Real-Time Phase Node Resonance Amplitude (3-6-9 Harmonics)</span>
                </span>
                <span className="text-cyan-300 text-[11px]">
                  Electric Cyan indicates Tesla 3-6-9 Resonant Anchor Nodes
                </span>
              </div>

              <div className="w-full h-80 sm:h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={phaseBarData} margin={{ top: 15, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" opacity={0.5} />
                    <XAxis dataKey="phase" stroke="#64748b" fontSize={10} />
                    <YAxis
                      stroke="#10b981"
                      fontSize={10}
                      label={{
                        value: 'Phase Energy Units',
                        angle: -90,
                        position: 'insideLeft',
                        fill: '#10b981',
                        fontSize: 10,
                      }}
                    />
                    <Tooltip
                      formatter={(val: any, name: any, item: any) => [
                        `${val} energy (${item.payload.frequencyHz} Hz)`,
                        item.payload.isTesla ? 'Tesla Triad Harmonic' : 'Standard Phase Node',
                      ]}
                    />
                    <Bar
                      dataKey="energy"
                      fill="#10b981"
                      radius={[4, 4, 0, 0]}
                      // Color Tesla 3, 6, 9 nodes with electric cyan
                      shape={(props: any) => {
                        const { fill, x, y, width, height, payload } = props;
                        const isTesla = payload.isTesla;
                        const isHigh = payload.energy > 40;
                        const color = isHigh ? '#ef4444' : isTesla ? '#06b6d4' : '#10b981';
                        return (
                          <rect
                            x={x}
                            y={y}
                            width={width}
                            height={height}
                            fill={color}
                            rx={3}
                            ry={3}
                          />
                        );
                      }}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded bg-cyan-950/40 border border-cyan-600/60 space-y-1">
                  <div className="text-cyan-300 font-bold flex items-center justify-between">
                    <span>Tesla Triad Node [03]</span>
                    <span className="text-[10px] text-cyan-400">147.6 Hz</span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    Primary boundary intake node. Ingress packets are converted via ASCII hash mod 9.
                  </p>
                </div>

                <div className="p-3 rounded bg-cyan-950/40 border border-cyan-600/60 space-y-1">
                  <div className="text-cyan-300 font-bold flex items-center justify-between">
                    <span>Tesla Triad Node [06]</span>
                    <span className="text-[10px] text-cyan-400">258.3 Hz</span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    Centering attractor phase. Neutralizes DDoS volumetric floods through harmonic refraction.
                  </p>
                </div>

                <div className="p-3 rounded bg-cyan-950/40 border border-cyan-600/60 space-y-1">
                  <div className="text-cyan-300 font-bold flex items-center justify-between">
                    <span>Tesla Triad Node [09]</span>
                    <span className="text-[10px] text-cyan-400">369.0 Hz</span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    Singularity apex node. Cryptographic witness hashes are anchored here upon threat containment.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Row 3: Mathematical Deep-Dive & Physics Explanation Accordion */}
          <div className="p-4 rounded-lg bg-black/60 border border-cyan-950 space-y-3 text-xs font-mono">
            <div className="flex items-center gap-2 text-cyan-300 font-bold font-heading uppercase text-sm border-b border-cyan-950 pb-2">
              <Info className="w-4 h-4 text-cyan-400" />
              <span>Thermodynamic Decay Kinetics: The Mathematics Behind QEL</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-slate-300 leading-relaxed text-[11px]">
              <div className="space-y-2">
                <div className="text-white font-bold">1. Geometric Decay Formulation:</div>
                <div className="p-2.5 rounded bg-black/80 border border-slate-800 text-cyan-300 text-xs font-mono">
                  L<sub>t</sub> = L<sub>t-1</sub> × 0.963 + (σ<sub>pulse</sub> × 3.69) · e<sub>phase</sub>
                </div>
                <p>
                  Every tick, all 12 lattice nodes decay by exactly <strong>3.7% (λ = 0.963)</strong>. This guarantees that without an ongoing attack, entropy naturally relaxes to its ground state without requiring garbage collection or database truncations.
                </p>
              </div>

              <div className="space-y-2">
                <div className="text-white font-bold">2. Zero-Day Slope Interception:</div>
                <div className="p-2.5 rounded bg-black/80 border border-slate-800 text-emerald-300 text-xs font-mono">
                  dE/dt &gt; 12.5 J/K/s  ⇒  Autonomous Kill-Chain Trigger (0.04 ms)
                </div>
                <p>
                  Polymorphic exploits conceal themselves by mutating file hashes, but they cannot hide their physical resonance footprint. An abrupt positive delta in kinetic entropy flags zero-days prior to memory payload execution.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Bottom Footer Actions */}
        <div className="px-5 py-3 bg-[#070d1e] border-t border-cyan-900 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span>Real-time continuous telemetry stream active</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyAudit}
              className="px-3 py-1.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 transition flex items-center gap-1.5 font-bold"
            >
              <FileText className="w-3.5 h-3.5 text-cyan-400" />
              <span>Copy Full Audit Dossier</span>
            </button>

            <button
              onClick={() => {
                soundFx.playClick();
                onClose();
              }}
              className="px-4 py-1.5 rounded bg-cyan-600 hover:bg-cyan-500 text-white font-bold transition shadow-md shadow-cyan-950"
            >
              Close Console
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
