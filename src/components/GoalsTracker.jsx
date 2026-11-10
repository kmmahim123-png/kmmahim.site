import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useOS } from '../context/OSContext';
import { SoundFX } from './common/SoundEffects';
import {
  Target, Plus, CheckCircle2, Trash2, Clock, Play, Pause,
  RotateCcw, Timer, Calendar, Sparkles, Sliders
} from 'lucide-react';

function getTimeRemainingForCycle(timeframe, now) {
  let end;
  let start;
  let resetLabel = '';

  if (timeframe === 'daily') {
    start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0);
    resetLabel = 'রাত ১২:০০টায় রিসেট হবে (Midnight)';
  } else if (timeframe === 'weekly') {
    // Weekly cycle resets every Friday (end of Thursday / Friday reset)
    const d = new Date(now);
    const dayOfWeek = d.getDay(); // 0=Sun..5=Fri, 6=Sat
    const daysUntilFridayEnd = (5 - dayOfWeek + 7) % 7;
    end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + daysUntilFridayEnd + 1, 0, 0, 0);
    start = new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000);
    resetLabel = 'প্রতি শুক্রবার শেষে রিসেট হবে (Friday Reset)';
  } else if (timeframe === 'monthly') {
    start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
    end = new Date(now.getFullYear(), now.getMonth() + 1, 1, 0, 0, 0);
    resetLabel = 'মাসের শেষ দিনে রিসেট হবে (Month End)';
  } else {
    // yearly
    start = new Date(now.getFullYear(), 0, 1, 0, 0, 0);
    end = new Date(now.getFullYear() + 1, 0, 1, 0, 0, 0);
    resetLabel = 'বছরের শেষ দিনে (৩১ ডিসে.) রিসেট হবে';
  }

  const totalMs = Math.max(1, end - start);
  const diffMs = Math.max(0, end - now);
  const elapsedPct = Math.min(100, Math.round(((totalMs - diffMs) / totalMs) * 100));

  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffMs / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diffMs / (1000 * 60)) % 60);
  const seconds = Math.floor((diffMs / 1000) % 60);

  return { days, hours, minutes, seconds, elapsedPct, resetLabel };
}

