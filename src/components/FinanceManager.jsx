import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOS } from '../context/OSContext';
import {
  getLocalDateStr,
  getLocalMonthStr,
  getLocalYearStr,
  diffCalendarDays
} from '../utils/dateUtils';
import { AnimatedCounter, TiltCard, CircularFinanceDonut } from './common/MotionKit';
import SafeDeleteModal from './common/SafeDeleteModal';
import { SoundFX } from './common/SoundEffects';
import {
  Wallet, PlusCircle, CheckCircle2, Landmark, Smartphone,
  Banknote, Users, Pencil, Check, X, Trash2, ArrowRightLeft,
  Calendar as CalendarIcon, List, TrendingUp, ChevronLeft, ChevronRight,
  Gauge, Repeat
} from 'lucide-react';

export default function FinanceManager() {
  const {
    data,
    setWalletBalance,
    transferBetweenWallets,
    addTransaction,
    deleteTransaction,
    setCategoryBudget,
    addRecurringBill,
    logRecurringBill,
    deleteRecurringBill,
    addDebt,
    toggleDebtSettled,
    deleteDebt,
    resetFinanceData
  } = useOS();

  const { wallets, transactions, debts } = data.finance;
  const budgets = data.budgets || {};
  const recurringBills = data.recurringBills || [];

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
  const [date, setDate] = useState(getLocalDateStr());
  const [timeFilter, setTimeFilter] = useState('all'); // 'today' | 'week' | 'month' | 'year' | 'all'

  // History View Mode: 'list' | 'calendar'
  const [historyView, setHistoryView] = useState('list');
  const [calendarMonth, setCalendarMonth] = useState(() => getLocalMonthStr()); // YYYY-MM
  const [selectedCalDate, setSelectedCalDate] = useState(null);

  // Debt Form State
  const [person, setPerson] = useState('');
  const [debtType, setDebtType] = useState('receivable');
  const [debtAmount, setDebtAmount] = useState('');
  const [debtNote, setDebtNote] = useState('');

  // Budget & Recurring Bill Form State
  const [billTitle, setBillTitle] = useState('');
  const [billAmount, setBillAmount] = useState('');
  const [billWallet, setBillWallet] = useState('bkash');
  const [budgetCat, setBudgetCat] = useState('Food & Meal');
  const [budgetLimit, setBudgetLimit] = useState('');

  // Protected Safe Delete Modal
  const [showResetModal, setShowResetModal] = useState(false);

  const totalBalance = Object.values(wallets).reduce((sum, val) => sum + Number(val || 0), 0);
  const todayStr = getLocalDateStr();
  const currentMonthStr = getLocalMonthStr();
  const currentYearStr = getLocalYearStr();

  // Compute Simultaneous All-Horizon Stats (Today, Week, Month, Year) using local date diff
  const horizonStats = useMemo(() => {
    const res = {
      today: { in: 0, out: 0 },
      week: { in: 0, out: 0 },
      month: { in: 0, out: 0 },
      year: { in: 0, out: 0 }
    };

    transactions.forEach((tx) => {
      if (tx.category === 'Wallet Transfer') return;
      const amt = Number(tx.amount || 0);
      const isIncome = tx.type === 'in';
      const diffDays = diffCalendarDays(todayStr, tx.date);

      if (tx.date === todayStr) {
        if (isIncome) res.today.in += amt;
        else res.today.out += amt;
      }
      if (diffDays >= 0 && diffDays <= 7) {
        if (isIncome) res.week.in += amt;
        else res.week.out += amt;
      }
      if (tx.date.slice(0, 7) === currentMonthStr) {
        if (isIncome) res.month.in += amt;
        else res.month.out += amt;
      }
      if (tx.date.slice(0, 4) === currentYearStr) {
        if (isIncome) res.year.in += amt;
        else res.year.out += amt;
      }
    });

    return res;
  }, [transactions, todayStr, currentMonthStr, currentYearStr]);

  const monthCategorySpending = useMemo(() => {
    const map = {};
    transactions
      .filter((t) => t.type === 'out' && t.category !== 'Wallet Transfer' && t.date.startsWith(currentMonthStr))
      .forEach((t) => {
        map[t.category] = (map[t.category] || 0) + Number(t.amount || 0);
      });
    return map;
  }, [transactions, currentMonthStr]);

  // Yearly Income Source Breakdown
  const yearlyIncomeSources = useMemo(() => {
    const map = {};
    transactions
      .filter((t) => t.type === 'in' && t.category !== 'Wallet Transfer' && t.date.slice(0, 4) === currentYearStr)
      .forEach((t) => {
        map[t.category] = (map[t.category] || 0) + t.amount;
      });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [transactions, currentYearStr]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      if (selectedCalDate) return tx.date === selectedCalDate;
      if (timeFilter === 'today') return tx.date === todayStr;
      if (timeFilter === 'week') {
        const diffDays = diffCalendarDays(todayStr, tx.date);
        return diffDays >= 0 && diffDays <= 7;
      }
      if (timeFilter === 'month') return tx.date.slice(0, 7) === currentMonthStr;
      if (timeFilter === 'year') return tx.date.slice(0, 4) === currentYearStr;
      return true;
    });
  }, [transactions, timeFilter, selectedCalDate, todayStr, currentMonthStr, currentYearStr]);

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

  // Calendar grid generation for calendarMonth (YYYY-MM)
  const calendarDays = useMemo(() => {
    const [yr, mo] = calendarMonth.split('-').map(Number);
    const firstDay = new Date(yr, mo - 1, 1);
    const daysInMonth = new Date(yr, mo, 0).getDate();
    const startWeekday = firstDay.getDay(); // 0=Sun..6=Sat

    const dayTotals = {};
    transactions.forEach((tx) => {
      if (!tx.date.startsWith(calendarMonth) || tx.category === 'Wallet Transfer') return;
      if (!dayTotals[tx.date]) dayTotals[tx.date] = { in: 0, out: 0 };
      if (tx.type === 'in') dayTotals[tx.date].in += tx.amount;
      else dayTotals[tx.date].out += tx.amount;
    });

    const cells = [];
    for (let i = 0; i < startWeekday; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) {
      const dateKey = `${calendarMonth}-${String(d).padStart(2, '0')}`;
      cells.push({
        day: d,
        dateKey,
        stats: dayTotals[dateKey] || null
      });
    }
    return cells;
  }, [calendarMonth, transactions]);

  const shiftCalendarMonth = (offset) => {
    const [yr, mo] = calendarMonth.split('-').map(Number);
    const d = new Date(yr, mo - 1 + offset, 1);
    const nextStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    setCalendarMonth(nextStr);
    setSelectedCalDate(null);
  };

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

  const walletMeta = [
    { key: 'cash', label: 'Hand Cash', icon: Banknote, color: 'from-emerald-500 to-teal-600' },
    { key: 'bkash', label: 'bKash Wallet', icon: Smartphone, color: 'from-pink-500 to-rose-600' },
    { key: 'nagad', label: 'Nagad Wallet', icon: Smartphone, color: 'from-amber-500 to-orange-600' },
    { key: 'bank', label: 'Bank Account', icon: Landmark, color: 'from-indigo-500 to-blue-600' }
  ];

  const expenseCategories = [
    'Food & Meal',
    'Transport & Varsity',
    'Gym & Fitness',
    'Study & Academic',
    'Business / JACKFRU',
    'Personal & Care',
    'Tech & AI APIs',
    'Other'
  ];

  const incomeCategories = [
    'Client Project',
    'Business / JACKFRU',
    'Freelance / Coding',
    'Family / Allowance',
    'Investment / Profit',
    'Other Income'
  ];

  const activeCategories = txMode === 'in' ? incomeCategories : expenseCategories;
  const quickAmounts = [50, 100, 200, 500, 1000];

  return (
    <div className="space-y-6">
      {/* Protected Reset Finance Modal */}
      <SafeDeleteModal
        isOpen={showResetModal}
        onClose={() => setShowResetModal(false)}
        onConfirm={() => resetFinanceData()}
        title="ফাইন্যান্স ডেটা রিসেট (০৳)"
        description="আপনি কি আসলেই সব ওয়ালেট ব্যালেন্স ০৳ করতে এবং সকল লেনদেন ও ধারের হিসাব ডিলিট করতে চান?"
      />

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black flex items-center gap-2.5 text-white">
            <Wallet className="w-6 h-6 text-emerald-400" />
            <span>Money & Timeline Ledger</span>
          </h1>
          <p className="text-xs text-slate-400">
            আজকের তারিখ: <span className="text-cyan-400 font-mono">{todayStr}</span> • দৈনিক, সাপ্তাহিক, মাসিক ও বার্ষিক আয়-ব্যয় ট্র্যাকার
          </p>
        </div>

        {/* Time Filter */}
        <div className="flex flex-wrap items-center gap-1 glass-pill p-1 rounded-xl">
          {[
            { id: 'today', label: 'আজ' },
            { id: 'week', label: 'সপ্তাহ' },
            { id: 'month', label: 'মাস' },
            { id: 'year', label: 'বছর' },
            { id: 'all', label: 'সব' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                SoundFX.click();
                setSelectedCalDate(null);
                setTimeFilter(tab.id);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                timeFilter === tab.id && !selectedCalDate
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ALL-IN-ONE TIME HORIZON MATRIX (Today / Week / Month / Year at a glance) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { key: 'today', title: `📅 আজ (${todayStr})`, stats: horizonStats.today, color: 'text-cyan-300' },
          { key: 'week', title: '📆 এই সপ্তাহ (৭ দিন)', stats: horizonStats.week, color: 'text-indigo-300' },
          { key: 'month', title: `🗓️ এই মাস (${currentMonthStr})`, stats: horizonStats.month, color: 'text-emerald-300' },
          { key: 'year', title: `📊 এই বছর (${currentYearStr})`, stats: horizonStats.year, color: 'text-amber-300' }
        ].map((item) => (
          <div
            key={item.key}
            onClick={() => {
              SoundFX.click();
              setSelectedCalDate(null);
              setTimeFilter(item.key);
            }}
            className={`glass-crystal rounded-2xl p-4 cursor-pointer transition hover:border-white/25 ${
              timeFilter === item.key && !selectedCalDate ? 'border-indigo-500/60 bg-indigo-950/20' : ''
            }`}
          >
            <span className={`text-[11px] font-bold block mb-2 ${item.color}`}>{item.title}</span>
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-emerald-400">+৳{item.stats.in.toLocaleString()}</span>
              <span className="text-rose-400">-৳{item.stats.out.toLocaleString()}</span>
            </div>
          </div>
        ))}
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

      {/* Add Transaction / Transfer + Breakdown & Calendar */}
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

            <div className="flex glass-pill p-1 rounded-xl text-[11px]">
              <button
                type="button"
                onClick={() => {
                  SoundFX.click();
                  setTxMode('out');
                  setCategory(expenseCategories[0]);
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
                  setCategory(incomeCategories[0]);
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
                {txMode === 'transfer' ? 'কোন ওয়ালেট থেকে' : 'কোন ওয়ালেট?'}
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
              <label className="text-[11px] text-slate-400 block mb-1">কোন ওয়ালেটে যাবে (To)</label>
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
                <label className="text-[11px] text-slate-400 block mb-1">
                  {txMode === 'in' ? 'ইনকাম সোর্স (Source)' : 'খরচের খাত (Category)'}
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs"
                >
                  {activeCategories.map((c) => (
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
              placeholder={txMode === 'transfer' ? 'e.g. bKash Cash Out' : 'কী কাজে বা কোথা থেকে?'}
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
              ? '+ ইনকাম / জমা সেভ করুন'
              : txMode === 'transfer'
              ? '⇄ ট্রান্সফার সম্পন্ন করুন'
              : '- খরচ সেভ করুন'}
          </button>
        </form>

        {/* Right: History List / Visual Calendar + Category / Income Source Reports */}
        <div className="lg:col-span-7 glass-crystal rounded-3xl p-5 flex flex-col justify-between space-y-5">
          {/* Sub-Header with List / Calendar View Toggle */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <span>
                {selectedCalDate
                  ? `📅 ${selectedCalDate} এর লেনদেন`
                  : `লেনদেনের ইতিহাস (${filteredTransactions.length})`}
              </span>
              {selectedCalDate && (
                <button
                  onClick={() => setSelectedCalDate(null)}
                  className="px-2 py-0.5 rounded bg-white/10 text-[10px] text-cyan-300 hover:bg-white/20"
                >
                  Clear Date
                </button>
              )}
            </h4>

            <div className="flex items-center gap-1 glass-pill p-1 rounded-xl text-[11px]">
              <button
                onClick={() => {
                  SoundFX.click();
                  setHistoryView('list');
                }}
                className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 transition ${
                  historyView === 'list' ? 'bg-indigo-600 text-white' : 'text-slate-400'
                }`}
              >
                <List className="w-3 h-3" />
                <span>List</span>
              </button>
              <button
                onClick={() => {
                  SoundFX.click();
                  setHistoryView('calendar');
                }}
                className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 transition ${
                  historyView === 'calendar' ? 'bg-indigo-600 text-white' : 'text-slate-400'
                }`}
              >
                <CalendarIcon className="w-3 h-3" />
                <span>Calendar</span>
              </button>
            </div>
          </div>

          {/* Interactive Monthly Calendar View */}
          {historyView === 'calendar' && (
            <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => shiftCalendarMonth(-1)}
                  className="p-1 rounded-lg glass-pill hover:bg-white/10 text-slate-300"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs font-bold font-mono text-cyan-300">{calendarMonth}</span>
                <button
                  onClick={() => shiftCalendarMonth(1)}
                  className="p-1 rounded-lg glass-pill hover:bg-white/10 text-slate-300"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-mono text-slate-500">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                  <div key={d}>{d}</div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((cell, idx) => {
                  if (!cell) return <div key={idx} className="h-12 rounded-xl" />;
                  const isSelected = selectedCalDate === cell.dateKey;
                  const isToday = cell.dateKey === todayStr;

                  return (
                    <button
                      key={cell.dateKey}
                      onClick={() => {
                        SoundFX.click();
                        setSelectedCalDate(isSelected ? null : cell.dateKey);
                      }}
                      className={`h-12 p-1 rounded-xl border text-left flex flex-col justify-between transition ${
                        isSelected
                          ? 'bg-indigo-600/40 border-indigo-400 text-white'
                          : isToday
                          ? 'bg-cyan-950/40 border-cyan-500/40 text-cyan-200'
                          : 'bg-white/[0.02] border-white/5 hover:border-white/20 text-slate-300'
                      }`}
                    >
                      <span className="text-[10px] font-bold leading-none">{cell.day}</span>
                      {cell.stats && (
                        <div className="text-[8px] font-mono leading-tight truncate">
                          {cell.stats.in > 0 && <span className="text-emerald-400 block">+{cell.stats.in}</span>}
                          {cell.stats.out > 0 && <span className="text-rose-400 block">-{cell.stats.out}</span>}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Transactions List */}
          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {filteredTransactions.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-4">কোনো লেনদেন পাওয়া যায়নি।</p>
            ) : (
              <AnimatePresence>
                {filteredTransactions.map((tx) => (
                  <motion.div
                    key={tx.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/60 border border-white/5 hover:border-white/15 text-xs transition"
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
                        <p className="font-bold text-slate-100">{tx.note || tx.category}</p>
                        <span className="text-[10px] text-slate-400 uppercase font-mono">
                          {tx.wallet} • {tx.category} • {tx.date}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`font-black font-mono ${tx.type === 'in' ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {tx.type === 'in' ? '+' : '-'}৳{tx.amount.toLocaleString()}
                      </span>
                      <button
                        onClick={() => {
                          SoundFX.click();
                          deleteTransaction(tx.id, true);
                        }}
                        title="Delete transaction"
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

          {/* Yearly Income Source Breakdown */}
          <div className="border-t border-white/10 pt-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-xs flex items-center gap-2 text-emerald-400">
                <TrendingUp className="w-4 h-4" />
                <span>এই বছরের ({currentYearStr}) আয়ের উৎসসমূহ</span>
              </h3>
              <span className="text-xs font-mono text-emerald-300 font-bold">
                Total: ৳{horizonStats.year.in.toLocaleString()}
              </span>
            </div>

            {yearlyIncomeSources.length === 0 ? (
              <p className="text-[11px] text-slate-500">এই বছর এখনো কোনো ইনকাম রেকর্ড করা হয়নি।</p>
            ) : (
              <div className="grid sm:grid-cols-2 gap-2.5">
                {yearlyIncomeSources.map(([src, val]) => {
                  const pct = horizonStats.year.in > 0 ? Math.round((val / horizonStats.year.in) * 100) : 0;
                  return (
                    <div key={src} className="p-2.5 rounded-xl bg-slate-950/60 border border-white/5 space-y-1">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-slate-200 font-semibold">{src}</span>
                        <span className="text-emerald-400 font-mono font-bold">৳{val.toLocaleString()} ({pct}%)</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-slate-900 overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Debt & Loan Tracker */}
      <div className="glass-crystal rounded-3xl p-5 space-y-4">
        <div>
          <h3 className="font-bold text-sm flex items-center gap-2 text-white">
            <Users className="w-4 h-4 text-amber-400" />
            <span>ধার ও বাকি হিসাব (আমি পাবো / আমার কাছে পাবে)</span>
          </h3>
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
            + হিসাব যোগ
          </button>
        </form>

        <div className="grid md:grid-cols-2 gap-3 pt-2">
          {debts.map((d) => (
            <div
              key={d.id}
              className={`p-3.5 rounded-2xl border flex items-center justify-between transition ${
                d.settled ? 'bg-slate-950/30 border-white/5 opacity-55' : 'bg-slate-950/70 border-white/10'
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
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-rose-600 text-slate-400 hover:text-white transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Monthly Category Budgets & Recurring Bills */}
      <div className="grid lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 glass-crystal rounded-3xl p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
            <h3 className="font-bold text-sm flex items-center gap-2 text-white">
              <Gauge className="w-4 h-4 text-cyan-400" />
              <span>মাসিক বাজেট লিমিট ও সতর্কতা ({currentMonthStr})</span>
            </h3>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            {Object.entries(budgets).map(([cat, lim]) => {
              const spent = monthCategorySpending[cat] || 0;
              const pct = lim > 0 ? Math.round((spent / lim) * 100) : 0;
              const over = pct >= 100;
              const warn = pct >= 80 && !over;
              return (
                <div key={cat} className="p-3.5 rounded-2xl bg-slate-950/60 border border-white/10 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">{cat}</span>
                    <span className={`font-mono font-bold ${over ? 'text-rose-400' : warn ? 'text-amber-300' : 'text-emerald-300'}`}>
                      ৳{spent.toLocaleString()} / ৳{Number(lim).toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-900 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${over ? 'bg-rose-500' : warn ? 'bg-amber-400' : 'bg-emerald-500'}`}
                      style={{ width: `${Math.min(100, pct)}%` }}
                    />
                  </div>
                  <div className="text-[10px] text-slate-400 flex justify-between">
                    <span>{pct}% ব্যবহৃত</span>
                    {over && <span className="text-rose-400 font-bold">বাজেট অতিক্রম করেছে!</span>}
                    {warn && <span className="text-amber-300 font-bold">বাজেট প্রায় শেষ</span>}
                  </div>
                </div>
              );
            })}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!budgetLimit) return;
              SoundFX.success();
              setCategoryBudget(budgetCat, budgetLimit);
              setBudgetLimit('');
            }}
            className="flex flex-wrap gap-2 pt-2 border-t border-white/10"
          >
            <select
              value={budgetCat}
              onChange={(e) => setBudgetCat(e.target.value)}
              className="px-3 py-2 rounded-xl glass-input text-xs"
            >
              {expenseCategories.map((c) => (
                <option key={c} value={c} className="bg-slate-900">{c}</option>
              ))}
            </select>
            <input
              type="number"
              placeholder="নতুন বাজেট সীমা (৳)"
              value={budgetLimit}
              onChange={(e) => setBudgetLimit(e.target.value)}
              className="flex-1 min-w-[140px] px-3 py-2 rounded-xl glass-input text-xs"
            />
            <button type="submit" className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold">
              Set Limit
            </button>
          </form>
        </div>

        <div className="lg:col-span-5 glass-crystal rounded-3xl p-5 space-y-4">
          <h3 className="font-bold text-sm flex items-center gap-2 text-white border-b border-white/10 pb-3">
            <Repeat className="w-4 h-4 text-emerald-400" />
            <span>Recurring Bills (১-ক্লিক মাসিক বিল)</span>
          </h3>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!billTitle || !billAmount) return;
              SoundFX.success();
              addRecurringBill({ title: billTitle, amount: billAmount, wallet: billWallet, category: 'Other' });
              setBillTitle('');
              setBillAmount('');
            }}
            className="grid grid-cols-3 gap-2"
          >
            <input
              type="text"
              placeholder="বিল (e.g. Hall Fee)"
              value={billTitle}
              onChange={(e) => setBillTitle(e.target.value)}
              className="px-3 py-2 rounded-xl glass-input text-xs"
            />
            <input
              type="number"
              placeholder="৳"
              value={billAmount}
              onChange={(e) => setBillAmount(e.target.value)}
              className="px-3 py-2 rounded-xl glass-input text-xs"
            />
            <button type="submit" className="py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold">
              + Add Bill
            </button>
          </form>

          <div className="space-y-2 max-h-48 overflow-y-auto">
            {recurringBills.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-4">হল ফি, জিম বা ওয়াইফাই বিল এখানে সেভ করুন।</p>
            ) : (
              recurringBills.map((b) => (
                <div key={b.id} className="p-3 rounded-2xl bg-slate-950/60 border border-white/10 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold text-white">{b.title}</p>
                    <span className="text-[10px] font-mono text-slate-400">৳{b.amount} • {b.wallet}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => {
                        SoundFX.success();
                        logRecurringBill(b.id);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white text-[11px] font-bold transition"
                    >
                      Pay Now
                    </button>
                    <button
                      onClick={() => deleteRecurringBill(b.id)}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-rose-600 text-slate-400 hover:text-white"
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
          <span>Reset Finance Data (Protected)</span>
        </button>
      </div>
    </div>
  );
}
