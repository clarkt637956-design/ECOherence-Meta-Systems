import React, { useState, useEffect, useCallback, useRef } from 'react';
import { User } from 'firebase/auth';
import {
  initAuth,
  googleSignIn,
  logout,
  getAccessToken,
  testFirestoreConnection,
  persistPulseToFirestore,
  persistAlertToFirestore,
} from './lib/firebase.ts';
import { QELNexusEngine, globalQelEngine } from './lib/qelCore.ts';
import { QELState, SecurityAlert, TelemetryPulse, AlertStatus, CyberAction } from './types.ts';
import { HeaderHUD, DashboardView } from './components/HeaderHUD.tsx';
import { GuidedWorkflowBanner } from './components/GuidedWorkflowBanner.tsx';
import { DerivativesHUD } from './components/DerivativesHUD.tsx';
import { LatticeMatrix } from './components/LatticeMatrix.tsx';
import { VortexSpiral } from './components/VortexSpiral.tsx';
import { SignalInjector } from './components/SignalInjector.tsx';
import { AlertsAndSOAR } from './components/AlertsAndSOAR.tsx';
import { ThreatActorsList } from './components/ThreatActorsList.tsx';
import { WorkspaceExportModal } from './components/WorkspaceExportModal.tsx';
import { ThreatInvestigationModal } from './components/ThreatInvestigationModal.tsx';
import { KnowledgeBaseModal } from './components/KnowledgeBaseModal.tsx';
import { InteractiveDrillModal } from './components/InteractiveDrillModal.tsx';
import { IntegrationsHub } from './components/IntegrationsHub.tsx';
import { CompetitorBattlecard } from './components/CompetitorBattlecard.tsx';
import { HUDToast, ToastMessage } from './components/HUDToast.tsx';
import { VisualIncidentDissectorModal } from './components/VisualIncidentDissectorModal.tsx';
import { ResonanceVisualizerBar } from './components/ResonanceVisualizerBar.tsx';
import { QuantumEntropyDashboardModal } from './components/QuantumEntropyDashboardModal.tsx';
import { soundFx } from './lib/audio.ts';
import {
  Activity,
  ShieldCheck,
  Terminal,
  Radio,
  ExternalLink,
  Zap,
  Sparkles,
  Layers,
  BookOpen,
  PlayCircle,
  HelpCircle,
  ShieldAlert,
  Network,
  Swords,
} from 'lucide-react';
import { THREAT_KNOWLEDGE_BASE, PLAYBOOK_EXPLANATIONS } from './lib/threatKnowledge.ts';

