import { IntegrationConnector, CompetitorComparison, LiveBattleResult } from '../types.ts';

export const INTEGRATION_CONNECTORS: IntegrationConnector[] = [
  {
    id: 'splunk_hec',
    name: 'Splunk HTTP Event Collector (HEC)',
    vendor: 'Splunk / Cisco',
    category: 'SIEM',
    status: 'CONNECTED',
    endpoint: '/api/v1/integrations/splunk/hec',
    eventsIngested: 142850,
    lastSync: 'Just now (Live streaming)',
    description:
      'Bi-directional event collector. Ingests raw syslog, VPC flow logs, and forwarder telemetry directly into the QEL 12-phase lattice while streaming QEL alert anomalies back to Splunk indexes.',
    iconName: 'splunk',
    capabilities: [
      'High-throughput HEC token auth',
      'CEF / JSON payload normalization',
      'Automated index forwarding',
      'Log-to-Resonance phase mapping',
    ],
    samplePayload: {
      time: 1711184400,
      host: 'quantum-gateway-01',
      source: 'splunk-hec-stream',
      sourcetype: '_json',
      event: {
        action: 'ZERO_DAY_DETECTED',
        ip: '185.220.101.5',
        bytes_transferred: 4096,
        user_agent: 'QEL-QuantumProbe/13.0',
      },
    },
  },
  {
    id: 'crowdstrike_falcon',
    name: 'CrowdStrike Falcon Sensor Stream',
    vendor: 'CrowdStrike',
    category: 'EDR',
    status: 'STREAMING',
    endpoint: '/api/v1/integrations/crowdstrike/events',
    eventsIngested: 89420,
    lastSync: '4s ago',
    description:
      'Real-time streaming ingestion for CrowdStrike Falcon host endpoint detections, process hollowing, token elevation, and kernel-level telemetry mapped directly into phase jitter.',
    iconName: 'crowdstrike',
    capabilities: [
      'Falcon Event Streams API v2',
      'Real-time endpoint containment bridge',
      'Process lineage to phase mapping',
      'CrowdScore risk escalation',
    ],
    samplePayload: {
      event_id: 'cs-flcn-88491',
      ComputerName: 'PROD-AUTH-NODE-04',
      UserName: 'SYSTEM',
      DetectName: 'CredentialAccess:Kerberoasting',
      Severity: 'High',
      LocalIP: '10.0.4.15',
      SensorId: '49af9281048b',
    },
  },
  {
    id: 'cortex_xsoar',
    name: 'Palo Alto Cortex XSOAR',
    vendor: 'Palo Alto Networks',
    category: 'SOAR',
    status: 'CONNECTED',
    endpoint: '/api/v1/integrations/cortex/trigger',
    eventsIngested: 2315,
    lastSync: '12s ago',
    description:
      'Bi-directional playbook bridge. Cortex triggers QEL harmonic phase manifold shifts, while QEL dispatches autonomous boundary quarantine rules to PAN-OS next-gen firewalls.',
    iconName: 'paloalto',
    capabilities: [
      'Bi-directional REST playbook trigger',
      'PAN-OS dynamic address group push',
      'Automated incident enclosure',
      'War-room executive sync',
    ],
    samplePayload: {
      incident_id: 'XSOAR-INC-9921',
      playbook_code: 'HARMONIC_FREQUENCY_SHIFT',
      target_ip: '198.51.100.99',
      operator: 'CortexAutomationEngine',
      priority: 'Urgent',
    },
  },
  {
    id: 'ms_sentinel',
    name: 'Microsoft Sentinel & Azure Defender',
    vendor: 'Microsoft',
    category: 'SIEM',
    status: 'CONNECTED',
    endpoint: '/api/v1/integrations/sentinel/webhook',
    eventsIngested: 67320,
    lastSync: '1m ago',
    description:
      'Ingests Azure Monitor alerts and Microsoft 365 Defender alerts via Logic Apps webhooks; converts KQL security detections into quantum resonance pulses.',
    iconName: 'microsoft',
    capabilities: [
      'Azure Logic Apps webhook trigger',
      'KQL query result ingester',
      'Entra ID risky sign-in correlation',
      'Common Event Format (CEF) bridge',
    ],
    samplePayload: {
      WorkspaceId: '8a9f-azure-sentinel-sub',
      AlertRuleName: 'Anomalous Token Traversal Detected',
      Severity: 'Medium',
      Entities: [{ Type: 'ip', Address: '192.168.1.77' }],
    },
  },
  {
    id: 'slack_soc',
    name: 'Slack SecOps Incident War-Room',
    vendor: 'Slack Technologies',
    category: 'INCIDENT_DISPATCH',
    status: 'CONNECTED',
    endpoint: '/api/v1/integrations/slack/webhook',
    eventsIngested: 412,
    lastSync: 'Live Webhook Active',
    description:
      'Instantly dispatches rich, interactive incident cards to #secops-alerts with 1-click quarantine buttons, MITRE tactics, and executive summaries.',
    iconName: 'slack',
    capabilities: [
      'Interactive Slack Block Kit UI',
      '1-Click Quarantine from Slack',
      'Automated incident thread spawning',
      'Google Docs dossier link embed',
    ],
    samplePayload: {
      channel: '#secops-war-room',
      text: '🚨 [CRITICAL ALERT] QEL-X Zero-Day Attack Detected',
      blocks: [{ type: 'section', text: { type: 'mrkdwn', text: '*Target IP:* 185.220.101.5' } }],
    },
  },
  {
    id: 'pagerduty',
    name: 'PagerDuty On-Call Orchestrator',
    vendor: 'PagerDuty',
    category: 'INCIDENT_DISPATCH',
    status: 'CONNECTED',
    endpoint: '/api/v1/integrations/pagerduty/alert',
    eventsIngested: 88,
    lastSync: 'Standby',
    description:
      'Automated escalation paging for P1 critical security incidents when lattice entropy exceeds threshold (H > 150) or autonomous containment requires Tier-3 review.',
    iconName: 'pagerduty',
    capabilities: [
      'Events API v2 trigger & resolve',
      'Dynamic severity mapping',
      'Deduplication key persistence',
      'On-call SOC phone/SMS dispatch',
    ],
    samplePayload: {
      routing_key: 'pd-secops-key-8319',
      event_action: 'trigger',
      payload: {
        summary: 'QEL Resonance Lattice Anomaly: Critical Entropy Surge H=210.4',
        severity: 'critical',
        source: 'QEL-Nexus-Sensor-01',
      },
    },
  },
  {
    id: 'stix_taxii',
    name: 'STIX 2.1 / TAXII 2.1 Threat Intel Feed',
    vendor: 'OASIS CTI Standard',
    category: 'THREAT_INTEL',
    status: 'STREAMING',
    endpoint: '/api/v1/integrations/stix-taxii/import',
    eventsIngested: 512000,
    lastSync: '30s ago',
    description:
      'Industry-standard cyber threat intelligence parser. Translates STIX 2.1 Indicator and AttackPattern bundles into quantum resonance frequency signatures and boundary filters.',
    iconName: 'stix',
    capabilities: [
      'STIX 2.1 JSON bundle parsing',
      'TAXII 2.1 collection polling',
      'IoC-to-Phase hash hashing',
      'Automated MITRE ATT&CK tagging',
    ],
    samplePayload: {
      type: 'bundle',
      id: 'bundle--49c1-4b1a-82fa-10a9c8',
      objects: [
        {
          type: 'indicator',
          id: 'indicator--99fa-11c',
          pattern: "[ipv4-addr:value = '185.220.101.5']",
          name: 'APT29 Cobalt Strike Ingress Host',
        },
      ],
    },
  },
  {
    id: 'sigma_rules',
    name: 'Sigma Rule to QEL Resonance Translator',
    vendor: 'SigmaHQ Open Standard',
    category: 'RULE_CONVERTER',
    status: 'CONNECTED',
    endpoint: '/api/v1/integrations/sigma/translate',
    eventsIngested: 1840,
    lastSync: 'Ready',
    description:
      'Translates standard YAML/JSON Sigma detection rules into QEL 12-phase resonance filters and Lyapunov entropy jitter triggers with zero latency loss.',
    iconName: 'sigma',
    capabilities: [
      'Sigma v1/v2 rule compilation',
      'Phase node condition generation',
      'Instant conversion to SOAR action',
      'Post-quantum witness verification',
    ],
    samplePayload: {
      title: 'Suspicious Remote Thread Injection',
      status: 'production',
      logsource: { category: 'process_creation', product: 'windows' },
      detection: { selection: { TargetProcess: '*svchost.exe*', Injection: true } },
    },
  },
];

