import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOS } from '../../context/OSContext';
import {
  Cloud, CloudUpload, CloudDownload, Database, CheckCircle2,
  AlertCircle, RefreshCw, X, Copy, Check, Server, GitMerge
} from 'lucide-react';
import { SoundFX } from './SoundEffects';

function summarizeOSState(osData) {
  if (!osData) return null;
  const wallets = osData.finance?.wallets || {};
  const balance = Object.values(wallets).reduce((sum, v) => sum + Number(v || 0), 0);
  return {
    balance,
    transactions: osData.finance?.transactions?.length || 0,
    meals: osData.meals?.logs ? Object.keys(osData.meals.logs).length : 0,
    habits: osData.habits?.dailyLogs ? Object.keys(osData.habits.dailyLogs).length : 0,
    goals: osData.goals?.length || 0,
    ideas: osData.ideas?.length || 0
  };
}

export default function SupabaseSyncModal({ isOpen, onClose }) {
  const {
    data,
    uploadToSupabase,
    pullFromSupabase,
    mergeAndSyncWithCloud,
    refreshCloudStatus,
    cloudSnapshot,
    syncStatus,
    autoSync,
    toggleAutoSync
  } = useOS();

  const [copiedSql, setCopiedSql] = useState(false);
  const [activeTab, setActiveTab] = useState('sync'); // 'sync' | 'sql'
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    if (isOpen && refreshCloudStatus) {
      refreshCloudStatus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const sqlSetupSnippet = `-- Run this ONCE in Supabase SQL Editor (Project: uqupazmycylfcqvsajnx)
CREATE TABLE IF NOT EXISTS public.mahim_life_os (
  slot text PRIMARY KEY,
  owner text DEFAULT 'KM Mahim',
  data jsonb NOT NULL,
  updated_at timestamptz DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.mahim_life_os ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public all access" ON public.mahim_life_os;
CREATE POLICY "Allow public all access" 
ON public.mahim_life_os 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Enable instant Laptop <-> Mobile Realtime Sync
ALTER PUBLICATION supabase_realtime ADD TABLE public.mahim_life_os;`;

  const handleCopySql = () => {
    SoundFX.click();
    navigator.clipboard.writeText(sqlSetupSnippet);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  const handleUpload = async () => {
    SoundFX.laser();
    await uploadToSupabase();
  };

  const handlePull = async () => {
    SoundFX.laser();
    await pullFromSupabase();
  };

  const handleMerge = async () => {
    SoundFX.laser();
    await mergeAndSyncWithCloud();
  };

  const handleVerifyAndSync = async () => {
    SoundFX.laser();
    setVerifying(true);
    const diag = await refreshCloudStatus();
    if (diag?.success) {
      await mergeAndSyncWithCloud();
      setActiveTab('sync');
    }
    setVerifying(false);
  };

  const localSummary = summarizeOSState(data);
  const cloudSummary = summarizeOSState(cloudSnapshot?.data);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          transition={{ duration: 0.22 }}
          className="relative w-full max-w-xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-emerald-950/40 via-slate-900 to-indigo-950/40">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <Cloud className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>Supabase Cloud Sync Hub</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300">
                    uqupazmycylfcqvsajnx
                  </span>
                </h3>
                <p className="text-xs text-slate-400">
                  Real-time Laptop & Mobile Database Bridge
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                SoundFX.click();
                onClose();
              }}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Sub Navigation */}
          <div className="flex border-b border-slate-800 bg-slate-950/60 px-6 pt-2">
            <button
              onClick={() => {
                SoundFX.click();
                setActiveTab('sync');
              }}
              className={`pb-3 px-3 text-xs font-semibold border-b-2 transition flex items-center gap-2 ${
                activeTab === 'sync'
                  ? 'border-emerald-500 text-emerald-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Data Sync & Merge</span>
            </button>
            <button
              onClick={() => {
                SoundFX.click();
                setActiveTab('sql');
              }}
              className={`pb-3 px-3 text-xs font-semibold border-b-2 transition flex items-center gap-2 ${
                activeTab === 'sql'
                  ? 'border-emerald-500 text-emerald-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span>SQL Table Setup</span>
            </button>
          </div>

          {/* Body */}
          <div className="p-6 overflow-y-auto space-y-5 text-xs">
            {activeTab === 'sync' && (
              <>
                {/* Live Sync Status Banner */}
                <div
                  className={`p-4 rounded-2xl border flex flex-col gap-3 ${
                    syncStatus.status === 'success'
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
                      : syncStatus.status === 'needs_setup'
                      ? 'bg-amber-500/15 border-amber-500/40 text-amber-200'
                      : syncStatus.status === 'error'
                      ? 'bg-rose-500/10 border-rose-500/30 text-rose-200'
                      : syncStatus.status === 'syncing'
                      ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-200'
                      : 'bg-slate-950/80 border-slate-800 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      {syncStatus.status === 'syncing' ? (
                        <RefreshCw className="w-5 h-5 text-indigo-400 animate-spin" />
                      ) : syncStatus.status === 'success' ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      ) : syncStatus.status === 'needs_setup' ? (
                        <AlertCircle className="w-5 h-5 text-amber-400 animate-pulse" />
                      ) : (
                        <Server className="w-5 h-5 text-slate-400" />
                      )}
                      <div>
                        <div className="font-semibold text-sm">
                          {syncStatus.status === 'syncing'
                            ? 'Syncing with Supabase...'
                            : syncStatus.status === 'success'
                            ? 'Cloud Live Synced! (Laptop ⇄ Mobile)'
                            : syncStatus.status === 'needs_setup'
                            ? '⚠️ Supabase টেবিল সেটআপ বাকি!'
                            : syncStatus.status === 'error'
                            ? 'Sync Error'
                            : 'Supabase Ready'}
                        </div>
                        <div className="text-[11px] opacity-90">
                          {syncStatus.message || 'Ready to sync OS data with Supabase cloud.'}
                        </div>
                      </div>
                    </div>
                    {syncStatus.lastSync && (
                      <span className="text-[10px] font-mono bg-slate-900 px-2 py-1 rounded-lg border border-slate-800 shrink-0">
                        {new Date(syncStatus.lastSync).toLocaleTimeString()}
                      </span>
                    )}
                  </div>

                  {syncStatus.status === 'needs_setup' && (
                    <button
                      onClick={() => {
                        handleCopySql();
                        setActiveTab('sql');
                      }}
                      className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition"
                    >
                      ১. SQL কপি করুন ও টেবিল তৈরি করতে এখানে চাপুন →
                    </button>
                  )}
                </div>

                {/* Main Action Buttons */}
                <div className="grid sm:grid-cols-2 gap-3">
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleUpload}
                    disabled={syncStatus.status === 'syncing'}
                    className="p-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold flex flex-col items-center justify-center gap-1.5 shadow-lg shadow-emerald-900/40 disabled:opacity-50"
                  >
                    <CloudUpload className="w-5 h-5" />
                    <span className="text-xs sm:text-sm">Upload This Device → Cloud</span>
                    <span className="text-[10px] opacity-80 font-normal">
                      Push this device&apos;s data as primary cloud copy
                    </span>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handlePull}
                    disabled={syncStatus.status === 'syncing'}
                    className="p-4 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold flex flex-col items-center justify-center gap-1.5 transition disabled:opacity-50"
                  >
                    <CloudDownload className="w-5 h-5 text-indigo-400" />
                    <span className="text-xs sm:text-sm">Pull Cloud → This Device</span>
                    <span className="text-[10px] text-slate-400 font-normal">
                      Overwrite this device with latest cloud copy
                    </span>
                  </motion.button>
                </div>

                {/* Smart Merge Action */}
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={handleMerge}
                  disabled={syncStatus.status === 'syncing'}
                  className="w-full p-3.5 rounded-2xl bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-500/35 text-indigo-200 font-bold flex items-center justify-center gap-2.5 transition disabled:opacity-50"
                >
                  <GitMerge className="w-4 h-4 text-indigo-400" />
                  <span>Smart Merge (মোবাইল + ওয়েবসাইটের উভয় ডেটা একত্র করুন)</span>
                </motion.button>

                {/* Auto Sync Toggle */}
                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="font-semibold text-slate-200 block">
                      Auto-Sync on Changes
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Automatically sync meals, finance, habits & goals across Laptop & Mobile.
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      SoundFX.click();
                      toggleAutoSync();
                    }}
                    className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                      autoSync ? 'bg-emerald-600' : 'bg-slate-800'
                    }`}
                  >
                    <motion.div
                      animate={{ x: autoSync ? 24 : 0 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      className="w-5 h-5 rounded-full bg-white shadow-md"
                    />
                  </button>
                </div>

                {/* Local vs Cloud Comparison */}
                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1.5">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">
                      This Device (Local)
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-400">Wallet Total:</span>
                      <span className="font-mono font-bold text-white">৳{localSummary.balance}</span>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-400">Transactions / Meals:</span>
                      <span className="font-mono text-white">
                        {localSummary.transactions} tx · {localSummary.meals} days
                      </span>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-400">Goals / Ideas:</span>
                      <span className="font-mono text-white">
                        {localSummary.goals} goals · {localSummary.ideas} ideas
                      </span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1.5">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 flex items-center justify-between">
                      <span>Supabase Cloud</span>
                      {cloudSnapshot?.timestamp && (
                        <span className="text-[9px] font-mono text-slate-400">
                          {new Date(cloudSnapshot.timestamp).toLocaleTimeString()}
                        </span>
                      )}
                    </div>
                    {cloudSummary ? (
                      <>
                        <div className="flex justify-between text-[11px]">
                          <span className="text-slate-400">Wallet Total:</span>
                          <span className="font-mono font-bold text-emerald-300">৳{cloudSummary.balance}</span>
                        </div>
                        <div className="flex justify-between text-[11px]">
                          <span className="text-slate-400">Transactions / Meals:</span>
                          <span className="font-mono text-emerald-200">
                            {cloudSummary.transactions} tx · {cloudSummary.meals} days
                          </span>
                        </div>
                        <div className="flex justify-between text-[11px]">
                          <span className="text-slate-400">Goals / Ideas:</span>
                          <span className="font-mono text-emerald-200">
                            {cloudSummary.goals} goals · {cloudSummary.ideas} ideas
                          </span>
                        </div>
                      </>
                    ) : (
                      <div className="text-[11px] text-slate-500 py-2">
                        {syncStatus.status === 'needs_setup'
                          ? 'টেবিল তৈরি না হওয়ায় এখনো ক্লাউডে কোনো রেকর্ড নেই।'
                          : 'ক্লাউড টেবিল এখনো খালি (প্রথম Upload দিন)।'}
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            {activeTab === 'sql' && (
              <div className="space-y-4">
                <div className="p-3.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-200 text-xs leading-relaxed">
                  ১. নিচের SQL কপি করুন → ২.{' '}
                  <a
                    href="https://supabase.com/dashboard/project/uqupazmycylfcqvsajnx/sql/new"
                    target="_blank"
                    rel="noreferrer"
                    className="underline text-amber-300 font-bold"
                  >
                    Supabase SQL Editor খুলুন
                  </a>{' '}
                  → ৩. পেস্ট করে <b>Run</b> চাপুন → ৪. নিচের Verify বাটনে ক্লিক করুন।
                </div>

                <div className="relative">
                  <pre className="p-4 rounded-2xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-emerald-400 overflow-x-auto leading-relaxed">
                    {sqlSetupSnippet}
                  </pre>
                  <button
                    onClick={handleCopySql}
                    className="absolute top-3 right-3 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold flex items-center gap-1.5 text-white transition border border-slate-700"
                  >
                    {copiedSql ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy SQL</span>
                      </>
                    )}
                  </button>
                </div>

                <button
                  onClick={handleVerifyAndSync}
                  disabled={verifying}
                  className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${verifying ? 'animate-spin' : ''}`} />
                  <span>
                    {verifying ? 'যাচাই ও সিঙ্ক হচ্ছে...' : 'আমি SQL রান করেছি — এখনই চেক ও সিঙ্ক করুন'}
                  </span>
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
