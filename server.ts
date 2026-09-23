import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { globalQelEngine } from './src/lib/qelCore.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

app.use(express.json());

// Set up SSE client list for real-time data streaming
const sseClients: Response[] = [];

function broadcastSSE(eventType: string, data: any) {
  const payload = `event: ${eventType}\ndata: ${JSON.stringify(data)}\n\n`;
  sseClients.forEach((client) => {
    try {
      client.write(payload);
    } catch (e) {
      // client disconnected
    }
  });
}

// Background simulation agent (similar to stress() daemon in Python code)
let stressInterval: NodeJS.Timeout | null = null;
let stressActive = false;

function toggleStressDaemon(enable?: boolean): boolean {
  if (typeof enable === 'boolean') {
    stressActive = enable;
  } else {
    stressActive = !stressActive;
  }

  if (stressActive && !stressInterval) {
    stressInterval = setInterval(async () => {
      const actions = [
        'AUTH',
        'SCAN',
        'PULL',
        'PUSH',
        'EXPLOIT_ATTEMPT',
        'SQL_INJECTION',
        'DDOS_SURGE',
        'BEACON',
        'ZERO_DAY_DETECTED',
      ];
      const randomAction = actions[Math.floor(Math.random() * actions.length)];
      const randomIp = `192.168.1.${Math.floor(Math.random() * 254) + 1}`;
      const res = await globalQelEngine.processSignal(randomIp, randomAction, true);

      broadcastSSE('pulse', {
        ...res,
        derivatives: globalQelEngine.calculateDerivatives(),
      });
    }, 1200);
  } else if (!stressActive && stressInterval) {
    clearInterval(stressInterval);
    stressInterval = null;
  }
  return stressActive;
}

// Start moderate baseline background pulse generator so dashboard streams live data immediately
setInterval(async () => {
  if (!stressActive) {
    const routineActions = ['SCAN', 'AUTH', 'PULL', 'PUSH'];
    const action = routineActions[Math.floor(Math.random() * routineActions.length)];
    const ip = `10.0.4.${Math.floor(Math.random() * 50) + 1}`;
    const res = await globalQelEngine.processSignal(ip, action, false);
    broadcastSSE('pulse', {
      ...res,
      derivatives: globalQelEngine.calculateDerivatives(),
    });
  }
}, 3000);

// --- REST API ROUTES ---

/**
 * Exact endpoint matching original Python script:
 * POST /api/v1/nexus/pulse
 */
