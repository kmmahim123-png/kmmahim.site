import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useOS } from '../context/OSContext';
import { getLocalDateStr } from '../utils/dateUtils';
import { generateSimpleAI } from '../services/aiEngine';
import { SoundFX } from './common/SoundEffects';
import {
  Brain, Plus, Trash2, Link2, Network, BookOpen, Layers,
  Sparkles, Mic, Search, RotateCw, CheckCircle2, Calendar
} from 'lucide-react';

function extractWikiLinks(content = '') {
  const matches = [...String(content).matchAll(/\[\[([^\]]+)\]\]/g)];
  return [...new Set(matches.map((m) => m[1].trim()).filter(Boolean))];
}

export default function SecondBrain() {
  const {
    data,
    secretConfig,
    upsertSecondBrainNote,
    deleteSecondBrainNote,
    saveDailyJournal,
    addFlashcard,
    reviewFlashcard,
    deleteFlashcard,
    addIdea,
    deleteIdea
  } = useOS();

  const notes = data.secondBrain?.notes || [];
  const journalMap = data.secondBrain?.journal || {};
  const flashcards = data.secondBrain?.flashcards || [];
  const ideas = data.ideas || [];

  const [subTab, setSubTab] = useState('notes'); // 'notes' | 'graph' | 'journal' | 'flashcards' | 'ideas'
  const [folderFilter, setFolderFilter] = useState('All');
  const [searchQ, setSearchQ] = useState('');
  const [selectedId, setSelectedId] = useState(notes[0]?.id || null);

  // Note Editor State
  const [editingNote, setEditingNote] = useState(null);
  const [title, setTitle] = useState('');
  const [folder, setFolder] = useState('Projects');
  const [tags, setTags] = useState('');
  const [content, setContent] = useState('');
  const [aiBusy, setAiBusy] = useState(false);

  // Journal State
  const todayKey = getLocalDateStr();
  const [jDate, setJDate] = useState(todayKey);
  const curJournal = journalMap[jDate] || { wins: '', lessons: '', focus: '', mood: 'Focused' };

  // Flashcard State
  const [fcTopic, setFcTopic] = useState('Sports Science');
  const [fcFront, setFcFront] = useState('');
  const [fcBack, setFcBack] = useState('');
  const [flippedCardId, setFlippedCardId] = useState(null);

  // Quick Idea State (backward compatible with Chulbul Ideas)
  const [ideaTitle, setIdeaTitle] = useState('');
  const [ideaTag, setIdeaTag] = useState('Startup');
  const [ideaContent, setIdeaContent] = useState('');

  const folders = ['All', 'Projects', 'Areas', 'Resources', 'Archives'];

  const filteredNotes = useMemo(() => {
    const q = searchQ.toLowerCase();
    return notes.filter((n) => {
      if (folderFilter !== 'All' && n.folder !== folderFilter) return false;
      if (!q) return true;
      return (
        n.title.toLowerCase().includes(q) ||
        (n.content || '').toLowerCase().includes(q) ||
        (n.tags || []).some((t) => t.toLowerCase().includes(q))
      );
    });
  }, [notes, folderFilter, searchQ]);

  const activeNote = notes.find((n) => n.id === selectedId) || filteredNotes[0] || null;

  // Compute incoming Backlinks (`[[activeNote.title]]`)
  const backlinks = useMemo(() => {
    if (!activeNote) return [];
    const needle = `[[${activeNote.title.toLowerCase()}]]`;
    return notes.filter(
      (n) => n.id !== activeNote.id && (n.content || '').toLowerCase().includes(needle)
    );
  }, [activeNote, notes]);

  // Knowledge Graph Nodes & Edges (Notes + Ideas)
  const graphData = useMemo(() => {
    const allNodes = [
      ...notes.map((n) => ({
        id: n.id,
        label: n.title,
        kind: n.folder || 'Note',
        tags: n.tags || [],
        links: extractWikiLinks(n.content)
      })),
      ...ideas.map((i) => ({
        id: i.id,
        label: i.title,
        kind: 'Idea',
        tags: [i.tag].filter(Boolean),
        links: []
      }))
    ];

    const cx = 320;
    const cy = 175;
    const count = Math.max(1, allNodes.length);
    const positioned = allNodes.map((node, idx) => {
      const angle = (idx / count) * Math.PI * 2 - Math.PI / 2;
      const ring = idx % 2 === 0 ? 128 : 82;
      return {
        ...node,
        x: Math.round(cx + Math.cos(angle) * ring * 1.45),
        y: Math.round(cy + Math.sin(angle) * ring)
      };
    });

    const edges = [];
    for (let i = 0; i < positioned.length; i++) {
      for (let j = i + 1; j < positioned.length; j++) {
        const a = positioned[i];
        const b = positioned[j];
        const wikiLinked =
          a.links.some((l) => l.toLowerCase() === b.label.toLowerCase()) ||
          b.links.some((l) => l.toLowerCase() === a.label.toLowerCase());
        const sharedTag = a.tags.some((t) => b.tags.includes(t));
        if (wikiLinked || sharedTag) {
          edges.push({ from: a, to: b, strong: wikiLinked });
        }
      }
    }
    return { nodes: positioned, edges };
  }, [notes, ideas]);

  const startNewNote = () => {
    setEditingNote({ id: null });
    setTitle('');
    setFolder('Projects');
    setTags('');
    setContent('');
  };

  const startEditNote = (note) => {
    setEditingNote(note);
    setTitle(note.title);
    setFolder(note.folder || 'Resources');
    setTags((note.tags || []).join(', '));
    setContent(note.content || '');
  };

  const handleSaveNote = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    SoundFX.success();
    upsertSecondBrainNote({
      id: editingNote?.id || undefined,
      title: title.trim(),
      folder,
      tags,
      content
    });
    setEditingNote(null);
  };

  const handleVoiceDictation = () => {
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRec) return;
    const rec = new SpeechRec();
    rec.lang = 'bn-BD';
    rec.onresult = (e) => {
      const txt = e.results?.[0]?.[0]?.transcript || '';
      if (txt) {
        if (!editingNote) {
          startNewNote();
          setTitle('Voice Note • ' + todayKey);
          setContent(txt);
        } else {
          setContent((c) => (c ? `${c}\n${txt}` : txt));
        }
      }
    };
    rec.start();
  };

  const handleAISummarizeNote = async () => {
    if (!activeNote || !secretConfig.aiApiKey) {
      alert('প্রথমে AI Copilot-এ আপনার API Key সেট করুন।');
      return;
    }
    setAiBusy(true);
    try {
      const summary = await generateSimpleAI({
        provider: secretConfig.aiProvider || 'gemini',
        apiKey: secretConfig.aiApiKey,
        model: secretConfig.aiModel,
        instruction: 'Summarize this Second Brain note into 3 sharp actionable bullet points in Bengali/English.',
        input: `${activeNote.title}\n\n${activeNote.content}`
      });
      upsertSecondBrainNote({
        ...activeNote,
        content: `${activeNote.content}\n\n---\n### AI Action Summary\n${summary}`
      });
      SoundFX.success();
    } catch (err) {
      alert(err.message);
    } finally {
      setAiBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black flex items-center gap-2.5 text-white">
            <Brain className="w-6 h-6 text-indigo-400" />
            <span>Second Brain & Idea Constellation (PARA + Wiki-Links)</span>
          </h1>
          <p className="text-xs text-slate-400">
            Obsidian-স্টাইল [[Wiki-Link]] নোট, Knowledge Graph, ডেইলি রিফ্লেকশন জার্নাল এবং স্টাডি ফ্ল্যাশকার্ড
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 glass-pill p-1 rounded-xl text-xs">
          {[
            { id: 'notes', label: '📝 Notes (PARA)' },
            { id: 'graph', label: '🕸️ Knowledge Graph' },
            { id: 'journal', label: '📓 Daily Journal' },
            { id: 'flashcards', label: '🃏 Flashcards' },
            { id: 'ideas', label: '💡 Quick Ideas' }
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => {
                SoundFX.click();
                setSubTab(t.id);
              }}
              className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                subTab === t.id ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* TAB 1: NOTES (PARA + [[Wiki-Links]]) */}
      {subTab === 'notes' && (
        <div className="grid lg:grid-cols-12 gap-6">
          {/* Sidebar Notes List */}
          <div className="lg:col-span-4 glass-crystal rounded-3xl p-4 space-y-3">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="নোট বা #ট্যাগ খুঁজুন..."
                  value={searchQ}
                  onChange={(e) => setSearchQ(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 rounded-xl glass-input text-xs"
                />
              </div>
              <button
                onClick={startNewNote}
                className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white"
                title="New Note"
              >
                <Plus className="w-4 h-4" />
              </button>
              <button
                onClick={handleVoiceDictation}
                className="p-2 rounded-xl glass-pill hover:bg-white/10 text-cyan-300"
                title="Voice Dictate Note"
              >
                <Mic className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-wrap gap-1">
              {folders.map((f) => (
                <button
                  key={f}
                  onClick={() => setFolderFilter(f)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition ${
                    folderFilter === f ? 'bg-indigo-600 text-white' : 'bg-white/5 text-slate-400'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>

            <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
              {filteredNotes.map((n) => (
                <button
                  key={n.id}
                  onClick={() => {
                    SoundFX.click();
                    setEditingNote(null);
                    setSelectedId(n.id);
                  }}
                  className={`w-full text-left p-3 rounded-2xl border transition space-y-1 ${
                    activeNote?.id === n.id && !editingNote
                      ? 'bg-indigo-950/50 border-indigo-500/60 text-white'
                      : 'bg-slate-950/60 border-white/5 hover:border-white/20 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] font-mono text-cyan-400">
                    <span>{n.folder}</span>
                    <span>{n.updatedAt}</span>
                  </div>
                  <div className="text-xs font-bold truncate">{n.title}</div>
                  {n.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-0.5">
                      {n.tags.map((tg) => (
                        <span key={tg} className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-slate-400">
                          #{tg}
                        </span>
                      ))}
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Right Note Reader / Markdown Editor */}
          <div className="lg:col-span-8 glass-crystal rounded-3xl p-6 space-y-4">
            {editingNote ? (
              <form onSubmit={handleSaveNote} className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white">
                    {editingNote.id ? 'নোট এডিট করুন' : 'নতুন Second Brain নোট'}
                  </h3>
                  <button
                    type="button"
                    onClick={() => setEditingNote(null)}
                    className="text-xs text-slate-400 hover:text-white"
                  >
                    বাতিল
                  </button>
                </div>

                <input
                  type="text"
                  required
                  placeholder="নোটের শিরোনাম (যেমন: Muscle Hypertrophy Principles)..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-sm font-bold"
                />

                <div className="grid sm:grid-cols-2 gap-3">
                  <select
                    value={folder}
                    onChange={(e) => setFolder(e.target.value)}
                    className="px-3.5 py-2.5 rounded-xl glass-input text-xs"
                  >
                    <option value="Projects" className="bg-slate-900">Projects (চলমান প্রোজেক্ট)</option>
                    <option value="Areas" className="bg-slate-900">Areas (স্থায়ী ক্ষেত্র: স্বাস্থ্য/পড়া)</option>
                    <option value="Resources" className="bg-slate-900">Resources (তথ্য/রিসার্চ)</option>
                    <option value="Archives" className="bg-slate-900">Archives (সংরক্ষিত)</option>
                  </select>

                  <input
                    type="text"
                    placeholder="ট্যাগ কমা দিয়ে লিখুন (e.g. RU, AI, Business)"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    className="px-3.5 py-2.5 rounded-xl glass-input text-xs"
                  />
                </div>

                <textarea
                  rows="10"
                  placeholder="এখানে লিখুন... অন্য নোট লিংক করতে [[অন্য নোটের নাম]] লিখুন!"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl glass-input text-xs font-mono leading-relaxed"
                />

                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold"
                >
                  Save Note to Second Brain
                </button>
              </form>
            ) : activeNote ? (
              <div className="space-y-4">
                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-white/10 pb-3">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400">
                      {activeNote.folder} • Updated {activeNote.updatedAt}
                    </span>
                    <h2 className="text-lg font-black text-white mt-0.5">{activeNote.title}</h2>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleAISummarizeNote}
                      disabled={aiBusy}
                      className="px-3 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600 border border-indigo-500/40 text-indigo-200 hover:text-white text-xs font-bold flex items-center gap-1.5 transition"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{aiBusy ? 'Summarizing...' : 'AI Action Summary'}</span>
                    </button>
                    <button
                      onClick={() => startEditNote(activeNote)}
                      className="px-3 py-1.5 rounded-xl glass-pill hover:bg-white/10 text-xs font-bold text-white"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        SoundFX.click();
                        deleteSecondBrainNote(activeNote.id);
                      }}
                      className="p-2 rounded-xl bg-white/5 hover:bg-rose-600 text-slate-400 hover:text-white"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950/60 border border-white/5 text-xs text-slate-200 whitespace-pre-wrap leading-relaxed min-h-[220px]">
                  {activeNote.content}
                </div>

                {/* Clickable Outgoing Links & Backlinks */}
                <div className="grid sm:grid-cols-2 gap-3 pt-2 border-t border-white/10 text-xs">
                  <div className="p-3 rounded-2xl bg-slate-950/60 border border-white/5 space-y-1.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                      <Link2 className="w-3 h-3 text-cyan-400" />
                      <span>Outgoing [[Wiki-Links]]</span>
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {extractWikiLinks(activeNote.content).length === 0 ? (
                        <span className="text-[11px] text-slate-500">লিঙ্ক তৈরি করতে [[Note Title]] লিখুন।</span>
                      ) : (
                        extractWikiLinks(activeNote.content).map((lnk) => {
                          const target = notes.find(
                            (n) => n.title.toLowerCase() === lnk.toLowerCase()
                          );
                          return (
                            <button
                              key={lnk}
                              onClick={() => target && setSelectedId(target.id)}
                              className="px-2 py-0.5 rounded-lg bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-[11px] hover:bg-cyan-500/30"
                            >
                              [[{lnk}]]
                            </button>
                          );
                        })
                      )}
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-950/60 border border-white/5 space-y-1.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                      <Layers className="w-3 h-3 text-emerald-400" />
                      <span>Linked Backlinks ({backlinks.length})</span>
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {backlinks.length === 0 ? (
                        <span className="text-[11px] text-slate-500">অন্য কোনো নোট এখনো এটিকে লিংক করেনি।</span>
                      ) : (
                        backlinks.map((b) => (
                          <button
                            key={b.id}
                            onClick={() => setSelectedId(b.id)}
                            className="px-2 py-0.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[11px]"
                          >
                            {b.title}
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 space-y-3">
                <p className="text-xs text-slate-400">কোনো নোট পাওয়া যায়নি। প্রথম নোট তৈরি করুন!</p>
                <button
                  onClick={startNewNote}
                  className="px-4 py-2 rounded-xl bg-indigo-600 text-xs font-bold text-white"
                >
                  + Create First Note
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: INTERACTIVE KNOWLEDGE GRAPH */}
      {subTab === 'graph' && (
        <div className="glass-crystal rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-300">
              <Network className="w-4 h-4" />
              <span>SECOND BRAIN KNOWLEDGE GRAPH ({graphData.nodes.length} Nodes · {graphData.edges.length} Connections)</span>
            </div>
            <span className="text-[11px] text-slate-400">যেকোনো নোডে ক্লিক করলে সরাসরি নোটটি খুলবে</span>
          </div>

          <div className="w-full overflow-x-auto bg-slate-950/70 rounded-2xl border border-white/10 p-2">
            <svg viewBox="0 0 640 350" className="w-full min-w-[520px] h-[340px]">
              {graphData.edges.map((e, idx) => (
                <line
                  key={idx}
                  x1={e.from.x}
                  y1={e.from.y}
                  x2={e.to.x}
                  y2={e.to.y}
                  stroke={e.strong ? '#22d3ee' : 'rgba(148,163,184,0.28)'}
                  strokeWidth={e.strong ? 2 : 1}
                  strokeDasharray={e.strong ? '' : '4 3'}
                />
              ))}

              {graphData.nodes.map((node) => {
                const isIdea = node.kind === 'Idea';
                return (
                  <g
                    key={node.id}
                    onClick={() => {
                      if (!isIdea) {
                        setSelectedId(node.id);
                        setSubTab('notes');
                      } else {
                        setSubTab('ideas');
                      }
                    }}
                    className="cursor-pointer"
                  >
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={isIdea ? 10 : 13}
                      fill={isIdea ? '#f59e0b' : '#6366f1'}
                      stroke="#ffffff"
                      strokeWidth="1.5"
                    />
                    <text
                      x={node.x}
                      y={node.y + 24}
                      textAnchor="middle"
                      fill="#e2e8f0"
                      fontSize="10"
                      fontWeight="bold"
                    >
                      {node.label.slice(0, 20)}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>
      )}

      {/* TAB 3: DAILY REFLECTION JOURNAL */}
      {subTab === 'journal' && (
        <div className="glass-crystal rounded-3xl p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-400" />
              <span>Daily Reflection Journal</span>
            </h3>
            <input
              type="date"
              value={jDate}
              onChange={(e) => setJDate(e.target.value)}
              className="px-3 py-1.5 rounded-xl glass-input text-xs text-cyan-300"
            />
          </div>

          <div className="grid md:grid-cols-3 gap-4 text-xs">
            <div className="space-y-1.5">
              <label className="text-emerald-400 font-bold block">🏆 আজকের বড় জয় (Wins)</label>
              <textarea
                rows="4"
                placeholder="আজ কী কী ভালো হয়েছে..."
                value={curJournal.wins || ''}
                onChange={(e) => saveDailyJournal(jDate, { ...curJournal, wins: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-2xl glass-input"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-cyan-400 font-bold block">📖 আজ যা শিখলাম (Lessons)</label>
              <textarea
                rows="4"
                placeholder="নতুন কোনো জ্ঞান বা ভুল থেকে শিক্ষা..."
                value={curJournal.lessons || ''}
                onChange={(e) => saveDailyJournal(jDate, { ...curJournal, lessons: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-2xl glass-input"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-amber-400 font-bold block">🎯 কালকের ১ নম্বর ফোকাস</label>
              <textarea
                rows="4"
                placeholder="আগামীকালের সবচেয়ে জরুরি কাজ..."
                value={curJournal.focus || ''}
                onChange={(e) => saveDailyJournal(jDate, { ...curJournal, focus: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-2xl glass-input"
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: STUDY FLASHCARDS */}
      {subTab === 'flashcards' && (
        <div className="grid lg:grid-cols-12 gap-6">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!fcFront || !fcBack) return;
              SoundFX.success();
              addFlashcard({ topic: fcTopic, front: fcFront, back: fcBack });
              setFcFront('');
              setFcBack('');
            }}
            className="lg:col-span-4 glass-crystal rounded-3xl p-5 space-y-3"
          >
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-cyan-400" />
              <span>নতুন স্টাডি ফ্ল্যাশকার্ড</span>
            </h3>
            <input
              type="text"
              placeholder="Topic (e.g. Anatomy, React)"
              value={fcTopic}
              onChange={(e) => setFcTopic(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl glass-input text-xs"
            />
            <textarea
              rows="2"
              required
              placeholder="প্রশ্ন (Front)..."
              value={fcFront}
              onChange={(e) => setFcFront(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl glass-input text-xs"
            />
            <textarea
              rows="3"
              required
              placeholder="উত্তর (Back)..."
              value={fcBack}
              onChange={(e) => setFcBack(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl glass-input text-xs"
            />
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white"
            >
              + Add Flashcard
            </button>
          </form>

          <div className="lg:col-span-8 grid sm:grid-cols-2 gap-4">
            {flashcards.map((card) => {
              const flipped = flippedCardId === card.id;
              return (
                <div
                  key={card.id}
                  onClick={() => setFlippedCardId(flipped ? null : card.id)}
                  className="glass-crystal rounded-3xl p-5 flex flex-col justify-between cursor-pointer space-y-4 border hover:border-indigo-400/50 transition"
                >
                  <div className="flex items-center justify-between text-[10px] font-mono">
                    <span className="px-2 py-0.5 rounded bg-cyan-500/15 text-cyan-300">{card.topic}</span>
                    <span className="text-emerald-400">Mastery: {card.mastery || 0}</span>
                  </div>

                  <div className="py-3 text-center">
                    <span className="text-[10px] uppercase tracking-wider text-slate-500 block mb-1">
                      {flipped ? 'ANSWER (উত্তর)' : 'QUESTION (প্রশ্ন — ক্লিক করে উল্টান)'}
                    </span>
                    <p className="text-sm font-bold text-white leading-relaxed">
                      {flipped ? card.back : card.front}
                    </p>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/10">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        reviewFlashcard(card.id, false);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-amber-500/15 text-amber-300 text-[11px] font-bold flex items-center gap-1"
                    >
                      <RotateCw className="w-3 h-3" />
                      <span>Review Again</span>
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        reviewFlashcard(card.id, true);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-emerald-600/20 text-emerald-300 text-[11px] font-bold flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Mastered</span>
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteFlashcard(card.id);
                      }}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-rose-600 text-slate-400 hover:text-white"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 5: QUICK IDEAS (Chulbul Ideas preserved seamlessly) */}
      {subTab === 'ideas' && (
        <div className="grid lg:grid-cols-12 gap-6">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!ideaTitle) return;
              SoundFX.success();
              addIdea({ title: ideaTitle, tag: ideaTag, status: 'Just Idea', content: ideaContent });
              setIdeaTitle('');
              setIdeaContent('');
            }}
            className="lg:col-span-5 glass-crystal rounded-3xl p-5 space-y-3"
          >
            <h3 className="font-bold text-sm text-white">💡 চুলবুল আইডিয়া কুইক ক্যাপচার</h3>
            <input
              type="text"
              required
              placeholder="আইডিয়ার নাম..."
              value={ideaTitle}
              onChange={(e) => setIdeaTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs"
            />
            <input
              type="text"
              placeholder="Tag (Startup, AI...)"
              value={ideaTag}
              onChange={(e) => setIdeaTag(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs"
            />
            <textarea
              rows="3"
              placeholder="বিস্তারিত..."
              value={ideaContent}
              onChange={(e) => setIdeaContent(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs"
            />
            <button type="submit" className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold">
              + Save Idea
            </button>
          </form>

          <div className="lg:col-span-7 grid sm:grid-cols-2 gap-4">
            {ideas.map((idea) => (
              <motion.div
                key={idea.id}
                whileHover={{ y: -2 }}
                className="glass-crystal rounded-3xl p-5 flex flex-col justify-between space-y-3"
              >
                <div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/15 text-amber-300">
                    {idea.tag}
                  </span>
                  <h4 className="font-bold text-sm text-white mt-2">{idea.title}</h4>
                  {idea.content && <p className="text-xs text-slate-300 mt-1">{idea.content}</p>}
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-white/10 text-[10px] text-slate-500">
                  <span>{idea.date}</span>
                  <button
                    onClick={() => deleteIdea(idea.id)}
                    className="p-1 rounded-lg bg-white/5 hover:bg-rose-600 text-slate-400 hover:text-white"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
