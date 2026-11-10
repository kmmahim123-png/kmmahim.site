import React, { useState } from 'react';
import { useOS } from '../context/OSContext';
import { SoundFX } from './common/SoundEffects';
import { Boxes, Plus, Trash2, CheckCircle2, Sparkles } from 'lucide-react';

export default function CustomSectionsHub() {
  const {
    data,
    createCustomSection,
    deleteCustomSection,
    addCustomSectionItem,
    toggleCustomSectionItem,
    deleteCustomSectionItem,
    setShowCopilotDrawer
  } = useOS();

  const sections = data.customSections || [];
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('checklist');
  const [itemDrafts, setItemDrafts] = useState({});

  const handleCreate = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    SoundFX.success();
    createCustomSection({ title: title.trim(), description: description.trim(), type });
    setTitle('');
    setDescription('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black flex items-center gap-2.5 text-white">
            <Boxes className="w-6 h-6 text-indigo-400" />
            <span>Dynamic Custom Sections (নিজে বা AI দিয়ে তৈরি সেকশন)</span>
          </h1>
          <p className="text-xs text-slate-400">
            যেকোনো নতুন বিষয়—বই পড়া, ক্লায়েন্ট প্রোজেক্ট, ভিডিও লিস্ট, কিংবা বিজনেস ট্র্যাকার এখানে বানান অথবা AI Copilot-কে বললেই অটোমেটিক তৈরি করে দেবে
          </p>
        </div>

        <button
          onClick={() => setShowCopilotDrawer(true)}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 text-white text-xs font-bold flex items-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          <span>Ask AI to Build a Section</span>
        </button>
      </div>

      {/* Create New Custom Section */}
      <form onSubmit={handleCreate} className="glass-crystal rounded-3xl p-5 grid sm:grid-cols-4 gap-3">
        <input
          type="text"
          required
          placeholder="সেকশনের নাম (e.g. RU Exam Syllabus)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="px-3.5 py-2.5 rounded-xl glass-input text-xs"
        />
        <input
          type="text"
          placeholder="সংক্ষিপ্ত বিবরণ..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="px-3.5 py-2.5 rounded-xl glass-input text-xs"
        />
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="px-3.5 py-2.5 rounded-xl glass-input text-xs"
        >
          <option value="checklist" className="bg-slate-900">Checklist / Tasks</option>
          <option value="tracker" className="bg-slate-900">Key-Value Tracker</option>
          <option value="links" className="bg-slate-900">Saved Links / Bookmarks</option>
          <option value="notes" className="bg-slate-900">Quick Notes Board</option>
        </select>
        <button type="submit" className="py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center justify-center gap-1.5">
          <Plus className="w-4 h-4" />
          <span>Create Section</span>
        </button>
      </form>

      {/* Sections Grid */}
      {sections.length === 0 ? (
        <div className="glass-crystal rounded-3xl p-10 text-center text-xs text-slate-400">
          এখনো কোনো কাস্টম সেকশন নেই। উপরে নাম দিয়ে তৈরি করুন অথবা AI-কে বলুন!
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {sections.map((sec) => {
            const draft = itemDrafts[sec.id] || { label: '', value: '' };
            return (
              <div key={sec.id} className="glass-crystal rounded-3xl p-5 space-y-4">
                <div className="flex items-start justify-between gap-2 border-b border-white/10 pb-3">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-cyan-400">{sec.type}</span>
                    <h3 className="font-bold text-base text-white">{sec.title}</h3>
                    {sec.description && <p className="text-xs text-slate-400">{sec.description}</p>}
                  </div>
                  <button
                    onClick={() => deleteCustomSection(sec.id)}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-rose-600 text-slate-400 hover:text-white"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!draft.label?.trim()) return;
                    addCustomSectionItem(sec.id, draft);
                    setItemDrafts((p) => ({ ...p, [sec.id]: { label: '', value: '' } }));
                    SoundFX.click();
                  }}
                  className="flex gap-2"
                >
                  <input
                    type="text"
                    placeholder="নতুন আইটেম..."
                    value={draft.label}
                    onChange={(e) =>
                      setItemDrafts((p) => ({ ...p, [sec.id]: { ...draft, label: e.target.value } }))
                    }
                    className="flex-1 px-3 py-2 rounded-xl glass-input text-xs"
                  />
                  {sec.type !== 'checklist' && (
                    <input
                      type="text"
                      placeholder={sec.type === 'links' ? 'https://...' : 'Value/Note'}
                      value={draft.value}
                      onChange={(e) =>
                        setItemDrafts((p) => ({ ...p, [sec.id]: { ...draft, value: e.target.value } }))
                      }
                      className="w-32 px-3 py-2 rounded-xl glass-input text-xs"
                    />
                  )}
                  <button type="submit" className="px-3.5 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold">
                    +
                  </button>
                </form>

                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {(sec.items || []).map((it) => (
                    <div
                      key={it.id}
                      className={`p-3 rounded-2xl border flex items-center justify-between text-xs ${
                        it.done ? 'bg-slate-950/30 border-white/5 opacity-60' : 'bg-slate-950/60 border-white/10'
                      }`}
                    >
                      <div
                        onClick={() => toggleCustomSectionItem(sec.id, it.id)}
                        className="flex items-center gap-2.5 flex-1 cursor-pointer min-w-0"
                      >
                        <span
                          className={`w-4 h-4 rounded flex items-center justify-center border shrink-0 ${
                            it.done ? 'bg-emerald-600 border-emerald-500 text-white' : 'border-slate-600'
                          }`}
                        >
                          {it.done && <CheckCircle2 className="w-3 h-3" />}
                        </span>
                        <span className={`font-semibold truncate ${it.done ? 'line-through text-slate-500' : 'text-white'}`}>
                          {it.label}
                        </span>
                        {it.value && (
                          sec.type === 'links' && it.value.startsWith('http') ? (
                            <a
                              href={it.value}
                              target="_blank"
                              rel="noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="text-cyan-400 underline text-[11px] ml-auto"
                            >
                              Open
                            </a>
                          ) : (
                            <span className="text-cyan-300 font-mono text-[11px] ml-auto">{it.value}</span>
                          )
                        )}
                      </div>
                      <button
                        onClick={() => deleteCustomSectionItem(sec.id, it.id)}
                        className="p-1 ml-2 rounded bg-white/5 hover:bg-rose-600 text-slate-400 hover:text-white"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