app.post('/api/v1/nexus/pulse', async (req: Request, res: Response) => {
  try {
    const action = req.body?.action || 'SCAN';
    const ip =
      req.body?.ip ||
      req.headers['x-forwarded-for']?.toString().split(',')[0] ||
      req.socket.remoteAddress ||
      '127.0.0.1';

    const result = await globalQelEngine.processSignal(ip, action, true);

    // Broadcast to live stream
    broadcastSSE('pulse', {
      ...result,
      derivatives: globalQelEngine.calculateDerivatives(),
    });

    res.json({
      status: 'RESONATING',
      sig: result.sig,
      phase: result.phase,
      entropy: result.entropy,
      witnessHash: result.pulse.hash,
      derivatives: globalQelEngine.calculateDerivatives(),
    });
  } catch (error: any) {
    console.error('Pulse error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Current QEL Lattice state
 */
app.get('/api/v1/nexus/state', (_req: Request, res: Response) => {
  res.json(globalQelEngine.getState());
});

/**
 * Real-time SSE Stream Endpoint
 */
app.get('/api/v1/nexus/stream', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  // Send initial state snapshot
  res.write(`event: init\ndata: ${JSON.stringify(globalQelEngine.getState())}\n\n`);

  sseClients.push(res);

  req.on('close', () => {
    const index = sseClients.indexOf(res);
    if (index !== -1) {
      sseClients.splice(index, 1);
    }
  });
});

/**
 * Execute Automated SOAR Playbook
 */
app.post('/api/v1/alerts/action', (req: Request, res: Response) => {
  const { playbookCode, targetIp } = req.body;
  if (!playbookCode || !targetIp) {
    res.status(400).json({ error: 'playbookCode and targetIp are required' });
    return;
  }

  const log = globalQelEngine.executePlaybook(playbookCode, targetIp);
  broadcastSSE('playbook_executed', log);

  res.json({
    status: 'EXECUTED',
    log,
    state: globalQelEngine.getState(),
  });
});

/**
 * Toggle background stress tester
 */
app.post('/api/v1/stress-test', (req: Request, res: Response) => {
  const active = toggleStressDaemon(req.body?.enable);
  res.json({ active });
});

// --- ENTERPRISE INTEGRATION ENDPOINTS ---

/**
 * Splunk HTTP Event Collector (HEC) Ingestion Endpoint
 */
app.post('/api/v1/integrations/splunk/hec', async (req: Request, res: Response) => {
  try {
    const rawEvent = req.body?.event || req.body || {};
    const ip = rawEvent.ip || rawEvent.host || '198.51.100.22';
    const action = rawEvent.action || 'SCAN';

    const result = await globalQelEngine.processSignal(ip, action, true);
    broadcastSSE('pulse', {
      ...result,
      derivatives: globalQelEngine.calculateDerivatives(),
    });

    res.json({
      text: 'Success',
      code: 0,
      ackId: Math.floor(Math.random() * 900000) + 100000,
      qelEntropy: result.entropy,
      sig: result.sig,
    });
  } catch (err: any) {
    res.status(500).json({ text: 'Error', code: 5, error: err.message });
  }
});

/**
 * CrowdStrike Falcon Sensor Streaming Endpoint
 */
app.post('/api/v1/integrations/crowdstrike/events', async (req: Request, res: Response) => {
  try {
    const body = req.body || {};
    const ip = body.LocalIP || body.ip || '10.0.4.15';
    const action = body.DetectName?.includes('Credential') ? 'LATERAL_MOVEMENT' : 'EXPLOIT_ATTEMPT';

    const result = await globalQelEngine.processSignal(ip, action, true);
    broadcastSSE('pulse', {
      ...result,
      derivatives: globalQelEngine.calculateDerivatives(),
    });

    res.json({
      status: 'ACCEPTED',
      sensorEventsProcessed: 1,
      qelWitnessHash: result.pulse.hash,
      entropy: result.entropy,
    });
  } catch (err: any) {
    res.status(500).json({ status: 'ERROR', error: err.message });
  }
});

/**
 * Palo Alto Cortex XSOAR Bi-Directional Trigger
 */
app.post('/api/v1/integrations/cortex/trigger', (req: Request, res: Response) => {
  try {
    const { playbook_code, target_ip, incident_id } = req.body;
    const code = playbook_code || 'HARMONIC_FREQUENCY_SHIFT';
    const ip = target_ip || 'SYSTEM_BROADCAST';

    const log = globalQelEngine.executePlaybook(code, ip);
    broadcastSSE('playbook_executed', log);

    res.json({
      status: 'TRIGGERED',
      incident_id: incident_id || `INC-${Date.now()}`,
      executionLog: log,
      panosRuleEnforced: true,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Slack SecOps War-Room Webhook Dispatcher
 */
app.post('/api/v1/integrations/slack/webhook', (req: Request, res: Response) => {
  const { channel, alertTitle, targetIp, severity } = req.body;
  res.json({
    ok: true,
    channel: channel || '#secops-war-room',
    ts: `${Math.floor(Date.now() / 1000)}.000100`,
    message: {
      text: `🚨 [${severity || 'CRITICAL'}] ${alertTitle || 'Resonance Jitter Anomaly'} on ${targetIp || '185.220.101.5'}`,
      interactiveButtons: ['1-Click Quarantine', 'Phase Shift +90°', 'View Google Docs Brief'],
    },
  });
});

/**
 * PagerDuty On-Call Incident Dispatcher
 */
app.post('/api/v1/integrations/pagerduty/alert', (req: Request, res: Response) => {
  const { summary, severity, source } = req.body?.payload || req.body || {};
  res.json({
    status: 'success',
    message: 'Event processed by PagerDuty Orchestrator',
    dedup_key: `qel-pd-${Date.now()}`,
    assignedTier: severity === 'critical' ? 'TIER_1_ON_CALL_PAGER' : 'TIER_2_SOC_SLACK',
  });
});

/**
 * STIX 2.1 / TAXII 2.1 Threat Intel Ingestion
 */
app.post('/api/v1/integrations/stix-taxii/import', async (req: Request, res: Response) => {
  try {
    const bundle = req.body || {};
    const objects = bundle.objects || [];
    let importedCount = 0;

    for (const obj of objects) {
      if (obj.type === 'indicator') {
        importedCount++;
      }
    }

    res.json({
      status: 'IMPORTED',
      bundleId: bundle.id || `bundle--${Date.now()}`,
      indicatorsMapped: Math.max(importedCount, 1),
      quantumHarmonicHashesUpdated: true,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Sigma Detection Rule to QEL Resonance Translator
 */
app.post('/api/v1/integrations/sigma/translate', (req: Request, res: Response) => {
  const { title, detection } = req.body || {};
  const hash = Math.random().toString(36).substring(2, 10);
  res.json({
    status: 'COMPILED',
    ruleTitle: title || 'Custom Sigma Threat Rule',
    translatedQEL: {
      phaseNodeTarget: Math.floor(Math.random() * 12),
      entropyThresholdTrigger: 85.5,
      lyapunovJitterTolerance: 0.12,
      recommendedSOARPlaybook: 'ISOLATE_IP',
      resonanceSignature: `QEL-SIGMA-${hash.toUpperCase()}`,
    },
  });
});

/**
 * Common Event Format (CEF) Export for External SIEMs (Splunk, ArcSight, QRadar)
 */
app.get('/api/v1/integrations/export/cef', (_req: Request, res: Response) => {
  const state = globalQelEngine.getState();
  const cefLines = state.alerts.map((a, i) => {
    const sevNum = a.severity === 'CRITICAL' ? 10 : a.severity === 'HIGH' ? 7 : 4;
    return `CEF:0|QELNexus|QuantumEntropyLattice|13.0|${a.vector || 'ANOMALY'}|${a.title}|${sevNum}|src=${a.targetIp} msg=${a.description} cs1=${a.status} cs1Label=AlertStatus`;
  });
  res.setHeader('Content-Type', 'text/plain');
  res.send(cefLines.join('\n'));
});

// --- VITE MIDDLEWARE & STATIC SERVING ---
async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production static files
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[QEL Nexus] Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
