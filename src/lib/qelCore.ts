import {
  CyberAction,
  QELDerivatives,
  QELState,
  SecurityAlert,
  TelemetryPulse,
  ThreatActor,
  ThreatSeverity,
  PlaybookExecutionLog,
} from '../types.ts';
import { THREAT_KNOWLEDGE_BASE, PLAYBOOK_EXPLANATIONS } from './threatKnowledge.ts';

const COUNTRIES = ['US', 'DE', 'JP', 'GB', 'SG', 'NL', 'CA', 'AU', 'CH', 'FR', 'SE', 'IS'];

function getEstimatedCountry(ip: string): string {
  let hash = 0;
  for (let i = 0; i < ip.length; i++) hash = (hash * 31 + ip.charCodeAt(i)) >>> 0;
  return COUNTRIES[hash % COUNTRIES.length];
}

// Compute SHA-256 for witness hash integrity chain
export async function computeWitnessHash(dataString: string): Promise<string> {
  try {
    if (typeof window !== 'undefined' && window.crypto?.subtle) {
      const msgBuffer = new TextEncoder().encode(dataString);
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', msgBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('').slice(0, 32);
    }
  } catch (e) {
    // Fallback
  }
  let hash = 0;
  for (let i = 0; i < dataString.length; i++) {
    hash = (hash * 31 + dataString.charCodeAt(i)) >>> 0;
  }
  return `0x${hash.toString(16).padStart(8, '0')}${Date.now().toString(16)}`;
}

// Sequence counter to guarantee absolute uniqueness across all millisecond collisions
let globalIdSequence = 0;

export class QELNexusEngine {
  public lattice: number[] = new Array(12).fill(0);
  public history: number[] = [];
  public profiles: Record<
    string,
    { hits: number; last: string; lastSeen: string; isQuarantined: boolean; threatScore: number; country: string }
  > = {};
  public rotation: number = 0;
  public alerts: SecurityAlert[] = [];
  public playbookLogs: PlaybookExecutionLog[] = [];
  public pulses: TelemetryPulse[] = [];
  public dampingFactor: number = 0.963;
  public resonanceMultiplier: number = 3.69;
  public status: string = 'RESURRECTION ACTIVE';
  public architect: string = 'TAYLOR RYAN CLARK';
  public protocol: string = 'ECHO & WITNESS PROTOCOL v13.0';
  public lastPulseTime: string = new Date().toISOString();

  constructor() {
    // Seed initial historical trajectory
    this.lattice = [14.2, 28.5, 9.8, 42.1, 18.4, 63.9, 12.1, 31.0, 54.2, 22.8, 11.5, 36.4];
    for (let i = 0; i < 20; i++) {
      this.history.push(Math.round(200 + Math.sin(i / 2) * 45 + Math.random() * 20));
    }
    // Seed sample known threat actors
    this.processSignal('198.51.100.42', 'SCAN', false);
    this.processSignal('203.0.113.19', 'AUTH', false);
    this.processSignal('192.168.1.105', 'PULL', false);
  }

  public getVortexSpiralText(): string {
    const s_3 = this.rotation % 3 === 0 ? '3' : '·';
    const s_6 = this.rotation % 6 === 0 ? '6' : '·';
    const s_9 = this.rotation % 9 === 0 ? '9' : '·';
    return `(${s_3}---${s_6}---${s_9})`;
  }

