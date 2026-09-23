import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Play,
  Pause,
  RotateCcw,
  ShieldCheck,
  Zap,
  Activity,
  Radio,
  FileCode,
  Clock,
  Sparkles,
  HelpCircle,
  AlertTriangle,
  ArrowRight,
  Database,
  Lock,
} from 'lucide-react';
import { SecurityAlert } from '../types.ts';
import { soundFx } from '../lib/audio.ts';
import { THREAT_KNOWLEDGE_BASE } from '../lib/threatKnowledge.ts';

interface VisualIncidentDissectorModalProps {
  alert: SecurityAlert | null;
  onClose: () => void;
  onExecutePlaybook?: (playbookCode: string, ip: string) => void;
}

export const VisualIncidentDissectorModal: React.FC<VisualIncidentDissectorModalProps> = ({
  alert,
  onClose,
  onExecutePlaybook,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const vector = alert?.vector || 'EXPLOIT_ATTEMPT';
  const kb = THREAT_KNOWLEDGE_BASE[vector as keyof typeof THREAT_KNOWLEDGE_BASE];

  const steps = [
    {
      timeOffset: 't - 25.0 ms',
      label: 'Ingress Handshake & Vector Probe',
      badge: 'PROBE DETECTED',
      badgeColor: 'bg-amber-950 text-amber-300 border-amber-600',
      description: `Target ${alert?.targetIp || '192.168.1.x'} dispatched a high-frequency socket connection matching known ${vector} behavioral signatures.`,
      qelAction: 'Telemetry parsed into ASCII entropy sum and mapped to 12-phase lattice.',
      competitorAction: 'Legacy SIEM writes raw syslog line to disk buffer awaiting batch indexer cron (2-5 min lag).',
    },
    {
      timeOffset: 't + 0.01 ms',
      label: '12-Phase Harmonic Node Trip',
      badge: 'SPECTRAL JITTER',
      badgeColor: 'bg-purple-950 text-purple-300 border-purple-600',
      description: `Lattice phase node [${((alert?.entropyTrigger || 250) % 12).toFixed(0).padStart(2, '0')}] experienced sudden harmonic excitation (Entropy: ${alert?.entropyTrigger?.toFixed(1) || 280.4}).`,
      qelAction: 'QEL-S spectral sensor flags Lyapunov instability coefficient > 0.85.',
      competitorAction: 'CrowdStrike cloud sensor queues hash lookup against remote threat cloud database.',
    },
    {
      timeOffset: 't + 0.04 ms',
      label: 'Autonomous Boundary Socket Drop',
      badge: 'KILL-CHAIN SEVERED',
      badgeColor: 'bg-emerald-950 text-emerald-300 border-emerald-500',
      description: `Quantum boundary layer drops socket connection for ${alert?.targetIp || 'Target IP'} before payload payload can execute.`,
      qelAction: 'Boundary quarantine rule applied in 0.04 ms. Cryptographic witness hash generated.',
      competitorAction: 'Adversary payload executes shellcode in memory; begins credential dumping from LSASS.',
    },
    {
      timeOffset: 't + 120 ms',
      label: 'Post-Quantum Lattice Stabilization',
      badge: 'ENTROPY DAMPENED',
      badgeColor: 'bg-cyan-950 text-cyan-300 border-cyan-500',
      description: `Damping factor applied across the 12-phase manifold. Harmonic balance restored to 3-6-9 vortex spiral.`,
      qelAction: 'Audit log logged with SHA-256 witness seal; SOAR playbook marked SUCCESS.',
      competitorAction: 'SOC analyst receives Tier-1 alert in Splunk queue (avg wait time: 24 mins).',
    },
  ];

  // Auto-play through steps
  useEffect(() => {
    if (!isPlaying || !alert) return;
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % steps.length);
    }, 2400);
    return () => clearInterval(interval);
  }, [isPlaying, alert, steps.length]);

  // Live Canvas Waveform Visualization
  useEffect(() => {
    if (!alert) return;
    let animId: number;
    let t = 0;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      t += 0.05;
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      // Draw grid
      ctx.strokeStyle = '#083344';
      ctx.lineWidth = 0.5;
      for (let x = 0; x < width; x += 20) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      // Draw baseline wave
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (let x = 0; x < width; x++) {
        const y = height / 2 + Math.sin(x * 0.04 + t) * 12 + Math.cos(x * 0.015 - t * 0.5) * 8;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Draw active anomaly excitation pulse
      ctx.strokeStyle = currentStep >= 2 ? '#10b981' : '#ef4444';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      for (let x = 0; x < width; x++) {
        const pulse =
          Math.sin(x * 0.08 + t * 2) * (currentStep === 1 ? 26 : currentStep === 2 ? 6 : 14);
        const y = height / 2 + pulse;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [alert, currentStep]);

  if (!alert) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#050914] border border-cyan-500/50 rounded-xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl hud-corner overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-cyan-950 flex items-start justify-between bg-black/40">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded bg-cyan-950/80 border border-cyan-500 text-cyan-400">
              <Activity className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-700 px-2 py-0.5 rounded uppercase">
                  VISUAL INCIDENT DISSECTOR (QEL-T FORENSICS)
                </span>
                <span className="text-xs font-mono text-slate-400">
                  Target: <strong className="text-white">{alert.targetIp}</strong>
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white font-heading mt-0.5">
                {alert.title}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 font-mono text-xs">
          {/* Real-time Oscilloscope Waveform Canvas */}
          <div className="bg-[#02050c] border border-cyan-950 rounded-lg p-3 relative">
            <div className="flex items-center justify-between text-[11px] mb-2 text-slate-400">
              <span className="flex items-center gap-1.5 text-cyan-300 font-bold">
                <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                <span>SPECTRAL RESONANCE OSCILLOSCOPE (3-6-9 TESLA HARMONICS)</span>
              </span>
              <span className="text-[10px] text-slate-500">
                Frequency: 240.6 Hz | Lyapunov Stability: 0.963
              </span>
            </div>
            <canvas
              ref={canvasRef}
              width={760}
              height={90}
              className="w-full h-24 rounded bg-black/60 border border-slate-900"
            />
          </div>

          {/* Step Timeline Scrubber */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-slate-300 font-bold flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-cyan-400" />
                <span>KILL-CHAIN TIMELINE DISSECTION ({currentStep + 1} of {steps.length})</span>
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 border border-cyan-800 text-cyan-300 flex items-center gap-1 text-[11px] font-bold"
                >
                  {isPlaying ? (
                    <>
                      <Pause className="w-3 h-3" />
                      <span>Pause Timeline</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3 h-3" />
                      <span>Play Animation</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => {
                    setCurrentStep(0);
                    soundFx.playClick();
                  }}
                  className="p-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-400 hover:text-white"
                  title="Rewind to start"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Stepper Buttons */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {steps.map((st, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setCurrentStep(idx);
                    soundFx.playClick();
                  }}
                  className={`p-2.5 rounded text-left border transition-all ${
                    currentStep === idx
                      ? 'bg-cyan-950/70 border-cyan-400 shadow-md shadow-cyan-950'
                      : 'bg-black/40 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>STEP 0{idx + 1}</span>
                    <span className="font-bold text-cyan-300">{st.timeOffset}</span>
                  </div>
                  <div className="text-white font-bold text-xs mt-1 truncate">{st.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Active Step Deep-Dive Comparison Card */}
          <div className="bg-black/60 border border-cyan-950 rounded-xl p-4 sm:p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div>
                <span
                  className={`text-[9px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${steps[currentStep].badgeColor}`}
                >
                  {steps[currentStep].badge}
                </span>
                <h4 className="text-sm font-bold text-white mt-1">
                  {steps[currentStep].label} ({steps[currentStep].timeOffset})
                </h4>
              </div>
              <span className="text-slate-400 text-xs">{steps[currentStep].description}</span>
            </div>

            {/* Side-by-side: QEL vs Legacy */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              {/* QEL Action */}
              <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-500/60 space-y-2">
                <div className="flex items-center gap-2 text-emerald-400 font-bold">
                  <ShieldCheck className="w-4 h-4" />
                  <span>QEL NEXUS AUTONOMOUS RESPONSE (0.04 ms)</span>
                </div>
                <p className="text-slate-200 text-xs leading-relaxed">
                  {steps[currentStep].qelAction}
                </p>
                <div className="text-[10px] text-emerald-400 font-semibold pt-1">
                  ✓ Kill-chain neutralized before memory allocation.
                </div>
              </div>

              {/* Legacy Competitor Action */}
              <div className="p-3 rounded-lg bg-red-950/20 border border-red-700/60 space-y-2">
                <div className="flex items-center gap-2 text-red-400 font-bold">
                  <AlertTriangle className="w-4 h-4" />
                  <span>TRADITIONAL SIEM / EDR PIPELINE (Minutes Delay)</span>
                </div>
                <p className="text-slate-300 text-xs leading-relaxed">
                  {steps[currentStep].competitorAction}
                </p>
                <div className="text-[10px] text-red-400 font-semibold pt-1">
                  ⚠ 24-minute window allows lateral penetration &amp; exfiltration.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-cyan-950 flex flex-wrap items-center justify-between gap-3 bg-black/60 font-mono text-xs">
          <div className="text-slate-400 text-[11px]">
            Mitre Tactic:{' '}
            <strong className="text-cyan-300 font-bold">{alert.mitreTactic || 'Initial Access'}</strong>{' '}
            | ID: <strong className="text-cyan-300">{alert.mitreId || 'T1190'}</strong>
          </div>

          <div className="flex items-center gap-2">
            {onExecutePlaybook && alert.status !== 'RESOLVED' && (
              <button
                onClick={() => {
                  soundFx.playAlert();
                  onExecutePlaybook(alert.recommendedPlaybook || 'ISOLATE_IP', alert.targetIp);
                  onClose();
                }}
                className="px-4 py-1.5 rounded bg-red-600 hover:bg-red-500 text-white font-bold flex items-center gap-1.5 shadow-md shadow-red-950 transition"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Execute Remediation Playbook</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 transition"
            >
              Close Dissector
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
