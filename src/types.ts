export type ThreatSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';

export type AlertStatus = 'OPEN' | 'INVESTIGATING' | 'CONTAINED' | 'RESOLVED';

export type CyberAction =
  | 'AUTH'
  | 'SCAN'
  | 'PULL'
  | 'PUSH'
  | 'EXPLOIT_ATTEMPT'
  | 'SQL_INJECTION'
  | 'DDOS_SURGE'
  | 'BEACON'
  | 'ZERO_DAY_DETECTED'
  | 'LATERAL_MOVEMENT'
  | 'CREDENTIAL_STUFFING';

export interface TelemetryPulse {
  id: string;
  ip: string;
  action: string;
  sig: number;
  phase: number;
  entropy: number;
  timestamp: string;
  hash: string;
}

export interface QELDerivatives {
  qelA: {
    name: string;
    description: string;
    deflectionRatio: number;
    kineticShieldActive: boolean;
    status: 'OPTIMAL' | 'RESONATING' | 'CRITICAL_DEFLECTION';
  };
  qelT: {
    name: string;
    description: string;
    temporalDecayRate: number;
    entanglementTraceDepth: number;
    causalityCoherence: number;
  };
  qelS: {
    name: string;
    description: string;
    spectralAnomalyJitter: number;
    harmonicPhaseAlignment: number;
    lyapunovStability: number;
  };
  qelX: {
    name: string;
    description: string;
    containmentLockdown: boolean;
    zeroDayCoefficient: number;
    quarantineZoneCount: number;
  };
}

export interface ThreatActor {
  ip: string;
  hits: number;
  lastAction: string;
  lastSeen: string;
  threatScore: number;
  isQuarantined: boolean;
  country: string;
  notes?: string;
}

export interface SecurityAlert {
  id: string;
  title: string;
  severity: ThreatSeverity;
  targetIp: string;
  description: string;
  status: AlertStatus;
  playbookExecuted?: string;
  createdAt: string;
  resolvedAt?: string;
  vector?: string;
  entropyTrigger?: number;
  // Educational & Explainability Attributes
  mitreId?: string;
  mitreTactic?: string;
  whyDetected?: string;
  threatImpact?: string;
  recommendedPlaybook?: string;
  remediationRationale?: string;
}

export interface Playbook {
  id: string;
  name: string;
  description: string;
  actionCode:
    | 'ISOLATE_IP'
    | 'HARMONIC_FREQUENCY_SHIFT'
    | 'DEPLOY_QUANTUM_HONEYPOT'
    | 'KILL_CHAIN_TERMINATE'
    | 'RESTRICT_SUBNET';
  severityThreshold: ThreatSeverity[];
  automatic: boolean;
  whatItDoes: string;
  whyRunIt: string;
  mitreMitigationId?: string;
}

export interface PlaybookExecutionLog {
  id: string;
  playbookId: string;
  playbookName: string;
  targetIp: string;
  status: 'SUCCESS' | 'FAILED' | 'EXECUTING';
  executedAt: string;
  details: string;
  rationale?: string;
}

export interface ThreatVectorEducation {
  action: CyberAction;
  title: string;
  whatItIs: string;
  whyDangerous: string;
  howQelDetectsIt: string;
  mitreId: string;
  mitreTactic: string;
  recommendedPlaybook: string;
  remediationRationale: string;
  realWorldExample: string;
}

export interface InteractiveDrillScenario {
  id: string;
  title: string;
  vector: CyberAction;
  attackerIp: string;
  brief: string;
  detectionClue: string;
  whyDangerous: string;
  idealResponse: string;
  explanation: string;
}

export interface IncidentReportRecord {
  id: string;
  title: string;
  docId: string;
  docUrl: string;
  driveFileId?: string;
  summary: string;
  authorEmail?: string;
  createdAt: string;
}

export type IntegrationCategory =
  | 'SIEM'
  | 'EDR'
  | 'SOAR'
  | 'INCIDENT_DISPATCH'
  | 'THREAT_INTEL'
  | 'RULE_CONVERTER';

export interface IntegrationConnector {
  id: string;
  name: string;
  category: IntegrationCategory;
  vendor: string;
  status: 'CONNECTED' | 'STANDBY' | 'STREAMING' | 'CONFIG_REQUIRED';
  endpoint: string;
  eventsIngested: number;
  lastSync: string;
  description: string;
  iconName: string;
  samplePayload: any;
  capabilities: string[];
}

export interface CompetitorComparison {
  id: string;
  name: string;
  vendor: string;
  category: string;
  detectionLatency: string;
  zeroDayEfficacy: number; // percentage e.g. 38%
  mttr: string; // Mean Time to Respond e.g. "32 mins"
  ingestionPricing: string;
  quantumResilience: 'VULNERABLE' | 'PARTIAL' | 'POST_QUANTUM_NATIVE';
  soarAutomation: 'MANUAL_TRIAGE' | 'RULE_SCRIPTED' | 'AUTONOMOUS_RESONANCE';
  qelAdvantage: string;
}

export interface LiveBattleResult {
  scenarioName: string;
  payloadType: string;
  timestamp: string;
  qel: {
    detectionMs: number;
    contained: boolean;
    quarantinedIp: string;
    actionTaken: string;
    entropyShift: number;
  };
  competitors: {
    crowdstrike: { detectionMs: number; contained: boolean; delayReason: string };
    splunk: { detectionMs: number; contained: boolean; delayReason: string };
    cortex: { detectionMs: number; contained: boolean; delayReason: string };
    sentinel: { detectionMs: number; contained: boolean; delayReason: string };
  };
}

export interface QELState {
  lattice: number[];
  history: number[];
  entropy: number;
  rotation: number;
  spiralString: string;
  profiles: Record<
    string,
    { hits: number; last: string; lastSeen: string; isQuarantined: boolean; threatScore: number; country: string }
  >;
  derivatives: QELDerivatives;
  alerts: SecurityAlert[];
  playbookLogs: PlaybookExecutionLog[];
  status: string;
  architect: string;
  protocol: string;
  lastPulseTime: string;
}