  public async processSignal(
    ip: string,
    action: string,
    triggerAutoPlaybook: boolean = true
  ): Promise<{
    sig: number;
    phase: number;
    entropy: number;
    pulse: TelemetryPulse;
    alertCreated?: SecurityAlert;
  }> {
    // 1. Quantum signal calculation per Taylor Ryan Clark spec:
    // sig = (sum(ord(c) for c in (ip+action)) % 9) or 9
    let combinedStr = ip + action;
    let sumAscii = 0;
    for (let i = 0; i < combinedStr.length; i++) {
      sumAscii += combinedStr.charCodeAt(i);
    }
    const sig = sumAscii % 9 || 9;

    // phase = (sum(ord(c) for c in action) % 12)
    let actionSum = 0;
    for (let i = 0; i < action.length; i++) {
      actionSum += action.charCodeAt(i);
    }
    const phase = actionSum % 12;

    // 2. Lattice weighting and pulse decay:
    // lattice *= 0.963
    for (let i = 0; i < 12; i++) {
      this.lattice[i] *= this.dampingFactor;
    }
    // lattice[phase] += (sig * 3.69)
    this.lattice[phase] += sig * this.resonanceMultiplier;

    // 3. Compute total entropy
    const totalEntropy = Math.round(this.lattice.reduce((a, b) => a + b, 0) * 100) / 100;
    this.history.push(totalEntropy);
    if (this.history.length > 50) this.history.shift();

    // 4. Update Profile
    const nowIso = new Date().toISOString();
    this.lastPulseTime = nowIso;
    this.rotation = (this.rotation + 7) % 360;

    if (!this.profiles[ip]) {
      this.profiles[ip] = {
        hits: 0,
        last: action,
        lastSeen: nowIso,
        isQuarantined: false,
        threatScore: 10,
        country: getEstimatedCountry(ip),
      };
    }

    this.profiles[ip].hits += 1;
    this.profiles[ip].last = action;
    this.profiles[ip].lastSeen = nowIso;

    // Threat scoring adjustment based on vector
    let threatDelta = 2;
    if (['EXPLOIT_ATTEMPT', 'SQL_INJECTION', 'ZERO_DAY_DETECTED'].includes(action)) {
      threatDelta = 25;
    } else if (action === 'DDOS_SURGE') {
      threatDelta = 30;
    } else if (action === 'LATERAL_MOVEMENT') {
      threatDelta = 18;
    }
    this.profiles[ip].threatScore = Math.min(100, this.profiles[ip].threatScore + threatDelta);

    // 5. Generate Cryptographic Witness Hash
    const rawWitness = `${ip}|${action}|${sig}|${phase}|${totalEntropy}|${nowIso}`;
    const hash = await computeWitnessHash(rawWitness);

    const pulse: TelemetryPulse = {
      id: `pls-${Date.now()}-${++globalIdSequence}-${Math.random().toString(36).slice(2, 6)}`,
      ip,
      action,
      sig,
      phase,
      entropy: totalEntropy,
      timestamp: nowIso,
      hash,
    };

    this.pulses.unshift(pulse);
    if (this.pulses.length > 100) this.pulses.pop();

    // 6. Cyber Security Anomaly Detection & Alert Generation
    let alertCreated: SecurityAlert | undefined;
    const isCriticalVector = ['ZERO_DAY_DETECTED', 'EXPLOIT_ATTEMPT', 'DDOS_SURGE'].includes(action);
    const isHighEntropy = totalEntropy > 380;
    const isRepeatedAttacker = this.profiles[ip].hits >= 5 && this.profiles[ip].threatScore > 50;

    if (isCriticalVector || isHighEntropy || isRepeatedAttacker) {
      let severity: ThreatSeverity = 'MEDIUM';
      let title = `Anomalous Phase Resonance Detected on Node [${phase.toString().padStart(2, '0')}]`;

      if (action === 'ZERO_DAY_DETECTED') {
        severity = 'CRITICAL';
        title = `QEL-X Zero-Day Vector Exploitation Prevented [${ip}]`;
      } else if (action === 'DDOS_SURGE' || totalEntropy > 450) {
        severity = 'CRITICAL';
        title = `Critical Entropy Surge (${totalEntropy}) Across Lattice Manifold`;
      } else if (action === 'EXPLOIT_ATTEMPT' || action === 'SQL_INJECTION') {
        severity = 'HIGH';
        title = `Invasive Payload Injection Intercepted from ${ip}`;
      } else if (isRepeatedAttacker) {
        severity = 'HIGH';
        title = `Persistent Threat Actor Threshold Exceeded: ${ip}`;
      }

      const kb = THREAT_KNOWLEDGE_BASE[action as CyberAction];

      alertCreated = {
        id: `alt-${Date.now()}-${++globalIdSequence}-${Math.random().toString(36).slice(2, 6)}`,
        title,
        severity,
        targetIp: ip,
        description: `Echo & Witness Protocol v13.0 flagged vector ${action} generating harmonic signal ${sig} with entropy ${totalEntropy}. Witness Hash: ${hash.slice(0, 16)}...`,
        status: 'OPEN',
        createdAt: nowIso,
        vector: action,
        entropyTrigger: totalEntropy,
        mitreId: kb?.mitreId || 'T1190',
        mitreTactic: kb?.mitreTactic || 'Initial Access',
        whyDetected:
          kb?.howQelDetectsIt ||
          `Lattice node [${phase.toString().padStart(2, '0')}] experienced harmonic excitation (sig ${sig}), escalating total entropy to ${totalEntropy}.`,
        threatImpact:
          kb?.whyDangerous ||
          `Elevated risk of service disruption, credential compromise, or lateral movement from ${ip}.`,
        recommendedPlaybook: kb?.recommendedPlaybook || 'ISOLATE_IP',
        remediationRationale:
          kb?.remediationRationale ||
          `Execute boundary drop rule to break ingress connection and halt adversary kill-chain progression.`,
      };

      // Automated Incident Response SOAR Trigger:
      if (triggerAutoPlaybook) {
        if (severity === 'CRITICAL' && !this.profiles[ip].isQuarantined) {
          // Auto-quarantine on CRITICAL
          this.profiles[ip].isQuarantined = true;
          alertCreated.status = 'CONTAINED';
          alertCreated.playbookExecuted = 'AUTONOMOUS_QEL_X_QUARANTINE';

          this.playbookLogs.unshift({
            id: `pb-${Date.now()}-${++globalIdSequence}-${Math.random().toString(36).slice(2, 6)}`,
            playbookId: 'ISOLATE_IP',
            playbookName: 'Autonomous QEL-X Perimeter Quarantine',
            targetIp: ip,
            status: 'SUCCESS',
            executedAt: nowIso,
            details: `Isolated IP ${ip} across quantum firewall. Lattice phase ${phase} recalibrated.`,
          });
        }
      }

      this.alerts.unshift(alertCreated);
      if (this.alerts.length > 50) this.alerts.pop();
    }

    return { sig, phase, entropy: totalEntropy, pulse, alertCreated };
  }

