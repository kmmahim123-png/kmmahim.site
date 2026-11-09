import React, { useState } from 'react';
import { useOS } from '../context/OSContext';
import {
  Share2, Sparkles, Send, CheckCircle2, Trash2, ExternalLink,
  Calendar, Link as LinkIcon, Facebook, Linkedin, Twitter, Youtube
} from 'lucide-react';

export default function SocialPoster() {
  const { data, addSocialPost, approveAndPublishPost, deleteSocialPost } = useOS();
  const { socialQueue } = data;

  const [selectedPlatforms, setSelectedPlatforms] = useState(['Facebook', 'LinkedIn']);
  const [content, setContent] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');

  const platformsList = ['Facebook', 'LinkedIn', 'X', 'YouTube'];

  const togglePlatform = (p) => {
    setSelectedPlatforms((prev) =>
      prev.includes(p) ? prev.filter((item) => item !== p) : [...prev, p]
    );
  };

  // AI Smart Adaptation (Hermes + Grok Simulator)
  const handleAIFormat = () => {
    if (!content.trim()) {
      setContent(
        "🚀 Today's Progress Update:\n1. Completed Gym & Study Sprint\n2. Scaled AI Agent Webhooks\n3. Building digital products from Rajshahi University.\n\n#Tech #AI #Entrepreneurship #KMMahim"
      );
      return;
    }
    setContent(
      `🔥 ${content}\n\n⚡ Automated via KM Mahim Life OS (OpenClaw + Hermes Engine)\n#BuildInPublic #AIAutomation #BangladeshTech`
    );
  };

  const handleScheduleSubmit = (e) => {
    e.preventDefault();
    if (!content) return;
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
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2.5">
            <Share2 className="w-6 h-6 text-cyan-400"/>
            <span>Automate My Social Media (FB, LinkedIn, X, YouTube)</span>
          </h1>
          <p className="text-xs text-slate-400">
            Write once, auto-adapt with AI, schedule across platforms, and track live published links
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        {/* Composer */}
        <form
          onSubmit={handleScheduleSubmit}
          className="lg:col-span-5 bg-slate-900/70 border border-slate-800 rounded-2xl p-5 space-y-4"
        >
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm">Create & Automate Post</h3>
            <button
              type="button"
              onClick={handleAIFormat}
              className="px-3 py-1 rounded-lg bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 hover:bg-indigo-600 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <Sparkles className="w-3.5 h-3.5"/>
              <span>AI Enhance Caption</span>
            </button>
          </div>

          <div>
            <label className="text-[11px] text-slate-400 block mb-1.5">Select Target Platforms</label>
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
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <span>{p}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="text-[11px] text-slate-400 block mb-1">Post Content / Video Description *</label>
            <textarea
              rows="4"
              required
              placeholder="Write your update or click 'AI Enhance Caption'..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
            />
          </div>

          <div>
            <label className="text-[11px] text-slate-400 block mb-1">Media / YouTube / Drive Link (Optional)</label>
            <input
              type="text"
              placeholder="https://..."
              value={mediaUrl}
              onChange={(e) => setMediaUrl(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs"
            />
          </div>

          <div>
            <label className="text-[11px] text-slate-400 block mb-1">Schedule Time (Leave blank for Instant Queue)</label>
            <input
              type="datetime-local"
              value={scheduleTime}
              onChange={(e) => setScheduleTime(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-xs font-semibold text-white flex items-center justify-center gap-2"
          >
            <Send className="w-4 h-4"/>
            <span>Send to Auto-Upload Queue</span>
          </button>
        </form>

        {/* Queue & Live Uploaded History */}
        <div className="lg:col-span-7 bg-slate-900/70 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-bold text-sm">Upload Queue & Published Links ({socialQueue.length})</h3>
            <span className="text-[11px] text-emerald-400 font-mono">● OpenClaw Poster Ready</span>
          </div>

          <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
            {socialQueue.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap gap-1.5">
                    {(Array.isArray(item.platforms) ? item.platforms : [item.platform || 'General']).map((pl, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-semibold"
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

                <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                  <span className="text-slate-500">🕒 {item.scheduleTime}</span>

                  <div className="flex items-center gap-2">
                    {!item.status?.includes('Published') && (
                      <button
                        onClick={() => approveAndPublishPost(item.id)}
                        className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5"/>
                        <span>1-Click Auto Upload Now</span>
                      </button>
                    )}
                    {item.liveLink && (
                      <a
                        href={item.liveLink}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2.5 py-1 rounded-lg bg-slate-800 text-cyan-300 flex items-center gap-1"
                      >
                        <span>Live Link</span>
                        <ExternalLink className="w-3 h-3"/>
                      </a>
                    )}
                    <button
                      onClick={() => deleteSocialPost(item.id)}
                      className="p-1 text-slate-500 hover:text-rose-400"
                    >
                      <Trash2 className="w-4 h-4"/>
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
