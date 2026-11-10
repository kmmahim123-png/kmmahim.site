import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOS } from '../context/OSContext';
import { SecretPWAWidget } from './common/MotionKit';
import FinanceManager from './FinanceManager';
import MealManager from './MealManager';
import HabitsTracker from './HabitsTracker';
import GoalsTracker from './GoalsTracker';
import IdeaVault from './IdeaVault';
import SocialPoster from './SocialPoster';
import AgentHub from './AgentHub';
import {
  Wallet, Utensils, CheckSquare, Lightbulb,
  Share2, Bot, MessageSquare, Globe, Plus, Target
} from 'lucide-react';

export default function Layer2Shell() {
  const { data, setActiveLayer, updateProfile, addProject } = useOS();
  const [activeTab, setActiveTab] = useState('agents');

  const [nowInput, setNowInput] = useState(data.profile.nowStatus);
  const [projTitle, setProjTitle] = useState('');
  const [projCategory, setProjCategory] = useState('Web & AI');
  const [projDesc, setProjDesc] = useState('');
  const [projMetrics, setProjMetrics] = useState('');

  const handleSaveNow = (e) => {
    e.preventDefault();
    updateProfile({ nowStatus: nowInput });
  };

  const handleAddProject = (e) => {
    e.preventDefault();
    if (!projTitle) return;
    addProject({
      title: projTitle,
      category: projCategory,
      description: projDesc,
      metrics: projMetrics || 'Live Production',
      link: '#',
      badge: 'Creator'
    });
    setProjTitle('');
    setProjDesc('');
    setProjMetrics('');
  };

  const navItems = [
    { id: 'cms', label: 'Layer-1 Control & Inbox', icon: MessageSquare },
    { id: 'finance', label: 'Money & Wallets', icon: Wallet },
    { id: 'meals', label: 'Smart Meal Manager', icon: Utensils },
    { id: 'habits', label: 'Gym, Namaz & Minoxidil', icon: CheckSquare },
    { id: 'goals', label: 'Study & Goals', icon: Target },
    { id: 'ideas', label: 'Chulbul Idea Vault', icon: Lightbulb },
    { id: 'social', label: 'Social Auto-Poster', icon: Share2 },
    { id: 'agents', label: 'OpenClaw, Grok & Hermes', icon: Bot }
  ];

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-slate-950 border-r border-slate-800/80 p-4 flex flex-col justify-between shrink-0">
        <div>
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-black text-sm">
                OS
              </div>
              <div>
                <h2 className="text-sm font-bold leading-none">Mahim Life OS</h2>
                <span className="text-[10px] text-emerald-400 font-mono">● ALL SYSTEMS LIVE</span>
              </div>
            </div>
          </div>

          <div className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition ${
                    activeTab === item.id
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4"/>
                    <span>{item.label}</span>
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                    Live
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="pt-4 border-t border-slate-800 space-y-2 mt-6">
          <button
            onClick={() => setActiveLayer('public')}
            className="w-full py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-semibold flex items-center justify-center gap-2 text-cyan-400"
          >
            <Globe className="w-4 h-4"/>
            <span>Switch to Public Site</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-y-auto space-y-6">
        {/* Private PWA 1-Tap Install & 3x Speed Cache Engine (Visible ONLY in Layer 2 Private Panel) */}
        <SecretPWAWidget />

        {/* Native Mobile Swipe / Slide Tab Transition Container */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.24, ease: [0.25, 0.1, 0.25, 1] }}
            className="space-y-6"
          >
            {activeTab === 'cms' && (
              <>
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
                  <div>
                    <h1 className="text-2xl font-bold">Public Website Controller & Client Inbox</h1>
                    <p className="text-xs text-slate-400">
                      Update your Layer-1 Live Status, add new Projects, and view Service Bookings.
                    </p>
                  </div>
                </div>

                <form onSubmit={handleSaveNow} className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 space-y-3">
                  <label className="text-xs font-semibold uppercase tracking-wider text-cyan-400 block">
                    Update Public "NOW" Status Bar
                  </label>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={nowInput}
                      onChange={(e) => setNowInput(e.target.value)}
                      className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm"
                    />
                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold"
                    >
                      Update Live
                    </button>
                  </div>
                </form>

                <div className="grid lg:grid-cols-2 gap-6">
                  <form onSubmit={handleAddProject} className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 space-y-3">
                    <h3 className="font-bold text-sm flex items-center gap-2">
                      <Plus className="w-4 h-4 text-emerald-400"/>
                      <span>Add New Project to Public Portfolio</span>
                    </h3>
                    <input
                      type="text"
                      placeholder="Project or Brand Name"
                      value={projTitle}
                      onChange={(e) => setProjTitle(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Category"
                        value={projCategory}
                        onChange={(e) => setProjCategory(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs"
                      />
                      <input
                        type="text"
                        placeholder="Key Metric"
                        value={projMetrics}
                        onChange={(e) => setProjMetrics(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs"
                      />
                    </div>
                    <textarea
                      rows="2"
                      placeholder="Short description..."
                      value={projDesc}
                      onChange={(e) => setProjDesc(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs"
                    />
                    <button
                      type="submit"
                      className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold"
                    >
                      Publish to Layer 1
                    </button>
                  </form>

                  <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 space-y-3">
                    <h3 className="font-bold text-sm">Client Bookings & Agent Inbox ({data.messages.length})</h3>
                    <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                      {data.messages.map((m) => (
                        <div key={m.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-indigo-300">{m.sender}</span>
                            <span className="text-[10px] text-slate-500">{m.date}</span>
                          </div>
                          <p className="text-cyan-400 font-medium">Service: {m.service}</p>
                          <p className="text-slate-300">{m.text}</p>
                          <p className="text-[10px] text-slate-400">Contact: {m.email}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'finance' && <FinanceManager/>}
            {activeTab === 'meals' && <MealManager/>}
            {activeTab === 'habits' && <HabitsTracker/>}
            {activeTab === 'goals' && <GoalsTracker/>}
            {activeTab === 'ideas' && <IdeaVault/>}
            {activeTab === 'social' && <SocialPoster/>}
            {activeTab === 'agents' && <AgentHub/>}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