  public calculateDerivatives(): QELDerivatives {
    const totalEntropy = this.lattice.reduce((a, b) => a + b, 0);
    const maxVal = Math.max(...this.lattice, 1);
    const minVal = Math.min(...this.lattice);
    const mean = totalEntropy / 12;

    // Variance calculation for QEL-S
    const variance =
      this.lattice.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / 12;
    const stdDev = Math.sqrt(variance);

    // QEL-A: Kinetic Shielding Deflection
    const deflectionRatio = Math.min(99.8, Math.max(34.2, Math.round((100 - (totalEntropy / 8)) * 10) / 10));
    const kineticStatus =
      totalEntropy > 400
        ? 'CRITICAL_DEFLECTION'
        : totalEntropy > 250
        ? 'RESONATING'
        : 'OPTIMAL';

    // QEL-T: Temporal Incident Forensics
    const recentTrend =
      this.history.length >= 2
        ? this.history[this.history.length - 1] - this.history[this.history.length - 2]
        : 0;
    const temporalDecayRate = Math.round(this.dampingFactor * 1000) / 1000;
    const entanglementDepth = Math.round(12 + Math.abs(recentTrend) * 1.5);
    const causalityCoherence = Math.round(Math.max(60, 99 - stdDev * 0.8) * 10) / 10;

    // QEL-S: Spectral Anomaly
    const spectralJitter = Math.round((stdDev / (mean || 1)) * 100) / 100;
    const harmonicAlignment = Math.round(((this.lattice[3] + this.lattice[6] + this.lattice[9]) / (totalEntropy || 1)) * 300);
    const lyapunovStability = Math.round((1.0 - Math.min(1.0, variance / 5000)) * 100) / 100;

    // QEL-X: Zero-day containment
    const quarantinedCount = Object.values(this.profiles).filter((p) => p.isQuarantined).length;
    const zeroDayCoeff = Math.min(1.0, Math.round((totalEntropy / 500) * 100) / 100);

    return {
      qelA: {
        name: 'QEL-A: Kinetic Deflection Matrix',
        description: 'Autonomous spatial energy absorption & vector nullification',
        deflectionRatio,
        kineticShieldActive: deflectionRatio > 50,
        status: kineticStatus,
      },
      qelT: {
        name: 'QEL-T: Temporal Forensics Engine',
        description: 'Historical causality coherence & packet rewinding verification',
        temporalDecayRate,
        entanglementTraceDepth: entanglementDepth,
        causalityCoherence,
      },
      qelS: {
        name: 'QEL-S: Spectral Resonance Sensor',
        description: 'Waveform phase jitter & 3-6-9 Tesla harmonic frequency detection',
        spectralAnomalyJitter: spectralJitter,
        harmonicPhaseAlignment: harmonicAlignment,
        lyapunovStability,
      },
      qelX: {
        name: 'QEL-X: Cross-Vector Containment',
        description: 'Autonomous zero-day lockdown & active threat actor quarantine',
        containmentLockdown: zeroDayCoeff > 0.75,
        zeroDayCoefficient: zeroDayCoeff,
        quarantineZoneCount: quarantinedCount,
      },
    };
  }

