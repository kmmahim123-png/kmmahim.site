import React, { useState, useRef, useEffect, Suspense, lazy, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOS } from '../context/OSContext';
import SupabaseSyncModal from './common/SupabaseSyncModal';
import SafeDeleteModal from './common/SafeDeleteModal';
import CommandPalette from './common/CommandPalette';
import { SoundFX } from './common/SoundEffects';
import { downloadFullOSBackupJSON, downloadCalendarCSV } from '../utils/exportData';
import {
  Wallet, Utensils, CheckSquare, Brain, Share2, Bot, MessageSquare, Globe,
  Plus, Target, Cloud, LayoutDashboard, Trash2, Download, Upload, FileSpreadsheet,
  Smartphone, AlertTriangle, Sparkles, Plug, Youtube, Boxes, Lock, Search,
  RefreshCw, Play, Pause, Square
} from 'lucide-react';

// Lazy-loaded Workspace Modules (splits bundle into crisp async chunks)
const CommandOverview = lazy(() => import('./CommandOverview'));
const AICopilotDrawer = lazy(() => import('./AICopilotDrawer'));
const SecondBrain = lazy(() => import('./SecondBrain'));
const IntegrationsHub = lazy(() => import('./IntegrationsHub'));
const MediaVault = lazy(() => import('./MediaVault'));
const CustomSectionsHub = lazy(() => import('./CustomSectionsHub'));
const FinanceManager = lazy(() => import('./FinanceManager'));
const MealManager = lazy(() => import('./MealManager'));
const HabitsTracker = lazy(() => import('./HabitsTracker'));
const GoalsTracker = lazy(() => import('./GoalsTracker'));
const SocialPoster = lazy(() => import('./SocialPoster'));
const AgentHub = lazy(() => import('./AgentHub'));