export const COMPETITOR_COMPARISONS: CompetitorComparison[] = [
  {
    id: 'crowdstrike',
    name: 'CrowdStrike Falcon Insight XDR',
    vendor: 'CrowdStrike',
    category: 'Kernel Hook & Behavioral EDR',
    detectionLatency: '8 - 45 seconds',
    zeroDayEfficacy: 42,
    mttr: '24 minutes (SOC triage)',
    ingestionPricing: '$15 - $25 / endpoint / month + storage',
    quantumResilience: 'VULNERABLE',
    soarAutomation: 'RULE_SCRIPTED',
    qelAdvantage:
      'QEL detects anomalies through 12-phase mathematical entropy jitter in 0.04 milliseconds without waiting for cloud behavioral analytics or kernel hook bypass.',
  },
  {
    id: 'splunk_es',
    name: 'Splunk Enterprise Security + Phantom',
    vendor: 'Splunk / Cisco',
    category: 'Log Indexing SIEM & SOAR',
    detectionLatency: '3 - 15 minutes (Index batch delay)',
    zeroDayEfficacy: 31,
    mttr: '42 minutes (Analyst review)',
    ingestionPricing: '$4.50+ / GB ingested / day ($100k+/yr scale)',
    quantumResilience: 'VULNERABLE',
    soarAutomation: 'MANUAL_TRIAGE',
    qelAdvantage:
      'Fixed-memory O(1) lattice manifold eliminates ingestion pricing penalties completely. No expensive disk indexing batches — quantum entropy is computed synchronously in memory.',
  },
  {
    id: 'palo_alto_xsoar',
    name: 'Palo Alto Cortex XSOAR & XDR',
    vendor: 'Palo Alto Networks',
    category: 'Orchestration & Network EDR',
    detectionLatency: '30 - 180 seconds',
    zeroDayEfficacy: 48,
    mttr: '18 minutes',
    ingestionPricing: '$180,000+ / year enterprise tier',
    quantumResilience: 'PARTIAL',
    soarAutomation: 'RULE_SCRIPTED',
    qelAdvantage:
      'QEL features native autonomous resonance shifting (+90° harmonic desynchronization) that breaks kill chains before payloads assemble, without multi-step python script lag.',
  },
  {
    id: 'ms_sentinel',
    name: 'Microsoft Sentinel (Azure Cloud SIEM)',
    vendor: 'Microsoft',
    category: 'Cloud Rule SIEM & Logic Apps',
    detectionLatency: '5 - 30 minutes (Scheduled KQL queries)',
    zeroDayEfficacy: 35,
    mttr: '35 minutes',
    ingestionPricing: '$2.30 - $4.00 / GB + Log Analytics compute',
    quantumResilience: 'VULNERABLE',
    soarAutomation: 'RULE_SCRIPTED',
    qelAdvantage:
      'Continuous 3-6-9 vortex spiral rotation tracks sub-second mathematical drift rather than batch cron KQL polling, eliminating blind-spot windows between query cycles.',
  },
];