  public executePlaybook(
    playbookCode: string,
    targetIp: string
  ): PlaybookExecutionLog {
    const nowIso = new Date().toISOString();
    let details = '';

    switch (playbookCode) {
      case 'ISOLATE_IP':
        if (this.profiles[targetIp]) {
          this.profiles[targetIp].isQuarantined = true;
        }
        details = `Host ${targetIp} quarantined from cluster. IP traffic dropped at ingress.`;
        break;

      case 'HARMONIC_FREQUENCY_SHIFT':
        // Dampen all lattice bins and shift phase by 90 degrees
        for (let i = 0; i < 12; i++) {
          this.lattice[i] *= 0.5;
        }
        this.rotation = (this.rotation + 90) % 360;
        details = `Lattice phase manifold shifted +90°. Harmonic resonance neutralized.`;
        break;

      case 'DEPLOY_QUANTUM_HONEYPOT':
        details = `Synthetic decoy honeypot deployed on phase ${Math.floor(Math.random() * 12)}. Threat actor lured into observation silo.`;
        break;

      case 'KILL_CHAIN_TERMINATE':
        details = `Active kill-chain terminated for target ${targetIp}. All cryptographic session tokens invalidated.`;
        break;

      case 'RESTRICT_SUBNET':
        details = `Subnet ${targetIp.split('.').slice(0, 3).join('.')}.0/24 placed in high-entropy rate-limiting state.`;
        break;

      default:
        details = `Playbook ${playbookCode} executed successfully.`;
    }

    // Resolve any open alerts for this target
    this.alerts = this.alerts.map((alt) => {
      if (alt.targetIp === targetIp && alt.status !== 'RESOLVED') {
        return {
          ...alt,
          status: 'RESOLVED',
          resolvedAt: nowIso,
          playbookExecuted: playbookCode,
        };
      }
      return alt;
    });

    const rationale =
      PLAYBOOK_EXPLANATIONS[playbookCode as keyof typeof PLAYBOOK_EXPLANATIONS]?.whyRunIt ||
      'Mitigate active threat vector and stabilize quantum lattice.';

    const log: PlaybookExecutionLog = {
      id: `pb-${Date.now()}-${++globalIdSequence}-${Math.random().toString(36).slice(2, 6)}`,
      playbookId: playbookCode,
      playbookName: playbookCode.replace(/_/g, ' '),
      targetIp,
      status: 'SUCCESS',
      executedAt: nowIso,
      details,
      rationale,
    };

    this.playbookLogs.unshift(log);
    if (this.playbookLogs.length > 50) this.playbookLogs.pop();
    return log;
  }

  public getState(): QELState {
    const totalEntropy = Math.round(this.lattice.reduce((a, b) => a + b, 0) * 100) / 100;

    // Bulletproof ID deduplication to prevent any React duplicate key collisions
    const seenPbIds = new Set<string>();
    const sanitizedPlaybookLogs = this.playbookLogs.map((log, idx) => {
      let uniqueId = log.id;
      if (!uniqueId || seenPbIds.has(uniqueId)) {
        uniqueId = `${uniqueId || 'pb'}-${idx}-${Date.now()}`;
      }
      seenPbIds.add(uniqueId);
      return { ...log, id: uniqueId };
    });

    const seenAlertIds = new Set<string>();
    const sanitizedAlerts = this.alerts.map((alt, idx) => {
      let uniqueId = alt.id;
      if (!uniqueId || seenAlertIds.has(uniqueId)) {
        uniqueId = `${uniqueId || 'alt'}-${idx}-${Date.now()}`;
      }
      seenAlertIds.add(uniqueId);
      return { ...alt, id: uniqueId };
    });

    return {
      lattice: [...this.lattice],
      history: [...this.history],
      entropy: totalEntropy,
      rotation: this.rotation,
      spiralString: this.getVortexSpiralText(),
      profiles: { ...this.profiles },
      derivatives: this.calculateDerivatives(),
      alerts: sanitizedAlerts,
      playbookLogs: sanitizedPlaybookLogs,
      status: this.status,
      architect: this.architect,
      protocol: this.protocol,
      lastPulseTime: this.lastPulseTime,
    };
  }
}

// Global engine singleton for client/server sharing
export const globalQelEngine = new QELNexusEngine();
