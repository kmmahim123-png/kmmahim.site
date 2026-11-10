import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOS } from '../context/OSContext';
import { AI_PROVIDERS, buildOSSystemPrompt, runAICopilotPrompt } from '../services/aiEngine';
import { SoundFX } from './common/SoundEffects';
import {
  Sparkles, Send, Mic, MicOff, Key, CheckCircle2, FileText,
  Copy, Check, BookmarkPlus, X, Bot, ShieldAlert, Play, Trash2
} from 'lucide-react';

const CONFIRM_SENSITIVE_TOOLS = new Set(['gmail_send', 'whatsapp_send', 'calendar_create']);

export default function AICopilotDrawer({ embedded = false, onClose }) {
  const {
    data,
    secretConfig,
    updateSecretConfig,
    googleSession,
    integrationFeeds,
    aiMessages,
    setAiMessages,
    activeArtifact,
    setActiveArtifact,
    executeAITools,
    upsertSecondBrainNote
  } = useOS();

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showKeyConfig, setShowKeyConfig] = useState(!secretConfig.aiApiKey);
  const [isListening, setIsListening] = useState(false);
  const [copiedArtifact, setCopiedArtifact] = useState(false);
  const [pendingSensitive, setPendingSensitive] = useState([]); // { action, executed }

  const scrollRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [aiMessages, loading]);

  const handleVoiceToggle = () => {
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRec) {
      alert('এই ব্রাউজারে ভয়েস টাইপিং সাপোর্টেড নয় (Chrome ব্যবহার করুন)।');
      return;
    }
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
      return;
    }
    const rec = new SpeechRec();
    rec.lang = 'bn-BD';
    rec.interimResults = false;
    rec.onresult = (e) => {
      const text = e.results?.[0]?.[0]?.transcript || '';
      if (text) setInput((prev) => (prev ? `${prev} ${text}` : text));
    };
    rec.onend = () => setIsListening(false);
    rec.onerror = () => setIsListening(false);
    recognitionRef.current = rec;
    setIsListening(true);
    rec.start();
  };

  const handleSend = async (customText = null) => {
    const promptText = String(customText ?? input).trim();
    if (!promptText || loading) return;

    if (!secretConfig.aiApiKey) {
      setShowKeyConfig(true);
      return;
    }

    SoundFX.click();
    if (!customText) setInput('');

    const userMsg = { id: 'u_' + Date.now(), role: 'user', content: promptText };
    const nextHistory = [...aiMessages, userMsg];
    setAiMessages(nextHistory);
    setLoading(true);

    try {
      const systemPrompt = buildOSSystemPrompt(data, {
        googleAccessToken: Boolean(googleSession.accessToken),
        whatsappConfigured: Boolean(secretConfig.metaWaToken && secretConfig.metaWaPhoneId),
        emailsLoaded: integrationFeeds.emails?.length || 0
      });

      const response = await runAICopilotPrompt({
        provider: secretConfig.aiProvider || 'gemini',
        apiKey: secretConfig.aiApiKey,
        model: secretConfig.aiModel,
        systemPrompt,
        messages: nextHistory.slice(-10)
      });

      const safeActions = (response.actions || []).filter((a) => !CONFIRM_SENSITIVE_TOOLS.has(a.tool));
      const sensitiveActions = (response.actions || []).filter((a) => CONFIRM_SENSITIVE_TOOLS.has(a.tool));

      let execLogs = [];
      if (safeActions.length > 0) {
        execLogs = await executeAITools(safeActions);
      }
      if (sensitiveActions.length > 0) {
        setPendingSensitive(sensitiveActions.map((a, idx) => ({ id: `${Date.now()}_${idx}`, action: a, done: false })));
      }

      if (response.artifact) {
        setActiveArtifact(response.artifact);
      }

      const assistantMsg = {
        id: 'a_' + Date.now(),
        role: 'assistant',
        content: response.reply,
        execLogs,
        artifact: response.artifact || null
      };
      setAiMessages((prev) => [...prev, assistantMsg]);
      SoundFX.success();
    } catch (err) {
      setAiMessages((prev) => [
        ...prev,
        {
          id: 'err_' + Date.now(),
          role: 'assistant',
          content: `⚠️ AI Error: ${err.message}`,
          execLogs: []
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmSensitive = async (item) => {
    SoundFX.laser();
    const logs = await executeAITools([item.action]);
    setPendingSensitive((prev) => prev.map((p) => (p.id === item.id ? { ...p, done: true, log: logs[0] } : p)));
    setAiMessages((prev) => [
      ...prev,
      { id: 'act_' + Date.now(), role: 'assistant', content: logs[0] || 'Action executed.', execLogs: [] }
    ]);
  };

  const quickPrompts = [
    'আজকের খরচ, মিল ও হ্যাবিটের পূর্ণ সামারি এবং পরামর্শ দাও',
    'আজ দুপুর ও রাতের মিল ১+১ লগ করো',
    'আমার Gmail ও আজকের Google Calendar ইভেন্ট চেক করো',
    'Sports Science রিভিশনের জন্য "Biomechanics" সেকশন ও ৫টি ফ্ল্যাশকার্ড বানাও',
    'JACKFRU ব্র্যান্ডের জন্য একটি ক্লায়েন্ট প্রপোজাল Artifact বানাও'
  ];

  const container = (
    <div
      className={`flex flex-col ${
        embedded
          ? 'glass-crystal rounded-3xl overflow-hidden min-h-[76vh]'
          : 'w-full max-w-6xl h-[88vh] bg-slate-950 border border-white/15 rounded-3xl shadow-2xl overflow-hidden'
      }`}
    >
      {/* Top Claude-Style Toolbar */}
      <div className="px-5 py-3.5 border-b border-white/10 bg-slate-950/80 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-indigo-500 via-cyan-500 to-emerald-400 flex items-center justify-center text-white shadow-lg">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-black text-white flex items-center gap-2">
              <span>Claude-Style AI Copilot & Workbench</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {AI_PROVIDERS[secretConfig.aiProvider || 'gemini']?.label}
              </span>
            </h2>
            <p className="text-[11px] text-slate-400">
              API Key দিন — AI সরাসরি Finance, Meals, Brain, Custom Modules, Gmail, Calendar ও WhatsApp নিয়ন্ত্রণ করবে
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowKeyConfig(!showKeyConfig)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition ${
              secretConfig.aiApiKey
                ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                : 'bg-amber-500/20 border-amber-500/40 text-amber-300 animate-pulse'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>{secretConfig.aiApiKey ? 'API Key Connected' : 'Set AI API Key'}</span>
          </button>

          <button
            type="button"
            onClick={() => setAiMessages(aiMessages.slice(0, 1))}
            title="Clear chat"
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>

          {!embedded && onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-white/5 hover:bg-rose-600 text-slate-300 hover:text-white transition"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Collapsible Multi-Provider API Key Config */}
      <AnimatePresence>
        {showKeyConfig && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-b border-white/10 bg-slate-900/90 px-5 py-4"
          >
            <div className="grid sm:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">AI Provider</label>
                <select
                  value={secretConfig.aiProvider || 'gemini'}
                  onChange={(e) => updateSecretConfig({ aiProvider: e.target.value, aiModel: '' })}
                  className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                >
                  {Object.values(AI_PROVIDERS).map((p) => (
                    <option key={p.id} value={p.id} className="bg-slate-900">
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="text-[10px] text-slate-400 block mb-1">
                  API Key (শুধু আপনার এই ডিভাইসেই সুরক্ষিত থাকে)
                </label>
                <input
                  type="password"
                  placeholder={AI_PROVIDERS[secretConfig.aiProvider || 'gemini']?.hint}
                  value={secretConfig.aiApiKey || ''}
                  onChange={(e) => updateSecretConfig({ aiApiKey: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl glass-input text-xs font-mono"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Model (ঐচ্ছিক)</label>
                <input
                  type="text"
                  placeholder={AI_PROVIDERS[secretConfig.aiProvider || 'gemini']?.defaultModel}
                  value={secretConfig.aiModel || ''}
                  onChange={(e) => updateSecretConfig({ aiModel: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl glass-input text-xs font-mono"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Split Workspace: Left Chat + Right Artifact / Action Panel */}
      <div className="flex-1 grid lg:grid-cols-12 min-h-0 overflow-hidden">
        {/* Left: Chat */}
        <div className="lg:col-span-7 flex flex-col min-h-0 border-r border-white/10">
          {/* Quick Prompt Chips */}
          <div className="px-4 py-2 border-b border-white/5 flex items-center gap-2 overflow-x-auto no-scrollbar">
            {quickPrompts.map((qp, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSend(qp)}
                className="px-2.5 py-1 rounded-full bg-white/5 hover:bg-indigo-600/30 border border-white/10 text-[10px] text-slate-300 hover:text-white whitespace-nowrap transition"
              >
                {qp}
              </button>
            ))}
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 p-4 space-y-4 overflow-y-auto">
            {aiMessages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[88%] rounded-2xl px-4 py-3 text-xs leading-relaxed space-y-2 ${
                    msg.role === 'user'
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-950/40'
                      : 'bg-slate-900/90 border border-white/10 text-slate-200'
                  }`}
                >
                  <div className="whitespace-pre-line">{msg.content}</div>

                  {msg.execLogs?.length > 0 && (
                    <div className="pt-2 border-t border-white/10 space-y-1">
                      {msg.execLogs.map((lg, i) => (
                        <div key={i} className="text-[11px] font-mono text-emerald-300">
                          {lg}
                        </div>
                      ))}
                    </div>
                  )}

                  {msg.artifact && (
                    <button
                      type="button"
                      onClick={() => setActiveArtifact(msg.artifact)}
                      className="mt-1 px-3 py-1.5 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/40 border border-indigo-500/40 text-indigo-200 text-[11px] font-bold flex items-center gap-1.5"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Open Artifact: {msg.artifact.title}</span>
                    </button>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 text-xs text-cyan-300 font-mono px-2">
                <Bot className="w-4 h-4 animate-spin" />
                <span>Mahim AI চিন্তা করছে ও টুল চালাচ্ছে...</span>
              </div>
            )}

            {/* Pending External Actions requiring explicit user confirmation */}
            {pendingSensitive.filter((p) => !p.done).length > 0 && (
              <div className="p-3.5 rounded-2xl bg-amber-500/15 border border-amber-500/40 space-y-2.5 text-xs">
                <div className="flex items-center gap-2 text-amber-300 font-bold">
                  <ShieldAlert className="w-4 h-4" />
                  <span>এক্সটার্নাল অ্যাকশন নিশ্চিত করুন (Safety Gate)</span>
                </div>
                {pendingSensitive
                  .filter((p) => !p.done)
                  .map((p) => (
                    <div key={p.id} className="p-2.5 rounded-xl bg-slate-950/80 border border-white/10 flex items-center justify-between gap-2">
                      <div>
                        <span className="font-mono text-[10px] text-cyan-400 block">{p.action.tool}</span>
                        <span className="text-white">{p.action.summary || JSON.stringify(p.action.args)}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleConfirmSensitive(p)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] flex items-center gap-1 shrink-0"
                      >
                        <Play className="w-3 h-3" />
                        <span>Run Now</span>
                      </button>
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* Input Composer */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3.5 border-t border-white/10 bg-slate-950/60 flex items-center gap-2"
          >
            <button
              type="button"
              onClick={handleVoiceToggle}
              title="Voice Input (বাংলা / English)"
              className={`p-2.5 rounded-xl border transition ${
                isListening
                  ? 'bg-rose-600 border-rose-400 text-white animate-pulse'
                  : 'bg-white/5 border-white/10 text-slate-300 hover:text-white'
              }`}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            <input
              type="text"
              placeholder="AI-কে বলুন... (যেমন: রিকশা ৪০৳, ডেইলি গোল অ্যাড, জিমেইল চেক, বা নতুন সেকশন বানাও)"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 px-4 py-2.5 rounded-xl glass-input text-xs"
            />

            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 transition disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send</span>
            </button>
          </form>
        </div>

        {/* Right: Claude-Style Artifact & Live OS Snapshot */}
        <div className="lg:col-span-5 flex flex-col min-h-0 bg-slate-950/60">
          <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
            <span className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" />
              <span>{activeArtifact ? activeArtifact.title : 'Live Artifact & OS Context Canvas'}</span>
            </span>

            {activeArtifact && (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(activeArtifact.content || '');
                    setCopiedArtifact(true);
                    setTimeout(() => setCopiedArtifact(false), 2000);
                  }}
                  className="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/15 text-[10px] text-slate-300 flex items-center gap-1"
                >
                  {copiedArtifact ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>Copy</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    SoundFX.success();
                    upsertSecondBrainNote({
                      title: activeArtifact.title || 'AI Artifact Note',
                      folder: 'Resources',
                      tags: ['AI-Artifact'],
                      content: activeArtifact.content || ''
                    });
                  }}
                  className="px-2.5 py-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white text-[10px] font-bold flex items-center gap-1 transition"
                >
                  <BookmarkPlus className="w-3 h-3" />
                  <span>Save to Brain</span>
                </button>
              </div>
            )}
          </div>

          <div className="flex-1 p-4 overflow-y-auto text-xs">
            {activeArtifact ? (
              <pre className="whitespace-pre-wrap font-sans text-slate-200 leading-relaxed bg-slate-900/70 p-4 rounded-2xl border border-white/10">
                {activeArtifact.content}
              </pre>
            ) : (
              <div className="space-y-4 text-slate-400">
                <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/10 space-y-2">
                  <div className="text-white font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>AI কী কী কন্ট্রোল করতে পারে?</span>
                  </div>
                  <ul className="space-y-1.5 text-[11px] list-disc pl-4">
                    <li>যেকোনো খরচ, ইনকাম, ওয়ালেট, মিল বা হ্যাবিট এন্ট্রি</li>
                    <li>Second Brain নোট, `[[Wiki-Links]]` ও পড়াশোনার Flashcard তৈরি</li>
                    <li>নতুন ডায়নামিক কাস্টম সেকশন (`Custom Modules`) তৈরি</li>
                    <li>Gmail পড়া/পাঠানো, Google Calendar, Contacts, WhatsApp ও YouTube চ্যানেল ফেচ করা</li>
                    <li>পাবলিক সাইটের `Now Status` ও প্রোজেক্ট আপডেট</li>
                  </ul>
                </div>

                <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/30 text-[11px] space-y-1">
                  <span className="font-bold text-indigo-300 block">💡 ফ্রি API Key টিপস:</span>
                  <p>
                    Google AI Studio (aistudio.google.com) অথবা Groq (console.groq.com) থেকে ১ মিনিটে ফ্রি API Key এনে বসালেই আপনার পূর্ণাঙ্গ পার্সোনাল AI অ্যাসিস্ট্যান্ট চালু হয়ে যাবে!
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  if (embedded) return container;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-6">
      {container}
    </div>
  );
}
