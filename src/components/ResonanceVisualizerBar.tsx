import React, { useState, useEffect, useRef } from 'react';
import {
  Volume2,
  VolumeX,
  Radio,
  Zap,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Activity,
} from 'lucide-react';
import { soundFx } from '../lib/audio.ts';

interface ResonanceVisualizerBarProps {
  lattice: number[];
  entropy: number;
  rotation: number;
  onNodePulse?: (nodeIdx: number) => void;
  onOpenEntropyDashboard?: () => void;
}

export const ResonanceVisualizerBar: React.FC<ResonanceVisualizerBarProps> = ({
  lattice,
  entropy,
  rotation,
  onNodePulse,
  onOpenEntropyDashboard,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [selectedNode, setSelectedNode] = useState<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Audio tone generation for 3-6-9 Tesla frequencies
  const audioCtxRef = useRef<AudioContext | null>(null);

  const toggleAudio = () => {
    if (!audioEnabled) {
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
          audioCtxRef.current = new AudioContextClass();
        }
      } catch (e) {}
      setAudioEnabled(true);
      soundFx.playPulse(6);
    } else {
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {});
        audioCtxRef.current = null;
      }
      setAudioEnabled(false);
    }
  };

  // Canvas visualizer animation
  useEffect(() => {
    let animId: number;
    let frame = 0;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      frame++;
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      // Draw 12 dynamic visualizer bars corresponding to lattice nodes
      const barWidth = w / 12 - 2;
      for (let i = 0; i < 12; i++) {
        const val = lattice[i] || 0;
        const normalized = Math.min(1, val / 60);
        const barHeight = Math.max(4, normalized * (h - 8) + Math.sin(frame * 0.08 + i) * 3);

        const isTeslaHarmonic = i === 3 || i === 6 || i === 9;
        ctx.fillStyle = isTeslaHarmonic
          ? '#06b6d4' // Electric Cyan
          : normalized > 0.6
          ? '#ef4444' // Critical Red
          : '#10b981'; // Emerald Green

        const x = i * (barWidth + 2) + 1;
        const y = h - barHeight - 2;

        ctx.fillRect(x, y, barWidth, barHeight);

        // Cap highlight
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x, y, barWidth, 1.5);
      }

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [lattice]);

  return (
    <div className="bg-[#050914] border border-cyan-500/30 rounded-lg p-2.5 sm:p-3 hud-corner shadow-lg font-mono text-xs">
      <div className="flex flex-wrap items-center justify-between gap-2">
        {/* Left: Indicator & Spectrum Preview */}
        <div className="flex items-center gap-2.5">
          <div className="p-1 rounded bg-cyan-950/80 border border-cyan-500/70 text-cyan-400">
            <Radio className="w-3.5 h-3.5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-cyan-300 uppercase tracking-wider">
                HARMONIC SPECTRUM BUS
              </span>
              <span className="text-[10px] text-slate-500">
                Tesla 3-6-9 Phase Angle: <strong className="text-white">{rotation}°</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Center: Real-time Canvas Mini-Spectrum */}
        <div className="flex-1 max-w-xs hidden sm:block">
          <canvas
            ref={canvasRef}
            width={240}
            height={24}
            className="w-full h-6 rounded bg-black/60 border border-cyan-950"
            title="Real-time 12-node quantum harmonic spectrum"
          />
        </div>

        {/* Right: Audio Toggle & Expand */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleAudio}
            className={`px-2 py-1 rounded text-[11px] font-bold border transition flex items-center gap-1 ${
              audioEnabled
                ? 'bg-cyan-950 text-cyan-300 border-cyan-500 shadow-sm shadow-cyan-950'
                : 'bg-black/60 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
            title="Toggle audible acoustic harmonic feedback (Web Audio)"
          >
            {audioEnabled ? (
              <>
                <Volume2 className="w-3 h-3 text-cyan-400" />
                <span>Audio Active</span>
              </>
            ) : (
              <>
                <VolumeX className="w-3 h-3 text-slate-500" />
                <span>Audio Muted</span>
              </>
            )}
          </button>

          {onOpenEntropyDashboard && (
            <button
              onClick={() => {
                soundFx.playClick();
                onOpenEntropyDashboard();
              }}
              className="px-2.5 py-1 rounded bg-purple-950/80 hover:bg-purple-900 border border-purple-500/60 text-purple-200 text-[11px] font-bold flex items-center gap-1.5 transition shadow-sm"
              title="Open 60-Minute Quantum Entropy Dashboard & Decay Analytics"
            >
              <Activity className="w-3 h-3 text-purple-400 animate-pulse" />
              <span>Entropy Analytics (60m)</span>
            </button>
          )}

          <button
            onClick={() => {
              soundFx.playClick();
              setIsExpanded(!isExpanded);
            }}
            className="px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-[11px] font-bold flex items-center gap-1 transition"
          >
            <span>{isExpanded ? 'Hide Frequencies' : '12-Phase Matrix'}</span>
            {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>
      </div>

      {/* Expanded 12-Node Harmonic Inspector */}
      {isExpanded && (
        <div className="mt-3 pt-3 border-t border-cyan-950 space-y-3 animate-in fade-in duration-200">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>Click any node to observe its resonant Tesla frequency and inject an excitation pulse:</span>
            <span className="text-cyan-300 font-bold">Total Entropy: {entropy.toFixed(2)}</span>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-12 gap-1.5">
            {lattice.map((val, idx) => {
              const isTesla = idx === 3 || idx === 6 || idx === 9;
              const freq = (36.9 * (idx + 1)).toFixed(1);
              const isSelected = selectedNode === idx;

              return (
                <button
                  key={idx}
                  onClick={() => {
                    setSelectedNode(idx);
                    soundFx.playPulse(isTesla ? 9 : 3);
                    if (onNodePulse) onNodePulse(idx);
                  }}
                  className={`p-1.5 rounded border text-center transition flex flex-col justify-between ${
                    isSelected
                      ? 'bg-cyan-900/60 border-cyan-400 shadow-md shadow-cyan-950'
                      : isTesla
                      ? 'bg-cyan-950/40 border-cyan-700/60 hover:border-cyan-400'
                      : 'bg-black/50 border-slate-800 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center justify-between text-[9px] text-slate-400">
                    <span className="font-bold">[{idx.toString().padStart(2, '0')}]</span>
                    {isTesla && <span className="text-cyan-400 font-bold">369</span>}
                  </div>
                  <div
                    className={`text-xs font-bold my-1 ${
                      val > 40 ? 'text-red-400' : isTesla ? 'text-cyan-300' : 'text-emerald-400'
                    }`}
                  >
                    {val.toFixed(1)}
                  </div>
                  <div className="text-[8px] text-slate-500 font-mono">{freq}Hz</div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
