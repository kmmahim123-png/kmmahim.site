import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOS } from '../context/OSContext';
import { SoundFX } from './common/SoundEffects';
import { Lightbulb, Plus, Trash2, Sparkles, X, Compass } from 'lucide-react';

export default function IdeaVault() {
  const { data, addIdea, deleteIdea } = useOS();
  const { ideas } = data;

  const [title, setTitle] = useState('');
  const [tag, setTag] = useState('AI & Tech');
  const [status, setStatus] = useState('Just Idea');
  const [content, setContent] = useState('');
  const [image, setImage] = useState('');
  const [selectedIdeaId, setSelectedIdeaId] = useState(null);

  const cardRefs = useRef({});

  const handleAddIdea = (e) => {
    e.preventDefault();
    if (!title) return;
    SoundFX.success();
    addIdea({ title, tag, status, content, image });
    setTitle('');
    setContent('');
    setImage('');
  };

  const handleOrbClick = (ideaId) => {
    SoundFX.laser();
    setSelectedIdeaId(ideaId);
    const el = cardRefs.current[ideaId];
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const selectedIdea = ideas.find((i) => i.id === selectedIdeaId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black flex items-center gap-2.5 text-white">
            <Lightbulb className="w-6 h-6 text-amber-400" />
            <span>চুলবুল আইডিয়া ভল্ট (Floating Idea Galaxy)</span>
          </h1>
          <p className="text-xs text-slate-400">
            ভাসমান আইডিয়াগুলোতে ক্লিক করলেই সরাসরি ওই আইডিয়ার বিস্তারিত ওপেন হয়ে যাবে!
          </p>
        </div>
      </div>

      {/* ORBITING / FLOATING ANIMATED IDEA CONSTELLATION */}
      <div className="glass-crystal rounded-3xl p-6 relative overflow-hidden min-h-[290px] flex flex-col justify-between">
        {/* Orbital Rings & Center Core */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
            className="w-72 h-72 rounded-full border border-dashed border-amber-500/20"
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 28, repeat: Infinity, ease: 'linear' }}
            className="absolute w-48 h-48 rounded-full border border-indigo-500/20"
          />
          <div className="absolute w-20 h-20 rounded-full bg-amber-500/10 blur-xl animate-pulse" />
        </div>

        <div className="relative z-10 flex items-center justify-between text-[11px] font-mono text-amber-300">
          <span className="flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '12s' }} />
            <span>INTERACTIVE IDEA CONSTELLATION ({ideas.length} Orbs)</span>
          </span>
          <span className="text-slate-400 hidden sm:inline">Tap any floating bubble to jump to idea</span>
        </div>

        {/* Floating Idea Orbs Stage */}
        <div className="relative z-10 my-6 flex flex-wrap items-center justify-center gap-4 min-h-[160px]">
          {ideas.length === 0 ? (
            <div className="text-center text-xs text-slate-400">
              এখনো কোনো আইডিয়া নেই। নিচে প্রথম আইডিয়া যোগ করুন, সেটি এখানে ভেসে বেড়াবে!
            </div>
          ) : (
            ideas.map((idea, idx) => {
              const isSelected = selectedIdeaId === idea.id;
              // Unique drift offsets for organic floating galaxy effect
              const floatX = ((idx % 3) - 1) * 14 + 8;
              const floatY = ((idx % 2 === 0 ? 1 : -1) * 16);
              const dur = 5 + (idx % 4) * 1.4;

              return (
                <motion.button
                  key={idea.id}
                  onClick={() => handleOrbClick(idea.id)}
                  animate={{
                    x: [0, floatX, -floatX * 0.7, 0],
                    y: [0, floatY, -floatY * 0.8, 0],
                    rotate: [0, 1.5, -1.5, 0]
                  }}
                  transition={{
                    duration: dur,
                    repeat: Infinity,
                    ease: 'easeInOut'
                  }}
                  whileHover={{ scale: 1.12, zIndex: 30 }}
                  whileTap={{ scale: 0.94 }}
                  className={`px-4 py-2.5 rounded-full backdrop-blur-xl border cursor-pointer transition-colors flex items-center gap-2 shadow-xl ${
                    isSelected
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black border-amber-200 shadow-amber-500/40'
                      : 'bg-white/[0.06] hover:bg-amber-500/20 border-white/20 hover:border-amber-400/60 text-white'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping shrink-0" />
                  <span className="text-xs font-bold max-w-[180px] truncate">{idea.title}</span>
                  <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded-full ${
                    isSelected ? 'bg-black/20 text-white' : 'bg-white/10 text-cyan-300'
                  }`}>
                    {idea.tag}
                  </span>
                </motion.button>
              );
            })
          )}
        </div>

        {/* Expanded Focus Drawer if an Orb was clicked */}
        <AnimatePresence>
          {selectedIdea && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="relative z-20 p-4 rounded-2xl bg-slate-950/90 border border-amber-500/50 shadow-2xl space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <h4 className="font-bold text-sm text-white">{selectedIdea.title}</h4>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono">
                    {selectedIdea.status}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedIdeaId(null)}
                  className="p-1 rounded-lg bg-white/5 hover:bg-white/15 text-slate-400"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              {selectedIdea.content && (
                <p className="text-xs text-slate-300 leading-relaxed">{selectedIdea.content}</p>
              )}
              <span className="text-[10px] font-mono text-slate-500 block">
                Tag: {selectedIdea.tag} • Date: {selectedIdea.date}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Add Form + Grid */}
      <div className="grid lg:grid-cols-12 gap-6">
        <form onSubmit={handleAddIdea} className="lg:col-span-5 glass-crystal rounded-3xl p-5 space-y-4">
          <h3 className="font-bold text-sm flex items-center gap-2 text-white">
            <Plus className="w-4 h-4 text-amber-400" />
            <span>নতুন চুলবুল আইডিয়া লিখুন</span>
          </h3>

          <div>
            <label className="text-[11px] text-slate-400 block mb-1">আইডিয়ার শিরোনাম (Title) *</label>
            <input
              type="text"
              required
              placeholder="e.g. Autonomous AI Voice Note Tagger"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">ক্যাটাগরি / ট্যাগ</label>
              <input
                type="text"
                placeholder="AI, Startup, Fitness..."
                value={tag}
                onChange={(e) => setTag(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl glass-input text-xs"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">অবস্থা (Status)</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl glass-input text-xs"
              >
                <option value="Just Idea" className="bg-slate-900">Just Idea 💡</option>
                <option value="Researching" className="bg-slate-900">Researching 🔍</option>
                <option value="Working On It" className="bg-slate-900">Working On It 🚀</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-[11px] text-slate-400 block mb-1">ইমেজ লিংক (ঐচ্ছিক)</label>
            <input
              type="text"
              placeholder="https://images.unsplash.com/..."
              value={image}
              onChange={(e) => setImage(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl glass-input text-xs"
            />
          </div>

          <div>
            <label className="text-[11px] text-slate-400 block mb-1">বিস্তারিত নোট</label>
            <textarea
              rows="3"
              placeholder="আইডিয়াটি কীভাবে কাজ করবে..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl glass-input text-xs"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-xs font-bold text-white transition active:scale-95"
          >
            + গ্যালাক্সিতে সেভ করুন
          </button>
        </form>

        {/* Ideas Grid */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-white">সংরক্ষিত আইডিয়াসমূহ ({ideas.length})</h3>
            <span className="text-xs text-slate-400">গ্যালাক্সিতে ক্লিক করলে কার্ডটি হাইলাইট হবে</span>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {ideas.map((idea) => {
              const isHighlighted = selectedIdeaId === idea.id;
              return (
                <motion.div
                  key={idea.id}
                  ref={(el) => (cardRefs.current[idea.id] = el)}
                  animate={isHighlighted ? { scale: [1, 1.03, 1] } : {}}
                  transition={{ duration: 0.4 }}
                  onClick={() => {
                    SoundFX.click();
                    setSelectedIdeaId(idea.id);
                  }}
                  className={`glass-crystal rounded-3xl p-5 flex flex-col justify-between transition space-y-3 cursor-pointer ${
                    isHighlighted
                      ? 'border-amber-400 ring-2 ring-amber-500/40 bg-amber-950/20'
                      : 'hover:border-amber-500/40'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                        {idea.tag}
                      </span>
                      <span className="text-[10px] text-cyan-400 font-mono">{idea.status}</span>
                    </div>

                    <h4 className="font-bold text-sm text-white">{idea.title}</h4>
                    {idea.content && (
                      <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">{idea.content}</p>
                    )}

                    {idea.image && (
                      <img
                        src={idea.image}
                        alt={idea.title}
                        className="w-full h-32 object-cover rounded-2xl mt-3 border border-white/10"
                      />
                    )}
                  </div>

                  <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-500">
                    <span>{idea.date}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        SoundFX.click();
                        deleteIdea(idea.id);
                      }}
                      className="p-1 rounded-lg bg-white/5 hover:bg-rose-600 text-slate-400 hover:text-white transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