export default function Layer2Shell() {
  const {
    data,
    activeTab,
    setActiveTab,
    setActiveLayer,
    lockOS,
    updateProfile,
    addProject,
    deleteProject,
    deleteMessage,
    publicInquiries,
    loadPublicInquiries,
    resetAllPersonalOSData,
    restoreFromJSONBackup,
    syncStatus,
    pomodoro,
    audioPlayer,
    toggleAudioPlayPause,
    stopAudioTrack,
    showCopilotDrawer,
    setShowCopilotDrawer
  } = useOS();

  const [showSyncModal, setShowSyncModal] = useState(false);
  const [showDeleteAllModal, setShowDeleteAllModal] = useState(false);
  const [showOmniSearch, setShowOmniSearch] = useState(false);
  const [importNotice, setImportNotice] = useState('');
  const fileInputRef = useRef(null);

  const [nowInput, setNowInput] = useState(data.profile.nowStatus);
  const [projTitle, setProjTitle] = useState('');
  const [projCategory, setProjCategory] = useState('Web & AI');
  const [projDesc, setProjDesc] = useState('');
  const [projMetrics, setProjMetrics] = useState('');

  // Keep CMS nowInput synchronized when cloud data arrives
  useEffect(() => {
    setNowInput(data.profile.nowStatus || '');
  }, [data.profile.nowStatus]);

  useEffect(() => {
    const handlePaletteTrigger = () => setShowOmniSearch(true);
    window.addEventListener('open-command-palette', handlePaletteTrigger);
    return () => window.removeEventListener('open-command-palette', handlePaletteTrigger);
  }, []);

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

  const handleImportFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const parsed = JSON.parse(evt.target.result);
        const ok = restoreFromJSONBackup(parsed);
        if (ok) {
          SoundFX.success();
          setImportNotice('✅ ব্যাকআপ সফলভাবে রিস্টোর হয়েছে!');
          setTimeout(() => setImportNotice(''), 4000);
        } else {
          alert('Invalid backup format.');
        }
      } catch {
        alert('Could not parse JSON backup file.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const navItems = [
    { id: 'overview', label: 'Home', fullLabel: 'Command Cockpit', icon: LayoutDashboard, color: 'text-cyan-400' },
    { id: 'ai_desk', label: 'AI Desk', fullLabel: 'Claude-Style AI Copilot', icon: Sparkles, color: 'text-indigo-400' },
    { id: 'second_brain', label: '2nd Brain', fullLabel: 'Second Brain (Notes, Graph & Journal)', icon: Brain, color: 'text-purple-400' },
    { id: 'connections', label: 'Connect', fullLabel: 'Gmail, Calendar, Contacts & WhatsApp', icon: Plug, color: 'text-emerald-400' },
    { id: 'media', label: 'Media', fullLabel: 'YouTube & Background Audio Vault', icon: Youtube, color: 'text-rose-400' },
    { id: 'custom', label: 'Custom', fullLabel: 'Dynamic Custom Sections', icon: Boxes, color: 'text-sky-400' },
    { id: 'finance', label: 'Money', fullLabel: 'Money, Budgets & Wallets', icon: Wallet, color: 'text-emerald-400' },
    { id: 'meals', label: 'Food', fullLabel: 'Smart Meal Manager', icon: Utensils, color: 'text-amber-400' },
    { id: 'habits', label: 'Habits', fullLabel: 'Daily Habits & Heatmap', icon: CheckSquare, color: 'text-rose-400' },
    { id: 'goals', label: 'Goals', fullLabel: 'Goals & Focus Timer', icon: Target, color: 'text-violet-400' },
    { id: 'social', label: 'Social', fullLabel: 'Social Content Planner', icon: Share2, color: 'text-pink-400' },
    { id: 'agents', label: 'Webhooks', fullLabel: 'OpenClaw & n8n Webhooks', icon: Bot, color: 'text-blue-400' },
    { id: 'cms', label: 'Inbox', fullLabel: 'Site Control & Client Inbox', icon: MessageSquare, color: 'text-indigo-400' }
  ];

  // Universal Layer-2 Omni-Search Index (Tabs + Notes + Goals + Ideas + Custom Sections)
  const omniCommands = useMemo(() => {
    const items = navItems.map((nav) => ({
      id: `tab_${nav.id}`,
      label: nav.fullLabel,
      badge: 'Module',
      icon: nav.icon,
      action: () => setActiveTab(nav.id)
    }));

    (data.secondBrain?.notes || []).forEach((n) => {
      items.push({
        id: `note_${n.id}`,
        label: `Note: ${n.title}`,
        badge: n.folder || 'Brain',
        icon: Brain,
        action: () => setActiveTab('second_brain')
      });
    });

    (data.goals || []).forEach((g) => {
      items.push({
        id: `goal_${g.id}`,
        label: `Goal: ${g.title}`,
        badge: g.timeframe || 'daily',
        icon: Target,
        action: () => setActiveTab('goals')
      });
    });

    (data.customSections || []).forEach((s) => {
      items.push({
        id: `sec_${s.id}`,
        label: `Custom: ${s.title}`,
        badge: s.type,
        icon: Boxes,
        action: () => setActiveTab('custom')
      });
    });

    items.push({
      id: 'ask_ai_modal',
      label: 'Open Floating AI Copilot Drawer',
      badge: 'AI',
      icon: Sparkles,
      action: () => setShowCopilotDrawer(true)
    });

    return items;
  }, [data.secondBrain?.notes, data.goals, data.customSections]);

  const handleTabChange = (tabId) => {
    SoundFX.click();
    setActiveTab(tabId);
  };

  // Merge Supabase public_inquiries + internal messages seamlessly
  const mergedMessages = useMemo(() => {
    const seen = new Set();
    const list = [];
    for (const m of [...(publicInquiries || []), ...(data.messages || [])]) {
      if (!seen.has(m.id)) {
        seen.add(m.id);
        list.push(m);
      }
    }
    return list;
  }, [publicInquiries, data.messages]);

  const pomoMin = Math.floor(pomodoro.timeLeft / 60);
  const pomoSec = String(pomodoro.timeLeft % 60).padStart(2, '0');

  return (
    <div className="min-h-screen bg-[#04060c] text-slate-100 flex flex-col relative selection:bg-indigo-500 selection:text-white overflow-x-hidden">
      {/* Classical Crystal Aurora Ambient Background */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-indigo-600/20 blur-[120px] animate-aurora" />
        <div className="absolute top-1/2 -right-32 w-[450px] h-[450px] rounded-full bg-cyan-500/15 blur-[120px] animate-aurora-delayed" />
        <div className="absolute -bottom-32 left-1/3 w-[400px] h-[400px] rounded-full bg-emerald-500/10 blur-[110px] animate-aurora" />
      </div>

      {/* Modals & Drawers */}
      <CommandPalette
        isOpen={showOmniSearch}
        onClose={() => setShowOmniSearch(false)}
        customCommands={omniCommands}
        darkTheme
      />

      {showCopilotDrawer && (
        <Suspense fallback={null}>
          <AICopilotDrawer embedded={false} onClose={() => setShowCopilotDrawer(false)} />
        </Suspense>
      )}

      <SupabaseSyncModal
        isOpen={showSyncModal}
        onClose={() => setShowSyncModal(false)}
      />

      <SafeDeleteModal
        isOpen={showDeleteAllModal}
        onClose={() => setShowDeleteAllModal(false)}
        onConfirm={() => resetAllPersonalOSData()}
        title="সব পার্সোনাল ডেটা ডিলিট (Factory Wipe)"
        description="আপনি কি আপনার ওয়ালেট, লেনদেন, মিল, হ্যাবিট, গোল এবং সব আইডিয়া সম্পূর্ণ মুছে ০ করতে চান?"
      />

      {/* TOP CIRCULAR CRYSTAL ORBITAL BAR */}
      <header className="sticky top-0 z-30 bg-slate-950/75 backdrop-blur-2xl border-b border-white/10 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 pt-2.5 pb-2">
          {/* Top Utility Strip */}
          <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-white/5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center font-black text-xs shadow-lg shadow-indigo-600/30 border border-white/20">
                OS
              </div>
              <div>
                <h2 className="text-xs sm:text-sm font-bold leading-none text-white tracking-wide">
                  Mahim Life OS
                </h2>
                <span className="text-[9px] text-emerald-400 font-mono flex items-center gap-1 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  SECOND BRAIN + AI COPILOT
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2">
              {pomodoro.isRunning && (
                <button
                  onClick={() => setActiveTab('goals')}
                  className="px-2.5 py-1.5 rounded-full bg-indigo-600/30 border border-indigo-400/50 text-[11px] font-mono font-bold text-indigo-200 animate-pulse"
                  title="Running Focus Timer"
                >
                  ⏱ {pomoMin}:{pomoSec}
                </button>
              )}

              <button
                onClick={() => setShowOmniSearch(true)}
                title="Omni-Search (⌘K)"
                className="p-2 sm:px-3 sm:py-1.5 rounded-full glass-pill hover:bg-white/10 text-slate-300 text-[11px] font-bold flex items-center gap-1 transition"
              >
                <Search className="w-3.5 h-3.5" />
                <span className="hidden md:inline">⌘K</span>
              </button>

              <button
                onClick={() => {
                  SoundFX.click();
                  setShowCopilotDrawer(true);
                }}
                className="px-2.5 sm:px-3 py-1.5 rounded-full bg-gradient-to-r from-indigo-600 to-cyan-600 text-white text-[11px] font-bold flex items-center gap-1 shadow-md"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Ask AI</span>
              </button>

              <button
                onClick={() => {
                  SoundFX.click();
                  setShowSyncModal(true);
                }}
                className={`px-2.5 sm:px-3 py-1.5 rounded-full border text-[11px] font-bold flex items-center gap-1.5 transition ${
                  syncStatus.status === 'needs_setup'
                    ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 animate-pulse'
                    : syncStatus.status === 'error'
                    ? 'bg-rose-500/20 border-rose-500/40 text-rose-300'
                    : 'bg-emerald-500/15 border-emerald-500/30 hover:border-emerald-400 text-emerald-300'
                }`}
              >
                <Cloud className={`w-3.5 h-3.5 ${syncStatus.status === 'syncing' ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">
                  {syncStatus.status === 'needs_setup'
                    ? '⚠️ Setup DB'
                    : syncStatus.status === 'syncing'
                    ? 'Syncing...'
                    : syncStatus.status === 'success'
                    ? 'Cloud Synced'
                    : 'Supabase Sync'}
                </span>
              </button>

              <button
                onClick={() => {
                  SoundFX.click();
                  setActiveLayer('public');
                }}
                className="px-2.5 sm:px-3 py-1.5 rounded-full glass-pill hover:bg-white/10 text-cyan-400 text-[11px] font-bold flex items-center gap-1 transition"
                title="View Public Portfolio (stays unlocked)"
              >
                <Globe className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Public</span>
              </button>

              <button
                onClick={() => {
                  SoundFX.click();
                  lockOS();
                }}
                className="p-2 sm:px-2.5 sm:py-1.5 rounded-full bg-rose-500/15 hover:bg-rose-600 border border-rose-500/30 text-rose-300 hover:text-white text-[11px] font-bold flex items-center gap-1 transition"
                title="Lock Workspace (Require PIN next time)"
              >
                <Lock className="w-3.5 h-3.5" />
                <span className="hidden lg:inline">Lock</span>
              </button>
            </div>
          </div>

          {/* CIRCULAR NAVIGATION BAR */}
          <nav className="pt-2.5 pb-1 overflow-x-auto no-scrollbar flex items-center xl:justify-center gap-3 sm:gap-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabChange(item.id)}
                  title={item.fullLabel}
                  className="flex flex-col items-center gap-1 shrink-0 group cursor-pointer focus:outline-none"
                >
                  <motion.div
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.92 }}
                    animate={{ y: isActive ? -2 : 0 }}
                    className={`nav-circle-orb ${isActive ? 'nav-circle-active' : ''}`}
                  >
                    <Icon
                      className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform ${
                        isActive ? 'text-white scale-110' : `${item.color} group-hover:scale-110`
                      }`}
                    />
                  </motion.div>
                  <span
                    className={`text-[10px] font-semibold tracking-tight transition-colors ${
                      isActive ? 'text-cyan-300 font-bold' : 'text-slate-400 group-hover:text-slate-200'
                    }`}
                  >
                    {item.label}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      {/* MAIN WORKSPACE CONTENT */}
      <main className="flex-1 p-4 md:p-6 overflow-y-auto space-y-6 max-w-7xl mx-auto w-full relative z-10">
        {(syncStatus.status === 'needs_setup' || syncStatus.status === 'error') && (
          <button
            onClick={() => {
              SoundFX.click();
              setShowSyncModal(true);
            }}
            className="w-full text-left p-3.5 sm:p-4 rounded-2xl bg-amber-500/15 hover:bg-amber-500/20 border border-amber-500/40 text-amber-200 flex flex-wrap items-center justify-between gap-3 transition"
          >
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 animate-pulse" />
              <div>
                <div className="text-xs sm:text-sm font-bold text-amber-300">
                  {syncStatus.status === 'needs_setup'
                    ? 'ক্লাউড সিঙ্ক এখনো চালু হয়নি (Supabase টেবিল তৈরি বাকি)'
                    : 'Supabase ক্লাউড সিঙ্ক এরর'}
                </div>
                <div className="text-[11px] text-amber-100/80">
                  {syncStatus.message || 'মোবাইল ও ল্যাপটপের ডেটা সিঙ্ক করতে এখানে ক্লিক করে ১-বারের SQL সেটআপ সম্পূর্ণ করুন।'}
                </div>
              </div>
            </div>
            <span className="px-3 py-1.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-[11px] shrink-0">
              সেটআপ ও সিঙ্ক দেখুন →
            </span>
          </button>
        )}

        {importNotice && (
          <div className="p-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 text-xs font-bold text-center">
            {importNotice}
          </div>
        )}

        <Suspense
          fallback={
            <div className="glass-crystal rounded-3xl p-12 text-center text-xs text-slate-400 font-mono">
              লোড হচ্ছে...
            </div>
          }
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 12, scale: 0.99 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.99 }}
              transition={{ duration: 0.22, ease: [0.25, 0.1, 0.25, 1] }}
              className="space-y-6"
            >
              {activeTab === 'overview' && <CommandOverview onNavigate={handleTabChange} />}
              {activeTab === 'ai_desk' && <AICopilotDrawer embedded />}
              {activeTab === 'second_brain' && <SecondBrain />}
              {activeTab === 'connections' && <IntegrationsHub />}
              {activeTab === 'media' && <MediaVault />}
              {activeTab === 'custom' && <CustomSectionsHub />}
              {activeTab === 'finance' && <FinanceManager />}
              {activeTab === 'meals' && <MealManager />}
              {activeTab === 'habits' && <HabitsTracker />}
              {activeTab === 'goals' && <GoalsTracker />}
              {activeTab === 'social' && <SocialPoster />}
              {activeTab === 'agents' && <AgentHub />}

              {activeTab === 'cms' && (
                <>
                  <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
                    <div>
                      <h1 className="text-xl md:text-2xl font-black text-white">
                        Public Website Controller & Client Inbox
                      </h1>
                      <p className="text-xs text-slate-400">
                        Layer-1 Live Status, Projects এবং রিয়েল Supabase ক্লায়েন্ট মেসেজ দেখুন
                      </p>
                    </div>
                    <button
                      onClick={() => loadPublicInquiries()}
                      className="px-3.5 py-2 rounded-xl glass-pill hover:bg-white/10 text-xs font-bold text-cyan-300 flex items-center gap-1.5"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Sync Client Inquiries</span>
                    </button>
                  </div>

                  <form onSubmit={handleSaveNow} className="glass-crystal rounded-3xl p-5 space-y-3">
                    <label className="text-xs font-bold uppercase tracking-wider text-cyan-400 block">
                      Update Public &quot;NOW&quot; Status Bar
                    </label>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <input
                        type="text"
                        value={nowInput}
                        onChange={(e) => setNowInput(e.target.value)}
                        className="flex-1 px-4 py-2.5 rounded-xl glass-input text-sm"
                      />
                      <button
                        type="submit"
                        className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white transition active:scale-95"
                      >
                        Update Live
                      </button>
                    </div>
                  </form>

                  <div className="grid lg:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <form onSubmit={handleAddProject} className="glass-crystal rounded-3xl p-5 space-y-3">
                        <h3 className="font-bold text-sm flex items-center gap-2 text-white">
                          <Plus className="w-4 h-4 text-emerald-400" />
                          <span>Add New Project to Public Portfolio</span>
                        </h3>
                        <input
                          type="text"
                          placeholder="Project or Brand Name"
                          value={projTitle}
                          onChange={(e) => setProjTitle(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs"
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            placeholder="Category"
                            value={projCategory}
                            onChange={(e) => setProjCategory(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs"
                          />
                          <input
                            type="text"
                            placeholder="Key Metric"
                            value={projMetrics}
                            onChange={(e) => setProjMetrics(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs"
                          />
                        </div>
                        <textarea
                          rows="2"
                          placeholder="Short description..."
                          value={projDesc}
                          onChange={(e) => setProjDesc(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs"
                        />
                        <button
                          type="submit"
                          className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white transition active:scale-95"
                        >
                          Publish to Layer 1
                        </button>
                      </form>

                      <div className="glass-crystal rounded-3xl p-5 space-y-2.5">
                        <h3 className="font-bold text-xs uppercase text-slate-400">
                          Manage Projects ({data.projects.length})
                        </h3>
                        <div className="space-y-2 max-h-40 overflow-y-auto">
                          {data.projects.map((p) => (
                            <div key={p.id} className="p-2.5 rounded-xl bg-slate-950/60 border border-white/5 flex items-center justify-between text-xs">
                              <span className="font-semibold text-slate-200">{p.title}</span>
                              <button
                                onClick={() => {
                                  SoundFX.click();
                                  deleteProject(p.id);
                                }}
                                className="p-1.5 rounded-lg bg-white/5 hover:bg-rose-600 text-slate-400 hover:text-white transition"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="glass-crystal rounded-3xl p-5 space-y-3">
                      <h3 className="font-bold text-sm text-white flex items-center justify-between">
                        <span>Client Inquiries & Agent Inbox</span>
                        <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300">
                          {mergedMessages.length}
                        </span>
                      </h3>
                      <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
                        {mergedMessages.length === 0 ? (
                          <p className="text-xs text-slate-500 text-center py-4">ইনবক্স খালি।</p>
                        ) : (
                          mergedMessages.map((m) => (
                            <div key={m.id} className="p-3.5 rounded-2xl bg-slate-950/60 border border-white/10 text-xs space-y-1">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-indigo-300">{m.sender}</span>
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] text-slate-500">{m.date}</span>
                                  <button
                                    onClick={() => {
                                      SoundFX.click();
                                      deleteMessage(m.id, m.dbId || null);
                                    }}
                                    className="p-1 rounded-md bg-white/5 hover:bg-rose-600 text-slate-400 hover:text-white transition"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                              <p className="text-cyan-400 font-medium">Service: {m.service}</p>
                              <p className="text-slate-300">{m.text}</p>
                              <p className="text-[10px] text-slate-400">Contact: {m.email}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </Suspense>
      </main>

      {/* PERSISTENT BACKGROUND AUDIO MINI-BAR */}
      {audioPlayer.currentTrack && (
        <div className="sticky bottom-3 mx-auto max-w-md w-[92%] z-30 px-4 py-2.5 rounded-full bg-slate-900/95 border border-cyan-500/40 backdrop-blur-xl shadow-2xl flex items-center justify-between gap-3 text-xs">
          <div className="min-w-0">
            <p className="font-bold text-white truncate">🎧 {audioPlayer.currentTrack.title}</p>
            <span className="text-[10px] text-cyan-300">{audioPlayer.isPlaying ? 'Playing in Background' : 'Paused'}</span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button onClick={toggleAudioPlayPause} className="p-2 rounded-full bg-indigo-600 text-white">
              {audioPlayer.isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            </button>
            <button onClick={stopAudioTrack} className="p-2 rounded-full bg-white/10 text-slate-300">
              <Square className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* SUBTLE BOTTOM CORNER DATA EXPORT, IMPORT, APK & PROTECTED RESET BAR */}
      <footer className="relative z-10 border-t border-white/5 bg-slate-950/60 backdrop-blur-xl py-4 px-4 sm:px-6 mt-10">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-500">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                SoundFX.laser();
                downloadCalendarCSV(data);
              }}
              className="px-2.5 py-1.5 rounded-lg glass-pill hover:bg-white/10 text-emerald-400 flex items-center gap-1.5 transition"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Export Calendar (.CSV)</span>
            </button>

            <button
              onClick={() => {
                SoundFX.laser();
                downloadFullOSBackupJSON(data);
              }}
              className="px-2.5 py-1.5 rounded-lg glass-pill hover:bg-white/10 text-cyan-400 flex items-center gap-1.5 transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Backup Data (.JSON)</span>
            </button>

            <input
              type="file"
              accept=".json"
              ref={fileInputRef}
              onChange={handleImportFile}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-2.5 py-1.5 rounded-lg glass-pill hover:bg-white/10 text-indigo-300 flex items-center gap-1.5 transition"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Import Backup</span>
            </button>

            <a
              href="/kmmahim-life-os.apk"
              download="kmmahim-life-os.apk"
              className="px-2.5 py-1.5 rounded-lg glass-pill hover:bg-white/10 text-slate-400 hover:text-white flex items-center gap-1.5 transition"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>APK</span>
            </a>
          </div>

          <button
            onClick={() => {
              SoundFX.click();
              setShowDeleteAllModal(true);
            }}
            className="text-[11px] text-slate-600 hover:text-rose-400 flex items-center gap-1 transition"
          >
            <Trash2 className="w-3 h-3" />
            <span>Reset All OS Data</span>
          </button>
        </div>
      </footer>
    </div>
  );
}