export const SIMULATION_ATTACK_PRESETS = [
  {
    id: 'zero_day_polymorphic',
    name: 'Polymorphic Zero-Day Quantum Probe',
    vector: 'ZERO_DAY_DETECTED',
    ip: '185.220.101.5',
    description:
      'Novel memory corruption exploiting an unregistered instruction set; completely bypasses static signatures and cloud hashes.',
  },
  {
    id: 'ddos_resonance_flood',
    name: 'Synchronized Volumetric Phase Flood (DDoS)',
    vector: 'DDOS_SURGE',
    ip: '203.0.113.88',
    description:
      'Floods network ingress to saturate CPU and buffer pools with multi-threaded spoofed UDP fragments.',
  },
  {
    id: 'lateral_kerberoasting',
    name: 'Kerberoast Ticket & Lateral Traversal',
    vector: 'LATERAL_MOVEMENT',
    ip: '10.0.4.15',
    description:
      'Harvests service ticket TGS hashes to crack credentials offline and pivot to Domain Controller.',
  },
  {
    id: 'blind_sql_extraction',
    name: 'Time-Based Blind SQL Infiltration',
    vector: 'SQL_INJECTION',
    ip: '198.51.100.99',
    description:
      'Exfiltrates database schema through time-delayed boolean extraction queries injected via HTTP headers.',
  },
];

/**
 * Runs a simulated head-to-head battle comparing QEL against traditional competitors
 */
export function runCompetitiveBattle(presetId: string): LiveBattleResult {
  const preset =
    SIMULATION_ATTACK_PRESETS.find((p) => p.id === presetId) || SIMULATION_ATTACK_PRESETS[0];

  // QEL latency is sub-millisecond (0.02 - 0.4ms)
  const qelLatency = Math.round((Math.random() * 0.35 + 0.05) * 100) / 100;
  const entropyShift = Math.round((Math.random() * 45 + 25) * 10) / 10;

  return {
    scenarioName: preset.name,
    payloadType: preset.vector,
    timestamp: new Date().toISOString(),
    qel: {
      detectionMs: qelLatency,
      contained: true,
      quarantinedIp: preset.ip,
      actionTaken:
        preset.vector === 'DDOS_SURGE'
          ? 'HARMONIC_FREQUENCY_SHIFT (+90° Desynchronization)'
          : preset.vector === 'LATERAL_MOVEMENT'
          ? 'KILL_CHAIN_TERMINATE (Token Nullification)'
          : 'ISOLATE_IP (Autonomous Ingress Boundary Drop)',
      entropyShift,
    },
    competitors: {
      crowdstrike: {
        detectionMs: preset.vector === 'ZERO_DAY_DETECTED' ? 42000 : 1850,
        contained: preset.vector !== 'ZERO_DAY_DETECTED',
        delayReason:
          preset.vector === 'ZERO_DAY_DETECTED'
            ? 'Bypassed sensor static hash lookup; required 42s behavioral cloud sandbox execution'
            : 'Sensor process hook telemetry upload & correlation delay (1.85s)',
      },
      splunk: {
        detectionMs: 180000, // 3 minutes
        contained: false,
        delayReason:
          'Ingestion buffer batch index window (scheduled search runs every 3 mins); analyst alert pending in queue',
      },
      cortex: {
        detectionMs: 45000,
        contained: true,
        delayReason:
          'Playbook container initialization delay; PAN-OS dynamic address group REST API sync required 45s',
      },
      sentinel: {
        detectionMs: 300000, // 5 minutes
        contained: false,
        delayReason:
          'KQL analytics query scheduled at 5-minute interval; alert generated after attack concluded',
      },
    },
  };
}
