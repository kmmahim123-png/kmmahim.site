import React, { useState } from 'react';
import { useOS } from '../context/OSContext';
import { Target, Plus, CheckCircle2, Trash2, Clock, Play, Pause, RotateCcw } from 'lucide-react';

export default function GoalsTracker() {
  const { data, addGoal, toggleGoalComplete, deleteGoal } = useOS();
  const { goals } = data;

  const [title, setTitle] = useState('');
  const [timeframe, setTimeframe] = useState('daily');
  const [category, setCategory] = useState('Academic');
  const [activeTab, setActiveTab] = useState('daily');

  // Pomodoro Timer State
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [timerMode, setTimerMode] = useState('work'); // 'work' | 'break'

  React.useEffect(() => {
    let timer = null;
    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    } else if (timeLeft === 0) {
      setIsRunning(false);
      alert(timerMode === 'work' ? 'Pomodoro Work session finished! Take a break.' : 'Break finished! Back to study.');
    }
    return () => clearInterval(timer);
  }, [isRunning, timeLeft, timerMode]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAddGoal = (e) => {
    e.preventDefault();
    if (!title) return;
    addGoal({ title, timeframe, category });
    setTitle('');
  };

  const filteredGoals = goals.filter((g) => g.timeframe === activeTab);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2.5">
            <Target className="w-6 h-6 text-indigo-400"/>
            <span>Study & Goals Command Center (পড়াশোনা ও লক্ষ্য)</span>
          </h1>
          <p className="text-xs text-slate-400">
            Manage daily, weekly, monthly goals and use the built-in Pomodoro focus timer
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        {/* Goals Management */}
        <div className="lg:col-span-8 space-y-4">
          <form onSubmit={handleAddGoal} className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 space-y-3">
            <h3 className="font-bold text-sm flex items-center gap-2">
              <Plus className="w-4 h-4 text-emerald-400"/>
              <span>Add New Goal or Study Task</span>
            </h3>

            <div className="grid sm:grid-cols-3 gap-3">
              <input
                type="text"
                required
                placeholder="What is your goal or study task?"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="sm:col-span-2 px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
              />
              <select
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value)}
                className="px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200"
              >
                <option value="daily">Daily Goal</option>
                <option value="weekly">Weekly Goal</option>
                <option value="monthly">Monthly Goal</option>
                <option value="yearly">Yearly Goal</option>
              </select>
            </div>

            <div className="flex items-center justify-between gap-3 pt-1">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200"
              >
                <option value="Academic">Academic (পড়াশোনা)</option>
                <option value="AI Work">AI & Tech Work</option>
                <option value="Business">JACKFRU / Business</option>
                <option value="Fitness">Fitness & Health</option>
              </select>

              <button
                type="submit"
                className="py-2 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white"
              >
                + Add Goal
              </button>
            </div>
          </form>

          {/* Timeframe Tabs & List */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              {[
                { id: 'daily', label: 'Daily (আজকে)' },
                { id: 'weekly', label: 'Weekly (এই সপ্তাহে)' },
                { id: 'monthly', label: 'Monthly (এই মাসে)' },
                { id: 'yearly', label: 'Yearly (এই বছরে)' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                    activeTab === tab.id ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
              {filteredGoals.length === 0 ? (
                <p className="text-xs text-slate-500 py-4 text-center">No goals set for this timeframe yet.</p>
              ) : (
                filteredGoals.map((g) => (
                  <div
                    key={g.id}
                    className={`p-3.5 rounded-xl border flex items-center justify-between transition ${
                      g.completed ? 'bg-slate-950/40 border-slate-800 opacity-60' : 'bg-slate-950 border-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => toggleGoalComplete(g.id)}
                        className={`w-5 h-5 rounded-md flex items-center justify-center border ${
                          g.completed ? 'bg-emerald-600 border-emerald-500 text-white' : 'border-slate-700'
                        }`}
                      >
                        {g.completed && <CheckCircle2 className="w-3.5 h-3.5"/>}
                      </button>
                      <div>
                        <p className={`text-xs font-medium ${g.completed ? 'line-through text-slate-500' : 'text-white'}`}>
                          {g.title}
                        </p>
                        <span className="text-[10px] text-cyan-400 font-mono">{g.category}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => deleteGoal(g.id)}
                      className="text-slate-600 hover:text-rose-400 transition"
                    >
                      <Trash2 className="w-4 h-4"/>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Pomodoro Focus Timer */}
        <div className="lg:col-span-4 bg-gradient-to-br from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/30 rounded-2xl p-6 flex flex-col justify-between text-center space-y-6">
          <div>
            <span className="text-xs uppercase tracking-widest text-indigo-300 font-bold block mb-1">
              Study Focus Timer (Pomodoro)
            </span>
            <span className="text-[11px] text-slate-400">
              {timerMode === 'work' ? '📚 Deep Study / Coding Session' : '☕ Relax & Break'}
            </span>
          </div>

          <div className="my-4">
            <span className="text-6xl font-black font-mono tracking-tight text-white">
              {formatTime(timeLeft)}
            </span>
          </div>

          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => setIsRunning(!isRunning)}
              className={`px-6 py-3 rounded-xl font-semibold text-xs flex items-center gap-2 text-white ${
                isRunning ? 'bg-amber-600 hover:bg-amber-500' : 'bg-emerald-600 hover:bg-emerald-500'
              }`}
            >
              {isRunning ? <Pause className="w-4 h-4"/> : <Play className="w-4 h-4"/>}
              <span>{isRunning ? 'Pause' : 'Start Focus'}</span>
            </button>

            <button
              onClick={() => {
                setIsRunning(false);
                setTimeLeft(timerMode === 'work' ? 25 * 60 : 5 * 60);
              }}
              className="p-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300"
            >
              <RotateCcw className="w-4 h-4"/>
            </button>
          </div>

          <div className="flex items-center justify-center gap-2 pt-2 border-t border-slate-800/80">
            <button
              onClick={() => {
                setIsRunning(false);
                setTimerMode('work');
                setTimeLeft(25 * 60);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
                timerMode === 'work' ? 'bg-indigo-600 text-white' : 'text-slate-400'
              }`}
            >
              25m Work
            </button>
            <button
              onClick={() => {
                setIsRunning(false);
                setTimerMode('break');
                setTimeLeft(5 * 60);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
                timerMode === 'break' ? 'bg-indigo-600 text-white' : 'text-slate-400'
              }`}
            >
              5m Break
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