export default function App() {
  const [engine] = useState<QELNexusEngine>(() => globalQelEngine);
  const [state, setState] = useState<QELState>(() => engine.getState());
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isConnectedFirestore, setIsConnectedFirestore] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isStressTesting, setIsStressTesting] = useState(false);
  const [dampingFactor, setDampingFactor] = useState(0.963);
  const [resonanceMultiplier, setResonanceMultiplier] = useState(3.69);

  // New Seamless Ergonomics States
  const [activeView, setActiveView] = useState<DashboardView>('OVERVIEW');
  const [autopilotEnabled, setAutopilotEnabled] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const [lastPulse, setLastPulse] = useState<{
    sig: number;
    phase: number;
    entropy: number;
    action: string;
    ip: string;
    hash: string;
  } | null>(null);

  // Educational & Investigation Modal States
  const [investigatingAlert, setInvestigatingAlert] = useState<SecurityAlert | null>(null);
  const [dissectAlert, setDissectAlert] = useState<SecurityAlert | null>(null);
  const [isEntropyDashboardOpen, setIsEntropyDashboardOpen] = useState(false);
  const [isKnowledgeBaseOpen, setIsKnowledgeBaseOpen] = useState(false);
  const [knowledgeBaseVector, setKnowledgeBaseVector] = useState<CyberAction | undefined>(undefined);
  const [isDrillsOpen, setIsDrillsOpen] = useState(false);

  // Toast notification helper
  const addToast = useCallback(
    (title: string, message: string, type: 'SUCCESS' | 'WARNING' | 'ALERT' | 'INFO' = 'INFO') => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      setToasts((prev) => [...prev, { id, title, message, type, timestamp: Date.now() }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4500);
    },
    []
  );

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Sync engine settings
  useEffect(() => {
    engine.dampingFactor = dampingFactor;
    engine.resonanceMultiplier = resonanceMultiplier;
  }, [dampingFactor, resonanceMultiplier, engine]);

  // Sound FX toggle
  const handleToggleSound = () => {
    soundFx.enabled = !soundEnabled;
    setSoundEnabled(!soundEnabled);
    addToast(
      soundEnabled ? 'Audio Muted' : 'Audio FX Enabled',
      soundEnabled
        ? 'Quantum harmonics audio feedback disabled.'
        : 'Harmonic resonance audio feedback initialized.',
      'INFO'
    );
  };

  // 1. Initialize Auth & Firestore
  useEffect(() => {
    testFirestoreConnection().then((connected) => {
      setIsConnectedFirestore(connected);
    });

    const unsubscribe = initAuth(
      (currentUser, token) => {
        setUser(currentUser);
        setAccessToken(token);
        if (currentUser) {
          addToast(
            'Google Workspace Connected',
            `Authenticated as ${currentUser.displayName || currentUser.email}. Direct Docs & Drive exports active.`,
            'SUCCESS'
          );
        }
      },
      () => {
        setUser(null);
        setAccessToken(null);
      }
    );

    return () => unsubscribe();
  }, [addToast]);

  // 2. Connect to Real-time Streaming SSE endpoint with fallback
  useEffect(() => {
    let eventSource: EventSource | null = null;

    try {
      eventSource = new EventSource('/api/v1/nexus/stream');
      eventSource.onopen = () => {
        setIsStreaming(true);
      };

      eventSource.addEventListener('init', (e: MessageEvent) => {
        try {
          const data = JSON.parse(e.data);
          if (data && Array.isArray(data.playbookLogs)) {
            const seen = new Set<string>();
            data.playbookLogs = data.playbookLogs.map((log: any, idx: number) => {
              let id = log.id;
              if (!id || seen.has(id)) id = `${id || 'pb'}-${idx}-${Date.now()}`;
              seen.add(id);
              return { ...log, id };
            });
          }
          if (data && Array.isArray(data.alerts)) {
            const seen = new Set<string>();
            data.alerts = data.alerts.map((alt: any, idx: number) => {
              let id = alt.id;
              if (!id || seen.has(id)) id = `${id || 'alt'}-${idx}-${Date.now()}`;
              seen.add(id);
              return { ...alt, id };
            });
          }
          setState(data);
        } catch (err) {}
      });

      eventSource.addEventListener('pulse', (e: MessageEvent) => {
        try {
          const data = JSON.parse(e.data);
          if (data.pulse) {
            setLastPulse({
              sig: data.sig,
              phase: data.phase,
              entropy: data.entropy,
              action: data.pulse.action,
              ip: data.pulse.ip,
              hash: data.pulse.hash,
            });
          }
          setState(engine.getState());
        } catch (err) {}
      });

      eventSource.addEventListener('playbook_executed', () => {
        setState(engine.getState());
      });

      eventSource.onerror = () => {
        setIsStreaming(false);
      };
    } catch (e) {}

    // Local state refresh loop (500ms)
    const syncInterval = setInterval(() => {
      setState(engine.getState());
    }, 500);

    return () => {
      if (eventSource) eventSource.close();
      clearInterval(syncInterval);
    };
  }, [engine]);

  // Google Login / Logout
  const handleLogin = async () => {
    try {
      const res = await googleSignIn();
      if (res) {
        setUser(res.user);
        setAccessToken(res.accessToken);
      }
    } catch (err: any) {
      console.error('Login prompt failure:', err);
    }
  };

  const handleLogout = async () => {
    await logout();
    setUser(null);
    setAccessToken(null);
    addToast('Disconnected', 'Google Account unlinked from QEL session.', 'INFO');
  };

  // Playbook execution handler
  const handleExecutePlaybook = useCallback(
    (playbookCode: string, targetIp: string) => {
      engine.executePlaybook(playbookCode, targetIp);
      setState(engine.getState());

      const expl = PLAYBOOK_EXPLANATIONS[playbookCode as keyof typeof PLAYBOOK_EXPLANATIONS];
      addToast(
        `SOAR Executed: ${expl?.name || playbookCode}`,
        `Action applied to ${targetIp}. ${expl?.whatItDoes || ''}`,
        'SUCCESS'
      );

      fetch('/api/v1/alerts/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playbookCode, targetIp }),
      }).catch(() => {});
    },
    [engine, addToast]
  );

  // 1-Click Neutralize
  const handleQuickNeutralize = useCallback(
    (alert: SecurityAlert) => {
      const code = alert.recommendedPlaybook || 'ISOLATE_IP';
      handleExecutePlaybook(code, alert.targetIp);

      // Auto resolve alert
      engine.alerts = engine.alerts.map((a) =>
        a.id === alert.id ? { ...a, status: 'RESOLVED', playbookExecuted: code } : a
      );
      setState(engine.getState());

      addToast(
        `Threat Neutralized: ${alert.title}`,
        `Applied ${code} to ${alert.targetIp}. Host isolated & perimeter secure.`,
        'SUCCESS'
      );
    },
    [engine, handleExecutePlaybook, addToast]
  );

  // Autonomous SOAR Autopilot monitor
  useEffect(() => {
    if (!autopilotEnabled) return;

    const unhandledCrit = state.alerts.find(
      (a) => (a.severity === 'CRITICAL' || a.severity === 'HIGH') && a.status === 'OPEN'
    );

    if (unhandledCrit) {
      const timer = setTimeout(() => {
        handleQuickNeutralize(unhandledCrit);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [autopilotEnabled, state.alerts, handleQuickNeutralize]);

  // Signal Injection Trigger
  const handleInjectSignal = async (ip: string, action: string) => {
    const res = await engine.processSignal(ip, action, true);
    setLastPulse({
      sig: res.sig,
      phase: res.phase,
      entropy: res.entropy,
      action,
      ip,
      hash: res.pulse.hash,
    });
    setState(engine.getState());

    persistPulseToFirestore(res.pulse);
    if (res.alertCreated) {
      persistAlertToFirestore(res.alertCreated);
      soundFx.playAlert();
      addToast(
        `⚠️ ${res.alertCreated.severity}: ${res.alertCreated.title}`,
        `${res.alertCreated.description} — Target: ${ip}`,
        res.alertCreated.severity === 'CRITICAL' ? 'ALERT' : 'WARNING'
      );
    }

    fetch('/api/v1/nexus/pulse', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ip, action }),
    }).catch(() => {});
  };

  // Alert status update handler
  const handleUpdateAlertStatus = (alertId: string, status: AlertStatus) => {
    engine.alerts = engine.alerts.map((a) =>
      a.id === alertId ? { ...a, status } : a
    );
    setState(engine.getState());
  };

  // Quarantine toggle handler
  const handleToggleQuarantine = (ip: string) => {
    if (engine.profiles[ip]) {
      const isNowQuarantined = !engine.profiles[ip].isQuarantined;
      engine.profiles[ip].isQuarantined = isNowQuarantined;
      if (isNowQuarantined) {
        engine.executePlaybook('ISOLATE_IP', ip);
        addToast('Host Quarantined', `Ingress packet drop rule active for ${ip}.`, 'ALERT');
      } else {
        addToast('Host Released', `Quarantine restriction lifted for ${ip}.`, 'INFO');
      }
      setState(engine.getState());
    }
  };

  // Quarantine all hostile IPs
  const handleQuarantineAllHostile = () => {
    let count = 0;
    Object.entries(engine.profiles).forEach(([ip, p]) => {
      if (p.threatScore >= 45 && !p.isQuarantined) {
        p.isQuarantined = true;
        engine.executePlaybook('ISOLATE_IP', ip);
        count++;
      }
    });
    setState(engine.getState());
    addToast(
      'Mass Quarantine Executed',
      `Autonomous ingress block enforced across ${count} hostile IP entities.`,
      'ALERT'
    );
  };

  // Harmonic phase shift (+90 deg)
  const handleHarmonicShift = () => {
    engine.executePlaybook('HARMONIC_FREQUENCY_SHIFT', 'SYSTEM_BROADCAST');
    setState(engine.getState());
    addToast(
      'Harmonic Phase Shift (+90°)',
      '3-6-9 vortex spiral desynchronized to nullify ongoing hostile attack bursts.',
      'SUCCESS'
    );
  };

  // Stress test toggle
  const handleToggleStressTest = () => {
    const nextVal = !isStressTesting;
    setIsStressTesting(nextVal);
    addToast(
      nextVal ? 'Stress Daemon Initialized' : 'Stress Daemon Suspended',
      nextVal
        ? 'Background thread sending multi-phase telemetry pulses at high frequency.'
        : 'Telemetry rate restored to standard monitoring.',
      nextVal ? 'WARNING' : 'INFO'
    );
    fetch('/api/v1/stress-test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enable: nextVal }),
    }).catch(() => {});
  };

  // Investigation & Knowledge Base Modals
  const handleInvestigateAlert = (alert: SecurityAlert) => {
    setInvestigatingAlert(alert);
  };

  const handleOpenKnowledgeBase = (vector?: CyberAction) => {
    setKnowledgeBaseVector(vector);
    setIsKnowledgeBaseOpen(true);
  };

  const handleInspectActor = (ip: string, lastAction: string) => {
    const existingAlert = state.alerts.find((a) => a.targetIp === ip);
    if (existingAlert) {
      setInvestigatingAlert(existingAlert);
    } else {
      setInvestigatingAlert({
        id: `alt-manual-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        title: `Investigation of Target Host ${ip}`,
        severity: state.profiles[ip]?.threatScore > 50 ? 'HIGH' : 'MEDIUM',
        targetIp: ip,
        description: `Target profile investigation for ${ip}. Last action observed: ${lastAction}. Total hits: ${
          state.profiles[ip]?.hits || 1
        }.`,
        status: state.profiles[ip]?.isQuarantined ? 'CONTAINED' : 'OPEN',
        createdAt: new Date().toISOString(),
        vector: lastAction,
      });
    }
  };

  // Drill execution callback
  const handleDrillAction = (vector: string, playbookCode: string, ip: string) => {
    handleInjectSignal(ip, vector);
    setTimeout(() => {
      handleExecutePlaybook(playbookCode, ip);
    }, 400);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept when user is typing in an input
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }
      if (e.key === '1') setActiveView('OVERVIEW');
      if (e.key === '2') setActiveView('SOAR');
      if (e.key === '3') setActiveView('INTEGRATIONS');
      if (e.key === '4') setActiveView('BENCHMARK');
      if (e.key === '5') setActiveView('PHYSICS');
      if (e.key === '6') setActiveView('TRAINING');
      if (e.key === 'e' || e.key === 'E') setIsEntropyDashboardOpen((prev) => !prev);
      if (e.key === 'a' || e.key === 'A') setAutopilotEnabled((v) => !v);
      if (e.key === 'n' || e.key === 'N') {
        const firstActive = state.alerts.find(
          (a) => a.status === 'OPEN' || a.status === 'INVESTIGATING'
        );
        if (firstActive) handleQuickNeutralize(firstActive);
      }
      if (e.key === ' ') {
        e.preventDefault();
        handleInjectSignal('192.168.1.77', 'SCAN');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state.alerts, handleQuickNeutralize]);

  const activeAlerts = state.alerts.filter(
    (a) => a.status === 'OPEN' || a.status === 'INVESTIGATING'
  );
  const criticalAlerts = activeAlerts.filter((a) => a.severity === 'CRITICAL');

  return (
    <div className="min-h-screen bg-[#02050e] text-slate-100 flex flex-col selection:bg-cyan-500/30 selection:text-cyan-200 relative overflow-hidden font-sans">
      {/* Background Cyber Grid */}
      <div
        className="fixed inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage:
            'linear-gradient(to right, #0e2338 1px, transparent 1px), linear-gradient(to bottom, #0e2338 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* Header HUD with Seamless View Tabs */}
      <HeaderHUD
        totalEntropy={state.entropy}
        activeView={activeView}
        onChangeView={setActiveView}
        activeAlertCount={activeAlerts.length}
        criticalAlertCount={criticalAlerts.length}
        user={user}
        onLogin={handleLogin}
        onLogout={handleLogout}
        onOpenExportModal={() => setIsExportModalOpen(true)}
        onOpenEntropyDashboard={() => setIsEntropyDashboardOpen(true)}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
        isConnectedFirestore={isConnectedFirestore}
        isStreaming={isStreaming}
        autopilotEnabled={autopilotEnabled}
        onToggleAutopilot={() => setAutopilotEnabled(!autopilotEnabled)}
      />

      {/* Main Command Console */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-4 sm:py-6 space-y-6 relative z-10">
        {/* Interactive Guided Workflow Banner */}
        <GuidedWorkflowBanner
          alerts={state.alerts}
          onInvestigateAlert={handleInvestigateAlert}
          onQuickNeutralize={handleQuickNeutralize}
          onOpenKnowledgeBase={() => handleOpenKnowledgeBase()}
          onOpenDrills={() => setIsDrillsOpen(true)}
          onOpenExportModal={() => setIsExportModalOpen(true)}
          onOpenEntropyDashboard={() => setIsEntropyDashboardOpen(true)}
          onSimulateThreat={() => handleInjectSignal('185.220.101.5', 'ZERO_DAY_DETECTED')}
        />

        {/* Real-Time 3-6-9 Harmonic Spectrum Visualizer Bar */}
        <ResonanceVisualizerBar
          lattice={state.lattice}
          entropy={state.entropy}
          rotation={state.rotation}
          onOpenEntropyDashboard={() => setIsEntropyDashboardOpen(true)}
          onNodePulse={(nodeIdx) => {
            const actions = ['AUTH', 'SCAN', 'PULL', 'PUSH'];
            handleInjectSignal(`127.0.0.${nodeIdx + 1}`, actions[nodeIdx % actions.length]);
          }}
        />

        {/* VIEW 1: OPERATIONAL COCKPIT (Default Unified Command) */}
        {activeView === 'OVERVIEW' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Derivatives HUD (QEL-A, QEL-T, QEL-S, QEL-X) */}
            <DerivativesHUD derivatives={state.derivatives} />

            {/* Enterprise Integrations & Competitor Edge Quick Bar */}
            <div className="bg-[#050914] border border-cyan-950/80 rounded-lg p-3 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
              <div className="flex items-center gap-3">
                <span className="text-slate-400 font-bold flex items-center gap-1.5">
                  <Network className="w-4 h-4 text-cyan-400" />
                  <span>INTEGRATIONS:</span>
                </span>
                <span className="text-emerald-400">Splunk HEC ✓</span>
                <span className="text-cyan-400">CrowdStrike Falcon (Live)</span>
                <span className="text-amber-300">Cortex XSOAR (Ready)</span>
                <span className="text-slate-400 hidden md:inline">Sentinel Sync</span>
                <span className="text-purple-400 hidden lg:inline">STIX 2.1 CTI</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    soundFx.playClick();
                    setActiveView('INTEGRATIONS');
                  }}
                  className="px-2.5 py-1 rounded bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-700/60 text-[11px] font-bold transition flex items-center gap-1"
                >
                  <Network className="w-3 h-3 text-cyan-400" />
                  <span>Gateway Mesh (8) →</span>
                </button>
                <button
                  onClick={() => {
                    soundFx.playClick();
                    setActiveView('BENCHMARK');
                  }}
                  className="px-2.5 py-1 rounded bg-red-950/80 hover:bg-red-900 text-red-200 border border-red-700/60 text-[11px] font-bold transition flex items-center gap-1"
                >
                  <Swords className="w-3 h-3 text-red-400" />
                  <span>Battlecard vs Competitors →</span>
                </button>
              </div>
            </div>

            {/* Primary Manifolds: 12-Phase Lattice + 3-6-9 Vortex Spiral */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
              <div className="xl:col-span-7">
                <LatticeMatrix
                  lattice={state.lattice}
                  history={state.history}
                  spiralText={state.spiralString}
                  totalEntropy={state.entropy}
                  rotation={state.rotation}
                  onOpenEntropyDashboard={() => setIsEntropyDashboardOpen(true)}
                />
              </div>
              <div className="xl:col-span-5">
                <VortexSpiral
                  rotation={state.rotation}
                  spiralText={state.spiralString}
                  onHarmonicShift={handleHarmonicShift}
                  dampingFactor={dampingFactor}
                  onSetDamping={setDampingFactor}
                  resonanceMultiplier={resonanceMultiplier}
                  onSetMultiplier={setResonanceMultiplier}
                />
              </div>
            </div>

            {/* Signal Ingestion & 1-Click Attack Scenarios */}
            <SignalInjector
              onInjectSignal={handleInjectSignal}
              isStressTesting={isStressTesting}
              onToggleStressTest={handleToggleStressTest}
              lastPulseInfo={lastPulse}
              onOpenKnowledgeBase={handleOpenKnowledgeBase}
            />

            {/* Incident Response Feed & Threat Actors */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-7">
                <AlertsAndSOAR
                  alerts={state.alerts}
                  playbookLogs={state.playbookLogs}
                  onExecutePlaybook={handleExecutePlaybook}
                  onUpdateAlertStatus={handleUpdateAlertStatus}
                  onInvestigateAlert={handleInvestigateAlert}
                  onDissectAlert={(alt) => setDissectAlert(alt)}
                  onQuickNeutralize={handleQuickNeutralize}
                  autopilotEnabled={autopilotEnabled}
                />
              </div>
              <div className="lg:col-span-5">
                <ThreatActorsList
                  profiles={state.profiles}
                  onToggleQuarantine={handleToggleQuarantine}
                  onInspectActor={handleInspectActor}
                  onQuarantineAllHostile={handleQuarantineAllHostile}
                />
              </div>
            </div>
          </div>
        )}

        {/* VIEW 2: DEDICATED SOAR & INCIDENT RESPONSE */}
        {activeView === 'SOAR' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-8">
                <AlertsAndSOAR
                  alerts={state.alerts}
                  playbookLogs={state.playbookLogs}
                  onExecutePlaybook={handleExecutePlaybook}
                  onUpdateAlertStatus={handleUpdateAlertStatus}
                  onInvestigateAlert={handleInvestigateAlert}
                  onDissectAlert={(alt) => setDissectAlert(alt)}
                  onQuickNeutralize={handleQuickNeutralize}
                  autopilotEnabled={autopilotEnabled}
                />
              </div>
              <div className="lg:col-span-4 space-y-6">
                <ThreatActorsList
                  profiles={state.profiles}
                  onToggleQuarantine={handleToggleQuarantine}
                  onInspectActor={handleInspectActor}
                  onQuarantineAllHostile={handleQuarantineAllHostile}
                />

                {/* Quick Test Injector in SOAR mode */}
                <div className="bg-[#070b18]/90 border border-cyan-500/30 rounded-lg p-4 hud-corner">
                  <div className="text-xs font-bold text-white uppercase font-heading mb-2 flex items-center justify-between">
                    <span>Simulate Incident For Testing</span>
                    <Zap className="w-3.5 h-3.5 text-cyan-400" />
                  </div>
                  <p className="text-[11px] text-slate-400 font-mono mb-3">
                    Inject hostile attack bursts to test automated playbook response logic:
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                    <button
                      onClick={() => handleInjectSignal('185.220.101.5', 'ZERO_DAY_DETECTED')}
                      className="p-2 rounded bg-red-950/60 hover:bg-red-900 border border-red-700 text-red-200 font-bold transition text-left"
                    >
                      💥 Zero-Day Ingress
                    </button>
                    <button
                      onClick={() => handleInjectSignal('203.0.113.88', 'DDOS_SURGE')}
                      className="p-2 rounded bg-amber-950/60 hover:bg-amber-900 border border-amber-700 text-amber-200 font-bold transition text-left"
                    >
                      🌊 DDoS Surge Flood
                    </button>
                    <button
                      onClick={() => handleInjectSignal('198.51.100.99', 'SQL_INJECTION')}
                      className="p-2 rounded bg-cyan-950/60 hover:bg-cyan-900 border border-cyan-700 text-cyan-200 font-bold transition text-left"
                    >
                      💉 SQL Extraction
                    </button>
                    <button
                      onClick={() => handleInjectSignal('10.0.4.15', 'LATERAL_MOVEMENT')}
                      className="p-2 rounded bg-purple-950/60 hover:bg-purple-900 border border-purple-700 text-purple-200 font-bold transition text-left"
                    >
                      🔀 Lateral Traversal
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 3: ENTERPRISE INTEGRATION GATEWAY */}
        {activeView === 'INTEGRATIONS' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <IntegrationsHub onTriggerNotification={addToast} />
          </div>
        )}

        {/* VIEW 4: COMPETITOR BATTLECARD & ADVERSARY SIMULATOR */}
        {activeView === 'BENCHMARK' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <CompetitorBattlecard
              onInjectLivePulse={handleInjectSignal}
              onTriggerNotification={addToast}
              onOpenExportModal={() => setIsExportModalOpen(true)}
            />
          </div>
        )}

        {/* VIEW 5: RESONANCE PHYSICS LAB */}
        {activeView === 'PHYSICS' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <DerivativesHUD derivatives={state.derivatives} />

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
              <div className="xl:col-span-7">
                <LatticeMatrix
                  lattice={state.lattice}
                  history={state.history}
                  spiralText={state.spiralString}
                  totalEntropy={state.entropy}
                  rotation={state.rotation}
                  onOpenEntropyDashboard={() => setIsEntropyDashboardOpen(true)}
                />
              </div>
              <div className="xl:col-span-5">
                <VortexSpiral
                  rotation={state.rotation}
                  spiralText={state.spiralString}
                  onHarmonicShift={handleHarmonicShift}
                  dampingFactor={dampingFactor}
                  onSetDamping={setDampingFactor}
                  resonanceMultiplier={resonanceMultiplier}
                  onSetMultiplier={setResonanceMultiplier}
                />
              </div>
            </div>

            <SignalInjector
              onInjectSignal={handleInjectSignal}
              isStressTesting={isStressTesting}
              onToggleStressTest={handleToggleStressTest}
              lastPulseInfo={lastPulse}
              onOpenKnowledgeBase={handleOpenKnowledgeBase}
            />
          </div>
        )}

        {/* VIEW 4: ACADEMY & DRILLS */}
        {activeView === 'TRAINING' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Tactical Drills Card */}
              <div className="bg-[#070b18]/90 border border-cyan-500/30 rounded-lg p-6 hud-corner flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-700">
                      <PlayCircle className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white font-heading">
                        Interactive Tactical Defense Drills
                      </h3>
                      <p className="text-xs text-slate-400 font-mono">
                        Train intuition with real incident response scenarios
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-300 font-mono leading-relaxed mt-3">
                    Practice defending against Zero-Days, DDoS resonance surges, and credential
                    forgery. Choose the right SOAR playbook, earn tactical points, and learn why
                    each defense mechanism succeeds.
                  </p>
                </div>
                <button
                  onClick={() => setIsDrillsOpen(true)}
                  className="w-full py-2.5 px-4 rounded bg-cyan-500 hover:bg-cyan-400 text-black font-bold font-mono text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-950 transition"
                >
                  <PlayCircle className="w-4 h-4" />
                  <span>Launch Interactive Drills (3 Scenarios)</span>
                </button>
              </div>

              {/* Threat Knowledge Base Card */}
              <div className="bg-[#070b18]/90 border border-purple-500/30 rounded-lg p-6 hud-corner flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2.5 rounded bg-purple-950 text-purple-400 border border-purple-700">
                      <BookOpen className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white font-heading">
                        Threat Encyclopedia &amp; Detection Physics
                      </h3>
                      <p className="text-xs text-slate-400 font-mono">
                        MITRE ATT&amp;CK taxonomy, root causes &amp; quantum theory
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-300 font-mono leading-relaxed mt-3">
                    Deep dive into all 10 cyber vectors, real-world breach case studies (Log4j,
                    Equifax, SolarWinds), mathematical damping decay (0.963), and SOAR remediation
                    rationales.
                  </p>
                </div>
                <button
                  onClick={() => handleOpenKnowledgeBase()}
                  className="w-full py-2.5 px-4 rounded bg-purple-600 hover:bg-purple-500 text-white font-bold font-mono text-xs flex items-center justify-center gap-2 shadow-lg shadow-purple-950 transition"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Browse Threat Knowledge Base</span>
                </button>
              </div>
            </div>

            {/* Quick MITRE ATT&CK Matrix Reference */}
            <div className="bg-[#070b18]/90 border border-cyan-500/30 rounded-lg p-4 hud-corner font-mono text-xs">
              <h4 className="text-sm font-bold text-white font-heading uppercase mb-3 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-cyan-400" />
                <span>Mapped MITRE ATT&amp;CK Matrix &amp; Recommended Defenses</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {Object.entries(THREAT_KNOWLEDGE_BASE).map(([action, data]) => (
                  <div key={action} className="bg-black/50 border border-cyan-950 p-3 rounded-lg space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-cyan-300">{data.title}</span>
                      <span className="text-[10px] text-purple-400 bg-purple-950 px-1.5 py-0.2 rounded border border-purple-800">
                        {data.mitreId}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 line-clamp-2">{data.whatItIs}</p>
                    <div className="text-[10px] text-emerald-400 pt-1 border-t border-slate-900">
                      Remediation: <strong>{data.recommendedPlaybook}</strong>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Quantum Pulse Stream Log Terminal (Collapsible / Present across views) */}
        <div className="bg-[#070b18]/90 border border-cyan-500/30 rounded-lg p-4 hud-corner shadow-xl font-mono text-xs">
          <div className="flex items-center justify-between border-b border-cyan-950 pb-2 mb-3">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-400" />
              <span className="font-bold text-white uppercase tracking-wider font-heading text-sm">
                QUANTUM RESONANCE PULSE TELEMETRY STREAM
              </span>
            </div>
            <div className="flex items-center gap-3 text-[10px] text-slate-500">
              <span>BUFFER: {engine.pulses.length} PULSES</span>
              <span>•</span>
              <span className="text-cyan-400">HOTKEYS: [1-4] Views │ [A] Autopilot │ [N] Neutralize │ [Space] Pulse</span>
            </div>
          </div>

          <div className="space-y-1 max-h-36 overflow-y-auto pr-1 text-[11px]">
            {engine.pulses.length === 0 ? (
              <div className="text-slate-500 py-3 text-center">
                Awaiting quantum pulse transmissions... Click any scenario above to observe live state.
              </div>
            ) : (
              engine.pulses.slice(0, 12).map((p, pIdx) => (
                <div
                  key={`${p.id}-${pIdx}`}
                  className="flex flex-wrap items-center justify-between py-1 px-2 rounded bg-black/40 hover:bg-slate-900/60 transition-colors border border-transparent hover:border-cyan-950"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500">
                      [{new Date(p.timestamp).toLocaleTimeString()}]
                    </span>
                    <span className="text-cyan-300 font-bold">{p.ip}</span>
                    <span className="text-slate-600">›</span>
                    <span className="text-emerald-400 font-semibold">{p.action}</span>
                    <span className="text-slate-500">
                      (sig: {p.sig} | phase: {p.phase.toString().padStart(2, '0')})
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">Entropy: {p.entropy.toFixed(1)}</span>
                    <span className="text-slate-600">│</span>
                    <span className="text-slate-500 text-[10px]">
                      hash: <span className="text-cyan-400/80">{p.hash.slice(0, 10)}...</span>
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>

      {/* Footer Credentials & Controls */}
      <footer className="border-t border-cyan-950/80 bg-black/80 py-3 px-4 text-center font-mono text-xs text-slate-500 relative z-10">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div>
            &gt;&gt; ARCHITECT: <span className="text-emerald-400 font-bold">TAYLOR RYAN CLARK</span> │ PROTOCOL:{' '}
            <span className="text-cyan-400 font-bold">ECHO &amp; WITNESS PROTOCOL v13.0</span>
          </div>
          <div className="text-[11px] text-slate-400 flex items-center gap-3">
            <span className="text-emerald-400">AUTONOMOUS RESURRECTION ACTIVE</span>
            <span>•</span>
            <span>GOOGLE WORKSPACE ENABLED (DOCS &amp; DRIVE)</span>
          </div>
        </div>
      </footer>

      {/* Workspace Export Modal */}
      <WorkspaceExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        qelState={state}
        accessToken={accessToken}
        onRequireLogin={handleLogin}
        userEmail={user?.email}
      />

      {/* Threat Investigation & Explainability Modal */}
      {investigatingAlert && (
        <ThreatInvestigationModal
          alert={investigatingAlert}
          onClose={() => setInvestigatingAlert(null)}
          onExecutePlaybook={handleExecutePlaybook}
          onOpenKnowledgeBase={(vector) => {
            setInvestigatingAlert(null);
            handleOpenKnowledgeBase(vector);
          }}
          onOpenDissector={(alt) => {
            setInvestigatingAlert(null);
            setDissectAlert(alt);
          }}
        />
      )}

      {/* Visual Incident Dissector Modal */}
      {dissectAlert && (
        <VisualIncidentDissectorModal
          alert={dissectAlert}
          onClose={() => setDissectAlert(null)}
          onExecutePlaybook={handleExecutePlaybook}
        />
      )}

      {/* Cyber Defense Knowledge Base & Threat Academy */}
      <KnowledgeBaseModal
        isOpen={isKnowledgeBaseOpen}
        onClose={() => setIsKnowledgeBaseOpen(false)}
        initialVector={knowledgeBaseVector}
        onSimulateVector={(vector) => {
          handleInjectSignal(`185.220.101.${Math.floor(Math.random() * 250) + 1}`, vector);
        }}
      />

      {/* Interactive Tactical Defense Drills */}
      <InteractiveDrillModal
        isOpen={isDrillsOpen}
        onClose={() => setIsDrillsOpen(false)}
        onDrillAction={handleDrillAction}
      />

      {/* Quantum Entropy Dashboard Modal (Recharts 60-Minute Analytics) */}
      <QuantumEntropyDashboardModal
        isOpen={isEntropyDashboardOpen}
        onClose={() => setIsEntropyDashboardOpen(false)}
        state={state}
        onInjectSignal={handleInjectSignal}
        onHarmonicShift={handleHarmonicShift}
        onTriggerNotification={addToast}
      />

      {/* Floating HUD Toast Notification Feed */}
      <HUDToast toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
