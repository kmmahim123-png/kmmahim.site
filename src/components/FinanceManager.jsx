import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOS } from '../context/OSContext';
import { AnimatedCounter, TiltCard, CircularFinanceDonut } from './common/MotionKit';
import { SoundFX } from './common/SoundEffects';
import {
  Wallet, PlusCircle, CheckCircle2, PieChart, Landmark, Smartphone,
  Banknote, Users, Pencil, Check, X, Trash2, ArrowRightLeft, RotateCcw, Sparkles
} from 'lucide-react';

export default function FinanceManager() {
  const {
    data,
    setWalletBalance,
    transferBetweenWallets,
    addTransaction,
    deleteTransaction,
    addDebt,
    toggleDebtSettled,
    deleteDebt,
    resetFinanceData,
    hasDemoData
  } = useOS();

  const { wallets, transactions, debts } = data.finance;

  // Direct Wallet Edit State
  const [editingWallet, setEditingWallet] = useState(null);
  const [editValue, setEditValue] = useState('');

  // Form Mode: 'out' | 'in' | 'transfer'
  const [txMode, setTxMode] = useState('out');
  const [amount, setAmount] = useState('');
  const [wallet, setWallet] = useState('bkash');
  const [toWallet, setToWallet] = useState('cash');
  const [category, setCategory] = useState('Food & Meal');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [timeFilter, setTimeFilter] = useState('all'); // 'today' | 'week' | 'month' | 'all'

  // Debt Form State
  const [person, setPerson] = useState('');
  const [debtType, setDebtType] = useState('receivable');
  const [debtAmount, setDebtAmount] = useState('');
  const [debtNote, setDebtNote] = useState('');

  // Confirm Reset
  const [confirmReset, setConfirmReset] = useState(false);

  const totalBalance = Object.values(wallets).reduce((sum, val) => sum + Number(val || 0), 0);

  const filteredTransactions = useMemo(() => {
    const todayStr = new Date().toISOString().slice(0, 10);
    const now = new Date();

    return transactions.filter((tx) => {
      if (timeFilter === 'today') return tx.date === todayStr;
      if (timeFilter === 'week') {
        const txDate = new Date(tx.date);
        const diffDays = (now - txDate) / (1000 * 60 * 60 * 24);
        return diffDays <= 7;
      }
      if (timeFilter === 'month') {
        return tx.date.slice(0, 7) === todayStr.slice(0, 7);
      }
      return true;
    });
  }, [transactions, timeFilter]);

  const totalIn = filteredTransactions
    .filter((t) => t.type === 'in' && t.category !== 'Wallet Transfer')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalOut = filteredTransactions
    .filter((t) => t.type === 'out' && t.category !== 'Wallet Transfer')
    .reduce((sum, t) => sum + t.amount, 0);

  const categoryBreakdown = useMemo(() => {
    const map = {};
    filteredTransactions
      .filter((t) => t.type === 'out' && t.category !== 'Wallet Transfer')
      .forEach((t) => {
        map[t.category] = (map[t.category] || 0) + t.amount;
      });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [filteredTransactions]);

  const handleStartEditWallet = (key, currentVal) => {
    SoundFX.click();
    setEditingWallet(key);
    setEditValue(String(currentVal || 0));
  };

  const handleSaveWallet = (key) => {
    SoundFX.success();
    setWalletBalance(key, Number(editValue));
    setEditingWallet(null);
  };

  const handleAddTx = (e) => {
    e.preventDefault();
    if (!amount) return;
    SoundFX.success();
    if (txMode === 'transfer') {
      transferBetweenWallets({
        fromWallet: wallet,
        toWallet,
        amount,
        note
      });
    } else {
      addTransaction({ type: txMode, amount, wallet, category, note, date });
    }
    setAmount('');
    setNote('');
  };

  const handleAddDebt = (e) => {
    e.preventDefault();
    if (!person || !debtAmount) return;
    SoundFX.success();
    addDebt({ person, type: debtType, amount: debtAmount, note: debtNote });
    setPerson('');
    setDebtAmount('');
    setDebtNote('');
  };

  const handleResetAll = () => {
    if (!confirmReset) {
      SoundFX.click();
      setConfirmReset(true);
      setTimeout(() => setConfirmReset(false), 4000);
      return;
    }
    SoundFX.laser();
    resetFinanceData();
    setConfirmReset(false);
  };

  const walletMeta = [
    { key: 'cash', label: 'Hand Cash', icon: Banknote, color: 'from-emerald-500 to-teal-600' },
    { key: 'bkash', label: 'bKash Wallet', icon: Smartphone, color: 'from-pink-500 to-rose-600' },
    { key: 'nagad', label: 'Nagad Wallet', icon: Smartphone, color: 'from-amber-500 to-orange-600' },
    { key: 'bank', label: 'Bank Account', icon: Landmark, color: 'from-indigo-500 to-blue-600' }
  ];

  const categories = [
    'Food & Meal',
    'Transport & Varsity',
    'Gym & Fitness',
    'Study & Academic',
    'Business / JACKFRU',
    'Client Project',
    'Personal & Care',
    'Tech & AI APIs',
    'Other'
  ];

  const quickAmounts = [50, 100, 200, 500, 1000];

  return (
    <div className="space-y-6">
      {/* Demo Data Alert Banner */}
      {hasDemoData && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-rose-500/10 to-indigo-500/15 border border-amber-500/40 backdrop-blur-xl flex flex-wrap items-center justify-between gap-3"
        >
          <div className="flex items-center gap-3 text-xs">
            <Sparkles className="w-5 h-5 text-amber-400 shrink-0 animate-pulse" />
            <div>
              <strong className="text-amber-300 block text-sm">এগুলো আনুমানিক স্যাম্পল/ডেমো ডেটা!</strong>
              <span className="text-slate-300">
                আপনি চাইলে প্রতিটি কার্ডের <strong>✏️ পেন্সিল আইকনে</strong> ট্যাপ করে নিজের আসল টাকা বসাতে পারেন অথবা এক ক্লিকে সব ডেমো মুছে ০৳ থেকে শুরু করতে পারেন।
              </span>
            </div>
          </div>
          <button
            onClick={() => {
              SoundFX.laser();
              resetFinanceData();
            }}
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-rose-900/40 transition active:scale-95"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>সব ডেমো মুছে ০৳ করুন</span>
          </button>
        </motion.div>
      )}

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black flex items-center gap-2.5 text-white">
            <Wallet className="w-6 h-6 text-emerald-400" />
            <span>Money & Multi-Wallet Command</span>
          </h1>
          <p className="text-xs text-slate-400">
            ওয়ালেটের আসল টাকা এডিট করুন (✏️), খরচ লিখুন, অথবা bKash ⇄ Cash ট্রান্সফার করুন
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Time Filter */}
          <div className="flex items-center gap-1 glass-pill p-1 rounded-xl">
            {[
              { id: 'today', label: 'আজ' },
              { id: 'week', label: '৭ দিন' },
              { id: 'month', label: 'মাস' },
              { id: 'all', label: 'সব' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  SoundFX.click();
                  setTimeFilter(tab.id);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  timeFilter === tab.id
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Reset Button */}
          <button
            onClick={handleResetAll}
            className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition border ${
              confirmReset
                ? 'bg-rose-600 border-rose-400 text-white animate-pulse'
                : 'glass-pill text-rose-400 hover:bg-rose-500/20'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{confirmReset ? 'নিশ্চিত মুছবেন? (Click)' : 'Clear All (0৳)'}</span>
          </button>
        </div>
      </div>

      {/* Circular Donut + Editable Wallet Cards */}
      <div className="grid lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-5 flex flex-col">
          <CircularFinanceDonut
            totalBalance={totalBalance}
            totalIn={totalIn}
            totalOut={totalOut}
            categoryBreakdown={categoryBreakdown}
          />
        </div>

        <div className="lg:col-span-7 grid sm:grid-cols-2 gap-4">
          {walletMeta.map((w) => {
            const Icon = w.icon;
            const bal = wallets[w.key] || 0;
            const isEditing = editingWallet === w.key;

            return (
              <TiltCard
                key={w.key}
                maxTilt={5}
                className="glass-crystal-hover rounded-3xl p-5 flex flex-col justify-between relative overflow-hidden"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${w.color} flex items-center justify-center text-white shadow-md`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-xs text-slate-200 font-bold">{w.label}</span>
                  </div>

                  {/* Direct Balance Edit Button */}
                  {!isEditing ? (
                    <button
                      onClick={() => handleStartEditWallet(w.key, bal)}
                      title="Edit exact wallet balance"
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-indigo-500/30 border border-white/10 text-slate-300 hover:text-white transition"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleSaveWallet(w.key)}
                        className="p-1.5 rounded-lg bg-emerald-600 text-white"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setEditingWallet(null)}
                        className="p-1.5 rounded-lg bg-slate-800 text-slate-300"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="mt-4">
                  {isEditing ? (
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-cyan-400">৳</span>
                      <input
                        type="number"
                        autoFocus
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveWallet(w.key);
                          if (e.key === 'Escape') setEditingWallet(null);
                        }}
                        className="w-full px-3 py-1.5 rounded-xl glass-input text-lg font-bold text-white"
                      />
                    </div>
                  ) : (
                    <>
                      <span className="text-2xl sm:text-3xl font-black text-white font-mono">
                        ৳<AnimatedCounter value={bal} />
                      </span>
                      <span className="block text-[10px] text-cyan-400/80 mt-1 font-mono">
                        Tap ✏️ to set exact balance
                      </span>
                    </>
                  )}
                </div>
              </TiltCard>
            );
          })}
        </div>
      </div>

      {/* Add Transaction / Transfer + Breakdown */}
      <div className="grid lg:grid-cols-12 gap-6">
        {/* Form Card */}
        <form
          onSubmit={handleAddTx}
          className="lg:col-span-5 glass-crystal rounded-3xl p-5 space-y-4"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="font-bold text-sm flex items-center gap-2 text-white">
              <PlusCircle className="w-4 h-4 text-emerald-400" />
              <span>নতুন হিসাব এন্ট্রি করুন</span>
            </h3>

            {/* Mode Switcher */}
            <div className="flex glass-pill p-1 rounded-xl text-[11px]">
              <button
                type="button"
                onClick={() => {
                  SoundFX.click();
                  setTxMode('out');
                }}
                className={`px-2.5 py-1 rounded-lg font-bold transition ${
                  txMode === 'out' ? 'bg-rose-600 text-white' : 'text-slate-400'
                }`}
              >
                - খরচ
              </button>
              <button
                type="button"
                onClick={() => {
                  SoundFX.click();
                  setTxMode('in');
                }}
                className={`px-2.5 py-1 rounded-lg font-bold transition ${
                  txMode === 'in' ? 'bg-emerald-600 text-white' : 'text-slate-400'
                }`}
              >
                + আয়
              </button>
              <button
                type="button"
                onClick={() => {
                  SoundFX.click();
                  setTxMode('transfer');
                }}
                className={`px-2.5 py-1 rounded-lg font-bold transition flex items-center gap-1 ${
                  txMode === 'transfer' ? 'bg-indigo-600 text-white' : 'text-slate-400'
                }`}
              >
                <ArrowRightLeft className="w-3 h-3" />
                <span>ট্রান্সফার</span>
              </button>
            </div>
          </div>

          {/* Quick Amount Tap Chips */}
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-mono block mb-1.5">
              Quick Amount Tap:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {quickAmounts.map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => {
                    SoundFX.click();
                    setAmount(String((Number(amount) || 0) + amt));
                  }}
                  className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-indigo-500/30 border border-white/10 text-[11px] font-bold text-cyan-300 transition active:scale-95"
                >
                  +৳{amt}
                </button>
              ))}
              {amount && (
                <button
                  type="button"
                  onClick={() => setAmount('')}
                  className="px-2 py-1 rounded-lg bg-rose-500/10 text-[11px] text-rose-400"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">টাকার পরিমাণ (৳) *</label>
              <input
                type="number"
                required
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm font-bold"
              />
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">
                {txMode === 'transfer' ? 'কোন ওয়ালেট থেকে (From)' : 'কোন ওয়ালেট?'}
              </label>
              <select
                value={wallet}
                onChange={(e) => setWallet(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs"
              >
                <option value="cash" className="bg-slate-900">Hand Cash</option>
                <option value="bkash" className="bg-slate-900">bKash</option>
                <option value="nagad" className="bg-slate-900">Nagad</option>
                <option value="bank" className="bg-slate-900">Bank Account</option>
              </select>
            </div>
          </div>

          {txMode === 'transfer' ? (
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">কোন ওয়ালেটে যাবে (To Wallet)</label>
              <select
                value={toWallet}
                onChange={(e) => setToWallet(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs"
              >
                <option value="cash" className="bg-slate-900">Hand Cash</option>
                <option value="bkash" className="bg-slate-900">bKash</option>
                <option value="nagad" className="bg-slate-900">Nagad</option>
                <option value="bank" className="bg-slate-900">Bank Account</option>
              </select>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">খাত / ক্যাটাগরি</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs"
                >
                  {categories.map((c) => (
                    <option key={c} value={c} className="bg-slate-900">{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">তারিখ</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs"
                />
              </div>
            </div>
          )}

          <div>
            <label className="text-[11px] text-slate-400 block mb-1">নোট / বিবরণ</label>
            <input
              type="text"
              placeholder={txMode === 'transfer' ? 'e.g. Cash out from bKash' : 'কী কাজে খরচ বা আয় হলো?'}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs"
            />
          </div>

          <button
            type="submit"
            className={`w-full py-3 rounded-xl font-bold text-xs text-white transition active:scale-95 shadow-lg ${
              txMode === 'in'
                ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-900/40'
                : txMode === 'transfer'
                ? 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-900/40'
                : 'bg-rose-600 hover:bg-rose-500 shadow-rose-900/40'
            }`}
          >
            {txMode === 'in'
              ? '+ ওয়ালেটে টাকা যোগ করুন'
              : txMode === 'transfer'
              ? '⇄ ওয়ালেট ট্রান্সফার সম্পন্ন করুন'
              : '- খরচ সেভ করুন'}
          </button>
        </form>

        {/* Breakdown & History with Delete Buttons */}
        <div className="lg:col-span-7 glass-crystal rounded-3xl p-5 flex flex-col justify-between space-y-5">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-sm flex items-center gap-2 text-white">
                <PieChart className="w-4 h-4 text-cyan-400" />
                <span>খরচের বিশ্লেষণ (Category Breakdown)</span>
              </h3>
              <span className="text-xs text-slate-400">
                মোট খরচ: <strong className="text-rose-400 font-mono">৳{totalOut.toLocaleString()}</strong>
              </span>
            </div>

            {categoryBreakdown.length === 0 ? (
              <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 text-center text-xs text-slate-400">
                এই সময়ে কোনো খরচ রেকর্ড করা হয়নি। বাম পাশ থেকে প্রথম খরচ যোগ করুন!
              </div>
            ) : (
              <div className="space-y-2.5">
                {categoryBreakdown.map(([cat, val]) => {
                  const pct = totalOut > 0 ? Math.round((val / totalOut) * 100) : 0;
                  return (
                    <div key={cat} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-200 font-medium">{cat}</span>
                        <span className="text-slate-400 font-mono">
                          ৳{val.toLocaleString()} ({pct}%)
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-950/80 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.7 }}
                          className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-full"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Transaction Log with Delete Button */}
          <div className="border-t border-white/10 pt-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
              লেনদেনের তালিকা ({filteredTransactions.length})
            </h4>
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {filteredTransactions.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-4">কোনো লেনদেন নেই</p>
              ) : (
                <AnimatePresence>
                  {filteredTransactions.map((tx) => (
                    <motion.div
                      key={tx.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/60 border border-white/5 hover:border-white/15 text-xs transition group"
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold ${
                            tx.type === 'in'
                              ? 'bg-emerald-500/15 text-emerald-400'
                              : 'bg-rose-500/15 text-rose-400'
                          }`}
                        >
                          {tx.type === 'in' ? '+' : '-'}
                        </span>
                        <div>
                          <p className="font-bold text-slate-100">
                            {tx.note || tx.category}
                          </p>
                          <span className="text-[10px] text-slate-400 uppercase font-mono">
                            {tx.wallet} • {tx.category} • {tx.date}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span
                          className={`font-black font-mono ${
                            tx.type === 'in' ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {tx.type === 'in' ? '+' : '-'}৳{tx.amount.toLocaleString()}
                        </span>
                        <button
                          onClick={() => {
                            SoundFX.click();
                            deleteTransaction(tx.id, true);
                          }}
                          title="Delete transaction & revert balance"
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-rose-600 text-slate-400 hover:text-white transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Debt & Loan Tracker (কে পাবে / কার কাছে পাবো) */}
      <div className="glass-crystal rounded-3xl p-5 space-y-4">
        <div>
          <h3 className="font-bold text-sm flex items-center gap-2 text-white">
            <Users className="w-4 h-4 text-amber-400" />
            <span>ধার ও বাকি হিসাব (আমি পাবো / আমার কাছে পাবে)</span>
          </h3>
          <p className="text-xs text-slate-400">
            বন্ধু বা দোকানের বাকি হিসাব রাখুন এবং পরিশোধ হলে মুছে ফেলুন বা Settled করুন
          </p>
        </div>

        <form onSubmit={handleAddDebt} className="grid sm:grid-cols-5 gap-3 pt-1">
          <input
            type="text"
            placeholder="ব্যক্তি বা দোকানের নাম *"
            value={person}
            onChange={(e) => setPerson(e.target.value)}
            className="px-3.5 py-2.5 rounded-xl glass-input text-xs"
          />
          <select
            value={debtType}
            onChange={(e) => setDebtType(e.target.value)}
            className="px-3.5 py-2.5 rounded-xl glass-input text-xs"
          >
            <option value="receivable" className="bg-slate-900">আমি টাকা পাবো</option>
            <option value="payable" className="bg-slate-900">আমার কাছে পাবে</option>
          </select>
          <input
            type="number"
            placeholder="পরিমাণ (৳) *"
            value={debtAmount}
            onChange={(e) => setDebtAmount(e.target.value)}
            className="px-3.5 py-2.5 rounded-xl glass-input text-xs"
          />
          <input
            type="text"
            placeholder="নোট বা তারিখ"
            value={debtNote}
            onChange={(e) => setDebtNote(e.target.value)}
            className="px-3.5 py-2.5 rounded-xl glass-input text-xs"
          />
          <button
            type="submit"
            className="py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white transition active:scale-95"
          >
            + হিসাব যোগ করুন
          </button>
        </form>

        <div className="grid md:grid-cols-2 gap-3 pt-2">
          {debts.length === 0 ? (
            <p className="text-xs text-slate-500 col-span-2 py-2">কোনো ধার বা বাকি হিসাব নেই।</p>
          ) : (
            debts.map((d) => (
              <div
                key={d.id}
                className={`p-3.5 rounded-2xl border flex items-center justify-between transition ${
                  d.settled
                    ? 'bg-slate-950/30 border-white/5 opacity-55'
                    : 'bg-slate-950/70 border-white/10'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-white">{d.person}</span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                        d.type === 'receivable'
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                      }`}
                    >
                      {d.type === 'receivable' ? 'আমি পাবো' : 'আমার কাছে পাবে'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">{d.note || d.dueDate}</p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-white font-mono">৳{d.amount.toLocaleString()}</span>
                  <button
                    onClick={() => {
                      SoundFX.click();
                      toggleDebtSettled(d.id);
                    }}
                    className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition ${
                      d.settled
                        ? 'bg-slate-800 text-slate-400'
                        : 'bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600 hover:text-white'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{d.settled ? 'Settled' : 'Done'}</span>
                  </button>
                  <button
                    onClick={() => {
                      SoundFX.click();
                      deleteDebt(d.id);
                    }}
                    title="Delete record"
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
  );
}
