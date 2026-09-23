import React from 'react';
import {
  Shield,
  Radio,
  Volume2,
  VolumeX,
  LogIn,
  LogOut,
  FileText,
  Database,
  UserCheck,
  BookOpen,
  PlayCircle,
  LayoutDashboard,
  ShieldAlert,
  Atom,
  GraduationCap,
  Sparkles,
  Network,
  Swords,
  Activity,
} from 'lucide-react';
import { User } from 'firebase/auth';
import { soundFx } from '../lib/audio.ts';

export type DashboardView =
  | 'OVERVIEW'
  | 'SOAR'
  | 'INTEGRATIONS'
  | 'BENCHMARK'
  | 'PHYSICS'
  | 'TRAINING';

interface HeaderHUDProps {
  totalEntropy: number;
  activeView: DashboardView;
  onChangeView: (view: DashboardView) => void;
  activeAlertCount: number;
  criticalAlertCount: number;
  user: User | null;
  onLogin: () => void;
  onLogout: () => void;
  onOpenExportModal: () => void;
  onOpenEntropyDashboard?: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  isConnectedFirestore: boolean;
  isStreaming: boolean;
  autopilotEnabled: boolean;
  onToggleAutopilot: () => void;
}

export const HeaderHUD: React.FC<HeaderHUDProps> = ({
  totalEntropy,
  activeView,
  onChangeView,
  activeAlertCount,
  criticalAlertCount,
  user,
  onLogin,
  onLogout,
  onOpenExportModal,
  onOpenEntropyDashboard,
  soundEnabled,
  onToggleSound,
  isConnectedFirestore,
  isStreaming,
  autopilotEnabled,
  onToggleAutopilot,
}) => {
  const [timeStr, setTimeStr] = React.useState('');

  React.useEffect(() => {
    const update = () => {
      const now = new Date();
      setTimeStr(
        now.toTimeString().split(' ')[0] + '.' + String(now.getMilliseconds()).padStart(3, '0')
      );
    };
    update();
    const timer = setInterval(update, 100);
    return () => clearInterval(timer);
  }, []);

  const deflectionRate = Math.min(
    99.8,
    Math.max(35, Math.round((100 - totalEntropy / 8) * 10) / 10)
  );

  return (
    <header className="border-b border-cyan-500/30 bg-[#050813]/95 backdrop-blur-md sticky top-0 z-30 shadow-2xl">
      {/* Top Protocol Status Ticker */}
      <div className="bg-black/70 border-b border-cyan-950/60 px-4 py-1 text-[11px] font-mono flex flex-wrap items-center justify-between text-slate-400 gap-2">
        <div className="flex items-center gap-3">
          <span className="text-cyan-400 font-bold tracking-wider flex items-center gap-1.5">
            <span className="inline-block w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
            ECHO &amp; WITNESS PROTOCOL v13.0
          </span>
          <span className="hidden sm:inline text-slate-700">│</span>
          <span className="hidden md:inline text-emerald-400">
            ARCHITECT: <strong className="text-emerald-300 font-semibold">TAYLOR RYAN CLARK</strong>
          </span>
          <span className="hidden sm:inline text-slate-700">│</span>
          <span className="text-cyan-300 hidden sm:inline">
            STATUS:{' '}
            <strong className="text-cyan-200 font-semibold tracking-wide glow-cyan">
              RESURRECTION ACTIVE
            </strong>
          </span>
        </div>

        <div className="flex items-center gap-3 ml-auto sm:ml-0">
          <div className="flex items-center gap-1.5 text-xs text-slate-300">
            <span className="text-slate-500">SYS_TIME:</span>
            <span className="text-cyan-400 font-mono">{timeStr}</span>
          </div>
          <span className="text-slate-700">│</span>
          <div className="flex items-center gap-1 text-[10px]">
            <Database
              className={`w-3 h-3 ${isConnectedFirestore ? 'text-emerald-400' : 'text-amber-400'}`}
            />
            <span className={isConnectedFirestore ? 'text-emerald-400' : 'text-amber-400'}>
              {isConnectedFirestore ? 'FIRESTORE' : 'SYNCING'}
            </span>
          </div>
          <div className="flex items-center gap-1 text-[10px]">
            <Radio
              className={`w-3 h-3 ${isStreaming ? 'text-cyan-400 animate-pulse' : 'text-slate-500'}`}
            />
            <span className={isStreaming ? 'text-cyan-400' : 'text-slate-500'}>LIVE SSE</span>
          </div>
        </div>
      </div>

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex flex-wrap items-center justify-between gap-4">
        {/* Brand & Perimeter Status */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-9 h-9 rounded border border-cyan-500/50 bg-cyan-950/40 text-cyan-400 shadow-lg shadow-cyan-950/50 hud-corner flex-shrink-0">
            <Shield className="w-5 h-5 text-cyan-400" />
            <div className="absolute inset-0 rounded border border-cyan-400/20 animate-ping pointer-events-none opacity-20"></div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-bold tracking-wider text-white font-heading">
                QEL <span className="text-cyan-400">NEXUS</span>
              </h1>
              {criticalAlertCount > 0 ? (
                <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-red-950 text-red-300 border border-red-600 animate-pulse font-bold">
                  {criticalAlertCount} CRITICAL INTRUSION
                </span>
              ) : activeAlertCount > 0 ? (
                <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-600 font-bold">
                  {activeAlertCount} ACTIVE THREATS
                </span>
              ) : (
                <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-700/80 font-bold">
                  PERIMETER NOMINAL
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400 font-mono hidden sm:block">
              Quantum Entropy Lattice &amp; Automated Threat Defense
            </p>
          </div>
        </div>

        {/* Center Navigation Views: Seamless Mode Switcher */}
        <div className="flex items-center bg-black/60 border border-cyan-900/60 rounded-lg p-1 text-xs font-mono order-3 lg:order-2 w-full lg:w-auto justify-center">
          <button
            onClick={() => {
              soundFx.playClick();
              onChangeView('OVERVIEW');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition ${
              activeView === 'OVERVIEW'
                ? 'bg-cyan-950 text-cyan-200 border border-cyan-500/70 font-bold shadow-sm shadow-cyan-950'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Press [1] for Live Cockpit"
          >
            <LayoutDashboard className="w-3.5 h-3.5 text-cyan-400" />
            <span>Cockpit</span>
          </button>

          <button
            onClick={() => {
              soundFx.playClick();
              onChangeView('SOAR');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition relative ${
              activeView === 'SOAR'
                ? 'bg-cyan-950 text-cyan-200 border border-cyan-500/70 font-bold shadow-sm shadow-cyan-950'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Press [2] for Incident Response"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
            <span>Threats &amp; SOAR</span>
            {activeAlertCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-red-600 text-white font-bold ml-0.5">
                {activeAlertCount}
              </span>
            )}
          </button>

          <button
            onClick={() => {
              soundFx.playClick();
              onChangeView('INTEGRATIONS');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition ${
              activeView === 'INTEGRATIONS'
                ? 'bg-cyan-950 text-cyan-200 border border-cyan-500/70 font-bold shadow-sm shadow-cyan-950'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Press [3] for Enterprise Integrations (Splunk, CrowdStrike, Cortex, Sentinel)"
          >
            <Network className="w-3.5 h-3.5 text-cyan-400" />
            <span>Integrations</span>
            <span className="px-1.5 py-0.2 rounded text-[9px] bg-cyan-900 text-cyan-200 font-bold">
              8
            </span>
          </button>

          <button
            onClick={() => {
              soundFx.playClick();
              onChangeView('BENCHMARK');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition ${
              activeView === 'BENCHMARK'
                ? 'bg-cyan-950 text-cyan-200 border border-cyan-500/70 font-bold shadow-sm shadow-cyan-950'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Press [4] for Competitor Battlecard, Kill-Chain Topology & TCO Calculator"
          >
            <Swords className="w-3.5 h-3.5 text-red-400" />
            <span>vs Competitors</span>
            <span className="px-1.5 py-0.2 rounded text-[9px] bg-red-950 text-red-300 border border-red-700 font-bold">
              TCO / ROI
            </span>
          </button>

          <button
            onClick={() => {
              soundFx.playClick();
              onChangeView('PHYSICS');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition ${
              activeView === 'PHYSICS'
                ? 'bg-cyan-950 text-cyan-200 border border-cyan-500/70 font-bold shadow-sm shadow-cyan-950'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Press [5] for Resonance Lattice"
          >
            <Atom className="w-3.5 h-3.5 text-emerald-400" />
            <span>Resonance Lab</span>
          </button>

          <button
            onClick={() => {
              soundFx.playClick();
              onChangeView('TRAINING');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition ${
              activeView === 'TRAINING'
                ? 'bg-cyan-950 text-cyan-200 border border-cyan-500/70 font-bold shadow-sm shadow-cyan-950'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Press [6] for Drills & Knowledge Base"
          >
            <GraduationCap className="w-3.5 h-3.5 text-purple-400" />
            <span>Academy</span>
          </button>
        </div>

        {/* Right Action Controls */}
        <div className="flex items-center gap-2 order-2 lg:order-3">
          {/* Autonomous SOAR / Autopilot Toggle */}
          <button
            onClick={() => {
              soundFx.playClick();
              onToggleAutopilot();
            }}
            className={`px-2.5 py-1.5 rounded border text-xs font-mono font-bold flex items-center gap-1.5 transition ${
              autopilotEnabled
                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500 shadow-sm shadow-emerald-950'
                : 'bg-black/50 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
            title="When active, critical threats are automatically neutralized in real-time"
          >
            <Sparkles
              className={`w-3.5 h-3.5 ${autopilotEnabled ? 'text-emerald-400 animate-spin' : 'text-slate-500'}`}
            />
            <span className="hidden sm:inline">Autopilot:</span>
            <span>{autopilotEnabled ? 'ACTIVE' : 'OFF'}</span>
          </button>

          {/* Sound FX Toggle */}
          <button
            onClick={() => {
              onToggleSound();
              soundFx.playClick();
            }}
            title={soundEnabled ? 'Mute Audio FX' : 'Enable Audio FX'}
            className={`p-2 rounded border transition ${
              soundEnabled
                ? 'border-cyan-500 bg-cyan-950/60 text-cyan-300'
                : 'border-slate-800 bg-slate-900/60 text-slate-500 hover:text-slate-300'
            }`}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Quantum Entropy Dashboard (60m) */}
          {onOpenEntropyDashboard && (
            <button
              onClick={() => {
                soundFx.playClick();
                onOpenEntropyDashboard();
              }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-purple-950/80 hover:bg-purple-900 border border-purple-500/60 text-purple-200 text-xs font-mono font-medium transition shadow-sm"
              title="Open 60-Minute Quantum Entropy Dashboard (Recharts Decay & Frequency Spikes)"
            >
              <Activity className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
              <span className="hidden sm:inline">Entropy (60m)</span>
              <span className="px-1.5 py-0.2 rounded bg-purple-900 text-purple-300 font-bold text-[10px]">
                {totalEntropy.toFixed(1)}
              </span>
            </button>
          )}

          {/* Export to Google Docs & Drive */}
          <button
            onClick={() => {
              soundFx.playClick();
              onOpenExportModal();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/60 text-emerald-300 text-xs font-mono font-medium transition shadow-sm"
            title="Export full threat analysis and audit trail to Google Docs & Drive"
          >
            <FileText className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden md:inline">Docs Dossier</span>
          </button>

          {/* Google Account Auth */}
          {user ? (
            <div className="flex items-center gap-2 bg-slate-900/80 border border-slate-700/80 px-2 py-1 rounded">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'User'}
                  className="w-5 h-5 rounded-full border border-cyan-500/40"
                />
              ) : (
                <div className="w-5 h-5 rounded-full bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-300 text-[10px]">
                  <UserCheck className="w-3 h-3" />
                </div>
              )}
              <div className="hidden xl:block text-left">
                <div className="text-[10px] text-white font-medium truncate max-w-[80px]">
                  {user.displayName || user.email?.split('@')[0]}
                </div>
              </div>
              <button
                onClick={() => {
                  soundFx.playClick();
                  onLogout();
                }}
                title="Disconnect Google Account"
                className="p-1 text-slate-400 hover:text-red-400 transition"
              >
                <LogOut className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                soundFx.playClick();
                onLogin();
              }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-white text-slate-800 hover:bg-slate-100 text-xs font-medium transition shadow-md"
            >
              <svg className="w-3 h-3" viewBox="0 0 48 48">
                <path
                  fill="#EA4335"
                  d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                />
                <path
                  fill="#4285F4"
                  d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                />
                <path
                  fill="#FBBC05"
                  d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                />
                <path
                  fill="#34A853"
                  d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                />
              </svg>
              <span className="hidden sm:inline">Google Auth</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
