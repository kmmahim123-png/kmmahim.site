import React, { useState, useMemo } from 'react';
import { useOS } from '../context/OSContext';
import {
  Utensils, Calendar, Plus, AlertTriangle, CheckCircle2,
  Coins, Calculator, Sparkles, History
} from 'lucide-react';

export default function MealManager() {
  const { data, updateMealSettings, addMealDeposit, updateDailyMeal } = useOS();
  const { mode, ratePerMeal, packageTotalMeals, deposits, logs } = data.meals;

  const todayKey = new Date().toISOString().slice(0, 10);
  const [selectedDate, setSelectedDate] = useState(todayKey);

  // Deposit Form State
  const [depAmount, setDepAmount] = useState('');
  const [depDate, setDepDate] = useState(todayKey);
  const [depNote, setDepNote] = useState('');
  const [deductWallet, setDeductWallet] = useState('cash');

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

    const totalCost = totalMealsEaten * Number(ratePerMeal || 0);
    const remainingBalance = totalDeposited - totalCost;
    const remainingMealsByBalance =
      ratePerMeal > 0 ? Math.floor(remainingBalance / ratePerMeal) : 0;
    const estDaysLeft = Math.max(0, Math.floor(remainingMealsByBalance / 2.5));

    return {
      totalDeposited,
      totalMealsEaten,
      totalCost,
      remainingBalance,
      remainingMealsByBalance,
      estDaysLeft,
      packageRemaining: Math.max(0, Number(packageTotalMeals || 60) - totalMealsEaten)
    };
  }, [deposits, logs, ratePerMeal, packageTotalMeals]);

  const handleSetMealPart = (part, value) => {
    const next = {
      ...currentLog,
      [part]: Number(value)
    };
    updateDailyMeal(selectedDate, next);
  };

  const handleQuickFullDay = () => {
    updateDailyMeal(selectedDate, { breakfast: 1, lunch: 1, dinner: 1, guest: 0 });
  };

  const handleDepositSubmit = (e) => {
    e.preventDefault();
    if (!depAmount) return;
    addMealDeposit({
      amount: depAmount,
      date: depDate,
      note: depNote,
      deductFromWallet: deductWallet === 'none' ? null : deductWallet
    });
    setDepAmount('');
    setDepNote('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2.5">
            <Utensils className="w-6 h-6 text-cyan-400"/>
            <span>Smart Meal Manager (খাবারের ডিজিটাল হিসাব)</span>
          </h1>
          <p className="text-xs text-slate-400">
            Track daily meals, deposits, automatic balance deduction, and remaining meal days
          </p>
        </div>

        {/* Mode Switcher */}
        <div className="flex items-center gap-2 bg-slate-900 p-1.5 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => updateMealSettings({ mode: 'fixed' })}
            className={`px-3 py-1.5 rounded-lg font-semibold transition ${
              mode === 'fixed' ? 'bg-indigo-600 text-white' : 'text-slate-400'
            }`}
          >
            Fixed Rate / Mess System
          </button>
          <button
            onClick={() => updateMealSettings({ mode: 'package' })}
            className={`px-3 py-1.5 rounded-lg font-semibold transition ${
              mode === 'package' ? 'bg-indigo-600 text-white' : 'text-slate-400'
            }`}
          >
            Monthly Package Mode
          </button>
        </div>
      </div>

      {/* Top Summary Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5">
          <span className="text-xs text-slate-400">মোট জমা (Total Deposited)</span>
          <p className="text-2xl font-black text-emerald-400 mt-1">
            ৳{stats.totalDeposited.toLocaleString()}
          </p>
          <span className="text-[11px] text-slate-500">
            Across {deposits.length} deposit(s)
          </span>
        </div>

        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5">
          <span className="text-xs text-slate-400">মোট খাওয়া মিল (Total Meals)</span>
          <p className="text-2xl font-black text-cyan-400 mt-1">
            {stats.totalMealsEaten} <span className="text-sm font-normal">Meals</span>
          </p>
          <span className="text-[11px] text-slate-500">
            Total Cost: ৳{stats.totalCost.toLocaleString()} (@ ৳{ratePerMeal}/meal)
          </span>
        </div>

        <div
          className={`rounded-2xl p-5 border ${
            stats.remainingBalance < 200
              ? 'bg-rose-950/30 border-rose-500/40'
              : 'bg-slate-900/70 border-slate-800'
          }`}
        >
          <span className="text-xs text-slate-400">বর্তমান ব্যালেন্স (Remaining Balance)</span>
          <p
            className={`text-2xl font-black mt-1 ${
              stats.remainingBalance < 0 ? 'text-rose-400' : 'text-white'
            }`}
          >
            {stats.remainingBalance < 0 ? '-' : ''}৳
            {Math.abs(stats.remainingBalance).toLocaleString()}
          </p>
          <span className="text-[11px] text-amber-400 font-medium">
            {stats.remainingBalance < 0
              ? '⚠️ বকেয়া (Due Balance - Deposit Needed)'
              : '✅ অ্যাডভান্স জমা আছে'}
          </span>
        </div>

        <div className="bg-gradient-to-br from-indigo-950/60 to-slate-900 border border-indigo-500/30 rounded-2xl p-5">
          <span className="text-xs text-indigo-300 font-semibold">
            {mode === 'fixed' ? 'আর কত মিল / দিন বাকি?' : 'প্যাকেজের বাকি মিল'}
          </span>
          <p className="text-2xl font-black text-white mt-1">
            {mode === 'fixed'
              ? `${Math.max(0, stats.remainingMealsByBalance)} টি মিল`
              : `${stats.packageRemaining} টি মিল`}
          </p>
          <span className="text-[11px] text-cyan-300">
            প্রায় ~{stats.estDaysLeft} দিন খাওয়া যাবে
          </span>
        </div>
      </div>

      {/* Main Controls: Daily Meal Logger + Deposit & Rate Config */}
      <div className="grid lg:grid-cols-12 gap-6">
        {/* Daily Meal Logger */}
        <div className="lg:col-span-7 bg-slate-900/70 border border-slate-800 rounded-2xl p-5 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <h3 className="font-bold text-base">প্রতিদিনের মিল এন্ট্রি (Daily Meal Logger)</h3>
              <p className="text-xs text-slate-400">
                Select date and tap how many meals you had today
              </p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-cyan-300 font-semibold"
              />
              <button
                onClick={handleQuickFullDay}
                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white"
              >
                1-Click All Done (1+1+1)
              </button>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { key: 'breakfast', label: 'সকাল (Breakfast)', options: [0, 0.5, 1, 2] },
              { key: 'lunch', label: 'দুপুর (Lunch)', options: [0, 1, 2, 3] },
              { key: 'dinner', label: 'রাত (Dinner)', options: [0, 0.5, 1, 2] },
              { key: 'guest', label: 'গেস্ট মিল (Guest/Extra)', options: [0, 1, 2, 3, 4] }
            ].map((item) => (
              <div
                key={item.key}
                className="p-4 rounded-xl bg-slate-950 border border-slate-800/90 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200">{item.label}</span>
                  <span className="text-xs font-mono text-cyan-400">
                    Selected: {currentLog[item.key] || 0}
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
                        className={`py-2 rounded-lg text-xs font-bold transition ${
                          active
                            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                            : 'bg-slate-900 text-slate-400 hover:text-white'
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
          <div className="p-4 rounded-xl bg-indigo-950/30 border border-indigo-500/30 flex flex-wrap items-center justify-between gap-2 text-xs">
            <span>
              <strong>{selectedDate}</strong> তারিখে মোট মিল:{' '}
              <strong className="text-cyan-300">
                {Number(currentLog.breakfast || 0) +
                  Number(currentLog.lunch || 0) +
                  Number(currentLog.dinner || 0) +
                  Number(currentLog.guest || 0)}{' '}
                টি
              </strong>
            </span>
            <span>
              দিনের খরচ:{' '}
              <strong className="text-emerald-400">
                ৳
                {(
                  (Number(currentLog.breakfast || 0) +
                    Number(currentLog.lunch || 0) +
                    Number(currentLog.dinner || 0) +
                    Number(currentLog.guest || 0)) *
                  ratePerMeal
                ).toLocaleString()}
              </strong>
            </span>
          </div>

          {/* Calendar Log Table */}
          <div className="pt-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
              Recent Meal History Log
            </h4>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {Object.entries(logs)
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
                      onClick={() => setSelectedDate(dateKey)}
                      className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs cursor-pointer hover:border-indigo-500/50"
                    >
                      <span className="font-mono text-slate-300">{dateKey}</span>
                      <div className="flex items-center gap-3 text-slate-400">
                        <span>সকাল: {d.breakfast}</span>
                        <span>দুপুর: {d.lunch}</span>
                        <span>রাত: {d.dinner}</span>
                        {d.guest > 0 && <span className="text-amber-400">গেস্ট: {d.guest}</span>}
                      </div>
                      <span className="font-bold text-cyan-400">
                        {dayTotal} মিল (৳{dayTotal * ratePerMeal})
                      </span>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>

        {/* Right Column: Deposit Money & Meal Rate Settings */}
        <div className="lg:col-span-5 space-y-6">
          {/* Meal Rate Config */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 space-y-3">
            <h3 className="font-bold text-sm flex items-center gap-2">
              <Calculator className="w-4 h-4 text-indigo-400"/>
              <span>মিল রেট ও প্যাকেজ সেটিংস</span>
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">
                  প্রতি মিলের দাম (Rate Per Meal ৳)
                </label>
                <input
                  type="number"
                  value={ratePerMeal}
                  onChange={(e) => updateMealSettings({ ratePerMeal: Number(e.target.value) })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm font-bold text-emerald-400"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">
                  মাসিক প্যাকেজ মিল সংখ্যা
                </label>
                <input
                  type="number"
                  value={packageTotalMeals}
                  onChange={(e) =>
                    updateMealSettings({ packageTotalMeals: Number(e.target.value) })
                  }
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm font-bold text-cyan-400"
                />
              </div>
            </div>
          </div>

          {/* Add Meal Deposit */}
          <form
            onSubmit={handleDepositSubmit}
            className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 space-y-3">
            <h3 className="font-bold text-sm flex items-center gap-2">
              <Coins className="w-4 h-4 text-emerald-400"/>
              <span>নতুন মিলের টাকা জমা দিন (Add Deposit)</span>
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">জমার পরিমাণ (৳) *</label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 1500"
                  value={depAmount}
                  onChange={(e) => setDepAmount(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm font-bold text-white"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">জমা দেওয়ার তারিখ</label>
                <input
                  type="date"
                  value={depDate}
                  onChange={(e) => setDepDate(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200"
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
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200"
              >
                <option value="cash">Hand Cash থেকে কাটবে</option>
                <option value="bkash">bKash থেকে কাটবে</option>
                <option value="nagad">Nagad থেকে কাটবে</option>
                <option value="bank">Bank Account থেকে কাটবে</option>
                <option value="none">ওয়ালেট থেকে কাটবে না (শুধু মিলের হিসাবে যোগ হবে)</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">নোট (কার কাছে জমা দিলেন)</label>
              <input
                type="text"
                placeholder="e.g. Hall Manager / Mess Deposit"
                value={depNote}
                onChange={(e) => setDepNote(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white"
            >
              + মিলের টাকা জমা করুন
            </button>
          </form>

          {/* Deposit History */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <History className="w-3.5 h-3.5 text-cyan-400"/>
              <span>টাকা জমার ইতিহাস (Deposit History)</span>
            </h4>
            <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
              {deposits.map((dep) => (
                <div
                  key={dep.id}
                  className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
                >
                  <div>
                    <p className="font-semibold text-slate-200">{dep.note}</p>
                    <span className="text-[10px] text-slate-500">{dep.date}</span>
                  </div>
                  <span className="font-bold text-emerald-400">
                    +৳{Number(dep.amount).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
