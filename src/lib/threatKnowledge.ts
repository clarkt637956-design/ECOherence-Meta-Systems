import { CyberAction, ThreatVectorEducation, InteractiveDrillScenario } from '../types.ts';

export const THREAT_KNOWLEDGE_BASE: Record<CyberAction, ThreatVectorEducation> = {
  ZERO_DAY_DETECTED: {
    action: 'ZERO_DAY_DETECTED',
    title: 'Zero-Day Flaw Infiltration',
    whatItIs:
      'An attack leveraging previously undisclosed security vulnerabilities in software or firmware for which no official vendor patch or signature yet exists.',
    whyDangerous:
      'Traditional signature-based antivirus or firewalls are completely blind to zero-days because no prior signature exists. Adversaries gain privileged root execution and deep network persistence undetected.',
    howQelDetectsIt:
      'QEL detects zero-days through anomalous phase resonance variance and severe entropy distortion across the 12-phase lattice manifold, independent of signatures. The pulse generates an abnormal harmonic signal (sig 8-9) that causes rapid entropy divergence.',
    mitreId: 'T1190',
    mitreTactic: 'Initial Access / Exploit Public-Facing Application',
    recommendedPlaybook: 'ISOLATE_IP',
    remediationRationale:
      'Quarantine the attacker IP at the ingress border immediately to break the inbound socket, preventing privilege escalation and lateral movement while incident forensics verify the targeted binary.',
    realWorldExample:
      'Log4Shell (CVE-2021-44228) and Microsoft Exchange ProxyLogon where attackers executed remote code before public security patches were authored.',
  },
  DDOS_SURGE: {
    action: 'DDOS_SURGE',
    title: 'Distributed Denial of Service (DDoS) Flood',
    whatItIs:
      'A synchronized, high-volume assault designed to overwhelm network bandwidth, connection state tables, or compute resources using botnet fleets.',
    whyDangerous:
      'Exhausts server CPU/RAM buffers and network pipes, causing total outage for legitimate users, critical operational paralysis, and potential distraction for secondary stealth attacks.',
    howQelDetectsIt:
      'Rapid repetitive pulses overload individual lattice bins faster than the 0.963 damping dissipation rate, driving total lattice entropy past critical thresholds (>400), causing QEL-A deflection failure alarms.',
    mitreId: 'T1499',
    mitreTactic: 'Impact / Endpoint Denial of Service',
    recommendedPlaybook: 'HARMONIC_FREQUENCY_SHIFT',
    remediationRationale:
      'Rotating the 3-6-9 vortex manifold by +90° causes destructive wave interference against synchronized repetitive packet timings, dampening resonance across all nodes and neutralizing flood amplification.',
    realWorldExample:
      'Mirai botnet 1.2 Tbps DNS surge and modern HTTP/2 Rapid Reset attacks that overwhelmed edge routers.',
  },
  SQL_INJECTION: {
    action: 'SQL_INJECTION',
    title: 'Structured Query Language (SQL) Injection',
    whatItIs:
      'Malicious SQL query payloads injected through untrusted input fields or API query parameters to bypass backend database validation.',
    whyDangerous:
      'Allows unauthorized adversaries to bypass authentication barriers, dump private databases (passwords, credit cards, PII), corrupt data tables, or execute OS commands via database extended procedures.',
    howQelDetectsIt:
      'Injected syntax characters (quotes, semicolons, comments) produce a characteristic ASCII distribution offset that excites odd-numbered phase bins (node 05, node 07), creating localized high-Q resonance peaks.',
    mitreId: 'T1190',
    mitreTactic: 'Initial Access / Exploit Public-Facing Application',
    recommendedPlaybook: 'KILL_CHAIN_TERMINATE',
    remediationRationale:
      'Terminating the active kill-chain revokes active database sessions and bearer authentication tokens instantly, stopping exfiltration in progress while the input vulnerability is sanitized.',
    realWorldExample:
      'MOVEit Transfer SQLi vulnerability (CVE-2023-34362) that enabled massive corporate data extortion worldwide.',
  },
  EXPLOIT_ATTEMPT: {
    action: 'EXPLOIT_ATTEMPT',
    title: 'Exploitation of Remote Vulnerability / RCE',
    whatItIs:
      'Targeted transmission of shellcode payloads, buffer overflows, or deserialization gadgets aimed at executing arbitrary code on server daemons.',
    whyDangerous:
      'Gives attackers an interactive command shell on internal servers, allowing malware deployment, credential dumping, and full infrastructure takeover.',
    howQelDetectsIt:
      'Generates a concentrated energy spike in single phase nodes with harmonic signal 7-9, breaking the smooth Lyapunov stability index of QEL-S and triggering immediate security tripwires.',
    mitreId: 'T1059',
    mitreTactic: 'Execution / Command and Scripting Interpreter',
    recommendedPlaybook: 'ISOLATE_IP',
    remediationRationale:
      'Dropping IP packets at the boundary stops the reverse TCP shell connection and prevents secondary payload stage downloads.',
    realWorldExample:
      'Apache Struts Equifax breach where unpatched OGNL parser vulnerabilities allowed attackers to extract 147 million records.',
  },
  LATERAL_MOVEMENT: {
    action: 'LATERAL_MOVEMENT',
    title: 'Internal Lateral Movement / Kerberoasting',
    whatItIs:
      'Techniques used by an attacker who has already breached one internal workstation to traverse across the subnet to compromise domain controllers and high-value databases.',
    whyDangerous:
      'Expands the blast radius from a single compromised laptop to enterprise-wide infrastructure domain control.',
    howQelDetectsIt:
      'Subnet hop telemetry produces temporal phase dissonance in QEL-T, dropping causality coherence below 75% as inter-node authentication jumps occur out of typical temporal sequence.',
    mitreId: 'T1021',
    mitreTactic: 'Lateral Movement / Remote Services & SMB/WinRM',
    recommendedPlaybook: 'KILL_CHAIN_TERMINATE',
    remediationRationale:
      'Revokes compromised Kerberos ticket-granting tickets (TGTs) and forces domain-wide credential invalidation to stop unauthorized traversal.',
    realWorldExample:
      'NotPetya malware which spread laterally across internal corporate networks via EternalBlue and Mimikatz token extraction in seconds.',
  },
  SCAN: {
    action: 'SCAN',
    title: 'Port & Service Reconnaissance Probing',
    whatItIs:
      'Automated probes (SYN scans, banner grabbing) identifying open listening ports, service versions, and perimeter defense topography.',
    whyDangerous:
      'Pre-attack reconnaissance uncovers unpatched daemons, misconfigured admin portals, and entry points for the weaponized phase of an attack.',
    howQelDetectsIt:
      'Sequential polling creates rhythmic low-energy pulses (sig 2-4) traversing nodes 0 to 11 in predictable rotational sequence.',
    mitreId: 'T1595',
    mitreTactic: 'Reconnaissance / Active Scanning',
    recommendedPlaybook: 'DEPLOY_QUANTUM_HONEYPOT',
    remediationRationale:
      'Deploying a synthetic honeypot decoying the scanner into an isolated observation silo feeds false topography to the adversary while tracking their toolchain signatures.',
    realWorldExample:
      'Masscan and Shodan crawling scanning IPv4 address space continuously looking for vulnerable exposed RDP/SSH ports.',
  },
  AUTH: {
    action: 'AUTH',
    title: 'Authentication & Credential Handshake',
    whatItIs:
      'Routine or elevated credential verification and authorization exchanges between client agents and authentication servers.',
    whyDangerous:
      'High-frequency AUTH pulses from a single IP indicate brute-force password spraying or credential stuffing using compromised credential dumps.',
    howQelDetectsIt:
      'Monitored in target profiles; if frequency exceeds 5 pulses/min or failure entropy spikes, threat score rises from baseline (10) into warning thresholds (>50).',
    mitreId: 'T1110',
    mitreTactic: 'Credential Access / Brute Force',
    recommendedPlaybook: 'ISOLATE_IP',
    remediationRationale:
      'Temporarily quarantine the offending client IP to halt automated credential dictionaries before accounts are locked or passwords guessed.',
    realWorldExample:
      'Credential stuffing campaigns against consumer portals using credential lists from third-party breaches.',
  },
  PULL: {
    action: 'PULL',
    title: 'Data Ingress & Telemetry Query',
    whatItIs:
      'Standard retrieval of telemetry records, configuration files, or database queries by client endpoints.',
    whyDangerous:
      'Unusual pull bursts from unauthorized endpoints can signal database exfiltration or unauthorized intellectual property harvesting.',
    howQelDetectsIt:
      'Evaluated against baseline node energy; sudden continuous drain shifts QEL-T causality depth upwards.',
    mitreId: 'T1005',
    mitreTactic: 'Collection / Data from Local System',
    recommendedPlaybook: 'KILL_CHAIN_TERMINATE',
    remediationRationale:
      'Sever connections to halt exfiltration while audit logs determine whether sensitive proprietary files were accessed.',
    realWorldExample:
      'Insider threat data exfiltration over encrypted HTTPS channels before departure.',
  },
  PUSH: {
    action: 'PUSH',
    title: 'Command Ingestion & Outbound Payload Burst',
    whatItIs:
      'Uploading configuration objects, command files, or pushing patches to distributed nodes.',
    whyDangerous:
      'Unauthorized push commands can inject webshells or rogue updates into production pipelines.',
    howQelDetectsIt:
      'Produces rapid phase concentration; verified against SHA-256 witness hash integrity chain.',
    mitreId: 'T1105',
    mitreTactic: 'Command and Control / Ingress Tool Transfer',
    recommendedPlaybook: 'ISOLATE_IP',
    remediationRationale:
      'Quarantines sender until cryptographic hash signatures verify upload legitimacy.',
    realWorldExample:
      'SolarWinds Orion supply chain compromise injecting malicious Sunburst updates.',
  },
  BEACON: {
    action: 'BEACON',
    title: 'Command & Control (C2) Heartbeat Beaconing',
    whatItIs:
      'Periodic, low-profile outbound heartbeats from an infected host contacting an external adversary command-and-control server.',
    whyDangerous:
      'Enables attackers to maintain persistent control, receive remote execution instructions, and coordinate coordinated lateral attacks.',
    howQelDetectsIt:
      'Fixed-interval jitter detection in QEL-S: consistent harmonic phase alignment without user interaction flags algorithmic beaconing.',
    mitreId: 'T1071',
    mitreTactic: 'Command and Control / Application Layer Protocol',
    recommendedPlaybook: 'KILL_CHAIN_TERMINATE',
    remediationRationale:
      'Terminates outbound socket connections and invalidates TLS session states to blind the external C2 controller.',
    realWorldExample:
      'Cobalt Strike Beacon HTTP/HTTPS profiles communicating back to threat actor team servers.',
  },
  CREDENTIAL_STUFFING: {
    action: 'CREDENTIAL_STUFFING',
    title: 'Automated Credential Stuffing Campaign',
    whatItIs:
      'Mass automated login attempts using username/password pairs stolen from other compromised websites.',
    whyDangerous:
      'Because users frequently reuse passwords, attackers achieve unauthorized access to sensitive accounts without triggering complex exploit alarms.',
    howQelDetectsIt:
      'High-velocity AUTH signal generation causing localized nodal resonance buildup across phases 0, 1, 2.',
    mitreId: 'T1110.004',
    mitreTactic: 'Credential Access / Credential Stuffing',
    recommendedPlaybook: 'ISOLATE_IP',
    remediationRationale:
      'Rate-limiting and IP isolation prevents attackers from exhausting credentials while alerting account owners.',
    realWorldExample:
      'Stuffing attacks targeting banking, healthcare, and streaming accounts using botnets with residential proxies.',
  },
};

