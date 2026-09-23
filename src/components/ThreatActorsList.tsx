import React, { useState } from 'react';
import { ShieldX, ShieldCheck, Globe, Target, Search, Filter, AlertTriangle } from 'lucide-react';
import { soundFx } from '../lib/audio.ts';

interface ThreatActorsListProps {
  profiles: Record<
    string,
    { hits: number; last: string; lastSeen: string; isQuarantined: boolean; threatScore: number; country: string }
  >;
  onToggleQuarantine: (ip: string) => void;
  onInspectActor?: (ip: string, lastAction: string) => void;
  onQuarantineAllHostile?: () => void;
}

export const ThreatActorsList: React.FC<ThreatActorsListProps> = ({
  profiles,
  onToggleQuarantine,
  onInspectActor,
  onQuarantineAllHostile,
}) => {
  const [filterMode, setFilterMode] = useState<'ALL' | 'HOSTILE' | 'QUARANTINED'>('ALL');

  const allEntries = Object.entries(profiles).sort((a, b) => b[1].threatScore - a[1].threatScore);

  const filteredEntries = allEntries.filter(([ip, data]) => {
    if (filterMode === 'HOSTILE') return data.threatScore >= 40;
    if (filterMode === 'QUARANTINED') return data.isQuarantined;
    return true;
  });

  const hostileUnquarantinedCount = allEntries.filter(
    ([_, data]) => data.threatScore >= 50 && !data.isQuarantined
  ).length;

  return (
    <div className="bg-[#070b18]/90 border border-cyan-500/30 rounded-lg p-4 hud-corner shadow-xl space-y-3">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between border-b border-cyan-950 pb-3 gap-2">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-cyan-400" />
          <h2 className="text-sm sm:text-base font-bold tracking-wider text-white font-heading uppercase">
            Active Targets &amp; Threat Profiles
          </h2>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          {/* Filter Pills */}
          <div className="flex items-center bg-black/50 border border-cyan-950 rounded p-0.5 text-[10px]">
            <button
              onClick={() => setFilterMode('ALL')}
              className={`px-2 py-0.5 rounded transition ${
                filterMode === 'ALL'
                  ? 'bg-cyan-900 text-cyan-200 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All ({allEntries.length})
            </button>
            <button
              onClick={() => setFilterMode('HOSTILE')}
              className={`px-2 py-0.5 rounded transition ${
                filterMode === 'HOSTILE'
                  ? 'bg-cyan-900 text-cyan-200 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Hostile ({allEntries.filter(([_, d]) => d.threatScore >= 40).length})
            </button>
            <button
              onClick={() => setFilterMode('QUARANTINED')}
              className={`px-2 py-0.5 rounded transition ${
                filterMode === 'QUARANTINED'
                  ? 'bg-cyan-900 text-cyan-200 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Quarantined ({allEntries.filter(([_, d]) => d.isQuarantined).length})
            </button>
          </div>

          {/* 1-Click Quarantine All Hostile */}
          {hostileUnquarantinedCount > 0 && onQuarantineAllHostile && (
            <button
              onClick={() => {
                soundFx.playAlert();
                onQuarantineAllHostile();
              }}
              className="px-2.5 py-1 rounded bg-red-950/80 hover:bg-red-900 text-red-300 border border-red-600 text-[10px] font-bold flex items-center gap-1 transition"
              title="Autonomous containment of all high-risk hosts"
            >
              <ShieldX className="w-3 h-3" />
              <span>Quarantine All ({hostileUnquarantinedCount})</span>
            </button>
          )}
        </div>
      </div>

      {/* Target Profiles List */}
      <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
        {filteredEntries.length === 0 ? (
          <div className="text-center py-8 text-slate-500 font-mono text-xs border border-dashed border-slate-900 rounded">
            No adversary profiles mapped in this category. Perimeter clear.
          </div>
        ) : (
          filteredEntries.map(([ip, data]) => {
            const isQuarantined = data.isQuarantined;
            const isHostile = data.threatScore >= 60;
            const isSuspicious = data.threatScore >= 30;

            return (
              <div
                key={ip}
                className={`p-2.5 rounded-lg border transition-all font-mono text-xs flex flex-wrap items-center justify-between gap-2 ${
                  isQuarantined
                    ? 'bg-red-950/20 border-red-800/60'
                    : isHostile
                    ? 'bg-amber-950/15 border-amber-700/50 hover:border-amber-500'
                    : 'bg-black/50 border-cyan-950/80 hover:border-cyan-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-slate-500 text-[10px] font-bold">[{data.country || 'GL'}]</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-100 tracking-wide text-xs">{ip}</span>
                      {isQuarantined && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-red-950 text-red-300 border border-red-700 font-bold">
                          QUARANTINED
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                      <span>
                        Hits: <strong className="text-cyan-300">{data.hits.toString().padStart(4, '0')}</strong>
                      </span>
                      <span>│</span>
                      <span>
                        Last: <strong className="text-emerald-400">{data.last}</strong>
                      </span>
                      <span>│</span>
                      <span>
                        Threat:{' '}
                        <strong
                          className={
                            data.threatScore > 60
                              ? 'text-red-400'
                              : data.threatScore > 30
                              ? 'text-amber-400'
                              : 'text-emerald-400'
                          }
                        >
                          {data.threatScore}%
                        </strong>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Threat Bar & Actions */}
                <div className="flex items-center gap-2">
                  <div className="w-16 hidden sm:block">
                    <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden border border-slate-800">
                      <div
                        className={`h-full rounded-full ${
                          data.threatScore > 60
                            ? 'bg-red-500'
                            : data.threatScore > 30
                            ? 'bg-amber-400'
                            : 'bg-emerald-400'
                        }`}
                        style={{ width: `${Math.min(100, data.threatScore)}%` }}
                      />
                    </div>
                  </div>

                  {onInspectActor && (
                    <button
                      onClick={() => {
                        soundFx.playClick();
                        onInspectActor(ip, data.last);
                      }}
                      className="px-2 py-1 rounded text-[10px] bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 flex items-center gap-1 transition"
                      title="Inspect threat profile and MITRE tactics"
                    >
                      <Search className="w-3 h-3 text-cyan-400" />
                      <span>Inspect</span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      soundFx.playClick();
                      onToggleQuarantine(ip);
                    }}
                    className={`px-2.5 py-1 rounded text-[10px] font-bold border flex items-center gap-1 transition ${
                      isQuarantined
                        ? 'bg-emerald-950/80 text-emerald-300 border-emerald-600 hover:bg-emerald-900'
                        : 'bg-red-950/80 text-red-300 border-red-700 hover:bg-red-900'
                    }`}
                  >
                    {isQuarantined ? (
                      <>
                        <ShieldCheck className="w-3 h-3" />
                        <span>Release</span>
                      </>
                    ) : (
                      <>
                        <ShieldX className="w-3 h-3" />
                        <span>Quarantine</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
