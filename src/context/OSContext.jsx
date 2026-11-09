import React, { createContext, useContext, useState, useEffect } from 'react';

const OSContext = createContext();

const INITIAL_DATA = {
  profile: {
    name: "KM Mahim",
    bnName: "কে এম মাহিম",
    tagline: "Entrepreneur • Web Architect • AI Automation Builder • Athlete",
    department: "Dept. of Physical Education & Sports Science, Rajshahi University",
    location: "Rajshahi / Dhaka, Bangladesh",
    nowStatus: "Building Autonomous AI Agent Workflows (OpenClaw + Grok) & Scaling Digital Products 🚀",
    email: "contact@kmmahim.com",
    phone: "+8801700000000",
    pin: "2526",
    socials: {
      facebook: "https://facebook.com/",
      linkedin: "https://linkedin.com/",
      twitter: "https://x.com/",
      youtube: "https://youtube.com/",
      github: "https://github.com/"
    }
  },
  projects: [
    {
      id: "p1",
      title: "JACKFRU Apparel",
      category: "Brand & Global Retail",
      description: "Founded and operated an apparel brand engineered for physical retail store distribution across Australia and local markets.",
      metrics: "Retail Ready • Custom Supply Chain",
      link: "#",
      badge: "Founder"
    },
    {
      id: "p2",
      title: "Autonomous AI Life OS & Agent Hub",
      category: "AI & Full-Stack System",
      description: "Two-layer personal command system integrating OpenClaw, Grok, and Hermes agents for daily task orchestration and social media automation.",
      metrics: "Multi-Agent API • APK Synced",
      link: "#",
      badge: "Lead Architect"
    },
    {
      id: "p3",
      title: "High-Conversion Business Web Platforms",
      category: "Web Development",
      description: "Custom-built responsive web platforms for healthcare, e-commerce, and service brands developed with modern no-code and AI-assisted workflows.",
      metrics: "Fast UI • SEO & Booking Ready",
      link: "#",
      badge: "Web Builder"
    }
  ],
  services: [
    {
      id: "s1",
      title: "Custom Website & Web App Development",
      category: "Web & App",
      price: 15000,
      delivery: "5-7 Days",
      features: ["Modern UI/UX Design", "Mobile APK Version Included", "Admin Dashboard", "Fast Loading & SEO"]
    },
    {
      id: "s2",
      title: "AI Agent & Workflow Automation Setup",
      category: "AI Automation",
      price: 12000,
      delivery: "3-5 Days",
      features: ["OpenClaw / n8n / Make Integration", "Social Media Auto-Posting", "Custom AI Bots (Grok/Hermes)", "24/7 Webhook Setup"]
    },
    {
      id: "s3",
      title: "Brand Launch & Digital Growth System",
      category: "Branding & Marketing",
      price: 10000,
      delivery: "4-6 Days",
      features: ["Brand Identity & Strategy", "Meta Ads & Funnel Setup", "Content Automation Pipeline", "Analytics Dashboard"]
    }
  ],
  messages: [
    {
      id: "m1",
      sender: "Broker Orchestrator Agent",
      email: "broker@openclaw.local",
      service: "Full OS Online",
      budget: "Internal",
      date: new Date().toLocaleDateString(),
      text: "All 4 parts of KM Mahim Life OS are active! OpenClaw, Grok, and Hermes are standing by.",
      type: "agent",
      read: false
    }
  ],
  finance: {
    wallets: { cash: 4500, bkash: 8200, nagad: 3100, bank: 25000 },
    transactions: [
      { id: "t1", type: "in", amount: 15000, wallet: "bank", category: "Client Project", note: "Web App Advance", date: "2026-11-05" },
      { id: "t2", type: "out", amount: 1200, wallet: "bkash", category: "Gym & Fitness", note: "Monthly Gym + Diet", date: "2026-11-06" }
    ],
    debts: [
      { id: "d1", person: "Rafi (Hall)", type: "receivable", amount: 1500, dueDate: "2026-11-15", note: "bKash Loan", settled: false }
    ]
  },
  meals: {
    mode: "fixed",
    ratePerMeal: 55,
    packageTotalMeals: 60,
    deposits: [{ id: "dep1", date: "2026-11-01", amount: 2500, note: "First Deposit" }],
    logs: {
      "2026-11-09": { breakfast: 1, lunch: 1, dinner: 1, guest: 0 }
    }
  },
  habits: {
    minoxidilBottleStart: "2026-11-01",
    dailyLogs: {
      "2026-11-09": {
        namaz: { fajr: true, zuhr: true, asr: true, maghrib: true, isha: false },
        minoxidil: { morning: true, night: false },
        gym: { done: true, muscle: "Chest & Triceps", weightLog: "Dumbbell Press 22kg" }
      }
    }
  },
  goals: [
    { id: "g1", title: "Connect OpenClaw Webhook with Social Poster", timeframe: "daily", completed: false, category: "AI Work" },
    { id: "g2", title: "Review Sports Science Lecture Notes", timeframe: "daily", completed: false, category: "Academic" }
  ],
  ideas: [
    {
      id: "i1",
      title: "AI Agent Driven Campus Utility Platform",
      tag: "Startup",
      status: "Working On It",
      content: "Centralized hub for student events, automated notifications, and local commerce.",
      image: "",
      date: "2026-11-05"
    }
  ],
  socialQueue: [
    {
      id: "sq1",
      platforms: ["Facebook", "LinkedIn", "X"],
      content: "Launched my custom 2-Layer Personal Life OS & AI Agent Command Center! Built to orchestrate daily routines, finances, and autonomous bots. 🚀",
      mediaUrl: "https://kmmahim.com/os-preview",
      scheduleTime: "2026-11-10 20:00",
      status: "Scheduled",
      liveLink: ""
    }
  ],
  agents: {
    webhookUrl: "https://n8n-or-openclaw.yourdomain.com/webhook/km-os",
    apiKey: "km_live_openclaw_99482x",
    autoApprove: false,
    bots: [
      { id: "b1", name: "Broker Orchestrator", role: "Master Task Router & Daily Planner", status: "Online", lastTask: "Synced Daily Goals" },
      { id: "b2", name: "OpenClaw Agent", role: "Browser Automation & Auto-Uploader", status: "Online", lastTask: "Ready for Social Queue" },
      { id: "b3", name: "Grok Research Bot", role: "Real-Time Trend & Viral Topic Finder", status: "Online", lastTask: "Scanned Tech Trends" },
      { id: "b4", name: "Hermes Logic Agent", role: "Copywriting, Code & Routine Optimizer", status: "Online", lastTask: "Drafted LinkedIn Thread" }
    ],
    logs: [
      { id: "l1", agent: "Broker Orchestrator", text: "Initialized Layer-2 API Bridge for Web & Android APK.", time: "Just now" }
    ]
  }
};

