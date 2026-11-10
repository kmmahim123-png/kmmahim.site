import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOS } from '../../context/OSContext';
import {
  Cloud, CloudUpload, CloudDownload, Database, CheckCircle2,
  AlertCircle, RefreshCw, X, Copy, Check, Server, ShieldCheck
} from 'lucide-react';
import { SoundFX } from './SoundEffects';

export default function SupabaseSyncModal({ isOpen, onClose }) {
  const {
    data,
    uploadToSupabase,
    pullFromSupabase,
    syncStatus,
    autoSync,
    toggleAutoSync
  } = useOS();

  const [copiedSql, setCopiedSql] = useState(false);
  const [activeTab, setActiveTab] = useState('sync'); // 'sync' | 'sql'

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

  const recordsCount = {
    transactions: data.finance?.transactions?.length || 0,
    wallets: Object.keys(data.finance?.wallets || {}).length,
    meals: data.meals?.logs ? Object.keys(data.meals.logs).length : 0,
    habits: data.habits?.dailyLogs ? Object.keys(data.habits.dailyLogs).length : 0,
    goals: data.goals?.length || 0,
    ideas: data.ideas?.length || 0,
    projects: data.projects?.length || 0,
    socialQueue: data.socialQueue?.length || 0
  };

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
                <Cloud className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>Supabase Cloud Sync Hub</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300">
                    uqupazmycylfcqvsajnx
                  </span>
                </h3>
                <p className="text-xs text-slate-400">
                  Cloud backup, data sync & PostgreSQL table manager
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
              <span>Data Sync & Backup</span>
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
          <div className="p-6 overflow-y-auto space-y-6 text-xs">
            {activeTab === 'sync' && (
              <>
                {/* Sync Status Banner */}
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
                            ? '⚠️ টেবিল তৈরি করা বাকি আছে!'
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
                <div className="grid sm:grid-cols-2 gap-4">
                  {/* Upload to Supabase */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleUpload}
                    disabled={syncStatus.status === 'syncing'}
                    className="p-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold flex flex-col items-center justify-center gap-2 shadow-lg shadow-emerald-900/40 disabled:opacity-50"
                  >
                    <CloudUpload className="w-6 h-6 animate-bounce" />
                    <span className="text-sm">Upload Data to Supabase</span>
                    <span className="text-[10px] opacity-80 font-normal">
                      Push local meals, finance & habits to cloud
                    </span>
                  </motion.button>

                  {/* Pull from Supabase */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handlePull}
                    disabled={syncStatus.status === 'syncing'}
                    className="p-4 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold flex flex-col items-center justify-center gap-2 transition disabled:opacity-50"
                  >
                    <CloudDownload className="w-6 h-6 text-indigo-400" />
                    <span className="text-sm">Restore from Supabase</span>
                    <span className="text-[10px] text-slate-400 font-normal">
                      Pull latest cloud backup into this device
                    </span>
                  </motion.button>
                </div>

                {/* Auto Sync Toggle */}
                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="font-semibold text-slate-200 block">
                      Auto-Sync on Changes
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Automatically push updates to Supabase when you log meals, expenses, or habits.
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

                {/* Data Records Summary */}
                <div className="space-y-2">
                  <span className="font-semibold text-slate-300 block uppercase tracking-wider text-[10px]">
                    Current OS Data Package
                  </span>
                  <div className="grid grid-cols-4 gap-2">
                    <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
                      <div className="text-lg font-black text-emerald-400 font-mono">
                        {recordsCount.wallets}
                      </div>
                      <div className="text-[10px] text-slate-400">Wallets</div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
                      <div className="text-lg font-black text-rose-400 font-mono">
                        {recordsCount.transactions}
                      </div>
                      <div className="text-[10px] text-slate-400">Expenses</div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
                      <div className="text-lg font-black text-indigo-400 font-mono">
                        {recordsCount.goals}
                      </div>
                      <div className="text-[10px] text-slate-400">Goals</div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
                      <div className="text-lg font-black text-amber-400 font-mono">
                        {recordsCount.ideas}
                      </div>
                      <div className="text-[10px] text-slate-400">Ideas</div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'sql' && (
              <div className="space-y-4">
                <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-200 text-xs">
                  Copy and paste this SQL into your{' '}
                  <a
                    href="https://supabase.com/dashboard/project/uqupazmycylfcqvsajnx/sql"
                    target="_blank"
                    rel="noreferrer"
                    className="underline text-indigo-300 font-bold"
                  >
                    Supabase SQL Editor
                  </a>{' '}
                  to create the tables for full cloud persistence.
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
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
