import React, { useState } from 'react';
import {
  PlayCircle,
  CheckCircle,
  XCircle,
  HelpCircle,
  ShieldAlert,
  ArrowRight,
  RotateCcw,
  Sparkles,
  X,
} from 'lucide-react';
import { INTERACTIVE_SCENARIOS, PLAYBOOK_EXPLANATIONS } from '../lib/threatKnowledge.ts';
import { InteractiveDrillScenario } from '../types.ts';
import { soundFx } from '../lib/audio.ts';

interface InteractiveDrillModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDrillAction: (vector: string, playbookCode: string, ip: string) => void;
}

export const InteractiveDrillModal: React.FC<InteractiveDrillModalProps> = ({
  isOpen,
  onClose,
  onDrillAction,
}) => {
  const [currentScenarioIndex, setCurrentScenarioIndex] = useState(0);
  const [selectedPlaybook, setSelectedPlaybook] = useState<string | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  if (!isOpen) return null;

  const scenario = INTERACTIVE_SCENARIOS[currentScenarioIndex];
  const isCorrect = selectedPlaybook === scenario.idealResponse;

  const handleSubmitChoice = () => {
    if (!selectedPlaybook) return;
    setHasSubmitted(true);
    if (selectedPlaybook === scenario.idealResponse) {
      soundFx.playPulse(9);
      setScore((s) => s + 100);
      onDrillAction(scenario.vector, selectedPlaybook, scenario.attackerIp);
    } else {
      soundFx.playAlert();
      onDrillAction(scenario.vector, selectedPlaybook, scenario.attackerIp);
    }
  };

  const handleNext = () => {
    setSelectedPlaybook(null);
    setHasSubmitted(false);
    if (currentScenarioIndex < INTERACTIVE_SCENARIOS.length - 1) {
      setCurrentScenarioIndex((i) => i + 1);
    } else {
      // Completed all drills
      setCurrentScenarioIndex(0);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl bg-[#080d1a] border border-cyan-500/40 rounded-lg p-6 shadow-2xl hud-corner">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-cyan-950 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded bg-cyan-950/70 border border-cyan-600/70 text-cyan-400">
              <PlayCircle className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-800 px-1.5 py-0.5 rounded">
                  TACTICAL DRILL {currentScenarioIndex + 1} OF {INTERACTIVE_SCENARIOS.length}
                </span>
                <span className="text-xs font-mono text-emerald-400 font-semibold">
                  Training Score: {score} PTS
                </span>
              </div>
              <h2 className="text-lg font-bold text-white font-heading mt-1">{scenario.title}</h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scenario Body */}
        <div className="space-y-4 text-xs font-mono">
          {/* Threat Brief */}
          <div className="bg-black/50 border border-cyan-950 p-3.5 rounded space-y-2">
            <div>
              <span className="text-cyan-400 font-bold block mb-0.5">› Situation Briefing:</span>
              <p className="text-slate-200 leading-relaxed">{scenario.brief}</p>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 pt-1 border-t border-cyan-950/60">
              <span>
                Simulated Attacker IP: <strong className="text-white">{scenario.attackerIp}</strong>
              </span>
              <span>•</span>
              <span>
                Detection Clue: <strong className="text-amber-300">{scenario.detectionClue}</strong>
              </span>
            </div>
          </div>

          {/* Operational Risk */}
          <div className="bg-amber-950/20 border border-amber-900/40 p-3 rounded text-amber-200">
            <strong className="text-amber-400 block mb-0.5">Why This Is Dangerous:</strong>
            {scenario.whyDangerous}
          </div>

          {/* Playbook Options */}
          <div>
            <span className="text-slate-300 font-bold block mb-2">
              Select the optimal incident response playbook to eliminate this threat:
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {Object.entries(PLAYBOOK_EXPLANATIONS).map(([code, p]) => {
                const isSelected = selectedPlaybook === code;
                return (
                  <button
                    key={code}
                    disabled={hasSubmitted}
                    onClick={() => {
                      soundFx.playClick();
                      setSelectedPlaybook(code);
                    }}
                    className={`p-3 rounded text-left border transition ${
                      isSelected
                        ? 'bg-cyan-950 border-cyan-400 text-white font-bold'
                        : 'bg-black/40 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                    } disabled:opacity-75`}
                  >
                    <div className="font-bold text-xs mb-1">{p.name}</div>
                    <div className="text-[10px] text-slate-400 leading-snug">{p.whatItDoes}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Feedback & Educational Explanations upon submission */}
          {hasSubmitted && (
            <div
              className={`p-4 rounded border ${
                isCorrect
                  ? 'bg-emerald-950/40 border-emerald-500 text-emerald-200'
                  : 'bg-amber-950/40 border-amber-500 text-amber-200'
              } space-y-2 animate-in fade-in`}
            >
              <div className="flex items-center gap-2">
                {isCorrect ? (
                  <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                ) : (
                  <XCircle className="w-5 h-5 text-amber-400 flex-shrink-0" />
                )}
                <div>
                  <strong className="text-white block text-sm">
                    {isCorrect ? 'Outstanding Decision! (+100 PTS)' : 'Playbook Executed (Sub-Optimal Selection)'}
                  </strong>
                  <span className="text-xs">
                    {isCorrect
                      ? 'You correctly selected the ideal remediation action for this attack vector.'
                      : `The ideal tactical choice for this scenario was ${scenario.idealResponse}.`}
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-700/50 text-[11px] text-slate-200">
                <strong className="text-white block mb-0.5">Why this works:</strong>
                {scenario.explanation}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-3 border-t border-cyan-950">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-mono"
            >
              Exit Drill
            </button>

            {!hasSubmitted ? (
              <button
                onClick={handleSubmitChoice}
                disabled={!selectedPlaybook}
                className="px-5 py-2 rounded bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs font-mono shadow-lg shadow-cyan-950 transition disabled:opacity-50"
              >
                Execute Choice &amp; Learn Why
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="px-5 py-2 rounded bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs font-mono shadow-lg shadow-emerald-950 transition flex items-center gap-1.5"
              >
                <span>
                  {currentScenarioIndex < INTERACTIVE_SCENARIOS.length - 1
                    ? 'Next Scenario'
                    : 'Restart Drill Cycle'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