export const PLAYBOOK_EXPLANATIONS = {
  ISOLATE_IP: {
    name: 'Isolate & Quarantine Ingress IP',
    whatItDoes:
      'Enforces an immediate boundary drop rule on the perimeter quantum firewall. All active TCP/UDP sockets originating from or targeting this IP are severed, and further ingress traffic is discarded.',
    whyRunIt:
      'Use this when an adversary is actively probing or exploiting a host. It prevents further damage, blocks data exfiltration, and isolates the threat while security teams conduct forensics.',
    bestForVectors: ['ZERO_DAY_DETECTED', 'EXPLOIT_ATTEMPT', 'AUTH', 'CREDENTIAL_STUFFING'],
  },
  HARMONIC_FREQUENCY_SHIFT: {
    name: 'Harmonic Phase Manifold Shift (+90°)',
    whatItDoes:
      'Dampens existing lattice energy across all 12 nodes by 50% and rotates the 3-6-9 vortex spiral by +90 degrees. This desynchronizes the lattice from incoming automated attack patterns.',
    whyRunIt:
      'Use this during volumetric attacks (such as DDoS surges or synchronized bot floods) where attackers rely on synchronized harmonic reinforcement to overwhelm system buffers.',
    bestForVectors: ['DDOS_SURGE', 'BEACON'],
  },
  DEPLOY_QUANTUM_HONEYPOT: {
    name: 'Deploy Synthetic Honeypot Decoy',
    whatItDoes:
      'Spins up a synthetic decoy node on an isolated phase and reroutes scanning traffic away from real production assets into an instrumented sandbox.',
    whyRunIt:
      'Use this during reconnaissance (port scans, crawler probes). Instead of revealing real infrastructure, you lure the attacker into a sandbox to capture their IP, tool signatures, and attack intentions without risk.',
    bestForVectors: ['SCAN', 'PULL'],
  },
  KILL_CHAIN_TERMINATE: {
    name: 'Terminate Kill-Chain Session Tokens',
    whatItDoes:
      'Invalidates all active cryptographic authentication tickets, OAuth access tokens, and TLS sessions associated with the compromised session identity.',
    whyRunIt:
      'Use this when an attacker has bypassed initial perimeter defense (e.g., via SQL injection, stolen session tokens, or lateral movement). It stops active command execution immediately without needing to reboot servers.',
    bestForVectors: ['SQL_INJECTION', 'LATERAL_MOVEMENT', 'BEACON'],
  },
};

