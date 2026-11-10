import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useOS } from '../context/OSContext';
import { AnimatedCounter, TiltCard } from './common/MotionKit';
import { SoundFX } from './common/SoundEffects';
import {
  Wallet, Utensils, CheckSquare, Target, Lightbulb, Sparkles,
  Plus, Trash2, ArrowRight, Cloud, CheckCircle2, Flame, Zap, Rocket
} from 'lucide-react';

export default function CommandOverview({ onNavigate }) {
  const {
    data,
    addTransaction,
    updateDailyMeal,
    updateDailyHabits,
    addIdea,
    resetAllPersonalOSData,
    hasDemoData,
    syncStatus
  } = useOS();

  const todayKey = new Date().toISOString().slice(0, 10);

  // Quick Expense Inline State
  const [quickAmt, setQuickAmt] = useState('');
  const [quickWallet, setQuickWallet] = useState('bkash');
  const [quickNote, setQuickNote] = useState('');

  // Quick Idea Inline State
  const [quickIdea, setQuickIdea] = useState('');

  // Confirm Wipe All Demo
  const [confirmWipe, setConfirmWipe] = useState(false);

  // Finance stats
  const wallets = data.finance?.wallets || {};
  const totalMoney = Object.values(wallets).reduce((sum, v) => sum + Number(v || 0), 0);

  // Meal stats
  const { deposits = [], logs = {}, ratePerMeal = 55 } = data.meals || {};
  const mealStats = useMemo(() => {
    const dep = deposits.reduce((s, d) => s + Number(d.amount || 0), 0);
    let eaten = 0;
    Object.values(logs).forEach((d) => {
      eaten += Number(d.breakfast || 0) + Number(d.lunch || 0) + Number(d.dinner || 0) + Number(d.guest || 0);
    });
    const cost = Math.round(eaten * Number(ratePerMeal || 0));
    const rem = dep - cost;
    const remMeals = ratePerMeal > 0 ? Math.floor(rem / ratePerMeal) : 0;
    const estDays = Math.max(0, Math.floor(remMeals / 2.5));
    return { dep, eaten, rem, remMeals, estDays };
  }, [deposits, logs, ratePerMeal]);

  const todayMeal = logs[todayKey] || { breakfast: 0, lunch: 0, dinner: 0, guest: 0 };

  // Today's Habits
  const todayHabits = data.habits?.dailyLogs?.[todayKey] || {
    namaz: { fajr: false, zuhr: false, asr: false, maghrib: false, isha: false },
    minoxidil: { morning: false, night: false },
    gym: { done: false }
  };
  const namazCount = todayHabits.namaz ? Object.values(todayHabits.namaz).filter(Boolean).length : 0;

  // Pending Goals
  const pendingGoals = (data.goals || []).filter((g) => !g.completed);

  const handleQuickExpense = (e) => {
    e.preventDefault();
    if (!quickAmt) return;
    SoundFX.success();
    addTransaction({
      type: 'out',
      amount: quickAmt,
      wallet: quickWallet,
      category: 'Quick Expense',
      note: quickNote || 'Quick Entry',
      date: todayKey
    });
    setQuickAmt('');
    setQuickNote('');
  };

  const handleQuickIdea = (e) => {
    e.preventDefault();
    if (!quickIdea) return;
    SoundFX.success();
    addIdea({ title: quickIdea, tag: 'Quick Note', status: 'Just Idea' });
    setQuickIdea('');
  };

  const toggleTodayMeal = (part) => {
    SoundFX.click();
    const curVal = Number(todayMeal[part] || 0);
    const nextVal = curVal === 0 ? 1 : 0;
    updateDailyMeal(todayKey, { ...todayMeal, [part]: nextVal });
  };

  const toggleTodayNamaz = (waqt) => {
    SoundFX.click();
    updateDailyHabits(todayKey, (prev) => ({
      ...prev,
      namaz: { ...prev.namaz, [waqt]: !prev.namaz[waqt] }
    }));
  };

  const handleWipeDemo = () => {
    if (!confirmWipe) {
      SoundFX.click();
      setConfirmWipe(true);
      setTimeout(() => setConfirmWipe(false), 4000);
      return;
    }
    SoundFX.laser();
    resetAllPersonalOSData();
    setConfirmWipe(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Hero Welcome & Fresh Start Banner */}
      <div className="glass-crystal rounded-3xl p-6 relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-wrap items-center justify-between gap-4 relative z-10">
          <div>
            <span className="text-[11px] font-mono text-cyan-400 uppercase tracking-widest flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 animate-pulse" />
              <span>Crystal OS Command Cockpit • {todayKey}</span>
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
              স্বাগতম, {data.profile?.name} 👋
            </h1>
            <p className="text-xs text-slate-300 mt-1">
              ১-স্ক্রিনে আপনার প্রতিদিনের আসল টাকা, মিল, নামাজ, ও জিম কন্ট্রোল করুন।
            </p>
          </div>

          {/* Demo Wipe / Start Real Data Button */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleWipeDemo}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 transition active:scale-95 shadow-lg ${
                confirmWipe
                  ? 'bg-rose-600 text-white animate-pulse'
                  : hasDemoData
                  ? 'bg-gradient-to-r from-amber-500 to-rose-600 text-white shadow-rose-900/30'
                  : 'glass-pill text-rose-400 hover:bg-rose-500/20'
              }`}
            >
              <Trash2 className="w-4 h-4" />
              <span>
                {confirmWipe
                  ? 'সত্যিই সব ডেমো মুছে ০ করবেন? (Click)'
                  : hasDemoData
                  ? '🧹 সব ডেমো মুছে আসল হিসাব (০৳) শুরু করুন'
                  : 'Reset All Personal Data'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Live Glass Cockpit Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Money Overview */}
        <TiltCard
          maxTilt={5}
          onClick={() => {
            SoundFX.click();
            onNavigate('finance');
          }}
          className="glass-crystal-hover rounded-3xl p-5 cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-300 font-semibold">মোট ব্যালেন্স</span>
            <Wallet className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="my-2">
            <span className="text-2xl sm:text-3xl font-black text-white font-mono">
              ৳<AnimatedCounter value={totalMoney} />
            </span>
          </div>
          <div className="text-[10px] text-emerald-300 flex items-center gap-1 font-semibold">
            <span>টাকা ও ওয়ালেট ম্যানেজ করুন</span>
            <ArrowRight className="w-3 h-3" />
          </div>
        </TiltCard>

        {/* Meals Overview */}
        <TiltCard
          maxTilt={5}
          onClick={() => {
            SoundFX.click();
            onNavigate('meals');
          }}
          className="glass-crystal-hover rounded-3xl p-5 cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-300 font-semibold">মিল ব্যালেন্স</span>
            <Utensils className="w-4 h-4 text-amber-400" />
          </div>
          <div className="my-2">
            <span className={`text-2xl sm:text-3xl font-black font-mono ${mealStats.rem < 0 ? 'text-rose-400' : 'text-cyan-300'}`}>
              {mealStats.rem < 0 ? '-' : ''}৳<AnimatedCounter value={Math.abs(mealStats.rem)} />
            </span>
          </div>
          <div className="text-[10px] text-amber-300 flex items-center gap-1 font-semibold">
            <span>{mealStats.remMeals > 0 ? `আর ~${mealStats.remMeals} মিল (${mealStats.estDays} দিন)` : 'মিল হিসাব দেখুন'}</span>
            <ArrowRight className="w-3 h-3" />
          </div>
        </TiltCard>

        {/* Habits Overview */}
        <TiltCard
          maxTilt={5}
          onClick={() => {
            SoundFX.click();
            onNavigate('habits');
          }}
          className="glass-crystal-hover rounded-3xl p-5 cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-300 font-semibold">আজকের নামাজ ও জিম</span>
            <CheckSquare className="w-4 h-4 text-rose-400" />
          </div>
          <div className="my-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-white font-mono">
              {namazCount}/5
            </span>
            <span className="text-xs text-slate-400">ওয়াক্ত</span>
          </div>
          <div className="text-[10px] text-rose-300 flex items-center gap-1 font-semibold">
            <span>{todayHabits.gym?.done ? '🏋️ Gym Done' : '🏋️ Gym Pending'}</span>
            <ArrowRight className="w-3 h-3 ml-auto" />
          </div>
        </TiltCard>

        {/* Goals & Cloud Overview */}
        <TiltCard
          maxTilt={5}
          onClick={() => {
            SoundFX.click();
            onNavigate('goals');
          }}
          className="glass-crystal-hover rounded-3xl p-5 cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-300 font-semibold">বাকি টাস্ক ও গোল</span>
            <Target className="w-4 h-4 text-violet-400" />
          </div>
          <div className="my-2">
            <span className="text-2xl sm:text-3xl font-black text-white font-mono">
              {pendingGoals.length}
            </span>
            <span className="text-xs text-slate-400 ml-1">বাকি</span>
          </div>
          <div className="text-[10px] text-violet-300 flex items-center gap-1 font-semibold">
            <span>টার্গেট ও পোমোডোরো</span>
            <ArrowRight className="w-3 h-3" />
          </div>
        </TiltCard>
      </div>

      {/* ULTRA EFFICIENT 1-TAP ACTION WIDGETS */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Widget 1: Instant 2-Second Expense Logger */}
        <form onSubmit={handleQuickExpense} className="glass-crystal rounded-3xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-rose-400" />
              <span>⚡ ২-সেকেন্ডে খরচ লিখুন</span>
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">Instant Out</span>
          </div>

          <div className="flex gap-2">
            <input
              type="number"
              placeholder="৳ টাকা"
              value={quickAmt}
              onChange={(e) => setQuickAmt(e.target.value)}
              className="w-28 px-3 py-2 rounded-xl glass-input text-sm font-bold"
            />
            <select
              value={quickWallet}
              onChange={(e) => setQuickWallet(e.target.value)}
              className="flex-1 px-3 py-2 rounded-xl glass-input text-xs"
            >
              <option value="cash" className="bg-slate-900">Hand Cash</option>
              <option value="bkash" className="bg-slate-900">bKash</option>
              <option value="nagad" className="bg-slate-900">Nagad</option>
              <option value="bank" className="bg-slate-900">Bank</option>
            </select>
          </div>

          <input
            type="text"
            placeholder="কী কিনলেন? (e.g. চা, রিকশা, নাস্তা)"
            value={quickNote}
            onChange={(e) => setQuickNote(e.target.value)}
            className="w-full px-3 py-2 rounded-xl glass-input text-xs"
          />

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition active:scale-95"
          >
            - খরচ সেভ করুন
          </button>
        </form>

        {/* Widget 2: Instant 1-Tap Today's Meal & Namaz */}
        <div className="glass-crystal rounded-3xl p-5 space-y-4">
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-white flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Utensils className="w-4 h-4 text-cyan-400" />
                <span>আজকের মিল (1-Tap Toggle)</span>
              </span>
              <span className="text-[10px] text-cyan-400 font-mono">
                Total: {Number(todayMeal.breakfast || 0) + Number(todayMeal.lunch || 0) + Number(todayMeal.dinner || 0)} টি
              </span>
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {[
                { k: 'breakfast', l: '🌅 সকাল' },
                { k: 'lunch', l: '☀️ দুপুর' },
                { k: 'dinner', l: '🌙 রাত' }
              ].map((m) => {
                const active = Number(todayMeal[m.k] || 0) > 0;
                return (
                  <button
                    key={m.k}
                    onClick={() => toggleTodayMeal(m.k)}
                    className={`py-2 rounded-xl text-xs font-bold border transition active:scale-95 ${
                      active
                        ? 'bg-cyan-600/30 border-cyan-400 text-cyan-200 shadow-md shadow-cyan-900/30'
                        : 'bg-white/5 border-white/10 text-slate-400'
                    }`}
                  >
                    {m.l} ({todayMeal[m.k] || 0})
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-white/10">
            <h3 className="text-xs font-bold text-slate-300">🕌 আজকের নামাজ ({namazCount}/5)</h3>
            <div className="grid grid-cols-5 gap-1.5">
              {[
                { k: 'fajr', l: 'ফজর' },
                { k: 'zuhr', l: 'যোহর' },
                { k: 'asr', l: 'আসর' },
                { k: 'maghrib', l: 'মাগরিব' },
                { k: 'isha', l: 'ইশা' }
              ].map((n) => {
                const done = Boolean(todayHabits.namaz?.[n.k]);
                return (
                  <button
                    key={n.k}
                    onClick={() => toggleTodayNamaz(n.k)}
                    className={`py-1.5 rounded-lg text-[10px] font-bold border transition ${
                      done
                        ? 'bg-emerald-600/30 border-emerald-400 text-emerald-200'
                        : 'bg-white/5 border-white/10 text-slate-400'
                    }`}
                  >
                    {n.l}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Widget 3: Quick Idea Capture */}
        <form onSubmit={handleQuickIdea} className="glass-crystal rounded-3xl p-5 flex flex-col justify-between space-y-3">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-1">
              <Lightbulb className="w-4 h-4 text-amber-400" />
              <span>💡 চট করে আইডিয়া লিখে রাখুন</span>
            </h3>
            <p className="text-[11px] text-slate-400">
              মাথায় আসা যেকোনো বিজনেস বা কোডিং আইডিয়া সাথে সাথে ভল্টে সেভ করুন।
            </p>
          </div>

          <textarea
            rows="2"
            placeholder="যেমন: RU স্টুডেন্টদের জন্য অটো..."
            value={quickIdea}
            onChange={(e) => setQuickIdea(e.target.value)}
            className="w-full px-3 py-2 rounded-xl glass-input text-xs resize-none"
          />

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition active:scale-95"
          >
            + আইডিয়া সেভ করুন
          </button>
        </form>
      </div>
    </div>
  );
}
