import React, { useState } from 'react';
import { useOS } from '../context/OSContext';
import { CheckSquare, Flame, Dumbbell, Sparkles, Droplets, Calendar, CheckCircle2 } from 'lucide-react';

export default function HabitsTracker() {
  const { data, updateDailyHabits, updateMinoxidilStart } = useOS();
  const { minoxidilBottleStart, dailyLogs } = data.habits;

  const todayKey = new Date().toISOString().slice(0, 10);
  const [selectedDate, setSelectedDate] = useState(todayKey);

  const currentDay = dailyLogs[selectedDate] || {
    namaz: { fajr: false, zuhr: false, asr: false, maghrib: false, isha: false },
    minoxidil: { morning: false, night: false },
    gym: { done: false, muscle: '', weightLog: '' }
  };

  // Calculate Minoxidil bottle days elapsed
  const bottleDaysPassed = Math.max(
    0,
    Math.floor((new Date() - new Date(minoxidilBottleStart || '2026-11-01')) / (1000 * 60 * 60 * 24))
  );
  const bottleDaysRemaining = Math.max(0, 30 - (bottleDaysPassed % 30));

  const toggleNamaz = (waqt) => {
    updateDailyHabits(selectedDate, (prev) => ({
      ...prev,
      namaz: { ...prev.namaz, [waqt]: !prev.namaz[waqt] }
    }));
  };

  const toggleMinoxidil = (slot) => {
    updateDailyHabits(selectedDate, (prev) => ({
      ...prev,
      minoxidil: { ...prev.minoxidil, [slot]: !prev.minoxidil[slot] }
    }));
  };

  const toggleGymDone = () => {
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

  const namazList = [
    { key: 'fajr', label: 'ফজর (Fajr)' },
    { key: 'zuhr', label: 'যোহর (Zuhr)' },
    { key: 'asr', label: 'আসর (Asr)' },
    { key: 'maghrib', label: 'মাগরিব (Maghrib)' },
    { key: 'isha', label: 'ইশা (Isha)' }
  ];

  const muscleGroups = ['Chest & Triceps', 'Back & Biceps', 'Legs & Core', 'Shoulders & Arms', 'Full Body / Cardio'];

  const namazDoneCount = currentDay.namaz ? Object.values(currentDay.namaz).filter(Boolean).length : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2.5">
            <CheckSquare className="w-6 h-6 text-emerald-400"/>
            <span>Daily Habits & Routine (জিম, নামাজ ও মিনোক্সিডিল)</span>
          </h1>
          <p className="text-xs text-slate-400">
            Track daily prayers, hair treatment consistency, and athletic gym sessions
          </p>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-cyan-300 font-semibold"
          />
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* 1. Namaz Tracker */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-bold text-sm flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400"/>
              <span>৫ ওয়াক্ত নামাজ (Daily Prayers)</span>
            </h3>
            <span className="text-[11px] text-slate-400 font-mono">
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
                  className={`p-3 rounded-xl border cursor-pointer flex items-center justify-between transition ${
                    checked
                      ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <span className="font-medium text-xs">{n.label}</span>
                  <div
                    className={`w-5 h-5 rounded-md flex items-center justify-center border ${
                      checked ? 'bg-emerald-600 border-emerald-500 text-white' : 'border-slate-700'
                    }`}
                  >
                    {checked && <CheckCircle2 className="w-3.5 h-3.5"/>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 2. Minoxidil Tracker */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-bold text-sm flex items-center gap-2">
              <Droplets className="w-4 h-4 text-cyan-400"/>
              <span>মিনোক্সিডিল (Minoxidil Routine)</span>
            </h3>
            <span className="text-[11px] text-cyan-400 font-mono">
              Bottle: ~{bottleDaysRemaining} Days Left
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
                  className={`p-3 rounded-xl border cursor-pointer flex items-center justify-between transition ${
                    checked
                      ? 'bg-cyan-950/30 border-cyan-500/40 text-cyan-300'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <span className="font-medium text-xs">{slot.label}</span>
                  <div
                    className={`w-5 h-5 rounded-md flex items-center justify-center border ${
                      checked ? 'bg-cyan-600 border-cyan-500 text-white' : 'border-slate-700'
                    }`}
                  >
                    {checked && <CheckCircle2 className="w-3.5 h-3.5"/>}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-2 border-t border-slate-800 space-y-2">
            <label className="text-[11px] text-slate-400 block">নতুন বোতল শুরুর তারিখ (Bottle Start Date)</label>
            <input
              type="date"
              value={minoxidilBottleStart}
              onChange={(e) => updateMinoxidilStart(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200"
            />
          </div>
        </div>

        {/* 3. Gym & Athletic Routine */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-bold text-sm flex items-center gap-2">
              <Dumbbell className="w-4 h-4 text-indigo-400"/>
              <span>জিম ও ফিটনেস (Gym Workout)</span>
            </h3>
            <button
              onClick={toggleGymDone}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                currentDay.gym?.done
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {currentDay.gym?.done ? '🏋️ Gym Completed' : 'Mark Done'}
            </button>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">আজ কোন মাসল গ্রুপ করলেন?</label>
              <select
                value={currentDay.gym?.muscle || ''}
                onChange={(e) => updateGymDetails('muscle', e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200"
              >
                <option value="">Select Muscle Group</option>
                {muscleGroups.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">ওজন / পিআর লগ (Weight / PR Note)</label>
              <input
                type="text"
                placeholder="e.g. Bench Press 60kg x 8 reps"
                value={currentDay.gym?.weightLog || ''}
                onChange={(e) => updateGymDetails('weightLog', e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