export const INTERACTIVE_SCENARIOS: InteractiveDrillScenario[] = [
  {
    id: 'drill-zero-day',
    title: 'Scenario 1: Defend Against a QEL-X Zero-Day Vector',
    vector: 'ZERO_DAY_DETECTED',
    attackerIp: '185.220.101.5',
    brief:
      'A foreign rogue node is transmitting unverified memory execution shellcode targeting an undocumented endpoint. QEL-X has raised a CRITICAL alert.',
    detectionClue:
      'Lattice Phase 08 spiked with harmonic signal 9, causing entropy to surge past nominal thresholds.',
    whyDangerous:
      'Standard endpoint agents do not have signatures for this payload. If unmitigated, the attacker will gain root command execution on the host.',
    idealResponse: 'ISOLATE_IP',
    explanation:
      'Immediate perimeter quarantine (ISOLATE_IP) severs the attacker connection at the firewall level before command-and-control can establish.',
  },
  {
    id: 'drill-ddos-flood',
    title: 'Scenario 2: Neutralize a Volumetric DDoS Resonance Flood',
    vector: 'DDOS_SURGE',
    attackerIp: '198.51.100.99',
    brief:
      'A multi-node botnet is flooding the ingress gateway with repetitive requests, attempting to overwhelm the 0.963 damping dissipation rate.',
    detectionClue:
      'Entropy has exceeded 400.0, and QEL-A kinetic shielding deflection is dropping toward critical levels.',
    whyDangerous:
      'Legitimate traffic is being delayed or dropped; server CPU buffers are approaching 100% capacity.',
    idealResponse: 'HARMONIC_FREQUENCY_SHIFT',
    explanation:
      'Executing a Harmonic Frequency Shift (+90°) desynchronizes the vortex manifold and induces destructive wave interference to nullify the resonance amplification.',
  },
  {
    id: 'drill-sql-injection',
    title: 'Scenario 3: Halt a Blind SQL Injection & Exfiltration Attempt',
    vector: 'SQL_INJECTION',
    attackerIp: '203.0.113.88',
    brief:
      'An attacker is submitting crafted SQL union statements through user input fields, attempting to dump client data.',
    detectionClue:
      'Odd-numbered phase nodes show irregular high-Q spikes with ASCII syntax offset signals.',
    whyDangerous:
      'Private customer records and administrative credentials could be exfiltrated within seconds.',
    idealResponse: 'KILL_CHAIN_TERMINATE',
    explanation:
      'Terminating the Kill-Chain invalidates all active session tokens immediately, severing the attacker database pipe while the backend query is sanitized.',
  },
];