export const OSProvider = ({ children }) => {
  const [data, setData] = useState(() => {
    const saved = localStorage.getItem('KM_MAHIM_LIFE_OS_V1');
    if (!saved) return INITIAL_DATA;
    try {
      const parsed = JSON.parse(saved);
      return {
        ...INITIAL_DATA,
        ...parsed,
        profile: { ...INITIAL_DATA.profile, ...(parsed.profile || {}) },
        finance: { ...INITIAL_DATA.finance, ...(parsed.finance || {}) },
        meals: { ...INITIAL_DATA.meals, ...(parsed.meals || {}) },
        habits: { ...INITIAL_DATA.habits, ...(parsed.habits || {}) },
        goals: parsed.goals || INITIAL_DATA.goals,
        ideas: parsed.ideas || INITIAL_DATA.ideas,
        socialQueue: parsed.socialQueue?.length ? parsed.socialQueue : INITIAL_DATA.socialQueue,
        agents: {
          ...INITIAL_DATA.agents,
          ...(parsed.agents || {}),
          bots: parsed.agents?.bots?.length ? parsed.agents.bots : INITIAL_DATA.agents.bots,
          logs: parsed.agents?.logs?.length ? parsed.agents.logs : INITIAL_DATA.agents.logs
        }
      };
    } catch {
      return INITIAL_DATA;
    }
  });

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeLayer, setActiveLayer] = useState('public');
  const [showPinModal, setShowPinModal] = useState(false);

  useEffect(() => {
    localStorage.setItem('KM_MAHIM_LIFE_OS_V1', JSON.stringify(data));
  }, [data]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'l') {
        e.preventDefault();
        if (isAuthenticated) {
          setActiveLayer(prev => (prev === 'public' ? 'private' : 'public'));
        } else {
          setShowPinModal(true);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAuthenticated]);

  const verifyPin = (inputPin) => {
    if (inputPin === data.profile.pin) {
      setIsAuthenticated(true);
      setActiveLayer('private');
      setShowPinModal(false);
      return true;
    }
    return false;
  };

  // Part 1 Actions
  const updateProfile = (newProfile) => {
    setData(prev => ({ ...prev, profile: { ...prev.profile, ...newProfile } }));
  };

  const addProject = (project) => {
    setData(prev => ({
      ...prev,
      projects: [{ ...project, id: 'p_' + Date.now() }, ...prev.projects]
    }));
  };

  const sendClientMessage = (msg) => {
    setData(prev => ({
      ...prev,
      messages: [{ ...msg, id: 'msg_' + Date.now(), date: new Date().toLocaleString(), type: 'client', read: false }, ...prev.messages]
    }));
  };

  // Part 2 Actions
  const addTransaction = ({ type, amount, wallet, category, note, date }) => {
    const numAmount = Number(amount);
    if (!numAmount || numAmount <= 0) return;
    setData(prev => {
      const currentBalance = prev.finance.wallets[wallet] || 0;
      const updatedBalance = type === 'in' ? currentBalance + numAmount : currentBalance - numAmount;
      const newTx = {
        id: 'tx_' + Date.now(),
        type,
        amount: numAmount,
        wallet,
        category,
        note,
        date: date || new Date().toISOString().slice(0, 10)
      };
      return {
        ...prev,
        finance: {
          ...prev.finance,
          wallets: { ...prev.finance.wallets, [wallet]: updatedBalance },
          transactions: [newTx, ...prev.finance.transactions]
        }
      };
    });
  };

  const addDebt = ({ person, type, amount, dueDate, note }) => {
    const numAmount = Number(amount);
    if (!person || !numAmount) return;
    setData(prev => ({
      ...prev,
      finance: {
        ...prev.finance,
        debts: [{ id: 'debt_' + Date.now(), person, type, amount: numAmount, dueDate: dueDate || 'Flexible', note, settled: false }, ...prev.finance.debts]
      }
    }));
  };

  const toggleDebtSettled = (debtId) => {
    setData(prev => ({
      ...prev,
      finance: {
        ...prev.finance,
        debts: prev.finance.debts.map(d => (d.id === debtId ? { ...d, settled: !d.settled } : d))
      }
    }));
  };

  const updateMealSettings = (settings) => {
    setData(prev => ({ ...prev, meals: { ...prev.meals, ...settings } }));
  };

  const addMealDeposit = ({ amount, date, note, deductFromWallet }) => {
    const numAmount = Number(amount);
    if (!numAmount || numAmount <= 0) return;
    setData(prev => {
      const newDep = { id: 'dep_' + Date.now(), amount: numAmount, date: date || new Date().toISOString().slice(0, 10), note: note || 'Meal Deposit' };
      const nextWallets = { ...prev.finance.wallets };
      const nextTransactions = [...prev.finance.transactions];
      if (deductFromWallet && nextWallets[deductFromWallet] !== undefined) {
        nextWallets[deductFromWallet] -= numAmount;
        nextTransactions.unshift({
          id: 'tx_' + Date.now(),
          type: 'out',
          amount: numAmount,
          wallet: deductFromWallet,
          category: 'Food & Meal',
          note: `Meal Deposit: ${note || 'Hall/Mess'}`,
          date: newDep.date
        });
      }
      return {
        ...prev,
        finance: { ...prev.finance, wallets: nextWallets, transactions: nextTransactions },
        meals: { ...prev.meals, deposits: [newDep, ...prev.meals.deposits] }
      };
    });
  };

  const updateDailyMeal = (dateKey, mealData) => {
    setData(prev => ({
      ...prev,
      meals: { ...prev.meals, logs: { ...prev.meals.logs, [dateKey]: mealData } }
    }));
  };

  // Part 3 Actions
  const updateDailyHabits = (dateKey, habitUpdater) => {
    setData(prev => {
      const existingDay = prev.habits.dailyLogs[dateKey] || {
        namaz: { fajr: false, zuhr: false, asr: false, maghrib: false, isha: false },
        minoxidil: { morning: false, night: false },
        gym: { done: false, muscle: '', weightLog: '' }
      };
      const updatedDay = typeof habitUpdater === 'function' ? habitUpdater(existingDay) : { ...existingDay, ...habitUpdater };
      return {
        ...prev,
        habits: { ...prev.habits, dailyLogs: { ...prev.habits.dailyLogs, [dateKey]: updatedDay } }
      };
    });
  };

  const updateMinoxidilStart = (startDate) => {
    setData(prev => ({ ...prev, habits: { ...prev.habits, minoxidilBottleStart: startDate } }));
  };

  const addGoal = ({ title, timeframe, category }) => {
    if (!title) return;
    setData(prev => ({
      ...prev,
      goals: [{ id: 'goal_' + Date.now(), title, timeframe: timeframe || 'daily', completed: false, category: category || 'General' }, ...prev.goals]
    }));
  };

  const toggleGoalComplete = (goalId) => {
    setData(prev => ({
      ...prev,
      goals: prev.goals.map(g => (g.id === goalId ? { ...g, completed: !g.completed } : g))
    }));
  };

  const deleteGoal = (goalId) => {
    setData(prev => ({ ...prev, goals: prev.goals.filter(g => g.id !== goalId) }));
  };

  const addIdea = ({ title, tag, status, content, image }) => {
    if (!title) return;
    setData(prev => ({
      ...prev,
      ideas: [{ id: 'idea_' + Date.now(), title, tag: tag || 'General', status: status || 'Just Idea', content: content || '', image: image || '', date: new Date().toISOString().slice(0, 10) }, ...prev.ideas]
    }));
  };

  const deleteIdea = (ideaId) => {
    setData(prev => ({ ...prev, ideas: prev.ideas.filter(i => i.id !== ideaId) }));
  };

  // --- PART 4: SOCIAL AUTO-POSTER & AI AGENT HUB ACTIONS ---
  const addSocialPost = ({ platforms, content, mediaUrl, scheduleTime, status }) => {
    if (!content) return;
    setData(prev => ({
      ...prev,
      socialQueue: [
        {
          id: 'sq_' + Date.now(),
          platforms: platforms?.length ? platforms : ['Facebook'],
          content,
          mediaUrl: mediaUrl || '',
          scheduleTime: scheduleTime || 'Immediate',
          status: status || (prev.agents.autoApprove ? 'Auto-Published' : 'Pending Approval'),
          liveLink: status === 'Published' ? 'https://social.kmmahim.com/post/' + Date.now() : ''
        },
        ...prev.socialQueue
      ]
    }));
  };

  const approveAndPublishPost = (postId) => {
    setData(prev => ({
      ...prev,
      socialQueue: prev.socialQueue.map(p =>
        p.id === postId
          ? { ...p, status: 'Published via OpenClaw', liveLink: `https://openclaw.sync/live/${postId}` }
          : p
      )
    }));
  };

  const deleteSocialPost = (postId) => {
    setData(prev => ({
      ...prev,
      socialQueue: prev.socialQueue.filter(p => p.id !== postId)
    }));
  };

  const dispatchAgentCommand = (agentName, commandText) => {
    if (!commandText) return;
    setData(prev => {
      const logEntry = {
        id: 'log_' + Date.now(),
        agent: agentName,
        text: `Executed: "${commandText}" -> Task synced to Goals & Social Queue.`,
        time: new Date().toLocaleTimeString()
      };
      const autoGoal = {
        id: 'goal_' + Date.now(),
        title: `[${agentName}] ${commandText}`,
        timeframe: 'daily',
        completed: false,
        category: 'AI Assigned'
      };
      return {
        ...prev,
        goals: [autoGoal, ...prev.goals],
        agents: {
          ...prev.agents,
          logs: [logEntry, ...(prev.agents.logs || [])]
        }
      };
    });
  };

  const updateAgentConfig = (newConfig) => {
    setData(prev => ({
      ...prev,
      agents: { ...prev.agents, ...newConfig }
    }));
  };

  return (
    <OSContext.Provider
      value={{
        data,
        setData,
        isAuthenticated,
        setIsAuthenticated,
        activeLayer,
        setActiveLayer,
        showPinModal,
        setShowPinModal,
        verifyPin,
        updateProfile,
        addProject,
        sendClientMessage,
        addTransaction,
        addDebt,
        toggleDebtSettled,
        updateMealSettings,
        addMealDeposit,
        updateDailyMeal,
        updateDailyHabits,
        updateMinoxidilStart,
        addGoal,
        toggleGoalComplete,
        deleteGoal,
        addIdea,
        deleteIdea,
        addSocialPost,
        approveAndPublishPost,
        deleteSocialPost,
        dispatchAgentCommand,
        updateAgentConfig
      }}
    >
      {children}
    </OSContext.Provider>
  );
};

export const useOS = () => useContext(OSContext);
