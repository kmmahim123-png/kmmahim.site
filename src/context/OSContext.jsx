import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import {
  uploadLifeOSData,
  fetchLifeOSData,
  testSupabaseConnection,
  subscribeToLifeOS
} from '../services/supabaseClient';

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
    customHabits: [],
    dailyLogs: {
      "2026-11-09": {
        namaz: { fajr: true, zuhr: true, asr: true, maghrib: true, isha: false },
        minoxidil: { morning: true, night: false },
        gym: { done: true, muscle: "Chest & Triceps", weightLog: "Dumbbell Press 22kg" },
        custom: {}
      }
    }
  },
  goalCycleStamps: {},
  goals: [
    { id: "g1", title: "Connect OpenClaw Webhook with Social Poster", timeframe: "daily", completed: false, category: "AI Work", deadline: "" },
    { id: "g2", title: "Review Sports Science Lecture Notes", timeframe: "daily", completed: false, category: "Academic", deadline: "" }
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

// Helper: Local YYYY-MM-DD
const getLocalDateStr = (d = new Date()) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Helper: Current cycle keys for Daily (12 AM), Weekly (Friday Reset), Monthly (Month End), Yearly (Dec 31)
export const getGoalCycleKeys = (now = new Date()) => {
  const daily = getLocalDateStr(now);

  // Weekly anchored to Friday (day 5): find upcoming or current Friday
  const d = new Date(now);
  const dayOfWeek = d.getDay(); // 0=Sun..5=Fri, 6=Sat
  const daysUntilFriday = (5 - dayOfWeek + 7) % 7;
  d.setDate(d.getDate() + daysUntilFriday);
  const weekly = `fri-${getLocalDateStr(d)}`;

  const monthly = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const yearly = `${now.getFullYear()}`;

  return { daily, weekly, monthly, yearly };
};

const LAST_CLOUD_SYNC_KEY = 'KM_MAHIM_LAST_CLOUD_SYNC';
const PENDING_UPLOAD_KEY = 'KM_MAHIM_PENDING_UPLOAD';

const hasUntouchedDemoOnly = (state) => {
  if (!state) return true;
  const tx = state.finance?.transactions || [];
  const debts = state.finance?.debts || [];
  const deps = state.meals?.deposits || [];
  const goals = state.goals || [];
  const ideas = state.ideas || [];
  const mealLogKeys = Object.keys(state.meals?.logs || {});
  const habitLogKeys = Object.keys(state.habits?.dailyLogs || {});

  const hasDemoSeeds =
    tx.some((t) => t.id === 't1') &&
    deps.some((d) => d.id === 'dep1') &&
    goals.some((g) => g.id === 'g1');
  if (!hasDemoSeeds) return false;

  const onlyDemoTx = tx.every((t) => t.id === 't1' || t.id === 't2');
  const onlyDemoDebts = debts.every((d) => d.id === 'd1');
  const onlyDemoDeps = deps.every((d) => d.id === 'dep1');
  const onlyDemoGoals = goals.every((g) => g.id === 'g1' || g.id === 'g2');
  const onlyDemoIdeas = ideas.every((i) => i.id === 'i1');
  const onlyDemoLogs =
    mealLogKeys.every((k) => k === '2026-11-09') &&
    habitLogKeys.every((k) => k === '2026-11-09') &&
    (state.habits?.customHabits || []).length === 0;

  const wallets = state.finance?.wallets || {};
  const defWallets = INITIAL_DATA.finance.wallets;
  const untouchedWallets =
    Number(wallets.cash) === defWallets.cash &&
    Number(wallets.bkash) === defWallets.bkash &&
    Number(wallets.nagad) === defWallets.nagad &&
    Number(wallets.bank) === defWallets.bank;

  return (
    untouchedWallets &&
    onlyDemoTx &&
    onlyDemoDebts &&
    onlyDemoDeps &&
    onlyDemoGoals &&
    onlyDemoIdeas &&
    onlyDemoLogs
  );
};

const normalizeOSState = (incoming, fallback = INITIAL_DATA) => {
  if (!incoming || typeof incoming !== 'object') return fallback;
  return {
    ...INITIAL_DATA,
    ...fallback,
    ...incoming,
    profile: { ...INITIAL_DATA.profile, ...(fallback.profile || {}), ...(incoming.profile || {}) },
    finance: { ...INITIAL_DATA.finance, ...(fallback.finance || {}), ...(incoming.finance || {}) },
    meals: { ...INITIAL_DATA.meals, ...(fallback.meals || {}), ...(incoming.meals || {}) },
    habits: {
      ...INITIAL_DATA.habits,
      ...(fallback.habits || {}),
      ...(incoming.habits || {}),
      customHabits: incoming.habits?.customHabits || fallback.habits?.customHabits || []
    },
    agents: {
      ...INITIAL_DATA.agents,
      ...(fallback.agents || {}),
      ...(incoming.agents || {}),
      bots: incoming.agents?.bots?.length ? incoming.agents.bots : INITIAL_DATA.agents.bots,
      logs: incoming.agents?.logs?.length ? incoming.agents.logs : INITIAL_DATA.agents.logs
    }
  };
};

const mergeArraysById = (primary = [], secondary = [], demoIds = new Set(), stripDemo = false) => {
  const map = new Map();
  for (const item of [...primary, ...secondary]) {
    if (!item) continue;
    const key = item.id || JSON.stringify(item);
    if (stripDemo && demoIds.has(key)) continue;
    if (!map.has(key)) map.set(key, item);
  }
  return Array.from(map.values());
};

const smartMergeOSData = (localState, remoteState) => {
  if (!remoteState) return localState;
  if (!localState || hasUntouchedDemoOnly(localState)) return normalizeOSState(remoteState);
  if (hasUntouchedDemoOnly(remoteState)) return normalizeOSState(localState);

  const demoIds = new Set(['t1', 't2', 'd1', 'dep1', 'g1', 'g2', 'i1', 'p1', 'p2', 'p3', 'sq1']);
  const localWallets = localState.finance?.wallets || {};
  const remoteWallets = remoteState.finance?.wallets || {};
  const defWallets = INITIAL_DATA.finance.wallets;
  const mergedWallets = { ...remoteWallets };
  for (const k of ['cash', 'bkash', 'nagad', 'bank']) {
    const localChanged = Number(localWallets[k] ?? defWallets[k]) !== defWallets[k];
    const remoteChanged = Number(remoteWallets[k] ?? defWallets[k]) !== defWallets[k];
    if (localChanged && !remoteChanged) {
      mergedWallets[k] = localWallets[k];
    } else if (Number(localWallets[k] || 0) > 0 && Number(remoteWallets[k] || 0) === 0) {
      mergedWallets[k] = localWallets[k];
    }
  }

  return normalizeOSState({
    ...remoteState,
    ...localState,
    profile: { ...remoteState.profile, ...localState.profile },
    finance: {
      wallets: mergedWallets,
      transactions: mergeArraysById(localState.finance?.transactions, remoteState.finance?.transactions, demoIds, true),
      debts: mergeArraysById(localState.finance?.debts, remoteState.finance?.debts, demoIds, true)
    },
    meals: {
      ...(remoteState.meals || {}),
      ...(localState.meals || {}),
      deposits: mergeArraysById(localState.meals?.deposits, remoteState.meals?.deposits, demoIds, true),
      logs: { ...(remoteState.meals?.logs || {}), ...(localState.meals?.logs || {}) }
    },
    habits: {
      ...(remoteState.habits || {}),
      ...(localState.habits || {}),
      customHabits: mergeArraysById(localState.habits?.customHabits, remoteState.habits?.customHabits),
      dailyLogs: { ...(remoteState.habits?.dailyLogs || {}), ...(localState.habits?.dailyLogs || {}) }
    },
    goals: mergeArraysById(localState.goals, remoteState.goals, demoIds, false),
    ideas: mergeArraysById(localState.ideas, remoteState.ideas, demoIds, false),
    projects: mergeArraysById(localState.projects, remoteState.projects),
    services: mergeArraysById(localState.services, remoteState.services),
    messages: mergeArraysById(localState.messages, remoteState.messages),
    socialQueue: mergeArraysById(localState.socialQueue, remoteState.socialQueue),
    agents: {
      ...(remoteState.agents || {}),
      ...(localState.agents || {}),
      logs: mergeArraysById(localState.agents?.logs, remoteState.agents?.logs).slice(0, 40)
    }
  });
};

export const OSProvider = ({ children }) => {
  const [data, setData] = useState(() => {
    const saved = localStorage.getItem('KM_MAHIM_LIFE_OS_V1');
    const cycles = getGoalCycleKeys(new Date());
    if (!saved) {
      return { ...INITIAL_DATA, goalCycleStamps: cycles };
    }
    try {
      const parsed = JSON.parse(saved);
      const savedStamps = parsed.goalCycleStamps || {};
      let goals = parsed.goals || INITIAL_DATA.goals;

      // Auto-reset completed flags when a cycle (Daily midnight, Weekly Friday, Monthly end, Yearly end) rolls over
      goals = goals.map((g) => {
        const tf = g.timeframe || 'daily';
        if (savedStamps[tf] && savedStamps[tf] !== cycles[tf] && g.completed) {
          return { ...g, completed: false };
        }
        return g;
      });

      return {
        ...INITIAL_DATA,
        ...parsed,
        profile: { ...INITIAL_DATA.profile, ...(parsed.profile || {}) },
        finance: { ...INITIAL_DATA.finance, ...(parsed.finance || {}) },
        meals: { ...INITIAL_DATA.meals, ...(parsed.meals || {}) },
        habits: {
          ...INITIAL_DATA.habits,
          ...(parsed.habits || {}),
          customHabits: parsed.habits?.customHabits || []
        },
        goalCycleStamps: cycles,
        goals,
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
      return { ...INITIAL_DATA, goalCycleStamps: cycles };
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

  // Supabase Cloud Sync State & Actions
  const [syncStatus, setSyncStatus] = useState({
    status: 'idle', // 'idle' | 'syncing' | 'success' | 'needs_setup' | 'error'
    lastSync: localStorage.getItem(LAST_CLOUD_SYNC_KEY) || null,
    setupReason: null,
    message: ''
  });
  const [cloudSnapshot, setCloudSnapshot] = useState({
    checkedAt: null,
    empty: true,
    timestamp: null,
    data: null
  });

  // Default Auto-Sync to TRUE so Laptop <-> Mobile sync works automatically
  const [autoSync, setAutoSync] = useState(() => {
    return localStorage.getItem('KM_MAHIM_AUTOSYNC') !== 'false';
  });

  const dataRef = useRef(data);
  dataRef.current = data;

  const isApplyingRemoteRef = useRef(false);
  const isFirstRenderRef = useRef(true);

  const toggleAutoSync = () => {
    setAutoSync((prev) => {
      const next = !prev;
      localStorage.setItem('KM_MAHIM_AUTOSYNC', String(next));
      return next;
    });
  };

  const applyRemoteData = (remoteData, remoteTimestamp) => {
    if (!remoteData) return;
    isApplyingRemoteRef.current = true;
    setData((prev) => normalizeOSState(remoteData, prev));
    if (remoteTimestamp) {
      localStorage.setItem(LAST_CLOUD_SYNC_KEY, remoteTimestamp);
    }
    localStorage.removeItem(PENDING_UPLOAD_KEY);
    setTimeout(() => {
      isApplyingRemoteRef.current = false;
    }, 600);
  };

  const uploadToSupabase = async (overrideData = null) => {
    setSyncStatus((prev) => ({
      ...prev,
      status: 'syncing',
      message: 'Supabase ডাটাবেসে সেভ হচ্ছে...'
    }));
    const payload = overrideData || dataRef.current;
    const result = await uploadLifeOSData('primary_os', payload);
    if (result.success) {
      if (result.timestamp) {
        localStorage.setItem(LAST_CLOUD_SYNC_KEY, result.timestamp);
      }
      localStorage.removeItem(PENDING_UPLOAD_KEY);
      setCloudSnapshot({
        checkedAt: new Date().toISOString(),
        empty: false,
        timestamp: result.timestamp,
        data: payload
      });
      setSyncStatus({
        status: 'success',
        lastSync: result.timestamp,
        setupReason: null,
        message: result.message
      });
      return true;
    } else {
      localStorage.setItem(PENDING_UPLOAD_KEY, '1');
      setSyncStatus({
        status: result.needsSetup ? 'needs_setup' : 'error',
        lastSync: localStorage.getItem(LAST_CLOUD_SYNC_KEY) || null,
        setupReason: result.setupReason || null,
        message: result.message
      });
      return false;
    }
  };

  const pullFromSupabase = async (silent = false) => {
    if (!silent) {
      setSyncStatus((prev) => ({
        ...prev,
        status: 'syncing',
        message: 'ডাটাবেস থেকে লেটেস্ট ডেটা আনা হচ্ছে...'
      }));
    }
    const result = await fetchLifeOSData('primary_os');
    if (result.success && result.data) {
      applyRemoteData(result.data, result.timestamp);
      setCloudSnapshot({
        checkedAt: new Date().toISOString(),
        empty: false,
        timestamp: result.timestamp,
        data: result.data
      });
      setSyncStatus({
        status: 'success',
        lastSync: result.timestamp,
        setupReason: null,
        message: 'Supabase থেকে লেটেস্ট ডেটা সিঙ্ক হয়েছে! ☁️'
      });
      return true;
    } else if (result.success && result.empty) {
      setCloudSnapshot({
        checkedAt: new Date().toISOString(),
        empty: true,
        timestamp: null,
        data: null
      });
      setSyncStatus({
        status: 'idle',
        lastSync: null,
        setupReason: null,
        message: 'Supabase টেবিল খালি আছে — আপলোড করলে সেভ হবে।'
      });
      return false;
    } else {
      setSyncStatus({
        status: result.needsSetup ? 'needs_setup' : 'error',
        lastSync: localStorage.getItem(LAST_CLOUD_SYNC_KEY) || null,
        setupReason: result.setupReason || null,
        message: result.message || 'ডাটাবেস কানেকশন পাওয়া যায়নি'
      });
      return false;
    }
  };

  const mergeAndSyncWithCloud = async () => {
    setSyncStatus((prev) => ({
      ...prev,
      status: 'syncing',
      message: 'দুই ডিভাইসের ডেটা মিলিয়ে সিঙ্ক করা হচ্ছে...'
    }));
    const latest = await fetchLifeOSData('primary_os');
    if (!latest.success) {
      setSyncStatus({
        status: latest.needsSetup ? 'needs_setup' : 'error',
        lastSync: localStorage.getItem(LAST_CLOUD_SYNC_KEY) || null,
        setupReason: latest.setupReason || null,
        message: latest.message
      });
      return false;
    }
    if (latest.empty || !latest.data) {
      return uploadToSupabase(dataRef.current);
    }
    const merged = smartMergeOSData(dataRef.current, latest.data);
    applyRemoteData(merged, latest.timestamp);
    return uploadToSupabase(merged);
  };

  const refreshCloudStatus = async () => {
    const diag = await testSupabaseConnection('primary_os');
    setCloudSnapshot({
      checkedAt: new Date().toISOString(),
      empty: Boolean(diag.empty),
      timestamp: diag.timestamp || null,
      data: diag.cloudData || null
    });
    if (!diag.success) {
      setSyncStatus({
        status: diag.needsSetup ? 'needs_setup' : 'error',
        lastSync: localStorage.getItem(LAST_CLOUD_SYNC_KEY) || null,
        setupReason: diag.setupReason || null,
        message: diag.message
      });
    } else if (diag.cloudData) {
      setSyncStatus((prev) => ({
        ...prev,
        status: 'success',
        lastSync: diag.timestamp,
        setupReason: null
      }));
    }
    return diag;
  };

  // Startup Cloud Fetch, Reconcile & Live Realtime Subscription (Laptop <-> Mobile instant sync)
  useEffect(() => {
    const syncOnOpen = async () => {
      const result = await fetchLifeOSData('primary_os');
      if (result.needsSetup) {
        setSyncStatus({
          status: 'needs_setup',
          lastSync: null,
          setupReason: result.setupReason || 'missing_table',
          message: result.message
        });
        return;
      }
      if (!result.success) {
        setSyncStatus({
          status: 'error',
          lastSync: localStorage.getItem(LAST_CLOUD_SYNC_KEY) || null,
          setupReason: null,
          message: result.message || 'ডাটাবেস সংযোগ ব্যর্থ হয়েছে'
        });
        return;
      }

      if (result.empty || !result.data) {
        setCloudSnapshot({
          checkedAt: new Date().toISOString(),
          empty: true,
          timestamp: null,
          data: null
        });
        const hasPending = localStorage.getItem(PENDING_UPLOAD_KEY) === '1';
        if (hasPending || !hasUntouchedDemoOnly(dataRef.current)) {
          await uploadToSupabase(dataRef.current);
        } else {
          setSyncStatus({
            status: 'idle',
            lastSync: null,
            setupReason: null,
            message: 'Supabase Live Ready — প্রথম আপডেটেই ক্লাউডে সেভ হবে।'
          });
        }
        return;
      }

      setCloudSnapshot({
        checkedAt: new Date().toISOString(),
        empty: false,
        timestamp: result.timestamp,
        data: result.data
      });

      const remoteTime = new Date(result.timestamp || 0).getTime();
      const lastCloudSync = new Date(localStorage.getItem(LAST_CLOUD_SYNC_KEY) || 0).getTime();
      const hasPending = localStorage.getItem(PENDING_UPLOAD_KEY) === '1';
      const localIsDemoOnly = hasUntouchedDemoOnly(dataRef.current);

      if (localIsDemoOnly) {
        applyRemoteData(result.data, result.timestamp);
        setSyncStatus({
          status: 'success',
          lastSync: result.timestamp,
          setupReason: null,
          message: 'ক্লাউডের লেটেস্ট ডেটা সিঙ্ক হয়েছে! ☁️'
        });
      } else if (!hasPending && (remoteTime > lastCloudSync || !lastCloudSync)) {
        applyRemoteData(result.data, result.timestamp);
        setSyncStatus({
          status: 'success',
          lastSync: result.timestamp,
          setupReason: null,
          message: 'অন্য ডিভাইসের লেটেস্ট ডেটা সিঙ্ক হয়েছে! ☁️'
        });
      } else if (hasPending && lastCloudSync > 0 && remoteTime <= lastCloudSync) {
        await uploadToSupabase(dataRef.current);
      } else if ((hasPending || !lastCloudSync) && remoteTime > lastCloudSync) {
        // Both devices hold distinct real updates -> merge cleanly without losing either!
        const merged = smartMergeOSData(dataRef.current, result.data);
        applyRemoteData(merged, result.timestamp);
        await uploadToSupabase(merged);
      } else {
        localStorage.setItem(LAST_CLOUD_SYNC_KEY, result.timestamp);
        setSyncStatus({
          status: 'success',
          lastSync: result.timestamp,
          setupReason: null,
          message: 'Supabase Live Connected 🟢'
        });
      }
    };

    syncOnOpen();

    // Realtime channel listener
    const unsubscribe = subscribeToLifeOS('primary_os', (remoteData, remoteTimestamp) => {
      setCloudSnapshot({
        checkedAt: new Date().toISOString(),
        empty: false,
        timestamp: remoteTimestamp,
        data: remoteData
      });
      const lastCloudSync = new Date(localStorage.getItem(LAST_CLOUD_SYNC_KEY) || 0).getTime();
      const remoteTime = new Date(remoteTimestamp || 0).getTime();
      if (remoteTime > lastCloudSync) {
        applyRemoteData(remoteData, remoteTimestamp);
        setSyncStatus({
          status: 'success',
          lastSync: remoteTimestamp,
          setupReason: null,
          message: 'লাইভ আপডেট রিসিভ হয়েছে! ⚡'
        });
      }
    });

    // Refresh when tab/mobile app returns to foreground or internet reconnects
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        syncOnOpen();
      }
    };
    const handleOnline = () => {
      syncOnOpen();
    };
    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('online', handleOnline);

    return () => {
      unsubscribe();
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  // Auto-sync debounce on local user edits
  useEffect(() => {
    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false;
      return;
    }
    if (isApplyingRemoteRef.current) return;

    localStorage.setItem(PENDING_UPLOAD_KEY, '1');

    if (!autoSync) return;
    const timeout = setTimeout(() => {
      uploadToSupabase(dataRef.current);
    }, 1200);
    return () => clearTimeout(timeout);
  }, [data, autoSync]);

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

  const deleteProject = (projectId) => {
    setData(prev => ({
      ...prev,
      projects: prev.projects.filter(p => p.id !== projectId)
    }));
  };

  const sendClientMessage = (msg) => {
    setData(prev => ({
      ...prev,
      messages: [{ ...msg, id: 'msg_' + Date.now(), date: new Date().toLocaleString(), type: 'client', read: false }, ...prev.messages]
    }));
  };

  const deleteMessage = (msgId) => {
    setData(prev => ({
      ...prev,
      messages: prev.messages.filter(m => m.id !== msgId)
    }));
  };

  // Part 2 Actions — Practical Finance & Wallet Editing
  const setWalletBalance = (walletKey, newAmount) => {
    const val = Math.max(0, Number(newAmount) || 0);
    setData(prev => ({
      ...prev,
      finance: {
        ...prev.finance,
        wallets: { ...prev.finance.wallets, [walletKey]: val }
      }
    }));
  };

  const transferBetweenWallets = ({ fromWallet, toWallet, amount, note }) => {
    const numAmount = Number(amount);
    if (!numAmount || numAmount <= 0 || fromWallet === toWallet) return;
    setData(prev => {
      const fromBal = prev.finance.wallets[fromWallet] || 0;
      const toBal = prev.finance.wallets[toWallet] || 0;
      const today = new Date().toISOString().slice(0, 10);
      const txOut = {
        id: 'tx_' + Date.now() + '_1',
        type: 'out',
        amount: numAmount,
        wallet: fromWallet,
        category: 'Wallet Transfer',
        note: `Transfer to ${toWallet.toUpperCase()}${note ? `: ${note}` : ''}`,
        date: today
      };
      const txIn = {
        id: 'tx_' + Date.now() + '_2',
        type: 'in',
        amount: numAmount,
        wallet: toWallet,
        category: 'Wallet Transfer',
        note: `Received from ${fromWallet.toUpperCase()}${note ? `: ${note}` : ''}`,
        date: today
      };
      return {
        ...prev,
        finance: {
          ...prev.finance,
          wallets: {
            ...prev.finance.wallets,
            [fromWallet]: Math.max(0, fromBal - numAmount),
            [toWallet]: toBal + numAmount
          },
          transactions: [txIn, txOut, ...prev.finance.transactions]
        }
      };
    });
  };

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

  const deleteTransaction = (txId, revertBalance = true) => {
    setData(prev => {
      const target = prev.finance.transactions.find(t => t.id === txId);
      if (!target) return prev;
      const nextWallets = { ...prev.finance.wallets };
      if (revertBalance && nextWallets[target.wallet] !== undefined) {
        if (target.type === 'in') {
          nextWallets[target.wallet] -= target.amount;
        } else {
          nextWallets[target.wallet] += target.amount;
        }
      }
      return {
        ...prev,
        finance: {
          ...prev.finance,
          wallets: nextWallets,
          transactions: prev.finance.transactions.filter(t => t.id !== txId)
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

  const deleteDebt = (debtId) => {
    setData(prev => ({
      ...prev,
      finance: {
        ...prev.finance,
        debts: prev.finance.debts.filter(d => d.id !== debtId)
      }
    }));
  };

  const resetFinanceData = () => {
    setData(prev => ({
      ...prev,
      finance: {
        wallets: { cash: 0, bkash: 0, nagad: 0, bank: 0 },
        transactions: [],
        debts: []
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

  const deleteMealDeposit = (depId) => {
    setData(prev => ({
      ...prev,
      meals: {
        ...prev.meals,
        deposits: prev.meals.deposits.filter(d => d.id !== depId)
      }
    }));
  };

  const updateDailyMeal = (dateKey, mealData) => {
    setData(prev => ({
      ...prev,
      meals: { ...prev.meals, logs: { ...prev.meals.logs, [dateKey]: mealData } }
    }));
  };

  const deleteMealLog = (dateKey) => {
    setData(prev => {
      const nextLogs = { ...prev.meals.logs };
      delete nextLogs[dateKey];
      return {
        ...prev,
        meals: { ...prev.meals, logs: nextLogs }
      };
    });
  };

  const resetMealsData = () => {
    setData(prev => ({
      ...prev,
      meals: {
        ...prev.meals,
        deposits: [],
        logs: {}
      }
    }));
  };

  const resetAllPersonalOSData = () => {
    setData(prev => ({
      ...prev,
      finance: {
        wallets: { cash: 0, bkash: 0, nagad: 0, bank: 0 },
        transactions: [],
        debts: []
      },
      meals: {
        ...prev.meals,
        deposits: [],
        logs: {}
      },
      habits: {
        minoxidilBottleStart: new Date().toISOString().slice(0, 10),
        dailyLogs: {}
      },
      goals: [],
      ideas: []
    }));
  };

  const hasDemoData = Boolean(
    data.finance?.transactions?.some(t => t.id === 't1' || t.id === 't2') ||
    data.finance?.debts?.some(d => d.id === 'd1') ||
    data.meals?.deposits?.some(d => d.id === 'dep1')
  );

  // Part 3 Actions
  const updateDailyHabits = (dateKey, habitUpdater) => {
    setData(prev => {
      const existingDay = prev.habits.dailyLogs[dateKey] || {
        namaz: { fajr: false, zuhr: false, asr: false, maghrib: false, isha: false },
        minoxidil: { morning: false, night: false },
        gym: { done: false, muscle: '', weightLog: '' },
        custom: {}
      };
      const updatedDay = typeof habitUpdater === 'function' ? habitUpdater(existingDay) : { ...existingDay, ...habitUpdater };
      return {
        ...prev,
        habits: { ...prev.habits, dailyLogs: { ...prev.habits.dailyLogs, [dateKey]: updatedDay } }
      };
    });
  };

  const addCustomHabit = ({ label, emoji = '⚡' }) => {
    if (!label) return;
    setData(prev => ({
      ...prev,
      habits: {
        ...prev.habits,
        customHabits: [
          ...(prev.habits.customHabits || []),
          { id: 'ch_' + Date.now(), label, emoji }
        ]
      }
    }));
  };

  const deleteCustomHabit = (habitId) => {
    setData(prev => ({
      ...prev,
      habits: {
        ...prev.habits,
        customHabits: (prev.habits.customHabits || []).filter(h => h.id !== habitId)
      }
    }));
  };

  const toggleCustomHabitForDay = (dateKey, habitId) => {
    updateDailyHabits(dateKey, (prevDay) => ({
      ...prevDay,
      custom: {
        ...(prevDay.custom || {}),
        [habitId]: !(prevDay.custom?.[habitId])
      }
    }));
  };

  const updateMinoxidilStart = (startDate) => {
    setData(prev => ({ ...prev, habits: { ...prev.habits, minoxidilBottleStart: startDate } }));
  };

  const addGoal = ({ title, timeframe, category, deadline }) => {
    if (!title) return;
    setData(prev => ({
      ...prev,
      goals: [
        {
          id: 'goal_' + Date.now(),
          title,
          timeframe: timeframe || 'daily',
          completed: false,
          category: category || 'General',
          deadline: deadline || '',
          createdAt: new Date().toISOString()
        },
        ...prev.goals
      ]
    }));
  };

  const restoreFromJSONBackup = (parsedPayload) => {
    const incoming = parsedPayload?.rawState || parsedPayload;
    if (!incoming || typeof incoming !== 'object') return false;
    setData((prev) => ({
      ...prev,
      ...incoming
    }));
    return true;
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
        deleteProject,
        sendClientMessage,
        deleteMessage,
        setWalletBalance,
        transferBetweenWallets,
        addTransaction,
        deleteTransaction,
        addDebt,
        toggleDebtSettled,
        deleteDebt,
        resetFinanceData,
        updateMealSettings,
        addMealDeposit,
        deleteMealDeposit,
        updateDailyMeal,
        deleteMealLog,
        resetMealsData,
        resetAllPersonalOSData,
        hasDemoData,
        updateDailyHabits,
        addCustomHabit,
        deleteCustomHabit,
        toggleCustomHabitForDay,
        updateMinoxidilStart,
        addGoal,
        toggleGoalComplete,
        deleteGoal,
        restoreFromJSONBackup,
        addIdea,
        deleteIdea,
        addSocialPost,
        approveAndPublishPost,
        deleteSocialPost,
        dispatchAgentCommand,
        updateAgentConfig,
        syncStatus,
        cloudSnapshot,
        autoSync,
        toggleAutoSync,
        uploadToSupabase,
        pullFromSupabase,
        mergeAndSyncWithCloud,
        refreshCloudStatus
      }}
    >
      {children}
    </OSContext.Provider>
  );
};

export const useOS = () => useContext(OSContext);