export default function GoalsTracker() {
  const {
    data,
    addGoal,
    toggleGoalComplete,
    deleteGoal,
    pomodoro,
    applyPomodoroPreset,
    togglePomodoroRun,
    dismissPomodoroNotice
  } = useOS();
  const { goals } = data;

  const [title, setTitle] = useState('');
  const [timeframe, setTimeframe] = useState('daily');
  const [category, setCategory] = useState('Academic');
  const [deadline, setDeadline] = useState('');
  const [activeTab, setActiveTab] = useState('daily');
  const [draftCustomMins, setDraftCustomMins] = useState(pomodoro.customMinutes || 25);

  // Real-time ticking clock for Cycle Countdowns
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const tick = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(tick);
  }, []);

  const cycleCountdown = useMemo(
    () => getTimeRemainingForCycle(activeTab, now),
    [activeTab, now]
  );

  const customMinutes = draftCustomMins;
  const totalSessionSecs = pomodoro.totalSessionSecs;
  const timeLeft = pomodoro.timeLeft;
  const isRunning = pomodoro.isRunning;
  const timerMode = pomodoro.mode;

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const applyCustomTimer = (mins, mode = 'work') => {
    const cleanMins = Math.max(1, Math.min(240, Number(mins) || 25));
    SoundFX.click();
    setDraftCustomMins(cleanMins);
    applyPomodoroPreset(cleanMins, mode);
  };

  const handleAddGoal = (e) => {
    e.preventDefault();
    if (!title) return;
    SoundFX.success();
    addGoal({ title, timeframe, category, deadline });
    setTitle('');
    setDeadline('');
    setActiveTab(timeframe);
  };

  const filteredGoals = goals.filter((g) => (g.timeframe || 'daily') === activeTab);
  const pomoProgress =
    totalSessionSecs > 0
      ? Math.round(((totalSessionSecs - timeLeft) / totalSessionSecs) * 100)
      : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black flex items-center gap-2.5 text-white">
            <Target className="w-6 h-6 text-indigo-400" />
            <span>Study & Life Goals (সময়সীমা ও কাস্টম টাইমার)</span>
          </h1>
          <p className="text-xs text-slate-400">
            দৈনিক, সাপ্তাহিক (শুক্রবার), মাসিক ও বার্ষিক গোলের লাইভ কাউন্টডাউন এবং কাস্টম পোমোডোরো
          </p>
        </div>
      </div>

      {/* LIVE RESET COUNTDOWN BANNER FOR ACTIVE GOAL CYCLE */}
      <div className="glass-crystal rounded-3xl p-5 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[11px] font-mono text-cyan-400 uppercase tracking-widest flex items-center gap-1.5">
              <Timer className="w-3.5 h-3.5 animate-pulse" />
              <span>Active Cycle Timeline • {activeTab.toUpperCase()}</span>
            </span>
            <h3 className="text-sm sm:text-base font-bold text-white">
              {cycleCountdown.resetLabel}
            </h3>
            <p className="text-[11px] text-slate-400">
              বর্তমান সাইকেলের {cycleCountdown.elapsedPct}% সময় পার হয়েছে
            </p>
          </div>

          {/* Ticking Digital Countdown */}
          <div className="flex items-center gap-2 font-mono">
            {cycleCountdown.days > 0 && (
              <div className="px-3 py-2 rounded-2xl bg-slate-950/70 border border-white/10 text-center min-w-[54px]">
                <span className="text-lg sm:text-xl font-black text-emerald-400 block leading-none">
                  {cycleCountdown.days}
                </span>
                <span className="text-[9px] text-slate-400 uppercase">দিন</span>
              </div>
            )}
            <div className="px-3 py-2 rounded-2xl bg-slate-950/70 border border-white/10 text-center min-w-[54px]">
              <span className="text-lg sm:text-xl font-black text-white block leading-none">
                {String(cycleCountdown.hours).padStart(2, '0')}
              </span>
              <span className="text-[9px] text-slate-400 uppercase">ঘণ্টা</span>
            </div>
            <div className="px-3 py-2 rounded-2xl bg-slate-950/70 border border-white/10 text-center min-w-[54px]">
              <span className="text-lg sm:text-xl font-black text-cyan-300 block leading-none">
                {String(cycleCountdown.minutes).padStart(2, '0')}
              </span>
              <span className="text-[9px] text-slate-400 uppercase">মিনিট</span>
            </div>
            <div className="px-3 py-2 rounded-2xl bg-indigo-950/60 border border-indigo-500/40 text-center min-w-[54px]">
              <span className="text-lg sm:text-xl font-black text-indigo-300 block leading-none">
                {String(cycleCountdown.seconds).padStart(2, '0')}
              </span>
              <span className="text-[9px] text-indigo-300 uppercase">সেকেন্ড</span>
            </div>
          </div>
        </div>

        {/* Cycle Progress Bar */}
        <div className="w-full h-1.5 rounded-full bg-slate-950/80 overflow-hidden mt-4 border border-white/5">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 via-cyan-400 to-indigo-500 transition-all duration-1000"
            style={{ width: `${100 - cycleCountdown.elapsedPct}%` }}
          />
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        {/* Left: Goals Management */}
        <div className="lg:col-span-7 space-y-5">
          <form onSubmit={handleAddGoal} className="glass-crystal rounded-3xl p-5 space-y-3">
            <h3 className="font-bold text-sm flex items-center gap-2 text-white">
              <Plus className="w-4 h-4 text-emerald-400" />
              <span>নতুন গোল বা পড়ার টার্গেট যোগ করুন</span>
            </h3>

            <div className="grid sm:grid-cols-3 gap-3">
              <input
                type="text"
                required
                placeholder="আপনার গোলটি লিখুন..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="sm:col-span-2 px-3.5 py-2.5 rounded-xl glass-input text-xs"
              />
              <select
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value)}
                className="px-3 py-2.5 rounded-xl glass-input text-xs"
              >
                <option value="daily" className="bg-slate-900">আজকের (Daily)</option>
                <option value="weekly" className="bg-slate-900">এই সপ্তাহ (Weekly)</option>
                <option value="monthly" className="bg-slate-900">এই মাস (Monthly)</option>
                <option value="yearly" className="bg-slate-900">এই বছর (Yearly)</option>
              </select>
            </div>

            <div className="grid sm:grid-cols-3 gap-3 items-center pt-1">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="px-3 py-2 rounded-xl glass-input text-xs"
              >
                <option value="Academic" className="bg-slate-900">Academic (পড়াশোনা)</option>
                <option value="AI Work" className="bg-slate-900">AI & Tech Work</option>
                <option value="Business" className="bg-slate-900">JACKFRU / Business</option>
                <option value="Fitness" className="bg-slate-900">Fitness & Health</option>
              </select>

              <input
                type="text"
                placeholder="ঐচ্ছিক ডেডলাইন (e.g. রাত ১০টা / ২৫ মে)"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="px-3 py-2 rounded-xl glass-input text-xs"
              />

              <button
                type="submit"
                className="py-2.5 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white transition active:scale-95"
              >
                + Add Goal
              </button>
            </div>
          </form>

          {/* Timeframe Tabs & Goal List */}
          <div className="glass-crystal rounded-3xl p-5 space-y-4">
            <div className="flex flex-wrap items-center gap-1.5 border-b border-white/10 pb-3">
              {[
                { id: 'daily', label: 'Daily (আজ)' },
                { id: 'weekly', label: 'Weekly (শুক্রবার)' },
                { id: 'monthly', label: 'Monthly (মাস)' },
                { id: 'yearly', label: 'Yearly (বছর)' }
              ].map((tab) => {
                const count = goals.filter((g) => (g.timeframe || 'daily') === tab.id).length;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      SoundFX.click();
                      setActiveTab(tab.id);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
                      activeTab === tab.id
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'glass-pill text-slate-400 hover:text-white'
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span className="text-[10px] font-mono opacity-80">({count})</span>
                  </button>
                );
              })}
            </div>

            <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
              {filteredGoals.length === 0 ? (
                <p className="text-xs text-slate-500 py-6 text-center">
                  এই টাইমফ্রেমে এখনো কোনো গোল সেট করা হয়নি।
                </p>
              ) : (
                filteredGoals.map((g) => (
                  <div
                    key={g.id}
                    className={`p-3.5 rounded-2xl border flex items-center justify-between transition ${
                      g.completed
                        ? 'bg-slate-950/30 border-white/5 opacity-60'
                        : 'bg-slate-950/60 border-white/10 hover:border-indigo-500/40'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => {
                          SoundFX.click();
                          toggleGoalComplete(g.id);
                        }}
                        className={`w-5 h-5 rounded-lg flex items-center justify-center border transition ${
                          g.completed
                            ? 'bg-emerald-600 border-emerald-500 text-white'
                            : 'border-slate-600 hover:border-emerald-400'
                        }`}
                      >
                        {g.completed && <CheckCircle2 className="w-3.5 h-3.5" />}
                      </button>
                      <div>
                        <p className={`text-xs font-bold ${g.completed ? 'line-through text-slate-500' : 'text-white'}`}>
                          {g.title}
                        </p>
                        <div className="flex flex-wrap items-center gap-2 mt-0.5 text-[10px] font-mono">
                          <span className="text-cyan-400">{g.category}</span>
                          {g.deadline && (
                            <span className="text-amber-300 bg-amber-500/10 px-1.5 py-0.2 rounded">
                              ⏰ {g.deadline}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        SoundFX.click();
                        deleteGoal(g.id);
                      }}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-rose-600 text-slate-400 hover:text-white transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right: Custom Interactive Pomodoro Focus Timer */}
        <div className="lg:col-span-5 glass-crystal rounded-3xl p-6 flex flex-col justify-between text-center space-y-5 relative overflow-hidden">
          <div className="space-y-1">
            <span className="text-xs uppercase tracking-widest text-indigo-300 font-bold block">
              Custom Focus Timer (Pomodoro)
            </span>
            <span className="text-[11px] text-slate-400">
              {timerMode === 'work' ? '📚 ডিপ স্টাডি / কোডিং সেশন' : '☕ রিল্যাক্স ও ব্রেক'}
            </span>
          </div>

          {/* Circular Progress Dial */}
          <div className="relative w-44 h-44 mx-auto flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="7" />
              <circle
                cx="60"
                cy="60"
                r="52"
                fill="none"
                stroke={timerMode === 'work' ? '#6366f1' : '#10b981'}
                strokeWidth="7"
                strokeLinecap="round"
                strokeDasharray={326.7}
                strokeDashoffset={326.7 - (pomoProgress / 100) * 326.7}
                className="transition-all duration-1000"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-black font-mono tracking-tight text-white">
                {formatTime(timeLeft)}
              </span>
              <span className="text-[10px] font-mono text-cyan-300 uppercase mt-1">
                {pomodoro.customMinutes} Min Session
              </span>
            </div>
          </div>

          {pomodoro.finishedNotice && (
            <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 text-xs font-bold flex items-center justify-between gap-2">
              <span>🎉 {pomodoro.finishedNotice}</span>
              <button onClick={dismissPomodoroNotice} className="text-[10px] underline">OK</button>
            </div>
          )}

          {/* Start / Pause / Reset */}
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => {
                SoundFX.click();
                togglePomodoroRun();
              }}
              className={`px-6 py-3 rounded-2xl font-bold text-xs flex items-center gap-2 text-white shadow-lg transition active:scale-95 ${
                isRunning ? 'bg-amber-600 hover:bg-amber-500' : 'bg-emerald-600 hover:bg-emerald-500'
              }`}
            >
              {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span>{isRunning ? 'Pause' : 'Start Focus'}</span>
            </button>

            <button
              onClick={() => applyCustomTimer(pomodoro.customMinutes, timerMode)}
              className="p-3 rounded-2xl glass-pill hover:bg-white/10 text-slate-300"
              title="Reset Timer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Custom Minutes Selector */}
          <div className="pt-4 border-t border-white/10 space-y-3 text-left">
            <div className="flex items-center justify-between text-[11px] text-slate-300 font-semibold">
              <span className="flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                <span>ইচ্ছামতো সময় সিলেক্ট করুন (Custom Mins):</span>
              </span>
            </div>

            {/* Direct Input & -5 / +5 */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => applyCustomTimer(Math.max(1, draftCustomMins - 5), 'work')}
                className="px-3 py-2 rounded-xl glass-pill text-xs font-bold text-slate-200 hover:bg-white/10"
              >
                -5m
              </button>
              <input
                type="number"
                min="1"
                max="240"
                value={draftCustomMins}
                onChange={(e) => setDraftCustomMins(Number(e.target.value))}
                className="flex-1 px-3 py-2 rounded-xl glass-input text-center text-sm font-bold"
              />
              <button
                type="button"
                onClick={() => applyCustomTimer(Math.min(240, draftCustomMins + 5), 'work')}
                className="px-3 py-2 rounded-xl glass-pill text-xs font-bold text-slate-200 hover:bg-white/10"
              >
                +5m
              </button>
              <button
                type="button"
                onClick={() => applyCustomTimer(draftCustomMins, 'work')}
                className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white"
              >
                Set
              </button>
            </div>

            {/* Quick Presets */}
            <div className="grid grid-cols-4 gap-1.5">
              {[
                { m: 15, l: '15m', mode: 'work' },
                { m: 25, l: '25m', mode: 'work' },
                { m: 45, l: '45m', mode: 'work' },
                { m: 60, l: '60m', mode: 'work' }
              ].map((p) => (
                <button
                  key={p.m}
                  type="button"
                  onClick={() => applyCustomTimer(p.m, p.mode)}
                  className={`py-1.5 rounded-xl text-xs font-bold transition ${
                    customMinutes === p.m && timerMode === 'work'
                      ? 'bg-indigo-600 text-white'
                      : 'glass-pill text-slate-300 hover:text-white'
                  }`}
                >
                  {p.l}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => applyCustomTimer(5, 'break')}
                className={`py-1.5 rounded-xl text-xs font-semibold transition ${
                  customMinutes === 5 && timerMode === 'break'
                    ? 'bg-emerald-600 text-white'
                    : 'glass-pill text-emerald-300 hover:bg-emerald-500/20'
                }`}
              >
                ☕ 5m Break
              </button>
              <button
                type="button"
                onClick={() => applyCustomTimer(10, 'break')}
                className={`py-1.5 rounded-xl text-xs font-semibold transition ${
                  customMinutes === 10 && timerMode === 'break'
                    ? 'bg-emerald-600 text-white'
                    : 'glass-pill text-emerald-300 hover:bg-emerald-500/20'
                }`}
              >
                🔋 10m Break
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
