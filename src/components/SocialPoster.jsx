import React, { useState } from 'react';
import { useOS } from '../context/OSContext';
import { generateSimpleAI } from '../services/aiEngine';
import { SoundFX } from './common/SoundEffects';
import {
  Share2, Sparkles, Send, CheckCircle2, Trash2
} from 'lucide-react';

export default function SocialPoster() {
  const { data, secretConfig, addSocialPost, approveAndPublishPost, deleteSocialPost } = useOS();
  const { socialQueue } = data;

  const [selectedPlatforms, setSelectedPlatforms] = useState(['Facebook', 'LinkedIn']);
  const [content, setContent] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  const platformsList = ['Facebook', 'LinkedIn', 'X', 'YouTube'];

  const togglePlatform = (p) => {
    setSelectedPlatforms((prev) =>
      prev.includes(p) ? prev.filter((item) => item !== p) : [...prev, p]
    );
  };

  // Real AI Caption Enhancement when API Key is present
  const handleAIFormat = async () => {
    if (!secretConfig.aiApiKey) {
      alert('AI দিয়ে ক্যাপশন লিখতে AI Desk-এ গিয়ে আপনার Gemini/OpenAI/Claude API Key সেট করুন।');
      return;
    }
    setAiLoading(true);
    try {
      const improved = await generateSimpleAI({
        provider: secretConfig.aiProvider || 'gemini',
        apiKey: secretConfig.aiApiKey,
        model: secretConfig.aiModel,
        instruction: `Rewrite or craft an engaging, concise post for ${selectedPlatforms.join(', ')} with clean hashtags.`,
        input: content.trim() || `Write a sharp entrepreneur/tech build-in-public update for ${data.profile?.name}`
      });
      setContent(improved);
      SoundFX.success();
    } catch (err) {
      alert(`AI Error: ${err.message}`);
    } finally {
      setAiLoading(false);
    }
  };

  const handleScheduleSubmit = (e) => {
    e.preventDefault();
    if (!content) return;
    SoundFX.success();
    addSocialPost({
      platforms: selectedPlatforms,
      content,
      mediaUrl,
      scheduleTime: scheduleTime || 'Auto-Queue (Today)',
      status: 'Pending Approval'
    });
    setContent('');
    setMediaUrl('');
    setScheduleTime('');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black flex items-center gap-2.5 text-white">
            <Share2 className="w-6 h-6 text-cyan-400" />
            <span>Social Content Planner & Webhook Dispatcher</span>
          </h1>
          <p className="text-xs text-slate-400">
            আসল AI দিয়ে ক্যাপশন তৈরি করুন এবং আপনার OpenClaw / n8n Webhook যুক্ত থাকলে ১-ক্লিকে পাবলিশ ট্রিগার করুন
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        {/* Composer */}
        <form
          onSubmit={handleScheduleSubmit}
          className="lg:col-span-5 glass-crystal rounded-3xl p-5 space-y-4"
        >
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-white">Create Post</h3>
            <button
              type="button"
              onClick={handleAIFormat}
              disabled={aiLoading}
              className="px-3 py-1.5 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 hover:bg-indigo-600 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{aiLoading ? 'Writing...' : 'AI Enhance Caption'}</span>
            </button>
          </div>

          <div>
            <label className="text-[11px] text-slate-400 block mb-1.5">Target Platforms</label>
            <div className="grid grid-cols-2 gap-2">
              {platformsList.map((p) => {
                const active = selectedPlatforms.includes(p);
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => togglePlatform(p)}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition ${
                      active
                        ? 'bg-indigo-600 border-indigo-500 text-white'
                        : 'bg-slate-950/60 border-white/10 text-slate-400 hover:text-white'
                    }`}
                  >
                    <span>{p}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="text-[11px] text-slate-400 block mb-1">Post Content *</label>
            <textarea
              rows="4"
              required
              placeholder="Write your update or click 'AI Enhance Caption'..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs"
            />
          </div>

          <div>
            <label className="text-[11px] text-slate-400 block mb-1">Media / Drive Link (Optional)</label>
            <input
              type="text"
              placeholder="https://..."
              value={mediaUrl}
              onChange={(e) => setMediaUrl(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl glass-input text-xs"
            />
          </div>

          <div>
            <label className="text-[11px] text-slate-400 block mb-1">Schedule Time (Optional)</label>
            <input
              type="datetime-local"
              value={scheduleTime}
              onChange={(e) => setScheduleTime(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl glass-input text-xs"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-xs font-bold text-white flex items-center justify-center gap-2"
          >
            <Send className="w-4 h-4" />
            <span>Add to Content Queue</span>
          </button>
        </form>

        {/* Queue */}
        <div className="lg:col-span-7 glass-crystal rounded-3xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h3 className="font-bold text-sm text-white">Content Queue ({socialQueue.length})</h3>
            <span className="text-[11px] text-emerald-400 font-mono">
              {data.agents?.webhookUrl && !data.agents.webhookUrl.includes('yourdomain.com')
                ? '● Live Webhook Connected'
                : '● Local Queue Mode'}
            </span>
          </div>

          <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
            {socialQueue.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-2xl bg-slate-950/60 border border-white/10 space-y-2.5"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap gap-1.5">
                    {(Array.isArray(item.platforms) ? item.platforms : [item.platform || 'General']).map((pl, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] px-2 py-0.5 rounded-md bg-indigo-500/15 text-indigo-300 border border-indigo-500/25 font-semibold"
                      >
                        {pl}
                      </span>
                    ))}
                  </div>
                  <span className="text-[11px] font-mono text-cyan-400">{item.status}</span>
                </div>

                <p className="text-xs text-slate-200 whitespace-pre-line leading-relaxed">
                  {item.content}
                </p>

                {item.mediaUrl && (
                  <p className="text-[11px] text-indigo-400 truncate">📎 Media: {item.mediaUrl}</p>
                )}

                <div className="pt-2 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                  <span className="text-slate-500">🕒 {item.scheduleTime}</span>

                  <div className="flex items-center gap-2">
                    {!item.status?.includes('Dispatched') && (
                      <button
                        onClick={() => approveAndPublishPost(item.id)}
                        className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Approve / Trigger Webhook</span>
                      </button>
                    )}
                    <button
                      onClick={() => deleteSocialPost(item.id)}
                      className="p-1 text-slate-500 hover:text-rose-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
