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
      sender: "System Broker Agent",
      email: "agent@openclaw.local",
      service: "AI Routine Check",
      budget: "Internal",
      date: new Date().toLocaleDateString(),
      text: "Welcome back, Mahim! Part 3 habit, goal, and idea modules are now fully integrated.",
      type: "agent",
      read: false
    }
  ],
  finance: {
    wallets: { cash: 4500, bkash: 8200, nagad: 3100, bank: 25000 },
    transactions: [
      { id: "tx_1", type: "in", amount: 25000, wallet: "bank", category: "Client Project", note: "Web Platform Advance", date: "2026-11-01" },
      { id: "tx_2", type: "out", amount: 500, wallet: "bkash", category: "Food & Meal", note: "Hall Cafeteria", date: "2026-11-08" }
    ],
    debts: [
      { id: "debt_1", person: "Tanvir (RU Batch)", type: "receivable", amount: 1200, dueDate: "2026-11-15", note: "Sports Gala ticket share", settled: false },
      { id: "debt_2", person: "Mess Manager Rahim", type: "payable", amount: 800, dueDate: "2026-11-12", note: "Extra feast dinner fee", settled: false }
    ]
  },
  meals: {
    mode: "fixed",
    ratePerMeal: 55,
    packageTotalMeals: 60,
    deposits: [{ id: "d1", date: "2026-11-01", amount: 3000, note: "Initial Monthly Deposit" }],
    logs: {}
  },
  habits: {
    minoxidilBottleStart: "2026-11-01",
    dailyLogs: {
      "2026-11-09": {
        namaz: { fajr: true, zuhr: true, asr: false, maghrib: true, isha: false },
        minoxidil: { morning: true, night: false },
        gym: { done: true, muscle: "Chest & Triceps", weightLog: "Dumbbell Press 22kg" }
      }
    }
  },
  goals: [
    { id: "g1", title: "Complete OpenClaw Agent Bot Webhook Sync", timeframe: "daily", completed: true, category: "AI Work" },
    { id: "g2", title: "Study Sports Biomechanics Chapter 4", timeframe: "daily", completed: false, category: "Academic" },
    { id: "g3", title: "Scale JACKFRU international sample shipments", timeframe: "weekly", completed: false, category: "Business" },
    { id: "g4", title: "Master React Native & Capacitor APK Compilation", timeframe: "monthly", completed: true, category: "Development" }
  ],
  ideas: [
    {
      id: "i1",
      title: "Autonomous Gym PR Tracker Bot",
      tag: "AI & Fitness",
      status: "Researching",
      content: "An AI agent that listens to voice notes after gym sessions and automatically logs workout weights and PRs into my Life OS.",
      image: "",
      date: "2026-11-02"
    },
    {
      id: "i2",
      title: "Automated Mess Meal Splitter for Rajshahi University Halls",
      tag: "Utility App",
      status: "Working On It",
      content: "A PWA web tool for student messes where deposits and daily meal counts automatically calculate individual meal rates and dues.",
      image: "",
      date: "2026-11-05"
    }
  ],
  socialQueue: [],
  agents: {
    webhookUrl: "https://api.kmmahim.com/v1/agent-webhook",
    apiKey: "km_live_openclaw_99482x",
    autoApprove: false
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
        finance: {
          wallets: { ...INITIAL_DATA.finance.wallets, ...(parsed.finance?.wallets || {}) },
          transactions: parsed.finance?.transactions?.length ? parsed.finance.transactions : INITIAL_DATA.finance.transactions,
          debts: parsed.finance?.debts?.length ? parsed.finance.debts : INITIAL_DATA.finance.debts
        },
        meals: {
          ...INITIAL_DATA.meals,
          ...(parsed.meals || {}),
          deposits: parsed.meals?.deposits?.length ? parsed.meals.deposits : INITIAL_DATA.meals.deposits,
          logs: parsed.meals?.logs || {}
        },
        habits: {
          minoxidilBottleStart: parsed.habits?.minoxidilBottleStart || INITIAL_DATA.habits.minoxidilBottleStart,
          dailyLogs: parsed.habits?.dailyLogs && Object.keys(parsed.habits.dailyLogs).length ? parsed.habits.dailyLogs : INITIAL_DATA.habits.dailyLogs
        },
        goals: parsed.goals?.length ? parsed.goals : INITIAL_DATA.goals,
        ideas: parsed.ideas?.length ? parsed.ideas : INITIAL_DATA.ideas
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
      messages: [
        {
          ...msg,
          id: 'msg_' + Date.now(),
          date: new Date().toLocaleString(),
          type: 'client',
          read: false
        },
        ...prev.messages
      ]
    }));
  };

  // --- PART 2: FINANCE ACTIONS ---
  const addTransaction = ({ type, amount, wallet, category, note, date }) => {
    const numAmount = Number(amount) || 0;
    setData(prev => {
      const currentBal = Number(prev.finance.wallets[wallet] || 0);
      const newBal = type === 'in' ? currentBal + numAmount : currentBal - numAmount;

      return {
        ...prev,
        finance: {
          ...prev.finance,
          wallets: {
            ...prev.finance.wallets,
            [wallet]: Math.max(0, newBal)
          },
          transactions: [
            {
              id: 'tx_' + Date.now(),
              type,
              amount: numAmount,
              wallet,
              category: category || 'Other',
              note: note || '',
              date: date || new Date().toISOString().slice(0, 10)
            },
            ...prev.finance.transactions
          ]
        }
      };
    });
  };

  const addDebt = ({ person, type, amount, dueDate, note }) => {
    const numAmount = Number(amount) || 0;
    setData(prev => ({
      ...prev,
      finance: {
        ...prev.finance,
        debts: [
          {
            id: 'debt_' + Date.now(),
            person,
            type: type || 'receivable',
            amount: numAmount,
            dueDate: dueDate || '',
            note: note || '',
            settled: false
          },
          ...prev.finance.debts
        ]
      }
    }));
  };

  const toggleDebtSettled = (id) => {
    setData(prev => ({
      ...prev,
      finance: {
        ...prev.finance,
        debts: prev.finance.debts.map(d =>
          d.id === id ? { ...d, settled: !d.settled } : d
        )
      }
    }));
  };

  // --- PART 2: MEALS ACTIONS ---
  const updateMealSettings = (settings) => {
    setData(prev => ({
      ...prev,
      meals: {
        ...prev.meals,
        ...settings
      }
    }));
  };

  const addMealDeposit = ({ amount, date, note, deductFromWallet }) => {
    const numAmount = Number(amount) || 0;
    setData(prev => {
      let updatedWallets = prev.finance.wallets;
      let updatedTx = prev.finance.transactions;

      if (deductFromWallet && updatedWallets[deductFromWallet] !== undefined) {
        const currentBal = Number(updatedWallets[deductFromWallet] || 0);
        updatedWallets = {
          ...updatedWallets,
          [deductFromWallet]: Math.max(0, currentBal - numAmount)
        };
        updatedTx = [
          {
            id: 'tx_' + Date.now(),
            type: 'out',
            amount: numAmount,
            wallet: deductFromWallet,
            category: 'Food & Meal',
            note: note ? `Meal Deposit: ${note}` : 'Meal Deposit',
            date: date || new Date().toISOString().slice(0, 10)
          },
          ...updatedTx
        ];
      }

      return {
        ...prev,
        finance: {
          ...prev.finance,
          wallets: updatedWallets,
          transactions: updatedTx
        },
        meals: {
          ...prev.meals,
          deposits: [
            {
              id: 'dep_' + Date.now(),
              amount: numAmount,
              date: date || new Date().toISOString().slice(0, 10),
              note: note || 'Meal Deposit'
            },
            ...prev.meals.deposits
          ]
        }
      };
    });
  };

  const updateDailyMeal = (dateKey, mealData) => {
    setData(prev => ({
      ...prev,
      meals: {
        ...prev.meals,
        logs: {
          ...prev.meals.logs,
          [dateKey]: mealData
        }
      }
    }));
  };

  // --- PART 3: HABITS ACTIONS ---
  const updateDailyHabits = (dateKey, habitUpdater) => {
    setData(prev => {
      const existingDay = prev.habits.dailyLogs[dateKey] || {
        namaz: { fajr: false, zuhr: false, asr: false, maghrib: false, isha: false },
        minoxidil: { morning: false, night: false },
        gym: { done: false, muscle: '', weightLog: '' }
      };

      const updatedDay =
        typeof habitUpdater === 'function' ? habitUpdater(existingDay) : { ...existingDay, ...habitUpdater };

      return {
        ...prev,
        habits: {
          ...prev.habits,
          dailyLogs: {
            ...prev.habits.dailyLogs,
            [dateKey]: updatedDay
          }
        }
      };
    });
  };

  const updateMinoxidilStart = (startDate) => {
    setData(prev => ({
      ...prev,
      habits: { ...prev.habits, minoxidilBottleStart: startDate }
    }));
  };

  // --- PART 3: GOALS & STUDY ACTIONS ---
  const addGoal = ({ title, timeframe, category }) => {
    if (!title) return;
    setData(prev => ({
      ...prev,
      goals: [
        {
          id: 'goal_' + Date.now(),
          title,
          timeframe: timeframe || 'daily',
          completed: false,
          category: category || 'General'
        },
        ...prev.goals
      ]
    }));
  };

  const toggleGoalComplete = (goalId) => {
    setData(prev => ({
      ...prev,
      goals: prev.goals.map(g => (g.id === goalId ? { ...g, completed: !g.completed } : g))
    }));
  };

  const deleteGoal = (goalId) => {
    setData(prev => ({
      ...prev,
      goals: prev.goals.filter(g => g.id !== goalId)
    }));
  };

  // --- PART 3: CHULBUL IDEA VAULT ACTIONS ---
  const addIdea = ({ title, tag, status, content, image }) => {
    if (!title) return;
    setData(prev => ({
      ...prev,
      ideas: [
        {
          id: 'idea_' + Date.now(),
          title,
          tag: tag || 'General',
          status: status || 'Just Idea',
          content: content || '',
          image: image || '',
          date: new Date().toISOString().slice(0, 10)
        },
        ...prev.ideas
      ]
    }));
  };

  const deleteIdea = (ideaId) => {
    setData(prev => ({
      ...prev,
      ideas: prev.ideas.filter(i => i.id !== ideaId)
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
        deleteIdea
      }}
    >
      {children}
    </OSContext.Provider>
  );
};

export const useOS = () => useContext(OSContext);
