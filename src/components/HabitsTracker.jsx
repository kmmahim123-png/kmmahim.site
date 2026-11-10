import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useOS } from '../context/OSContext';
import { getLocalDateStr } from '../utils/dateUtils';
import { AppleActivityRings } from './common/MotionKit';
import { SoundFX } from './common/SoundEffects';
import {
  CheckSquare, Dumbbell, Sparkles, Droplets, CheckCircle2, Plus, Trash2, Flame
} from 'lucide-react';

export default function HabitsTracker() {
  const {
    data,
    updateDailyHabits,
    addCustomHabit,
    deleteCustomHabit,
    toggleCustomHabitForDay,
    updateMinoxidilStart
  } = useOS();

  const { minoxidilBottleStart, dailyLogs, customHabits = [] } = data.habits;

  const todayKey = getLocalDateStr();
  const [selectedDate, setSelectedDate] = useState(todayKey);

  // Build 84-day (12 weeks) GitHub-style Contribution Heatmap
  const heatmapDays = useMemo(() => {
    const arr = [];
    const base = new Date();
    for (let i = 83; i >= 0; i--) {
      const d = new Date(base);
      d.setDate(d.getDate() - i);
      const key = getLocalDateStr(d);
      const log = dailyLogs[key];
      let score = 0;
      if (log) {
        score += log.namaz ? Object.values(log.namaz).filter(Boolean).length : 0;
        score += log.gym?.done ? 2 : 0;
        score += log.minoxidil ? Object.values(log.minoxidil).filter(Boolean).length : 0;
      }
      arr.push({ key, score });
    }
    return arr;
  }, [dailyLogs]);

  const activeStreak = useMemo(() => {
    let streak = 0;
    const base = new Date();
    for (let i = 0; i < 365; i++) {
      const d = new Date(base);
      d.setDate(d.getDate() - i);
      const log = dailyLogs[getLocalDateStr(d)];
      const nCount = log?.namaz ? Object.values(log.namaz).filter(Boolean).length : 0;
      if (nCount > 0 || log?.gym?.done) streak++;
      else if (i > 0) break;
    }
    return streak;
  }, [dailyLogs]);

  // Add Custom Habit State
  const [habitTitle, setHabitTitle] = useState('');
  const [habitEmoji, setHabitEmoji] = useState('📖');

  const currentDay = dailyLogs[selectedDate] || {
    namaz: { fajr: false, zuhr: false, asr: false, maghrib: false, isha: false },
    minoxidil: { morning: false, night: false },
    gym: { done: false, muscle: '', weightLog: '' },
    custom: {}
  };

  const bottleDaysPassed = Math.max(
    0,
    Math.floor((new Date() - new Date(minoxidilBottleStart || '2026-11-01')) / (1000 * 60 * 60 * 24))
  );
  const bottleDaysRemaining = Math.max(0, 30 - (bottleDaysPassed % 30));

  const toggleNamaz = (waqt) => {
    SoundFX.click();
    updateDailyHabits(selectedDate, (prev) => ({
      ...prev,
      namaz: { ...prev.namaz, [waqt]: !prev.namaz[waqt] }
    }));
  };

  const toggleMinoxidil = (slot) => {
    SoundFX.click();
    updateDailyHabits(selectedDate, (prev) => ({
      ...prev,
      minoxidil: { ...prev.minoxidil, [slot]: !prev.minoxidil[slot] }
    }));
  };

  const toggleGymDone = () => {
    SoundFX.click();
    updateDailyHabits(selectedDate, (prev) => ({
      ...prev,
      gym: { ...prev.gym, done: !prev.gym.done }
    }));
  };

  const updateGymDetails = (field, val) => {
    updateDailyHabits(selectedDate, (prev) => ({
      ...prev,
      gym: { ...prev.gym, [field]: val }
    }));
  };

  const handleAddCustomHabit = (e) => {
    e.preventDefault();
    if (!habitTitle.trim()) return;
    SoundFX.success();
    addCustomHabit({ label: habitTitle.trim(), emoji: habitEmoji });
    setHabitTitle('');
  };

  const namazList = [
    { key: 'fajr', label: 'ফজর (Fajr)' },
    { key: 'zuhr', label: 'যোহর (Zuhr)' },
    { key: 'asr', label: 'আসর (Asr)' },
    { key: 'maghrib', label: 'মাগরিব (Maghrib)' },
    { key: 'isha', label: 'ইশা (Isha)' }
  ];

  const muscleGroups = ['Chest & Triceps', 'Back & Biceps', 'Legs & Core', 'Shoulders & Arms', 'Full Body / Cardio'];
  const emojiOptions = ['📖', '💧', '🏃', '💻', '🧠', '🧘', '✍️', '🌙'];

  const namazDoneCount = currentDay.namaz ? Object.values(currentDay.namaz).filter(Boolean).length : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black flex items-center gap-2.5 text-white">
            <CheckSquare className="w-6 h-6 text-emerald-400" />
            <span>Daily Habits & Routine (জিম, নামাজ ও কাস্টম হ্যাবিট)</span>
          </h1>
          <p className="text-xs text-slate-400">
            প্রতিদিনের নামাজ, জিম ও মিনোক্সিডিলের পাশাপাশি নিজের নতুন কাস্টম হ্যাবিট যোগ করে ট্র্যাক করুন
          </p>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3.5 py-2 rounded-xl glass-input text-xs text-cyan-300 font-semibold"
          />
        </div>
      </div>

      {/* Apple Watch Activity Rings */}
      <AppleActivityRings
        namazDone={namazDoneCount}
        namazTotal={5}
        minoxidilDone={currentDay.minoxidil ? Object.values(currentDay.minoxidil).filter(Boolean).length : 0}
        minoxidilTotal={2}
        gymDone={Boolean(currentDay.gym?.done)}
      />

      {/* CUSTOM HABITS SECTION (User's own added habits) */}
      <div className="glass-crystal rounded-3xl p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
          <div>
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <span>⚡ আমার কাস্টম হ্যাবিটসমূহ (Custom Daily Habits)</span>
            </h3>
            <p className="text-[11px] text-slate-400">
              যেমন: কুরআন তিলাওয়াত, ৩০ মি. বই পড়া, ৩ লিটার পানি, কোডিং ইত্যাদি নিজের মতো যোগ করুন
            </p>
          </div>
          <span className="text-xs font-mono text-cyan-400">
            {customHabits.filter((h) => currentDay.custom?.[h.id]).length}/{customHabits.length} Done
          </span>
        </div>

        {/* Add Custom Habit Form */}
        <form onSubmit={handleAddCustomHabit} className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1 glass-pill p-1 rounded-xl">
            {emojiOptions.map((em) => (
              <button
                key={em}
                type="button"
                onClick={() => setHabitEmoji(em)}
                className={`w-7 h-7 rounded-lg text-sm flex items-center justify-center transition ${
                  habitEmoji === em ? 'bg-indigo-600 scale-110' : 'hover:bg-white/10'
                }`}
              >
                {em}
              </button>
            ))}
          </div>

          <input
            type="text"
            placeholder="নতুন হ্যাবিটের নাম লিখুন (e.g. কুরআন তিলাওয়াত)..."
            value={habitTitle}
            onChange={(e) => setHabitTitle(e.target.value)}
            className="flex-1 min-w-[200px] px-3.5 py-2.5 rounded-xl glass-input text-xs"
          />

          <button
            type="submit"
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 transition active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>হ্যাবিট যোগ করুন</span>
          </button>
        </form>

        {/* List of Custom Habits */}
        {customHabits.length === 0 ? (
          <p className="text-xs text-slate-500 text-center py-2">
            এখনো কোনো কাস্টম হ্যাবিট যোগ করা হয়নি। উপরের বক্স থেকে একটি যোগ করুন!
          </p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
            {customHabits.map((ch) => {
              const checked = Boolean(currentDay.custom?.[ch.id]);
              return (
                <div
                  key={ch.id}
                  className={`p-3.5 rounded-2xl border flex items-center justify-between transition ${
                    checked
                      ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
                      : 'bg-slate-950/60 border-white/10 hover:border-white/20 text-slate-200'
                  }`}
                >
                  <div
                    onClick={() => {
                      SoundFX.click();
                      toggleCustomHabitForDay(selectedDate, ch.id);
                    }}
                    className="flex items-center gap-2.5 flex-1 cursor-pointer"
                  >
                    <span className="text-lg">{ch.emoji}</span>
                    <span className="text-xs font-bold">{ch.label}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        SoundFX.click();
                        toggleCustomHabitForDay(selectedDate, ch.id);
                      }}
                      className={`w-5 h-5 rounded-md flex items-center justify-center border ${
                        checked ? 'bg-emerald-600 border-emerald-500 text-white' : 'border-slate-600'
                      }`}
                    >
                      {checked && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={() => {
                        SoundFX.click();
                        deleteCustomHabit(ch.id);
                      }}
                      title="Remove custom habit"
                      className="p-1 rounded-md bg-white/5 hover:bg-rose-600 text-slate-400 hover:text-white transition"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Core Built-in Habits Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* 1. Namaz Tracker */}
        <div className="glass-crystal rounded-3xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h3 className="font-bold text-sm flex items-center gap-2 text-white">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>৫ ওয়াক্ত নামাজ</span>
            </h3>
            <span className="text-[11px] text-emerald-400 font-mono">
              {namazDoneCount}/5 Done
            </span>
          </div>

          <div className="space-y-2.5">
            {namazList.map((n) => {
              const checked = currentDay.namaz?.[n.key];
              return (
                <div
                  key={n.key}
                  onClick={() => toggleNamaz(n.key)}
                  className={`p-3 rounded-2xl border cursor-pointer flex items-center justify-between transition ${
                    checked
                      ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
                      : 'bg-slate-950/60 border-white/10 text-slate-300 hover:border-white/20'
                  }`}
                >
                  <span className="font-semibold text-xs">{n.label}</span>
                  <div
                    className={`w-5 h-5 rounded-md flex items-center justify-center border ${
                      checked ? 'bg-emerald-600 border-emerald-500 text-white' : 'border-slate-600'
                    }`}
                  >
                    {checked && <CheckCircle2 className="w-3.5 h-3.5" />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 2. Minoxidil Tracker */}
        <div className="glass-crystal rounded-3xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h3 className="font-bold text-sm flex items-center gap-2 text-white">
              <Droplets className="w-4 h-4 text-cyan-400" />
              <span>মিনোক্সিডিল (Minoxidil)</span>
            </h3>
            <span className="text-[11px] text-cyan-400 font-mono">
              Bottle: ~{bottleDaysRemaining}d Left
            </span>
          </div>

          <div className="space-y-3">
            {[
              { key: 'morning', label: 'সকাল (Morning Application)' },
              { key: 'night', label: 'রাত (Night Application)' }
            ].map((slot) => {
              const checked = currentDay.minoxidil?.[slot.key];
              return (
                <div
                  key={slot.key}
                  onClick={() => toggleMinoxidil(slot.key)}
                  className={`p-3 rounded-2xl border cursor-pointer flex items-center justify-between transition ${
                    checked
                      ? 'bg-cyan-950/30 border-cyan-500/40 text-cyan-300'
                      : 'bg-slate-950/60 border-white/10 text-slate-300 hover:border-white/20'
                  }`}
                >
                  <span className="font-semibold text-xs">{slot.label}</span>
                  <div
                    className={`w-5 h-5 rounded-md flex items-center justify-center border ${
                      checked ? 'bg-cyan-600 border-cyan-500 text-white' : 'border-slate-600'
                    }`}
                  >
                    {checked && <CheckCircle2 className="w-3.5 h-3.5" />}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-2 border-t border-white/10 space-y-2">
            <label className="text-[11px] text-slate-400 block">বোতল শুরুর তারিখ (Start Date)</label>
            <input
              type="date"
              value={minoxidilBottleStart}
              onChange={(e) => updateMinoxidilStart(e.target.value)}
              className="w-full px-3 py-2 rounded-xl glass-input text-xs"
            />
          </div>
        </div>

        {/* 3. Gym & Athletic Routine */}
        <div className="glass-crystal rounded-3xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h3 className="font-bold text-sm flex items-center gap-2 text-white">
              <Dumbbell className="w-4 h-4 text-indigo-400" />
              <span>জিম ও ফিটনেস (Gym)</span>
            </h3>
            <button
              onClick={toggleGymDone}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition ${
                currentDay.gym?.done
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'glass-pill text-slate-300 hover:text-white'
              }`}
            >
              {currentDay.gym?.done ? '🏋️ Done' : 'Mark Done'}
            </button>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">আজ কোন মাসল গ্রুপ?</label>
              <select
                value={currentDay.gym?.muscle || ''}
                onChange={(e) => updateGymDetails('muscle', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs"
              >
                <option value="" className="bg-slate-900">Select Muscle Group</option>
                {muscleGroups.map((m) => (
                  <option key={m} value={m} className="bg-slate-900">{m}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">ওজন / পিআর নোট (Weight PR)</label>
              <input
                type="text"
                placeholder="e.g. Bench Press 60kg x 8 reps"
                value={currentDay.gym?.weightLog || ''}
                onChange={(e) => updateGymDetails('weightLog', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 84-Day Consistency Heatmap & Streak */}
      <div className="glass-crystal rounded-3xl p-5 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="font-bold text-sm text-white flex items-center gap-2">
            <Flame className="w-4 h-4 text-amber-400" />
            <span>১২-সপ্তাহের ডিসিপ্লিন হিটম্যাপ (Habit Consistency Grid)</span>
          </h3>
          <span className="px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-bold">
            🔥 Current Streak: {activeStreak} Days
          </span>
        </div>

        <div className="flex flex-wrap gap-1.5 pt-1">
          {heatmapDays.map((cell) => {
            const bg =
              cell.score >= 7
                ? 'bg-emerald-400'
                : cell.score >= 4
                ? 'bg-emerald-500/70'
                : cell.score > 0
                ? 'bg-emerald-700/60'
                : 'bg-white/5';
            return (
              <button
                key={cell.key}
                type="button"
                title={`${cell.key}: Score ${cell.score}`}
                onClick={() => setSelectedDate(cell.key)}
                className={`w-4 h-4 rounded-sm ${bg} ${
                  selectedDate === cell.key ? 'ring-2 ring-cyan-400' : ''
                } transition`}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
