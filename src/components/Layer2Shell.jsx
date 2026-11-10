import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOS } from '../context/OSContext';
import { SecretPWAWidget } from './common/MotionKit';
import SupabaseSyncModal from './common/SupabaseSyncModal';
import { SoundFX } from './common/SoundEffects';
import FinanceManager from './FinanceManager';
import MealManager from './MealManager';
import HabitsTracker from './HabitsTracker';
import GoalsTracker from './GoalsTracker';
import IdeaVault from './IdeaVault';
import SocialPoster from './SocialPoster';
import AgentHub from './AgentHub';
import {
  Wallet, Utensils, CheckSquare, Lightbulb,
  Share2, Bot, MessageSquare, Globe, Plus, Target,
  Cloud, CloudUpload, Lock, Sparkles, LayoutGrid, SlidersHorizontal
} from 'lucide-react';

export default function Layer2Shell() {
  const {
    data,
    setActiveLayer,
    updateProfile,
    addProject,
    syncStatus,
    uploadToSupabase
  } = useOS();

  const [activeTab, setActiveTab] = useState('agents');
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [mobileIconOnly, setMobileIconOnly] = useState(false); // Toggle between Icon-Only and Pill mode

  const [nowInput, setNowInput] = useState(data.profile.nowStatus);
  const [projTitle, setProjTitle] = useState('');
  const [projCategory, setProjCategory] = useState('Web & AI');
  const [projDesc, setProjDesc] = useState('');
  const [projMetrics, setProjMetrics] = useState('');

  const handleSaveNow = (e) => {
    e.preventDefault();
    SoundFX.success();
    updateProfile({ nowStatus: nowInput });
  };

  const handleAddProject = (e) => {
    e.preventDefault();
    if (!projTitle) return;
    SoundFX.success();
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
    {
      id: 'cms',
      label: 'Control & Inbox',
      shortLabel: 'Inbox',
      icon: MessageSquare,
      color: 'from-blue-500 to-indigo-600',
      activeColor: 'text-indigo-400',
      glow: 'shadow-indigo-500/30'
    },
    {
      id: 'finance',
      label: 'Money & Wallets',
      shortLabel: 'Money',
      icon: Wallet,
      color: 'from-emerald-500 to-teal-600',
      activeColor: 'text-emerald-400',
      glow: 'shadow-emerald-500/30'
    },
    {
      id: 'meals',
      label: 'Smart Meal Manager',
      shortLabel: 'Meals',
      icon: Utensils,
      color: 'from-amber-500 to-orange-600',
      activeColor: 'text-amber-400',
      glow: 'shadow-amber-500/30'
    },
    {
      id: 'habits',
      label: 'Gym, Namaz & Minoxidil',
      shortLabel: 'Habits',
      icon: CheckSquare,
      color: 'from-rose-500 to-pink-600',
      activeColor: 'text-rose-400',
      glow: 'shadow-rose-500/30'
    },
    {
      id: 'goals',
      label: 'Study & Goals',
      shortLabel: 'Goals',
      icon: Target,
      color: 'from-violet-500 to-purple-600',
      activeColor: 'text-violet-400',
      glow: 'shadow-violet-500/30'
    },
    {
      id: 'ideas',
      label: 'Chulbul Idea Vault',
      shortLabel: 'Ideas',
      icon: Lightbulb,
      color: 'from-yellow-400 to-amber-500',
      activeColor: 'text-yellow-400',
      glow: 'shadow-yellow-500/30'
    },
    {
      id: 'social',
      label: 'Social Auto-Poster',
      shortLabel: 'Social',
      icon: Share2,
      color: 'from-pink-500 to-rose-600',
      activeColor: 'text-pink-400',
      glow: 'shadow-pink-500/30'
    },
    {
      id: 'agents',
      label: 'OpenClaw, Grok & Hermes',
      shortLabel: 'AI Hub',
      icon: Bot,
      color: 'from-cyan-500 to-blue-600',
      activeColor: 'text-cyan-400',
      glow: 'shadow-cyan-500/30'
    }
  ];

  const handleTabChange = (tabId) => {
    SoundFX.click();
    setActiveTab(tabId);
  };

  return (
    <div className="min-h-screen bg-[#06080e] text-slate-100 flex flex-col md:flex-row relative selection:bg-indigo-500 selection:text-white">
      {/* Supabase Cloud Sync & Data Management Modal */}
      <SupabaseSyncModal
        isOpen={showSyncModal}
        onClose={() => setShowSyncModal(false)}
      />

      {/* DESKTOP SIDEBAR (>= md screens) */}
      <aside className="hidden md:flex w-64 bg-slate-950/95 border-r border-slate-800/80 p-4 flex-col justify-between shrink-0 sticky top-0 h-screen z-20 backdrop-blur-xl">
        <div className="space-y-4">
          {/* Logo & Status */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center font-black text-sm shadow-lg shadow-indigo-600/30">
                OS
              </div>
              <div>
                <h2 className="text-sm font-bold leading-none text-white tracking-wide">Mahim Life OS</h2>
                <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1 mt-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  ALL SYSTEMS LIVE
                </span>
              </div>
            </div>
          </div>

          {/* Supabase Quick Status Card */}
          <button
            onClick={() => {
              SoundFX.click();
              setShowSyncModal(true);
            }}
            className="w-full p-2.5 rounded-2xl bg-gradient-to-r from-emerald-950/40 to-slate-900 border border-emerald-500/30 hover:border-emerald-500/60 transition flex items-center justify-between group"
          >
            <div className="flex items-center gap-2">
              <Cloud className="w-4 h-4 text-emerald-400 group-hover:animate-bounce" />
              <div className="text-left">
                <div className="text-[11px] font-bold text-emerald-300">Supabase Cloud</div>
                <div className="text-[9px] text-slate-400">
                  {syncStatus.status === 'success' ? 'Synced & Ready' : 'uqupazmycylfcqvsajnx'}
                </div>
              </div>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono font-semibold">
              Manage
            </span>
          </button>

          {/* Desktop Navigation Items with Animated Active Pill */}
          <div className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabChange(item.id)}
                  className={`relative w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all group overflow-hidden ${
                    isActive ? 'text-white' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                  }`}
                >
                  {/* Moving Spring Active Background */}
                  {isActive && (
                    <motion.div
                      layoutId="desktopNavPill"
                      className="absolute inset-0 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-600/30"
                      transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                    />
                  )}

                  <span className="relative z-10 flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 transition-transform ${isActive ? 'scale-110' : 'group-hover:scale-105'}`} />
                    <span>{item.label}</span>
                  </span>

                  <span className={`relative z-10 text-[9px] font-mono px-1.5 py-0.5 rounded ${
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'
                  }`}>
                    Live
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-slate-800 space-y-2">
          <button
            onClick={() => {
              SoundFX.click();
              setActiveLayer('public');
            }}
            className="w-full py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-semibold flex items-center justify-center gap-2 text-cyan-400 border border-slate-800/80 transition"
          >
            <Globe className="w-4 h-4" />
            <span>Switch to Public Site</span>
          </button>
        </div>
      </aside>

      {/* MOBILE STICKY TOP HEADER & MOVING ANIMATED DOCK (< md screens) */}
      <div className="md:hidden sticky top-0 z-30 bg-slate-950/95 backdrop-blur-xl border-b border-slate-800/80 shadow-2xl">
        {/* Mobile Header Bar */}
        <div className="px-4 py-2.5 flex items-center justify-between border-b border-slate-800/50">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center font-black text-xs shadow-md shadow-indigo-600/40">
              OS
            </div>
            <div>
              <span className="text-xs font-bold text-white tracking-tight">Mahim Life OS</span>
              <span className="ml-1.5 text-[9px] font-mono text-emerald-400">● LIVE</span>
            </div>
          </div>

          {/* Quick Header Actions (Supabase Sync + Switch to Public + Mode Toggle) */}
          <div className="flex items-center gap-2">
            {/* Supabase Quick Upload Button */}
            <button
              onClick={() => {
                SoundFX.click();
                setShowSyncModal(true);
              }}
              title="Supabase Cloud Sync"
              className="px-2.5 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-bold flex items-center gap-1 active:scale-95 transition"
            >
              <Cloud className="w-3.5 h-3.5 animate-pulse" />
              <span>Cloud</span>
            </button>

            {/* Toggle Icon-Only mode */}
            <button
              onClick={() => {
                SoundFX.click();
                setMobileIconOnly(!mobileIconOnly);
              }}
              title={mobileIconOnly ? "Show Labels" : "Icon Only Mode"}
              className={`p-1.5 rounded-xl border transition ${
                mobileIconOnly
                  ? 'bg-indigo-600/30 border-indigo-500 text-indigo-300'
                  : 'bg-slate-900 border-slate-800 text-slate-400'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
            </button>

            {/* Switch to Public Site */}
            <button
              onClick={() => {
                SoundFX.click();
                setActiveLayer('public');
              }}
              title="Switch to Public"
              className="p-1.5 rounded-xl bg-slate-900 border border-slate-800 text-cyan-400 active:scale-95 transition"
            >
              <Globe className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* MOBILE ULTRA-SLEEK MOVING ANIMATED HORIZONTAL DOCK */}
        <div className="px-2 py-2 overflow-x-auto no-scrollbar flex items-center gap-1.5 scroll-smooth">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabChange(item.id)}
                className={`relative shrink-0 flex items-center justify-center transition-all ${
                  mobileIconOnly
                    ? 'w-11 h-11 rounded-2xl'
                    : 'px-3.5 py-2 rounded-2xl gap-2'
                } ${
                  isActive
                    ? 'text-white'
                    : 'text-slate-400 hover:text-slate-200 bg-slate-900/40 border border-slate-800/40'
                }`}
              >
                {/* Smooth Spring Active Glowing Pill */}
                {isActive && (
                  <motion.div
                    layoutId="mobileNavPill"
                    className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-indigo-500 rounded-2xl shadow-lg shadow-indigo-600/40 border border-indigo-400/30"
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  />
                )}

                {/* Animated Icon with Spring Bounce */}
                <motion.div
                  animate={{ scale: isActive ? 1.15 : 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                  className="relative z-10"
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : item.activeColor}`} />
                </motion.div>

                {/* Short Label (Hidden in Icon-Only mode) */}
                {!mobileIconOnly && (
                  <span className="relative z-10 text-xs font-bold tracking-tight whitespace-nowrap">
                    {item.shortLabel}
                  </span>
                )}

                {/* Subtle indicator dot for active item */}
                {isActive && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="relative z-10 w-1.5 h-1.5 rounded-full bg-cyan-300 shadow-[0_0_6px_#67e8f9]"
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 p-4 md:p-6 overflow-y-auto space-y-6 max-w-7xl mx-auto w-full">
        {/* Private PWA 1-Tap Install Widget */}
        <SecretPWAWidget />

        {/* Native Mobile Swipe / Slide Tab Transition Container */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 12, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.99 }}
            transition={{ duration: 0.22, ease: [0.25, 0.1, 0.25, 1] }}
            className="space-y-6"
          >
            {activeTab === 'cms' && (
              <>
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
                  <div>
                    <h1 className="text-xl md:text-2xl font-bold flex items-center gap-2">
                      <span>Public Website Controller & Client Inbox</span>
                    </h1>
                    <p className="text-xs text-slate-400">
                      Update your Layer-1 Live Status, add new Projects, and view Service Bookings.
                    </p>
                  </div>

                  {/* Supabase Upload Button in CMS */}
                  <button
                    onClick={() => {
                      SoundFX.click();
                      setShowSyncModal(true);
                    }}
                    className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-900/30 transition"
                  >
                    <CloudUpload className="w-4 h-4" />
                    <span>Supabase Cloud Sync</span>
                  </button>
                </div>

                <form onSubmit={handleSaveNow} className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 space-y-3">
                  <label className="text-xs font-semibold uppercase tracking-wider text-cyan-400 block">
                    Update Public "NOW" Status Bar
                  </label>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="text"
                      value={nowInput}
                      onChange={(e) => setNowInput(e.target.value)}
                      className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm focus:border-indigo-500 outline-none"
                    />
                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white transition active:scale-95"
                    >
                      Update Live
                    </button>
                  </div>
                </form>

                <div className="grid lg:grid-cols-2 gap-6">
                  <form onSubmit={handleAddProject} className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 space-y-3">
                    <h3 className="font-bold text-sm flex items-center gap-2 text-white">
                      <Plus className="w-4 h-4 text-emerald-400" />
                      <span>Add New Project to Public Portfolio</span>
                    </h3>
                    <input
                      type="text"
                      placeholder="Project or Brand Name"
                      value={projTitle}
                      onChange={(e) => setProjTitle(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs focus:border-indigo-500 outline-none"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Category"
                        value={projCategory}
                        onChange={(e) => setProjCategory(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs focus:border-indigo-500 outline-none"
                      />
                      <input
                        type="text"
                        placeholder="Key Metric"
                        value={projMetrics}
                        onChange={(e) => setProjMetrics(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs focus:border-indigo-500 outline-none"
                      />
                    </div>
                    <textarea
                      rows="2"
                      placeholder="Short description..."
                      value={projDesc}
                      onChange={(e) => setProjDesc(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs focus:border-indigo-500 outline-none"
                    />
                    <button
                      type="submit"
                      className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white transition active:scale-95"
                    >
                      Publish to Layer 1
                    </button>
                  </form>

                  <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 space-y-3">
                    <h3 className="font-bold text-sm text-white flex items-center justify-between">
                      <span>Client Bookings & Agent Inbox</span>
                      <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300">
                        {data.messages.length} messages
                      </span>
                    </h3>
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

            {activeTab === 'finance' && <FinanceManager />}
            {activeTab === 'meals' && <MealManager />}
            {activeTab === 'habits' && <HabitsTracker />}
            {activeTab === 'goals' && <GoalsTracker />}
            {activeTab === 'ideas' && <IdeaVault />}
            {activeTab === 'social' && <SocialPoster />}
            {activeTab === 'agents' && <AgentHub />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
