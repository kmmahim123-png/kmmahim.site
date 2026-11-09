import React, { useState } from 'react';
import { useOS } from '../context/OSContext';
import {
  Bot, Cpu, Terminal, Sparkles, Key, ShieldCheck, Send,
  Smartphone, Download, Upload, Zap
} from 'lucide-react';

export default function AgentHub() {
  const { data, setData, dispatchAgentCommand, updateAgentConfig } = useOS();
  const { agents } = data;

  const [selectedBot, setSelectedBot] = useState('Broker Orchestrator');
  const [commandInput, setCommandInput] = useState('');
  const [webhookInput, setWebhookInput] = useState(agents.webhookUrl || '');

  const handleSendCommand = (e) => {
    e.preventDefault();
    if (!commandInput.trim()) return;
    dispatchAgentCommand(selectedBot, commandInput);
    setCommandInput('');
  };

  const handleGenerateDailyRoutine = () => {
    dispatchAgentCommand(
      'Broker Orchestrator',
      'Morning Routine: 1) Gym Workout + Minoxidil, 2) 2 Pomodoro Study Blocks, 3) Approve OpenClaw Social Post'
    );
  };

  const handleExportBackup = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `KM_Mahim_OS_Sync_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2.5">
            <Bot className="w-6 h-6 text-indigo-400"/>
            <span>AI Agent Command Center (OpenClaw • Grok • Hermes)</span>
          </h1>
          <p className="text-xs text-slate-400">
            Control your autonomous agents, assign daily tasks, configure webhooks, and sync with your Android APK
          </p>
        </div>

        <button
          onClick={handleGenerateDailyRoutine}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-xs font-semibold text-white flex items-center gap-2 shadow-lg shadow-indigo-600/20"
        >
          <Zap className="w-4 h-4"/>
          <span>Ask Broker Agent for Today’s Tasks</span>
        </button>
      </div>

      {/* Active Agent Fleet Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {(agents.bots || []).map((bot) => (
          <div
            key={bot.id}
            onClick={() => setSelectedBot(bot.name)}
            className={`p-4 rounded-2xl border cursor-pointer transition ${
              selectedBot === bot.name
                ? 'bg-indigo-950/50 border-indigo-500'
                : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                ● {bot.status}
              </span>
              <Cpu className="w-4 h-4 text-cyan-400"/>
            </div>
            <h3 className="font-bold text-sm text-white">{bot.name}</h3>
            <p className="text-[11px] text-slate-400 mt-1">{bot.role}</p>
            <p className="text-[10px] text-indigo-300 font-mono mt-3 pt-2 border-t border-slate-800/80">
              Last: {bot.lastTask}
            </p>
          </div>
        ))}
      </div>

      {/* Command Dispatch + Live Logs */}
      <div className="grid lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-slate-900/70 border border-slate-800 rounded-2xl p-5 space-y-4">
          <h3 className="font-bold text-sm flex items-center gap-2">
            <Terminal className="w-4 h-4 text-emerald-400"/>
            <span>Direct Agent Command Terminal</span>
          </h3>

          <form onSubmit={handleSendCommand} className="space-y-3">
            <div className="grid sm:grid-cols-3 gap-3">
              <select
                value={selectedBot}
                onChange={(e) => setSelectedBot(e.target.value)}
                className="px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-indigo-300 font-semibold"
              >
                <option value="Broker Orchestrator">Broker Orchestrator</option>
                <option value="OpenClaw Agent">OpenClaw Agent</option>
                <option value="Grok Research Bot">Grok Research Bot</option>
                <option value="Hermes Logic Agent">Hermes Logic Agent</option>
              </select>

              <input
                type="text"
                placeholder="Give a command (e.g. Research viral fitness reels & add to daily goal)..."
                value={commandInput}
                onChange={(e) => setCommandInput(e.target.value)}
                className="sm:col-span-2 px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white flex items-center justify-center gap-2"
            >
              <Send className="w-3.5 h-3.5"/>
              <span>Execute Command & Sync with Daily Goals</span>
            </button>
          </form>

          {/* Activity Log */}
          <div className="pt-3 border-t border-slate-800 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
              Live Agent Execution Logs
            </span>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {(agents.logs || []).map((log) => (
                <div
                  key={log.id}
                  className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 text-xs flex items-center justify-between gap-2"
                >
                  <div>
                    <span className="font-bold text-cyan-400">[{log.agent}]</span>{' '}
                    <span className="text-slate-300">{log.text}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 shrink-0">{log.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Webhook Gateway & APK Mobile Sync */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 space-y-3">
            <h3 className="font-bold text-sm flex items-center gap-2">
              <Key className="w-4 h-4 text-amber-400"/>
              <span>OpenClaw / n8n Webhook & API Bridge</span>
            </h3>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Webhook Endpoint URL</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={webhookInput}
                  onChange={(e) => setWebhookInput(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300"
                />
                <button
                  type="button"
                  onClick={() => updateAgentConfig({ webhookUrl: webhookInput })}
                  className="px-3 py-2 rounded-xl bg-emerald-600 text-xs font-semibold text-white"
                >
                  Save
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 text-xs">
              <span className="text-slate-400">Secret Agent API Key:</span>
              <code className="px-2.5 py-1 rounded bg-slate-950 border border-slate-800 text-cyan-300 font-mono">
                {agents.apiKey}
              </code>
            </div>
          </div>

          <div className="bg-gradient-to-br from-indigo-950/50 to-slate-900 border border-indigo-500/30 rounded-2xl p-5 space-y-3">
            <h3 className="font-bold text-sm flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-cyan-400"/>
              <span>Mobile APK & Cloud Data Backup</span>
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Your Website and Android APK share the same OS structure. Export or sync your JSON database anytime.
            </p>
            <button
              onClick={handleExportBackup}
              className="w-full py-2.5 rounded-xl bg-slate-950 hover:bg-slate-900 border border-slate-700 text-xs font-semibold text-cyan-300 flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4"/>
              <span>Download Full Life OS Backup (.json)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
