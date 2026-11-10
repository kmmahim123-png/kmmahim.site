import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOS } from '../context/OSContext';
import SafeDeleteModal from './common/SafeDeleteModal';
import { SoundFX } from './common/SoundEffects';
import {
  Utensils, Coins, Calculator, History, Trash2
} from 'lucide-react';

export default function MealManager() {
  const {
    data,
    updateMealSettings,
    addMealDeposit,
    deleteMealDeposit,
    updateDailyMeal,
    deleteMealLog,
    resetMealsData
  } = useOS();

  const { mode, ratePerMeal, packageTotalMeals, deposits, logs } = data.meals;

  const todayKey = new Date().toISOString().slice(0, 10);
  const [selectedDate, setSelectedDate] = useState(todayKey);

  // Deposit Form State
  const [depAmount, setDepAmount] = useState('');
  const [depDate, setDepDate] = useState(todayKey);
  const [depNote, setDepNote] = useState('');
  const [deductWallet, setDeductWallet] = useState('cash');

  // Bazar Auto Meal Rate Calculator
  const [showBazarCalc, setShowBazarCalc] = useState(false);
  const [messTotalBazar, setMessTotalBazar] = useState('');
  const [messTotalMeals, setMessTotalMeals] = useState('');

  // Protected Safe Delete Modal
  const [showResetModal, setShowResetModal] = useState(false);

  const currentLog = logs[selectedDate] || { breakfast: 0, lunch: 0, dinner: 0, guest: 0 };

  // Totals Calculation
  const stats = useMemo(() => {
    const totalDeposited = deposits.reduce((sum, d) => sum + Number(d.amount || 0), 0);
    let totalMealsEaten = 0;

    Object.values(logs).forEach((day) => {
      totalMealsEaten +=
        Number(day.breakfast || 0) +
        Number(day.lunch || 0) +
        Number(day.dinner || 0) +
        Number(day.guest || 0);
    });

    const totalCost = Math.round(totalMealsEaten * Number(ratePerMeal || 0));
    const remainingBalance = totalDeposited - totalCost;
    const remainingMealsByBalance =
      ratePerMeal > 0 ? Math.floor(remainingBalance / ratePerMeal) : 0;
    const estDaysLeft = Math.max(0, Math.floor(remainingMealsByBalance / 2.5));

    const fuelPercent =
      totalDeposited > 0
        ? Math.max(0, Math.min(100, Math.round((remainingBalance / totalDeposited) * 100)))
        : 0;

    return {
      totalDeposited,
      totalMealsEaten,
      totalCost,
      remainingBalance,
      remainingMealsByBalance,
      estDaysLeft,
      fuelPercent,
      packageRemaining: Math.max(0, Number(packageTotalMeals || 60) - totalMealsEaten)
    };
  }, [deposits, logs, ratePerMeal, packageTotalMeals]);

  const handleSetMealPart = (part, value) => {
    SoundFX.click();
    const next = {
      ...currentLog,
      [part]: Number(value)
    };
    updateDailyMeal(selectedDate, next);
  };

  const handleQuickFullDay = () => {
    SoundFX.success();
    updateDailyMeal(selectedDate, { breakfast: 1, lunch: 1, dinner: 1, guest: 0 });
  };

  const handleDepositSubmit = (e) => {
    e.preventDefault();
    if (!depAmount) return;
    SoundFX.success();
    addMealDeposit({
      amount: depAmount,
      date: depDate,
      note: depNote,
      deductFromWallet: deductWallet === 'none' ? null : deductWallet
    });
    setDepAmount('');
    setDepNote('');
  };

  const handleApplyBazarRate = () => {
    const bazar = Number(messTotalBazar);
    const totalM = Number(messTotalMeals);
    if (!bazar || !totalM || totalM <= 0) return;
    SoundFX.success();
    const calcRate = Math.round((bazar / totalM) * 100) / 100;
    updateMealSettings({ ratePerMeal: calcRate });
    setShowBazarCalc(false);
  };

  const quickDepositAmounts = [500, 1000, 1500, 2000, 3000];

  return (
    <div className="space-y-6">
      {/* Protected Reset Meal Modal */}
      <SafeDeleteModal
        isOpen={showResetModal}
        onClose={() => setShowResetModal(false)}
        onConfirm={() => resetMealsData()}
        title="মিলের হিসাব রিসেট (০)"
        description="আপনি কি আসলেই সব মিল জমার হিসাব এবং প্রতিদিনের মিল লগ মুছে ফেলতে চান?"
      />

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black flex items-center gap-2.5 text-white">
            <Utensils className="w-6 h-6 text-cyan-400" />
            <span>Smart Meal Manager (হল ও মেসের মিল হিসাব)</span>
          </h1>
          <p className="text-xs text-slate-400">
            কত টাকা জমা দিয়েছেন, কয় মিল খেয়েছেন এবং আর কত দিন মিল চলবে তার রিয়েল-টাইম হিসাব
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Mode Switcher */}
          <div className="flex items-center gap-1 glass-pill p-1 rounded-xl text-xs">
            <button
              onClick={() => {
                SoundFX.click();
                updateMealSettings({ mode: 'fixed' });
              }}
              className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                mode === 'fixed' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              টাকার ব্যালেন্স মোড
            </button>
            <button
              onClick={() => {
                SoundFX.click();
                updateMealSettings({ mode: 'package' });
              }}
              className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                mode === 'package' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              মাসিক মিল প্যাকেজ
            </button>
          </div>
        </div>
      </div>

      {/* Crystal Glass Top Summary & Fuel Gauge */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Deposited */}
        <motion.div
          whileHover={{ y: -3 }}
          className="glass-crystal rounded-3xl p-5 flex flex-col justify-between"
        >
          <span className="text-xs text-slate-400 font-medium">মোট জমা দিয়েছেন (Total Deposit)</span>
          <p className="text-2xl sm:text-3xl font-black text-emerald-400 mt-1 font-mono">
            ৳{stats.totalDeposited.toLocaleString()}
          </p>
          <span className="text-[11px] text-slate-400 mt-1">
            মোট {deposits.length} বারে জমা দেওয়া হয়েছে
          </span>
        </motion.div>

        {/* Card 2: Total Meals Eaten */}
        <motion.div
          whileHover={{ y: -3 }}
          className="glass-crystal rounded-3xl p-5 flex flex-col justify-between"
        >
          <span className="text-xs text-slate-400 font-medium">মোট খাওয়া মিল (Total Meals)</span>
          <p className="text-2xl sm:text-3xl font-black text-cyan-400 mt-1 font-mono">
            {stats.totalMealsEaten} <span className="text-xs font-normal text-slate-300">টি মিল</span>
          </p>
          <span className="text-[11px] text-slate-400 mt-1">
            মোট খরচ: ৳{stats.totalCost.toLocaleString()} (রেট ৳{ratePerMeal})
          </span>
        </motion.div>

        {/* Card 3: Remaining Balance / Due */}
        <motion.div
          whileHover={{ y: -3 }}
          className={`rounded-3xl p-5 border backdrop-blur-2xl flex flex-col justify-between transition ${
            stats.remainingBalance < 0
              ? 'bg-rose-950/40 border-rose-500/40 shadow-lg shadow-rose-950/30'
              : 'glass-crystal'
          }`}
        >
          <span className="text-xs text-slate-400 font-medium">বর্তমান মিল ব্যালেন্স</span>
          <p
            className={`text-2xl sm:text-3xl font-black mt-1 font-mono ${
              stats.remainingBalance < 0 ? 'text-rose-400' : 'text-white'
            }`}
          >
            {stats.remainingBalance < 0 ? '-' : ''}৳
            {Math.abs(stats.remainingBalance).toLocaleString()}
          </p>
          <span className={`text-[11px] font-semibold mt-1 ${
            stats.remainingBalance < 0 ? 'text-rose-300' : 'text-emerald-400'
          }`}>
            {stats.remainingBalance < 0
              ? `⚠️ ম্যানেজারকে ৳${Math.abs(stats.remainingBalance)} দিতে হবে`
              : stats.totalDeposited === 0
              ? 'কোনো টাকা জমা দেওয়া হয়নি'
              : '✅ ম্যানেজারের কাছে অ্যাডভান্স জমা আছে'}
          </span>
        </motion.div>

        {/* Card 4: Fuel Gauge & Days Left */}
        <motion.div
          whileHover={{ y: -3 }}
          className="rounded-3xl p-5 bg-gradient-to-br from-indigo-950/70 to-slate-900/90 border border-indigo-500/40 backdrop-blur-2xl flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-indigo-300 font-bold">
              {mode === 'fixed' ? 'আর কত মিল চলবে?' : 'প্যাকেজের বাকি মিল'}
            </span>
            <span className="text-[10px] font-mono text-cyan-300 px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30">
              {stats.fuelPercent}% Left
            </span>
          </div>

          <p className="text-2xl sm:text-3xl font-black text-white mt-1 font-mono">
            {mode === 'fixed'
              ? `${Math.max(0, stats.remainingMealsByBalance)} টি`
              : `${stats.packageRemaining} টি`}
          </p>

          {/* Animated Liquid Progress Bar */}
          <div className="space-y-1.5 mt-2">
            <div className="w-full h-2 rounded-full bg-slate-950/80 overflow-hidden border border-white/5">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${stats.fuelPercent}%` }}
                transition={{ duration: 0.8 }}
                className={`h-full rounded-full ${
                  stats.fuelPercent < 20
                    ? 'bg-gradient-to-r from-rose-500 to-amber-500'
                    : 'bg-gradient-to-r from-emerald-500 to-cyan-400'
                }`}
              />
            </div>
            <span className="text-[11px] text-cyan-300 block">
              প্রায় ~{stats.estDaysLeft} দিন খাওয়া যাবে
            </span>
          </div>
        </motion.div>
      </div>

      {/* Main Controls */}
      <div className="grid lg:grid-cols-12 gap-6">
        {/* Left: Daily Meal Entry + History */}
        <div className="lg:col-span-7 glass-crystal rounded-3xl p-5 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
            <div>
              <h3 className="font-bold text-base text-white">প্রতিদিনের মিল এন্ট্রি (Daily Logger)</h3>
              <p className="text-xs text-slate-400">
                তারিখ সিলেক্ট করে সকাল, দুপুর ও রাতের মিলের সংখ্যায় ট্যাপ করুন
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {selectedDate !== todayKey && (
                <button
                  onClick={() => {
                    SoundFX.click();
                    setSelectedDate(todayKey);
                  }}
                  className="px-2.5 py-1.5 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-xs font-bold"
                >
                  আজ (Today)
                </button>
              )}
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-3 py-1.5 rounded-xl glass-input text-xs text-cyan-300 font-semibold"
              />
              <button
                onClick={handleQuickFullDay}
                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white transition active:scale-95"
              >
                ✓ ১+১+১ পুরো দিন
              </button>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { key: 'breakfast', label: '🌅 সকাল (Breakfast)', options: [0, 0.5, 1, 2] },
              { key: 'lunch', label: '☀️ দুপুর (Lunch)', options: [0, 1, 1.5, 2] },
              { key: 'dinner', label: '🌙 রাত (Dinner)', options: [0, 0.5, 1, 2] },
              { key: 'guest', label: '👥 গেস্ট মিল (Extra)', options: [0, 1, 2, 3] }
            ].map((item) => (
              <div
                key={item.key}
                className="p-4 rounded-2xl bg-slate-950/60 border border-white/10 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-100">{item.label}</span>
                  <span className="text-xs font-mono text-cyan-400 font-bold">
                    {currentLog[item.key] || 0} টি
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {item.options.map((val) => {
                    const active = Number(currentLog[item.key] || 0) === val;
                    return (
                      <button
                        key={val}
                        type="button"
                        onClick={() => handleSetMealPart(item.key, val)}
                        className={`py-2 rounded-xl text-xs font-bold transition active:scale-95 ${
                          active
                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/40 border border-indigo-400/50'
                            : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5'
                        }`}
                      >
                        {val}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Daily Summary Strip */}
          <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 flex flex-wrap items-center justify-between gap-2 text-xs">
            <span>
              📅 <strong>{selectedDate}</strong> তারিখে মোট মিল:{' '}
              <strong className="text-cyan-300 text-sm font-mono">
                {Number(currentLog.breakfast || 0) +
                  Number(currentLog.lunch || 0) +
                  Number(currentLog.dinner || 0) +
                  Number(currentLog.guest || 0)}{' '}
                টি
              </strong>
            </span>
            <span>
              দিনের মোট খরচ:{' '}
              <strong className="text-emerald-400 text-sm font-mono">
                ৳
                {Math.round(
                  (Number(currentLog.breakfast || 0) +
                    Number(currentLog.lunch || 0) +
                    Number(currentLog.dinner || 0) +
                    Number(currentLog.guest || 0)) *
                    ratePerMeal
                ).toLocaleString()}
              </strong>
            </span>
          </div>

          {/* History Log with Delete Button */}
          <div className="pt-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5 flex items-center justify-between">
              <span>প্রতিদিনের মিলের ইতিহাস ({Object.keys(logs).length} দিন)</span>
              <span className="text-[10px] font-normal text-slate-500">ক্লিক করলে এডিট করা যাবে</span>
            </h4>
            <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
              {Object.keys(logs).length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-4">এখনো কোনো মিল লগ করা হয়নি।</p>
              ) : (
                Object.entries(logs)
                  .sort((a, b) => b[0].localeCompare(a[0]))
                  .map(([dateKey, d]) => {
                    const dayTotal =
                      Number(d.breakfast || 0) +
                      Number(d.lunch || 0) +
                      Number(d.dinner || 0) +
                      Number(d.guest || 0);
                    return (
                      <div
                        key={dateKey}
                        className={`p-3 rounded-2xl border flex items-center justify-between text-xs transition ${
                          selectedDate === dateKey
                            ? 'bg-indigo-950/40 border-indigo-500/50'
                            : 'bg-slate-950/60 border-white/5 hover:border-white/20'
                        }`}
                      >
                        <div
                          onClick={() => {
                            SoundFX.click();
                            setSelectedDate(dateKey);
                          }}
                          className="flex-1 flex flex-wrap items-center justify-between gap-2 cursor-pointer pr-3"
                        >
                          <span className="font-mono text-white font-semibold">{dateKey}</span>
                          <div className="flex items-center gap-2.5 text-slate-300 text-[11px]">
                            <span>স: {d.breakfast}</span>
                            <span>দু: {d.lunch}</span>
                            <span>রা: {d.dinner}</span>
                            {d.guest > 0 && <span className="text-amber-400">গেস্ট: {d.guest}</span>}
                          </div>
                          <span className="font-bold text-cyan-400 font-mono">
                            {dayTotal} মিল (৳{Math.round(dayTotal * ratePerMeal)})
                          </span>
                        </div>

                        <button
                          onClick={() => {
                            SoundFX.click();
                            deleteMealLog(dateKey);
                          }}
                          title="Delete this day's log"
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-rose-600 text-slate-400 hover:text-white transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Settings + Bazar Calculator + Deposits */}
        <div className="lg:col-span-5 space-y-5">
          {/* Meal Rate Config + Auto Bazar Calculator */}
          <div className="glass-crystal rounded-3xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm flex items-center gap-2 text-white">
                <Calculator className="w-4 h-4 text-indigo-400" />
                <span>মিল রেট ও সেটিংস</span>
              </h3>
              <button
                type="button"
                onClick={() => {
                  SoundFX.click();
                  setShowBazarCalc(!showBazarCalc);
                }}
                className="text-[11px] font-bold text-cyan-400 hover:text-cyan-300 underline"
              >
                {showBazarCalc ? 'ক্যালকুলেটর বন্ধ করুন' : '🧮 বাজার থেকে রেট বের করুন'}
              </button>
            </div>

            <AnimatePresence>
              {showBazarCalc && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-3.5 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 space-y-2.5 overflow-hidden"
                >
                  <p className="text-[11px] text-indigo-200">
                    মেসের মোট বাজার খরচ এবং মোট মিলের সংখ্যা লিখুন, আসল মিল রেট স্বয়ংক্রিয়ভাবে বের হবে:
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      placeholder="মোট বাজার খরচ (৳)"
                      value={messTotalBazar}
                      onChange={(e) => setMessTotalBazar(e.target.value)}
                      className="px-3 py-2 rounded-xl glass-input text-xs"
                    />
                    <input
                      type="number"
                      placeholder="সবার মোট মিল সংখ্যা"
                      value={messTotalMeals}
                      onChange={(e) => setMessTotalMeals(e.target.value)}
                      className="px-3 py-2 rounded-xl glass-input text-xs"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleApplyBazarRate}
                    className="w-full py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold"
                  >
                    হিসাব করে মিল রেট সেট করুন (৳
                    {messTotalBazar && messTotalMeals > 0
                      ? (Number(messTotalBazar) / Number(messTotalMeals)).toFixed(1)
                      : '0'}
                    )
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">
                  প্রতি মিলের দাম (Rate ৳)
                </label>
                <input
                  type="number"
                  value={ratePerMeal}
                  onChange={(e) => updateMealSettings({ ratePerMeal: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm font-bold text-emerald-400"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">
                  প্যাকেজ মিল (Package Mode)
                </label>
                <input
                  type="number"
                  value={packageTotalMeals}
                  onChange={(e) =>
                    updateMealSettings({ packageTotalMeals: Number(e.target.value) })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm font-bold text-cyan-400"
                />
              </div>
            </div>
          </div>

          {/* Add Meal Deposit */}
          <form
            onSubmit={handleDepositSubmit}
            className="glass-crystal rounded-3xl p-5 space-y-3"
          >
            <h3 className="font-bold text-sm flex items-center gap-2 text-white">
              <Coins className="w-4 h-4 text-emerald-400" />
              <span>নতুন মিলের টাকা জমা দিন</span>
            </h3>

            {/* Quick Deposit Chips */}
            <div className="flex flex-wrap gap-1.5">
              {quickDepositAmounts.map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => {
                    SoundFX.click();
                    setDepAmount(String(amt));
                  }}
                  className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-emerald-500/30 border border-white/10 text-[11px] font-bold text-emerald-300 transition"
                >
                  ৳{amt}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">জমার পরিমাণ (৳) *</label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 1500"
                  value={depAmount}
                  onChange={(e) => setDepAmount(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm font-bold"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">জমার তারিখ</label>
                <input
                  type="date"
                  value={depDate}
                  onChange={(e) => setDepDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">
                কোন ওয়ালেট থেকে টাকা কেটে নেবে?
              </label>
              <select
                value={deductWallet}
                onChange={(e) => setDeductWallet(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs"
              >
                <option value="none" className="bg-slate-900">শুধু মিলের হিসাবে যোগ হবে (ওয়ালেট অপরিবর্তিত)</option>
                <option value="cash" className="bg-slate-900">Hand Cash থেকে কাটবে</option>
                <option value="bkash" className="bg-slate-900">bKash থেকে কাটবে</option>
                <option value="nagad" className="bg-slate-900">Nagad থেকে কাটবে</option>
                <option value="bank" className="bg-slate-900">Bank Account থেকে কাটবে</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">নোট (কার কাছে দিলেন)</label>
              <input
                type="text"
                placeholder="e.g. Mess Manager / 1st Week Deposit"
                value={depNote}
                onChange={(e) => setDepNote(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white shadow-lg shadow-emerald-900/40 transition active:scale-95"
            >
              + মিলের টাকা জমা সেভ করুন
            </button>
          </form>

          {/* Deposit History with Delete Buttons */}
          <div className="glass-crystal rounded-3xl p-5 space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <History className="w-3.5 h-3.5 text-cyan-400" />
              <span>টাকা জমার ইতিহাস ({deposits.length})</span>
            </h4>
            <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
              {deposits.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-3">এখনো কোনো জমা নেই।</p>
              ) : (
                deposits.map((dep) => (
                  <div
                    key={dep.id}
                    className="p-3 rounded-2xl bg-slate-950/60 border border-white/5 flex items-center justify-between text-xs"
                  >
                    <div>
                      <p className="font-bold text-slate-200">{dep.note}</p>
                      <span className="text-[10px] text-slate-400 font-mono">{dep.date}</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <span className="font-black text-emerald-400 font-mono">
                        +৳{Number(dep.amount).toLocaleString()}
                      </span>
                      <button
                        onClick={() => {
                          SoundFX.click();
                          deleteMealDeposit(dep.id);
                        }}
                        title="Delete deposit"
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-rose-600 text-slate-400 hover:text-white transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Subtle Bottom-Right Protected Reset Link */}
      <div className="flex justify-end pt-4">
        <button
          onClick={() => {
            SoundFX.click();
            setShowResetModal(true);
          }}
          className="text-[11px] text-slate-500 hover:text-rose-400 flex items-center gap-1.5 transition"
        >
          <Trash2 className="w-3 h-3" />
          <span>Reset Meal Month Data (Protected)</span>
        </button>
      </div>
    </div>
  );
}
