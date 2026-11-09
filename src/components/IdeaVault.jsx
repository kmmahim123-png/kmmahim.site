import React, { useState } from 'react';
import { useOS } from '../context/OSContext';
import { Lightbulb, Plus, Tag, Trash2, ExternalLink, Sparkles } from 'lucide-react';

export default function IdeaVault() {
  const { data, addIdea, deleteIdea } = useOS();
  const { ideas } = data;

  const [title, setTitle] = useState('');
  const [tag, setTag] = useState('AI & Tech');
  const [status, setStatus] = useState('Just Idea');
  const [content, setContent] = useState('');
  const [image, setImage] = useState('');

  const handleAddIdea = (e) => {
    e.preventDefault();
    if (!title) return;
    addIdea({ title, tag, status, content, image });
    setTitle('');
    setContent('');
    setImage('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2.5">
            <Lightbulb className="w-6 h-6 text-amber-400"/>
            <span>চুলবুল আইডিয়া ভল্ট (Chulbul Idea Vault)</span>
          </h1>
          <p className="text-xs text-slate-400">
            Capture spontaneous startup ideas, notes, images, and track their progression
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        {/* Add Idea Form */}
        <form onSubmit={handleAddIdea} className="lg:col-span-5 bg-slate-900/70 border border-slate-800 rounded-2xl p-5 space-y-4">
          <h3 className="font-bold text-sm flex items-center gap-2">
            <Plus className="w-4 h-4 text-amber-400"/>
            <span>Write New Chulbul Idea</span>
          </h3>

          <div>
            <label className="text-[11px] text-slate-400 block mb-1">Idea Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Autonomous AI Voice Note Tagger"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Category Tag</label>
              <input
                type="text"
                placeholder="AI, Startup, Fitness..."
                value={tag}
                onChange={(e) => setTag(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200"
              >
                <option value="Just Idea">Just Idea 💡</option>
                <option value="Researching">Researching 🔍</option>
                <option value="Working On It">Working On It 🚀</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-[11px] text-slate-400 block mb-1">Image URL (Optional)</label>
            <input
              type="text"
              placeholder="https://images.unsplash.com/..."
              value={image}
              onChange={(e) => setImage(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs"
            />
          </div>

          <div>
            <label className="text-[11px] text-slate-400 block mb-1">Detailed Notes / Description</label>
            <textarea
              rows="3"
              placeholder="Explain how this idea works..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-xs font-semibold text-white"
          >
            + Save to Idea Vault
          </button>
        </form>

        {/* Ideas Grid */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-200">Saved Ideas ({ideas.length})</h3>
            <span className="text-xs text-slate-400">Always accessible from your private OS</span>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {ideas.map((idea) => (
              <div
                key={idea.id}
                className="bg-slate-900/70 border border-slate-800 hover:border-amber-500/40 rounded-2xl p-5 flex flex-col justify-between transition space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      {idea.tag}
                    </span>
                    <span className="text-[10px] text-cyan-400 font-mono">{idea.status}</span>
                  </div>

                  <h4 className="font-bold text-sm text-white">{idea.title}</h4>
                  {idea.content && <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">{idea.content}</p>}

                  {idea.image && (
                    <img
                      src={idea.image}
                      alt={idea.title}
                      className="w-full h-32 object-cover rounded-xl mt-3 border border-slate-800"
                    />
                  )}
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
                  <span>{idea.date}</span>
                  <button
                    onClick={() => deleteIdea(idea.id)}
                    className="text-slate-600 hover:text-rose-400 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5"/>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
