import React, { useState, useMemo } from 'react';
import { useOS } from '../context/OSContext';
import { AnimatedCounter, TiltCard } from './common/MotionKit';
import {
  Wallet, ArrowUpRight, ArrowDownRight, PlusCircle, CheckCircle2,
  Clock, Filter, PieChart, Landmark, Smartphone, Banknote, Users
} from 'lucide-react';

export default function FinanceManager() {
  const { data, addTransaction, addDebt, toggleDebtSettled } = useOS();
  const { wallets, transactions, debts } = data.finance;

  // Transaction Form State
  const [txType, setTxType] = useState('out');
  const [amount, setAmount] = useState('');
  const [wallet, setWallet] = useState('bkash');
  const [category, setCategory] = useState('Food & Meal');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [timeFilter, setTimeFilter] = useState('all'); // 'today' | 'week' | 'month' | 'all'

  // Debt Form State
  const [person, setPerson] = useState('');
  const [debtType, setDebtType] = useState('receivable');
  const [debtAmount, setDebtAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [debtNote, setDebtNote] = useState('');

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
    .filter((t) => t.type === 'in')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalOut = filteredTransactions
    .filter((t) => t.type === 'out')
    .reduce((sum, t) => sum + t.amount, 0);

  // Category Breakdown
  const categoryBreakdown = useMemo(() => {
    const map = {};
    filteredTransactions
      .filter((t) => t.type === 'out')
      .forEach((t) => {
        map[t.category] = (map[t.category] || 0) + t.amount;
      });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [filteredTransactions]);

  const handleAddTx = (e) => {
    e.preventDefault();
    if (!amount) return;
    addTransaction({ type: txType, amount, wallet, category, note, date });
    setAmount('');
    setNote('');
  };

  const handleAddDebt = (e) => {
    e.preventDefault();
    if (!person || !debtAmount) return;
    addDebt({ person, type: debtType, amount: debtAmount, dueDate, note: debtNote });
    setPerson('');
    setDebtAmount('');
    setDueDate('');
    setDebtNote('');
  };

  const walletMeta = [
    { key: 'cash', label: 'Hand Cash', icon: Banknote, color: 'from-emerald-600 to-teal-600' },
    { key: 'bkash', label: 'bKash Wallet', icon: Smartphone, color: 'from-pink-600 to-rose-600' },
    { key: 'nagad', label: 'Nagad Wallet', icon: Smartphone, color: 'from-amber-600 to-orange-600' },
    { key: 'bank', label: 'Bank Account', icon: Landmark, color: 'from-indigo-600 to-blue-600' }
  ];

  const categories = [
    'Food & Meal',
    'Gym & Fitness',
    'Study & Academic',
    'Business / JACKFRU',
    'Client Project',
    'Personal & Care',
    'Tech & AI APIs',
    'Other'
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2.5">
            <Wallet className="w-6 h-6 text-emerald-400"/>
            <span>Money & Multi-Wallet Command Center</span>
          </h1>
          <p className="text-xs text-slate-400">
            Track Cash In/Out, Wallets (Cash, bKash, Nagad, Bank), Category Expenses & Debts
          </p>
        </div>

        {/* Time Period Filter */}
        <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800">
          {[
            { id: 'today', label: 'Daily' },
            { id: 'week', label: 'Weekly' },
            { id: 'month', label: 'Monthly' },
            { id: 'all', label: 'All Time' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setTimeFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                timeFilter === tab.id
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Total Net Worth & Multi-Wallets */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <TiltCard maxTilt={8} className="bg-gradient-to-br from-slate-900 via-indigo-950/60 to-slate-900 border border-indigo-500/40 rounded-2xl p-5 shadow-xl shadow-indigo-950/30 flex flex-col justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-indigo-300">
            Total Net Balance
          </span>
          <div className="my-2">
            <span className="text-3xl font-black text-white">
              ৳<AnimatedCounter value={totalBalance} />
            </span>
          </div>
          <div className="flex items-center justify-between text-[11px] pt-2 border-t border-slate-800/80">
            <span className="text-emerald-400 flex items-center gap-0.5">
              <ArrowUpRight className="w-3 h-3"/> In: ৳<AnimatedCounter value={totalIn} />
            </span>
            <span className="text-rose-400 flex items-center gap-0.5">
              <ArrowDownRight className="w-3 h-3"/> Out: ৳<AnimatedCounter value={totalOut} />
            </span>
          </div>
        </TiltCard>

        {walletMeta.map((w) => {
          const Icon = w.icon;
          const bal = wallets[w.key] || 0;
          return (
            <TiltCard
              key={w.key}
              maxTilt={6}
              className="bg-slate-900/70 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 shadow-lg flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-medium">{w.label}</span>
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${w.color} flex items-center justify-center text-white shadow-md`}>
                  <Icon className="w-4 h-4"/>
                </div>
              </div>
              <div className="mt-3">
                <span className="text-2xl font-bold text-white">
                  ৳<AnimatedCounter value={bal} />
                </span>
                <span className="block text-[10px] text-slate-500 mt-1 uppercase font-mono">
                  Active Wallet
                </span>
              </div>
            </TiltCard>
          );
        })}
      </div>

      {/* Add Transaction + Category Report */}
      <div className="grid lg:grid-cols-12 gap-6">
        {/* Quick Cash In / Cash Out Form */}
        <form
          onSubmit={handleAddTx}
          className="lg:col-span-5 bg-slate-900/70 border border-slate-800 rounded-2xl p-5 space-y-4"
        >
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm flex items-center gap-2">
              <PlusCircle className="w-4 h-4 text-emerald-400"/>
              <span>Record Cash In / Cash Out</span>
            </h3>
            <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => setTxType('in')}
                className={`px-3 py-1 rounded-lg font-semibold transition ${
                  txType === 'in' ? 'bg-emerald-600 text-white' : 'text-slate-400'
                }`}
              >
                + Cash In
              </button>
              <button
                type="button"
                onClick={() => setTxType('out')}
                className={`px-3 py-1 rounded-lg font-semibold transition ${
                  txType === 'out' ? 'bg-rose-600 text-white' : 'text-slate-400'
                }`}
              >
                - Cash Out
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Amount (৳) *</label>
              <input
                type="number"
                required
                placeholder="e.g. 500"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm font-bold text-white"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Select Wallet</label>
              <select
                value={wallet}
                onChange={(e) => setWallet(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-200"
              >
                <option value="cash">Hand Cash</option>
                <option value="bkash">bKash</option>
                <option value="nagad">Nagad</option>
                <option value="bank">Bank Account</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] text-slate-400 block mb-1">Short Note</label>
            <input
              type="text"
              placeholder="What was this for?"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs"
            />
          </div>

          <button
            type="submit"
            className={`w-full py-2.5 rounded-xl font-semibold text-xs text-white transition ${
              txType === 'in'
                ? 'bg-emerald-600 hover:bg-emerald-500'
                : 'bg-rose-600 hover:bg-rose-500'
            }`}
          >
            {txType === 'in' ? 'Add Money to Wallet' : 'Record Expense from Wallet'}
          </button>
        </form>

        {/* Expense Breakdown & Recent History */}
        <div className="lg:col-span-7 bg-slate-900/70 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between space-y-5">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <PieChart className="w-4 h-4 text-cyan-400"/>
                <span>Expense Breakdown by Category</span>
              </h3>
              <span className="text-xs text-slate-400">
                Total Out: <strong className="text-rose-400">৳{totalOut.toLocaleString()}</strong>
              </span>
            </div>

            {categoryBreakdown.length === 0 ? (
              <p className="text-xs text-slate-500 py-4">No expenses logged in this time period.</p>
            ) : (
              <div className="space-y-2.5">
                {categoryBreakdown.map(([cat, val]) => {
                  const pct = totalOut > 0 ? Math.round((val / totalOut) * 100) : 0;
                  return (
                    <div key={cat} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-300 font-medium">{cat}</span>
                        <span className="text-slate-400">
                          ৳{val.toLocaleString()} ({pct}%)
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-full"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Transaction Log */}
          <div className="border-t border-slate-800 pt-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
              Recent Transactions ({filteredTransactions.length})
            </h4>
            <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
              {filteredTransactions.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold ${
                        tx.type === 'in'
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : 'bg-rose-500/10 text-rose-400'
                      }`}
                    >
                      {tx.type === 'in' ? '+' : '-'}
                    </span>
                    <div>
                      <p className="font-semibold text-slate-200">
                        {tx.note || tx.category}
                      </p>
                      <span className="text-[10px] text-slate-500 uppercase">
                        {tx.wallet} • {tx.category} • {tx.date}
                      </span>
                    </div>
                  </div>
                  <span
                    className={`font-bold ${
                      tx.type === 'in' ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {tx.type === 'in' ? '+' : '-'}৳{tx.amount.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Debt & Loan Tracker (কে পাবে / কার কাছে পাবো) */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="font-bold text-sm flex items-center gap-2">
              <Users className="w-4 h-4 text-amber-400"/>
              <span>ধার ও বাকি হিসাব (Receivable & Payable Tracker)</span>
            </h3>
            <p className="text-xs text-slate-400">
              Track who owes you money (আমি পাবো) and whom you need to pay (আমার কাছে পাবে)
            </p>
          </div>
        </div>

        <form onSubmit={handleAddDebt} className="grid sm:grid-cols-5 gap-3 pt-1">
          <input
            type="text"
            placeholder="Person / Shop Name *"
            value={person}
            onChange={(e) => setPerson(e.target.value)}
            className="px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs"
          />
          <select
            value={debtType}
            onChange={(e) => setDebtType(e.target.value)}
            className="px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200"
          >
            <option value="receivable">আমি টাকা পাবো (Receivable)</option>
            <option value="payable">আমার কাছে পাবে (Payable)</option>
          </select>
          <input
            type="number"
            placeholder="Amount (৳) *"
            value={debtAmount}
            onChange={(e) => setDebtAmount(e.target.value)}
            className="px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs"
          />
          <input
            type="text"
            placeholder="Note / Due Date"
            value={debtNote}
            onChange={(e) => setDebtNote(e.target.value)}
            className="px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs"
          />
          <button
            type="submit"
            className="py-2 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white"
          >
            + Add Record
          </button>
        </form>

        <div className="grid md:grid-cols-2 gap-3 pt-2">
          {debts.map((d) => (
            <div
              key={d.id}
              className={`p-3.5 rounded-xl border flex items-center justify-between ${
                d.settled
                  ? 'bg-slate-950/40 border-slate-800/50 opacity-60'
                  : 'bg-slate-950 border-slate-800'
              }`}
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-white">{d.person}</span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                      d.type === 'receivable'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}
                  >
                    {d.type === 'receivable' ? 'আমি পাবো' : 'আমার কাছে পাবে'}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">{d.note || `Due: ${d.dueDate}`}</p>
              </div>

              <div className="flex items-center gap-3">
                <span className="font-bold text-sm text-white">৳{d.amount.toLocaleString()}</span>
                <button
                  onClick={() => toggleDebtSettled(d.id)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1 ${
                    d.settled
                      ? 'bg-slate-800 text-slate-400'
                      : 'bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600 hover:text-white'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5"/>
                  <span>{d.settled ? 'Settled' : 'Mark Done'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
