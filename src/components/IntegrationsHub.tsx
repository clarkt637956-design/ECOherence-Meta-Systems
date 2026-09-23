import React, { useState } from 'react';
import {
  Network,
  Share2,
  CheckCircle2,
  Radio,
  Copy,
  ExternalLink,
  Send,
  Zap,
  ShieldCheck,
  FileCode,
  Terminal,
  Activity,
  Layers,
  ArrowRight,
  Download,
} from 'lucide-react';
import { INTEGRATION_CONNECTORS } from '../lib/integrationsData.ts';
import { IntegrationConnector } from '../types.ts';
import { soundFx } from '../lib/audio.ts';

interface IntegrationsHubProps {
  onTriggerNotification?: (title: string, msg: string, type?: 'SUCCESS' | 'ALERT' | 'INFO') => void;
}

export const IntegrationsHub: React.FC<IntegrationsHubProps> = ({ onTriggerNotification }) => {
  const [selectedConnector, setSelectedConnector] = useState<IntegrationConnector>(
    INTEGRATION_CONNECTORS[0]
  );
  const [testResponse, setTestResponse] = useState<any | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('ALL');

  const categories = ['ALL', 'SIEM', 'EDR', 'SOAR', 'INCIDENT_DISPATCH', 'THREAT_INTEL', 'RULE_CONVERTER'];

  const filteredConnectors = INTEGRATION_CONNECTORS.filter((c) => {
    if (activeCategory === 'ALL') return true;
    return c.category === activeCategory;
  });

  const handleTestConnector = async (connector: IntegrationConnector) => {
    setIsTesting(true);
    soundFx.playClick();
    try {
      const res = await fetch(connector.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(connector.samplePayload),
      });
      const data = await res.json();
      setTestResponse(data);
      soundFx.playSuccess();
      if (onTriggerNotification) {
        onTriggerNotification(
          `Connector Ingestion Verified: ${connector.name}`,
          `Payload delivered to ${connector.endpoint} — Status: ${res.status} OK`,
          'SUCCESS'
        );
      }
    } catch (err: any) {
      setTestResponse({ error: err.message, status: 'FAILED' });
      if (onTriggerNotification) {
        onTriggerNotification(
          `Ingestion Test Error`,
          `Failed delivering test payload: ${err.message}`,
          'ALERT'
        );
      }
    } finally {
      setIsTesting(false);
    }
  };

  const handleCopyEndpoint = (endpoint: string) => {
    soundFx.playClick();
    const fullUrl = `${window.location.origin}${endpoint}`;
    navigator.clipboard.writeText(fullUrl);
    if (onTriggerNotification) {
      onTriggerNotification('Endpoint Copied', `Copied ${fullUrl} to clipboard.`, 'INFO');
    }
  };

  const handleDownloadCEF = async () => {
    soundFx.playClick();
    try {
      const res = await fetch('/api/v1/integrations/export/cef');
      const text = await res.text();
      const blob = new Blob([text], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `qel_alerts_${Date.now()}.cef`;
      a.click();
      URL.revokeObjectURL(url);
      if (onTriggerNotification) {
        onTriggerNotification(
          'CEF Export Generated',
          'Downloaded ArcSight / Splunk Common Event Format alert export.',
          'SUCCESS'
        );
      }
    } catch (err) {}
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-[#060a16] border border-cyan-500/30 rounded-lg p-4 sm:p-5 hud-corner shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Network className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base sm:text-lg font-bold text-white font-heading uppercase tracking-wider">
              Enterprise Integration Gateway &amp; Ingestion Mesh
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-700">
              8 CONNECTORS ACTIVE
            </span>
          </div>
          <p className="text-xs text-slate-300 font-mono max-w-2xl leading-relaxed">
            Bi-directional connectors bridging QEL’s sub-millisecond quantum resonance lattice with
            industry SIEM, EDR, SOAR, and CTI standards (Splunk HEC, CrowdStrike Falcon, Cortex XSOAR,
            Sentinel, Slack, STIX 2.1, and Sigma).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadCEF}
            className="px-3 py-2 rounded bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/60 text-cyan-200 text-xs font-mono font-bold flex items-center gap-2 transition"
            title="Export all active alerts in ArcSight CEF format for external SIEMs"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Export CEF Stream</span>
          </button>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
        <span className="text-slate-400 text-[11px] mr-1">Filter by Layer:</span>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => {
              soundFx.playClick();
              setActiveCategory(cat);
            }}
            className={`px-2.5 py-1 rounded transition border ${
              activeCategory === cat
                ? 'bg-cyan-950 text-cyan-200 border-cyan-400 font-bold'
                : 'bg-black/50 text-slate-400 border-slate-800 hover:text-white'
            }`}
          >
            {cat.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Main Grid: Left Connectors List, Right Detail & Test Console */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Connector Cards */}
        <div className="lg:col-span-5 space-y-2.5 max-h-[640px] overflow-y-auto pr-1 font-mono text-xs">
          {filteredConnectors.map((connector) => {
            const isSelected = selectedConnector.id === connector.id;
            return (
              <button
                key={connector.id}
                onClick={() => {
                  soundFx.playClick();
                  setSelectedConnector(connector);
                  setTestResponse(null);
                }}
                className={`w-full text-left p-3 rounded-lg border transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'bg-cyan-950/70 border-cyan-400 shadow-md shadow-cyan-950'
                    : 'bg-black/40 border-slate-800/80 hover:border-cyan-900 hover:bg-slate-900/30'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-xs">{connector.name}</span>
                  </div>
                  <span
                    className={`text-[9px] px-1.5 py-0.2 rounded font-bold border ${
                      connector.status === 'CONNECTED'
                        ? 'bg-emerald-950 text-emerald-300 border-emerald-700'
                        : connector.status === 'STREAMING'
                        ? 'bg-cyan-950 text-cyan-300 border-cyan-700 animate-pulse'
                        : 'bg-amber-950 text-amber-300 border-amber-700'
                    }`}
                  >
                    {connector.status}
                  </span>
                </div>

                <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed mb-2">
                  {connector.description}
                </p>

                <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1.5 border-t border-slate-900">
                  <span>Vendor: <strong className="text-slate-300">{connector.vendor}</strong></span>
                  <span>Ingested: <strong className="text-cyan-400">{connector.eventsIngested.toLocaleString()}</strong></span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Detail & Live Test Sandbox Console */}
        <div className="lg:col-span-7 bg-[#070b18]/95 border border-cyan-500/30 rounded-lg p-5 hud-corner shadow-xl space-y-4 font-mono text-xs">
          <div className="flex flex-wrap items-start justify-between border-b border-cyan-950 pb-3 gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-700">
                  {selectedConnector.category}
                </span>
                <h3 className="text-sm sm:text-base font-bold text-white font-heading">
                  {selectedConnector.name}
                </h3>
              </div>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                {selectedConnector.description}
              </p>
            </div>

            <button
              onClick={() => handleTestConnector(selectedConnector)}
              disabled={isTesting}
              className="px-3.5 py-2 rounded bg-cyan-500 hover:bg-cyan-400 text-black font-bold flex items-center gap-1.5 shadow-lg shadow-cyan-950 transition font-heading tracking-wider ml-auto disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5 text-black" />
              <span>{isTesting ? 'Ingesting...' : 'Test Live Ingest'}</span>
            </button>
          </div>

          {/* Capabilities Badges */}
          <div>
            <span className="text-[11px] text-slate-400 block mb-1 font-bold">
              Supported Enterprise Capabilities:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {selectedConnector.capabilities.map((cap, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300 text-[10px]"
                >
                  ✓ {cap}
                </span>
              ))}
            </div>
          </div>

          {/* Ingestion Webhook Endpoint */}
          <div>
            <div className="flex items-center justify-between text-slate-400 text-[11px] mb-1">
              <span>Rest Ingestion Webhook URL:</span>
              <button
                onClick={() => handleCopyEndpoint(selectedConnector.endpoint)}
                className="text-[10px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
              >
                <Copy className="w-3 h-3" />
                <span>Copy Full URL</span>
              </button>
            </div>
            <div className="p-2.5 rounded bg-black/80 border border-cyan-950 flex items-center justify-between text-cyan-300 text-xs font-mono">
              <span className="truncate">{selectedConnector.endpoint}</span>
              <span className="text-[10px] text-slate-500 font-bold ml-2">POST</span>
            </div>
          </div>

          {/* Sample JSON Ingestion Payload */}
          <div>
            <span className="text-[11px] text-slate-400 block mb-1">
              Live Ingestion Sample Payload (JSON):
            </span>
            <pre className="p-3 rounded bg-black/80 border border-slate-900 text-slate-300 text-[11px] overflow-x-auto max-h-40 leading-snug">
              {JSON.stringify(selectedConnector.samplePayload, null, 2)}
            </pre>
          </div>

          {/* Real-time Response Test Console */}
          {testResponse && (
            <div className="p-3.5 rounded bg-emerald-950/20 border border-emerald-500/50 space-y-1.5 animate-in fade-in duration-200">
              <div className="flex items-center justify-between text-emerald-300 text-xs font-bold">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Ingestion Acknowledged &amp; Resonance Updated</span>
                </span>
                <span className="text-[10px] text-slate-400 font-mono">HTTP 200 OK</span>
              </div>
              <pre className="text-[10px] text-emerald-200/90 font-mono overflow-x-auto bg-black/60 p-2 rounded border border-emerald-900">
                {JSON.stringify(testResponse, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
