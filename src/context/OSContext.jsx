import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import {
  uploadLifeOSData,
  fetchLifeOSData,
  testSupabaseConnection,
  subscribeToLifeOS,
  submitPublicInquiry,
  fetchPublicInquiries,
  deletePublicInquiry
} from '../services/supabaseClient';
import { getLocalDateStr } from '../utils/dateUtils';
import {
  listGmailMessages,
  sendGmailMessage,
  listCalendarEvents,
  createCalendarEvent,
  listGoogleContacts,
  fetchYouTubeVideos
} from '../services/googleIntegrations';
import { sendWhatsAppMessage } from '../services/whatsappService';
import { SoundFX } from '../components/common/SoundEffects';

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
  },
  secondBrain: {
    notes: [
      {
        id: "sb1",
        title: "JACKFRU Retail Strategy",
        folder: "Projects",
        tags: ["Apparel", "Business"],
        content: "# JACKFRU Launch Blueprint\n- Focus on quality stitching & packaging.\n- Connect with [[Autonomous Life OS]] for cashflow tracking.",
        pinned: true,
        updatedAt: "2026-11-09"
      },
      {
        id: "sb2",
        title: "Autonomous Life OS Architecture",
        folder: "Areas",
        tags: ["AI", "SecondBrain"],
        content: "Unified Second Brain combining [[JACKFRU Retail Strategy]], Sports Science notes, and AI Tool-Calling.",
        pinned: false,
        updatedAt: "2026-11-09"
      }
    ],
    journal: {},
    flashcards: [
      {
        id: "fc1",
        topic: "Sports Science",
        front: "What is VO2 Max?",
        back: "Maximum rate of oxygen consumption measured during incremental exercise (ml/kg/min).",
        mastery: 1,
        nextReview: "2026-11-10"
      }
    ]
  },
  budgets: {
    "Food & Meal": 4000,
    "Transport & Varsity": 1500,
    "Tech & AI APIs": 1500,
    "Personal & Care": 1500
  },
  recurringBills: [],
  customSections: [],
  mediaVault: {
    channelPlaylists: [],
    savedVideos: [],
    audioTracks: []
  }
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

const UNLOCK_UNTIL_KEY = 'KM_MAHIM_UNLOCK_UNTIL';
const ACTIVE_LAYER_KEY = 'KM_MAHIM_ACTIVE_LAYER';
const SECRET_CONFIG_KEY = 'KM_MAHIM_SECRET_CONFIG_V1';

const normalizeOSState = (incoming, fallback = INITIAL_DATA) => {
  if (!incoming || typeof incoming !== 'object') return fallback;
  return {
    ...INITIAL_DATA,
    ...fallback,
    ...incoming,
    profile: {
      ...INITIAL_DATA.profile,
      ...(fallback.profile || {}),
      ...(incoming.profile || {}),
      socials: {
        ...INITIAL_DATA.profile.socials,
        ...(fallback.profile?.socials || {}),
        ...(incoming.profile?.socials || {})
      }
    },
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
    },
    secondBrain: {
      notes: incoming.secondBrain?.notes || fallback.secondBrain?.notes || INITIAL_DATA.secondBrain.notes,
      journal: {
        ...(INITIAL_DATA.secondBrain.journal || {}),
        ...(fallback.secondBrain?.journal || {}),
        ...(incoming.secondBrain?.journal || {})
      },
      flashcards:
        incoming.secondBrain?.flashcards ||
        fallback.secondBrain?.flashcards ||
        INITIAL_DATA.secondBrain.flashcards
    },
    budgets: {
      ...INITIAL_DATA.budgets,
      ...(fallback.budgets || {}),
      ...(incoming.budgets || {})
    },
    recurringBills:
      incoming.recurringBills || fallback.recurringBills || INITIAL_DATA.recurringBills,
    customSections:
      incoming.customSections || fallback.customSections || INITIAL_DATA.customSections,
    mediaVault: {
      ...INITIAL_DATA.mediaVault,
      ...(fallback.mediaVault || {}),
      ...(incoming.mediaVault || {}),
      channelPlaylists:
        incoming.mediaVault?.channelPlaylists || fallback.mediaVault?.channelPlaylists || [],
      savedVideos: incoming.mediaVault?.savedVideos || fallback.mediaVault?.savedVideos || [],
      audioTracks: incoming.mediaVault?.audioTracks || fallback.mediaVault?.audioTracks || []
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
    },
    secondBrain: {
      notes: mergeArraysById(localState.secondBrain?.notes, remoteState.secondBrain?.notes),
      journal: {
        ...(remoteState.secondBrain?.journal || {}),
        ...(localState.secondBrain?.journal || {})
      },
      flashcards: mergeArraysById(
        localState.secondBrain?.flashcards,
        remoteState.secondBrain?.flashcards
      )
    },
    budgets: { ...(remoteState.budgets || {}), ...(localState.budgets || {}) },
    recurringBills: mergeArraysById(localState.recurringBills, remoteState.recurringBills),
    customSections: mergeArraysById(localState.customSections, remoteState.customSections),
    mediaVault: {
      channelPlaylists: mergeArraysById(
        localState.mediaVault?.channelPlaylists,
        remoteState.mediaVault?.channelPlaylists
      ),
      savedVideos: mergeArraysById(
        localState.mediaVault?.savedVideos,
        remoteState.mediaVault?.savedVideos
      ),
      audioTracks: mergeArraysById(
        localState.mediaVault?.audioTracks,
        remoteState.mediaVault?.audioTracks
      )
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

      // Auto-reset completed flags when a cycle rolls over
      goals = goals.map((g) => {
        const tf = g.timeframe || 'daily';
        if (savedStamps[tf] && savedStamps[tf] !== cycles[tf] && g.completed) {
          return { ...g, completed: false };
        }
        return g;
      });

      return normalizeOSState({
        ...parsed,
        goalCycleStamps: cycles,
        goals,
        socialQueue: parsed.socialQueue?.length ? parsed.socialQueue : INITIAL_DATA.socialQueue
      });
    } catch {
      return { ...INITIAL_DATA, goalCycleStamps: cycles };
    }
  });

  // Persistent Trusted Device Session (survives reload until Lock OS or expiry!)
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const until = Number(localStorage.getItem(UNLOCK_UNTIL_KEY) || 0);
    return until > Date.now();
  });
  const [activeLayer, setActiveLayerState] = useState(() => {
    const until = Number(localStorage.getItem(UNLOCK_UNTIL_KEY) || 0);
    if (until > Date.now() && localStorage.getItem(ACTIVE_LAYER_KEY) === 'private') {
      return 'private';
    }
    return 'public';
  });
  const [showPinModal, setShowPinModal] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const setActiveLayer = (nextLayer) => {
    const resolved = typeof nextLayer === 'function' ? nextLayer(activeLayer) : nextLayer;
    localStorage.setItem(ACTIVE_LAYER_KEY, resolved);
    setActiveLayerState(resolved);
  };

  // Device-Local Secret Config (API Keys, OAuth Client ID, Meta Tokens — kept out of public cloud row)
  const [secretConfig, setSecretConfig] = useState(() => {
    try {
      const raw = localStorage.getItem(SECRET_CONFIG_KEY);
      return raw
        ? JSON.parse(raw)
        : {
            aiProvider: 'gemini',
            aiModel: '',
            aiApiKey: '',
            rememberDays: 7,
            googleClientId: '',
            youtubeApiKey: '',
            metaWaToken: '',
            metaWaPhoneId: '',
            whatsappWebhookUrl: ''
          };
    } catch {
      return {
        aiProvider: 'gemini',
        aiModel: '',
        aiApiKey: '',
        rememberDays: 7,
        googleClientId: '',
        youtubeApiKey: '',
        metaWaToken: '',
        metaWaPhoneId: '',
        whatsappWebhookUrl: ''
      };
    }
  });

  const updateSecretConfig = (patch) => {
    setSecretConfig((prev) => {
      const next = { ...prev, ...patch };
      localStorage.setItem(SECRET_CONFIG_KEY, JSON.stringify(next));
      return next;
    });
  };

  // Ephemeral Google OAuth Token + Cached Live Feeds
  const [googleSession, setGoogleSession] = useState(() => {
    try {
      const cached = sessionStorage.getItem('KM_MAHIM_GOOGLE_TOKEN');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed.expiresAt > Date.now()) return parsed;
      }
    } catch {}
    return { accessToken: '', expiresAt: 0, scope: '' };
  });

  const saveGoogleSession = (sess) => {
    setGoogleSession(sess);
    try {
      if (sess?.accessToken) {
        sessionStorage.setItem('KM_MAHIM_GOOGLE_TOKEN', JSON.stringify(sess));
      } else {
        sessionStorage.removeItem('KM_MAHIM_GOOGLE_TOKEN');
      }
    } catch {}
  };

  const [integrationFeeds, setIntegrationFeeds] = useState({
    emails: [],
    events: [],
    contacts: [],
    youtubeVideos: [],
    youtubeChannelTitle: ''
  });

  // Global Pomodoro Focus Timer (persists across tab switches!)
  const [pomodoro, setPomodoro] = useState({
    customMinutes: 25,
    totalSessionSecs: 25 * 60,
    timeLeft: 25 * 60,
    isRunning: false,
    mode: 'work',
    finishedNotice: ''
  });

  useEffect(() => {
    if (!pomodoro.isRunning) return;
    const id = setInterval(() => {
      setPomodoro((prev) => {
        if (!prev.isRunning) return prev;
        if (prev.timeLeft <= 1) {
          SoundFX.success();
          const msg =
            prev.mode === 'work'
              ? 'ফোকাস সেশন সম্পন্ন হয়েছে! একটু বিরতি নিন।'
              : 'বিরতি শেষ! আবার কাজে মনোযোগ দিন।';
          if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
            try {
              new Notification('KM Mahim Focus Timer', { body: msg });
            } catch {}
          }
          return { ...prev, timeLeft: 0, isRunning: false, finishedNotice: msg };
        }
        return { ...prev, timeLeft: prev.timeLeft - 1 };
      });
    }, 1000);
    return () => clearInterval(id);
  }, [pomodoro.isRunning]);

  const applyPomodoroPreset = (mins, mode = 'work') => {
    const cleanMins = Math.max(1, Math.min(240, Number(mins) || 25));
    setPomodoro({
      customMinutes: cleanMins,
      totalSessionSecs: cleanMins * 60,
      timeLeft: cleanMins * 60,
      isRunning: false,
      mode,
      finishedNotice: ''
    });
  };

  const togglePomodoroRun = () => {
    setPomodoro((prev) => ({ ...prev, isRunning: !prev.isRunning, finishedNotice: '' }));
  };

  const dismissPomodoroNotice = () => {
    setPomodoro((prev) => ({ ...prev, finishedNotice: '' }));
  };

  // Persistent Background Audio Player (works across tabs & supports MediaSession lock-screen controls)
  const audioElRef = useRef(null);
  const [audioPlayer, setAudioPlayer] = useState({
    currentTrack: null,
    isPlaying: false
  });

  const playAudioTrack = (track) => {
    if (!track?.url) return;
    setAudioPlayer({ currentTrack: track, isPlaying: true });
    setTimeout(() => {
      if (audioElRef.current) {
        audioElRef.current.src = track.url;
        audioElRef.current.play().catch(() => {});
      }
      if ('mediaSession' in navigator) {
        try {
          navigator.mediaSession.metadata = new MediaMetadata({
            title: track.title || 'KM Mahim Audio',
            artist: track.artist || 'KM Mahim Media Vault'
          });
          navigator.mediaSession.setActionHandler('play', () => audioElRef.current?.play());
          navigator.mediaSession.setActionHandler('pause', () => audioElRef.current?.pause());
        } catch {}
      }
    }, 20);
  };

  const toggleAudioPlayPause = () => {
    if (!audioElRef.current || !audioPlayer.currentTrack) return;
    if (audioElRef.current.paused) {
      audioElRef.current.play().catch(() => {});
      setAudioPlayer((p) => ({ ...p, isPlaying: true }));
    } else {
      audioElRef.current.pause();
      setAudioPlayer((p) => ({ ...p, isPlaying: false }));
    }
  };

  const stopAudioTrack = () => {
    if (audioElRef.current) {
      audioElRef.current.pause();
      audioElRef.current.removeAttribute('src');
    }
    setAudioPlayer({ currentTrack: null, isPlaying: false });
  };

  // AI Copilot State (Session conversations + Right-Side Claude Artifact Preview)
  const [aiMessages, setAiMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        'স্বাগতম! আমি আপনার **Mahim AI Copilot**। উপরে শুধু আপনার Gemini / OpenAI / Claude / Groq API Key বসিয়ে বলুন—যেমন: *"আজ রিকশা ৫০৳ খরচ, দুপুর ১টা মিল, আর বই পড়ার গোল অ্যাড করো"* অথবা *"আমার জিমেইল/ক্যালেন্ডার চেক করো"* অথবা *"YouTube নোটস নামে নতুন সেকশন বানাও"*।',
      actions: [],
      artifact: null
    }
  ]);
  const [activeArtifact, setActiveArtifact] = useState(null);
  const [showCopilotDrawer, setShowCopilotDrawer] = useState(false);

  useEffect(() => {
    localStorage.setItem('KM_MAHIM_LIFE_OS_V1', JSON.stringify(data));
  }, [data]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'l') {
        e.preventDefault();
        if (isAuthenticated) {
          setActiveLayer((prev) => (prev === 'public' ? 'private' : 'public'));
        } else {
          setShowPinModal(true);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAuthenticated, activeLayer]);

  const verifyPin = (inputPin) => {
    if (inputPin === data.profile.pin) {
      const days = Math.max(0, Number(secretConfig.rememberDays ?? 7));
      if (days > 0) {
        localStorage.setItem(UNLOCK_UNTIL_KEY, String(Date.now() + days * 24 * 60 * 60 * 1000));
      } else {
        localStorage.setItem(UNLOCK_UNTIL_KEY, String(Date.now() + 12 * 60 * 60 * 1000));
      }
      localStorage.setItem(ACTIVE_LAYER_KEY, 'private');
      setIsAuthenticated(true);
      setActiveLayerState('private');
      setShowPinModal(false);
      return true;
    }
    return false;
  };

  const isAuthRef = useRef(isAuthenticated);
  isAuthRef.current = isAuthenticated;

  const lockOS = () => {
    localStorage.removeItem(UNLOCK_UNTIL_KEY);
    localStorage.setItem(ACTIVE_LAYER_KEY, 'public');
    setIsAuthenticated(false);
    setActiveLayerState('public');
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
        if (isAuthRef.current && (hasPending || !hasUntouchedDemoOnly(dataRef.current))) {
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
        if (isAuthRef.current) {
          await uploadToSupabase(dataRef.current);
        }
      } else if ((hasPending || !lastCloudSync) && remoteTime > lastCloudSync) {
        if (isAuthRef.current) {
          // Both devices hold distinct real updates -> merge cleanly without losing either!
          const merged = smartMergeOSData(dataRef.current, result.data);
          applyRemoteData(merged, result.timestamp);
          await uploadToSupabase(merged);
        } else {
          applyRemoteData(result.data, result.timestamp);
        }
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

  // Auto-sync debounce ONLY when owner is authenticated (prevents visitor edits overwriting primary_os)
  useEffect(() => {
    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false;
      return;
    }
    if (isApplyingRemoteRef.current) return;
    if (!isAuthenticated) return;

    localStorage.setItem(PENDING_UPLOAD_KEY, '1');

    if (!autoSync) return;
    const timeout = setTimeout(() => {
      uploadToSupabase(dataRef.current);
    }, 1200);
    return () => clearTimeout(timeout);
  }, [data, autoSync, isAuthenticated]);

  // Public Inquiries Queue synced safely from Supabase public_inquiries table
  const [publicInquiries, setPublicInquiries] = useState([]);
  const loadPublicInquiries = async () => {
    const res = await fetchPublicInquiries();
    if (res.success) {
      setPublicInquiries(res.items);
    }
    return res;
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadPublicInquiries();
    }
  }, [isAuthenticated]);

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

  const sendClientMessage = async (msg) => {
    const cloudRes = await submitPublicInquiry(msg);
    // Keep lightweight local confirmation for immediate UI feedback without mutating cloud primary_os
    if (isAuthenticated) {
      setData(prev => ({
        ...prev,
        messages: [{ ...msg, id: 'msg_' + Date.now(), date: new Date().toLocaleString(), type: 'client', read: false }, ...prev.messages]
      }));
    }
    return cloudRes;
  };

  const deleteMessage = async (msgId, dbId = null) => {
    if (dbId) {
      await deletePublicInquiry(dbId);
      setPublicInquiries(prev => prev.filter(m => m.id !== msgId));
    }
    setData(prev => ({
      ...prev,
      messages: prev.messages.filter(m => m.id !== msgId)
    }));
  };

  // Part 2 Actions — Practical Finance, Budgets & Recurring Bills
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
      const today = getLocalDateStr();
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
        date: date || getLocalDateStr()
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

  const setCategoryBudget = (categoryName, limitAmount) => {
    const val = Math.max(0, Number(limitAmount) || 0);
    setData(prev => ({
      ...prev,
      budgets: {
        ...(prev.budgets || {}),
        [categoryName]: val
      }
    }));
  };

  const addRecurringBill = ({ title, amount, wallet = 'bkash', category = 'Other', dayOfMonth = 1 }) => {
    if (!title || !amount) return;
    setData(prev => ({
      ...prev,
      recurringBills: [
        {
          id: 'bill_' + Date.now(),
          title,
          amount: Number(amount),
          wallet,
          category,
          dayOfMonth: Number(dayOfMonth) || 1
        },
        ...(prev.recurringBills || [])
      ]
    }));
  };

  const logRecurringBill = (billId) => {
    const target = (dataRef.current.recurringBills || []).find(b => b.id === billId);
    if (!target) return;
    addTransaction({
      type: 'out',
      amount: target.amount,
      wallet: target.wallet,
      category: target.category,
      note: `Recurring Bill: ${target.title}`,
      date: getLocalDateStr()
    });
  };

  const deleteRecurringBill = (billId) => {
    setData(prev => ({
      ...prev,
      recurringBills: (prev.recurringBills || []).filter(b => b.id !== billId)
    }));
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
      const stamp = Date.now();
      const linkedTxId = deductFromWallet && prev.finance.wallets[deductFromWallet] !== undefined ? 'tx_' + stamp : null;
      const newDep = {
        id: 'dep_' + stamp,
        amount: numAmount,
        date: date || getLocalDateStr(),
        note: note || 'Meal Deposit',
        linkedTxId
      };
      const nextWallets = { ...prev.finance.wallets };
      const nextTransactions = [...prev.finance.transactions];
      if (linkedTxId) {
        nextWallets[deductFromWallet] -= numAmount;
        nextTransactions.unshift({
          id: linkedTxId,
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
    setData(prev => {
      const targetDep = prev.meals.deposits.find(d => d.id === depId);
      const nextWallets = { ...prev.finance.wallets };
      let nextTransactions = prev.finance.transactions;

      if (targetDep?.linkedTxId) {
        const linkedTx = prev.finance.transactions.find(t => t.id === targetDep.linkedTxId);
        if (linkedTx && nextWallets[linkedTx.wallet] !== undefined) {
          nextWallets[linkedTx.wallet] += Number(linkedTx.amount || 0);
        }
        nextTransactions = prev.finance.transactions.filter(t => t.id !== targetDep.linkedTxId);
      }

      return {
        ...prev,
        finance: { ...prev.finance, wallets: nextWallets, transactions: nextTransactions },
        meals: {
          ...prev.meals,
          deposits: prev.meals.deposits.filter(d => d.id !== depId)
        }
      };
    });
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
        minoxidilBottleStart: getLocalDateStr(),
        customHabits: prev.habits?.customHabits || [],
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
    setData((prev) => normalizeOSState(incoming, prev));
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
      ideas: [{ id: 'idea_' + Date.now(), title, tag: tag || 'General', status: status || 'Just Idea', content: content || '', image: image || '', date: getLocalDateStr() }, ...prev.ideas]
    }));
  };

  const deleteIdea = (ideaId) => {
    setData(prev => ({ ...prev, ideas: prev.ideas.filter(i => i.id !== ideaId) }));
  };

  // --- SECOND BRAIN (PARA Notes, Journal & Flashcards) ---
  const upsertSecondBrainNote = (noteObj) => {
    if (!noteObj?.title) return;
    setData(prev => {
      const existing = prev.secondBrain?.notes || [];
      const idx = noteObj.id ? existing.findIndex(n => n.id === noteObj.id) : -1;
      const cleanNote = {
        id: noteObj.id || 'sb_' + Date.now(),
        title: noteObj.title,
        folder: noteObj.folder || 'Resources',
        tags: Array.isArray(noteObj.tags)
          ? noteObj.tags
          : String(noteObj.tags || '').split(',').map(s => s.trim()).filter(Boolean),
        content: noteObj.content || '',
        pinned: Boolean(noteObj.pinned),
        updatedAt: getLocalDateStr()
      };
      const nextNotes = idx >= 0
        ? existing.map((n, i) => (i === idx ? cleanNote : n))
        : [cleanNote, ...existing];
      return {
        ...prev,
        secondBrain: { ...(prev.secondBrain || {}), notes: nextNotes }
      };
    });
  };

  const deleteSecondBrainNote = (noteId) => {
    setData(prev => ({
      ...prev,
      secondBrain: {
        ...(prev.secondBrain || {}),
        notes: (prev.secondBrain?.notes || []).filter(n => n.id !== noteId)
      }
    }));
  };

  const saveDailyJournal = (dateKey, entry) => {
    setData(prev => ({
      ...prev,
      secondBrain: {
        ...(prev.secondBrain || {}),
        journal: {
          ...(prev.secondBrain?.journal || {}),
          [dateKey]: { ...entry, updatedAt: getLocalDateStr() }
        }
      }
    }));
  };

  const addFlashcard = ({ topic = 'General', front, back }) => {
    if (!front || !back) return;
    setData(prev => ({
      ...prev,
      secondBrain: {
        ...(prev.secondBrain || {}),
        flashcards: [
          { id: 'fc_' + Date.now(), topic, front, back, mastery: 0, nextReview: getLocalDateStr() },
          ...(prev.secondBrain?.flashcards || [])
        ]
      }
    }));
  };

  const reviewFlashcard = (cardId, known) => {
    setData(prev => ({
      ...prev,
      secondBrain: {
        ...(prev.secondBrain || {}),
        flashcards: (prev.secondBrain?.flashcards || []).map(c =>
          c.id === cardId
            ? { ...c, mastery: Math.max(0, (c.mastery || 0) + (known ? 1 : -1)), nextReview: getLocalDateStr() }
            : c
        )
      }
    }));
  };

  const deleteFlashcard = (cardId) => {
    setData(prev => ({
      ...prev,
      secondBrain: {
        ...(prev.secondBrain || {}),
        flashcards: (prev.secondBrain?.flashcards || []).filter(c => c.id !== cardId)
      }
    }));
  };

  // --- CUSTOM DYNAMIC SECTIONS BUILDER ---
  const createCustomSection = ({ title, description = '', type = 'checklist', items = [], config = {} }) => {
    if (!title) return null;
    const id = 'sec_' + Date.now();
    const normalizedItems = (items || []).map((it, idx) => ({
      id: `item_${Date.now()}_${idx}`,
      label: typeof it === 'string' ? it : it.label || 'Item',
      value: typeof it === 'object' ? it.value || '' : '',
      done: Boolean(it?.done)
    }));
    setData(prev => ({
      ...prev,
      customSections: [
        { id, title, description, type, config, items: normalizedItems, createdAt: getLocalDateStr() },
        ...(prev.customSections || [])
      ]
    }));
    return id;
  };

  const deleteCustomSection = (sectionId) => {
    setData(prev => ({
      ...prev,
      customSections: (prev.customSections || []).filter(s => s.id !== sectionId)
    }));
  };

  const addCustomSectionItem = (sectionId, item) => {
    if (!item?.label) return;
    setData(prev => ({
      ...prev,
      customSections: (prev.customSections || []).map(s =>
        s.id === sectionId
          ? {
              ...s,
              items: [
                { id: 'item_' + Date.now(), label: item.label, value: item.value || '', done: false },
                ...(s.items || [])
              ]
            }
          : s
      )
    }));
  };

  const toggleCustomSectionItem = (sectionId, itemId) => {
    setData(prev => ({
      ...prev,
      customSections: (prev.customSections || []).map(s =>
        s.id === sectionId
          ? {
              ...s,
              items: (s.items || []).map(it => (it.id === itemId ? { ...it, done: !it.done } : it))
            }
          : s
      )
    }));
  };

  const deleteCustomSectionItem = (sectionId, itemId) => {
    setData(prev => ({
      ...prev,
      customSections: (prev.customSections || []).map(s =>
        s.id === sectionId
          ? { ...s, items: (s.items || []).filter(it => it.id !== itemId) }
          : s
      )
    }));
  };

  // --- MEDIA VAULT (YouTube & Audio Tracks) ---
  const saveMediaVideo = (videoObj) => {
    if (!videoObj?.id) return;
    setData(prev => {
      const existing = prev.mediaVault?.savedVideos || [];
      if (existing.some(v => v.id === videoObj.id)) return prev;
      return {
        ...prev,
        mediaVault: { ...(prev.mediaVault || {}), savedVideos: [videoObj, ...existing] }
      };
    });
  };

  const removeMediaVideo = (videoId) => {
    setData(prev => ({
      ...prev,
      mediaVault: {
        ...(prev.mediaVault || {}),
        savedVideos: (prev.mediaVault?.savedVideos || []).filter(v => v.id !== videoId)
      }
    }));
  };

  const addAudioTrack = (track) => {
    if (!track?.title || !track?.url) return;
    setData(prev => ({
      ...prev,
      mediaVault: {
        ...(prev.mediaVault || {}),
        audioTracks: [
          { id: 'aud_' + Date.now(), ...track, addedAt: getLocalDateStr() },
          ...(prev.mediaVault?.audioTracks || [])
        ]
      }
    }));
  };

  const deleteAudioTrack = (trackId) => {
    setData(prev => ({
      ...prev,
      mediaVault: {
        ...(prev.mediaVault || {}),
        audioTracks: (prev.mediaVault?.audioTracks || []).filter(t => t.id !== trackId)
      }
    }));
  };

  // --- PART 4: SOCIAL AUTO-POSTER & REAL WEBHOOK / AGENT HUB ACTIONS ---
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
          status: status || 'Pending Approval',
          liveLink: ''
        },
        ...prev.socialQueue
      ]
    }));
  };

  const approveAndPublishPost = async (postId) => {
    const post = (dataRef.current.socialQueue || []).find(p => p.id === postId);
    if (!post) return { success: false };
    const webhookUrl = dataRef.current.agents?.webhookUrl || '';
    const hasRealWebhook = webhookUrl && !webhookUrl.includes('yourdomain.com');

    if (hasRealWebhook) {
      try {
        const resp = await fetch(webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Agent-Key': dataRef.current.agents?.apiKey || ''
          },
          body: JSON.stringify({ event: 'social_publish', post })
        });
        const statusText = resp.ok ? 'Dispatched to Webhook' : `Webhook HTTP ${resp.status}`;
        setData(prev => ({
          ...prev,
          socialQueue: prev.socialQueue.map(p => (p.id === postId ? { ...p, status: statusText } : p))
        }));
        return { success: resp.ok, message: statusText };
      } catch (err) {
        setData(prev => ({
          ...prev,
          socialQueue: prev.socialQueue.map(p => (p.id === postId ? { ...p, status: 'Webhook Failed' } : p))
        }));
        return { success: false, message: err.message };
      }
    }

    setData(prev => ({
      ...prev,
      socialQueue: prev.socialQueue.map(p =>
        p.id === postId ? { ...p, status: 'Approved (Local Queue — Connect Webhook)' } : p
      )
    }));
    return { success: true, message: 'Approved in local queue.' };
  };

  const deleteSocialPost = (postId) => {
    setData(prev => ({
      ...prev,
      socialQueue: prev.socialQueue.filter(p => p.id !== postId)
    }));
  };

  const dispatchAgentCommand = async (agentName, commandText) => {
    if (!commandText) return { success: false };
    const webhookUrl = dataRef.current.agents?.webhookUrl || '';
    const hasRealWebhook = webhookUrl && !webhookUrl.includes('yourdomain.com');
    let execNote = 'Added to Daily Goals (Webhook URL not configured — set n8n/OpenClaw URL to run remotely)';

    if (hasRealWebhook) {
      try {
        const resp = await fetch(webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Agent-Key': dataRef.current.agents?.apiKey || ''
          },
          body: JSON.stringify({
            event: 'agent_command',
            agent: agentName,
            command: commandText,
            timestamp: new Date().toISOString()
          })
        });
        execNote = resp.ok
          ? `Webhook HTTP ${resp.status} OK — Executed: "${commandText}"`
          : `Webhook Error HTTP ${resp.status} for: "${commandText}"`;
      } catch (err) {
        execNote = `Webhook Failed (${err.message}) — Logged locally`;
      }
    }

    setData(prev => {
      const logEntry = {
        id: 'log_' + Date.now(),
        agent: agentName,
        text: execNote,
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
    return { success: true, note: execNote };
  };

  const updateAgentConfig = (newConfig) => {
    setData(prev => ({
      ...prev,
      agents: { ...prev.agents, ...newConfig }
    }));
  };

  // --- REAL AI COPILOT TOOL-CALLING EXECUTOR ---
  const executeAITools = async (actions = []) => {
    const results = [];
    for (const act of actions) {
      const tool = act?.tool;
      const args = act?.args || {};
      try {
        if (tool === 'add_transaction') {
          addTransaction(args);
          results.push(`✅ লেনদেন যোগ হয়েছে: ${args.type === 'in' ? '+' : '-'}৳${args.amount} (${args.note || args.category})`);
        } else if (tool === 'set_wallet_balance') {
          setWalletBalance(args.wallet, args.amount);
          results.push(`✅ ${args.wallet} ব্যালেন্স আপডেট: ৳${args.amount}`);
        } else if (tool === 'add_debt') {
          addDebt(args);
          results.push(`✅ ধার/বাকি যুক্ত: ${args.person} (৳${args.amount})`);
        } else if (tool === 'log_meal') {
          const dKey = args.date || getLocalDateStr();
          const cur = dataRef.current.meals?.logs?.[dKey] || { breakfast: 0, lunch: 0, dinner: 0, guest: 0 };
          updateDailyMeal(dKey, {
            breakfast: args.breakfast ?? cur.breakfast,
            lunch: args.lunch ?? cur.lunch,
            dinner: args.dinner ?? cur.dinner,
            guest: args.guest ?? cur.guest
          });
          results.push(`✅ মিল লগ আপডেট (${dKey})`);
        } else if (tool === 'add_meal_deposit') {
          addMealDeposit(args);
          results.push(`✅ মিল ডিপোজিট সেভ: ৳${args.amount}`);
        } else if (tool === 'toggle_namaz') {
          const dKey = args.date || getLocalDateStr();
          updateDailyHabits(dKey, prevDay => ({
            ...prevDay,
            namaz: { ...prevDay.namaz, [args.waqt]: args.done !== undefined ? Boolean(args.done) : !prevDay.namaz?.[args.waqt] }
          }));
          results.push(`✅ নামাজ আপডেট: ${args.waqt}`);
        } else if (tool === 'log_gym') {
          const dKey = args.date || getLocalDateStr();
          updateDailyHabits(dKey, prevDay => ({
            ...prevDay,
            gym: {
              done: args.done ?? true,
              muscle: args.muscle || prevDay.gym?.muscle || '',
              weightLog: args.weightLog || prevDay.gym?.weightLog || ''
            }
          }));
          results.push(`✅ জিম লগ আপডেট`);
        } else if (tool === 'add_custom_habit') {
          addCustomHabit(args);
          results.push(`✅ কাস্টম হ্যাবিট যোগ: ${args.label}`);
        } else if (tool === 'add_goal') {
          addGoal(args);
          results.push(`✅ গোল যোগ হয়েছে: ${args.title}`);
        } else if (tool === 'complete_goal') {
          const kw = String(args.titleContains || '').toLowerCase();
          const match = (dataRef.current.goals || []).find(g => g.title.toLowerCase().includes(kw) && !g.completed);
          if (match) {
            toggleGoalComplete(match.id);
            results.push(`✅ গোল সম্পন্ন: ${match.title}`);
          } else {
            results.push(`ℹ️ "${args.titleContains}" নামে অসম্পূর্ণ গোল পাওয়া যায়নি`);
          }
        } else if (tool === 'create_note') {
          upsertSecondBrainNote(args);
          results.push(`✅ Second Brain-এ নোট সেভ হয়েছে: ${args.title}`);
        } else if (tool === 'add_flashcard') {
          addFlashcard(args);
          results.push(`✅ ফ্ল্যাশকার্ড যোগ: ${args.front}`);
        } else if (tool === 'create_custom_section') {
          createCustomSection(args);
          results.push(`✅ নতুন কাস্টম সেকশন তৈরি হয়েছে: "${args.title}"`);
        } else if (tool === 'update_public_now') {
          updateProfile({ nowStatus: args.nowStatus });
          results.push(`✅ পাবলিক Now Status আপডেট হয়েছে`);
        } else if (tool === 'add_project') {
          addProject(args);
          results.push(`✅ পাবলিক পোর্টফোলিও প্রোজেক্ট যোগ হয়েছে: ${args.title}`);
        } else if (tool === 'navigate_tab' && args.tab) {
          setActiveTab(args.tab);
          results.push(`🧭 ${args.tab} ট্যাবে নেভিগেট করা হয়েছে`);
        } else if (tool === 'gmail_list') {
          const emails = await listGmailMessages(googleSession.accessToken, args.query || '', args.maxResults || 8);
          setIntegrationFeeds(f => ({ ...f, emails }));
          setActiveArtifact({
            title: 'Gmail Inbox Feed',
            type: 'markdown',
            content: emails.map((e, i) => `${i + 1}. **${e.subject}**\n   - From: ${e.from}\n   - ${e.snippet}`).join('\n\n') || 'কোনো মেইল পাওয়া যায়নি।'
          });
          results.push(`📧 ${emails.length}টি Gmail আনা হয়েছে (ডান দিকের Artifact-এ দেখুন)`);
        } else if (tool === 'gmail_send') {
          await sendGmailMessage(googleSession.accessToken, args);
          results.push(`✅ ইমেইল পাঠানো হয়েছে → ${args.to}`);
        } else if (tool === 'calendar_list') {
          const events = await listCalendarEvents(googleSession.accessToken, args.maxResults || 12);
          setIntegrationFeeds(f => ({ ...f, events }));
          setActiveArtifact({
            title: 'Google Calendar Agenda',
            type: 'markdown',
            content: events.map((ev, i) => `${i + 1}. **${ev.summary}**\n   - Time: ${ev.start}`).join('\n\n') || 'আসন্ন কোনো ইভেন্ট নেই।'
          });
          results.push(`📅 ${events.length}টি ক্যালেন্ডার ইভেন্ট পাওয়া গেছে`);
        } else if (tool === 'calendar_create') {
          await createCalendarEvent(googleSession.accessToken, args);
          results.push(`✅ Google Calendar ইভেন্ট তৈরি হয়েছে: ${args.summary}`);
        } else if (tool === 'contacts_search') {
          const contacts = await listGoogleContacts(googleSession.accessToken, args.query || '', 25);
          setIntegrationFeeds(f => ({ ...f, contacts }));
          setActiveArtifact({
            title: `Google Contacts (${args.query || 'All'})`,
            type: 'markdown',
            content: contacts.map(c => `- **${c.name}** — ${c.phone || 'No Phone'} | ${c.email || 'No Email'}`).join('\n') || 'কোনো কন্টাক্ট পাওয়া যায়নি।'
          });
          results.push(`👥 ${contacts.length}টি কন্টাক্ট পাওয়া গেছে`);
        } else if (tool === 'whatsapp_send') {
          const waRes = await sendWhatsAppMessage({
            toPhone: args.toPhone,
            message: args.message,
            cloudToken: secretConfig.metaWaToken,
            phoneNumberId: secretConfig.metaWaPhoneId,
            webhookUrl: secretConfig.whatsappWebhookUrl
          });
          if (waRes.mode === 'deep_link' && waRes.url) {
            window.open(waRes.url, '_blank', 'noopener,noreferrer');
          }
          results.push(waRes.success ? `💬 ${waRes.message}` : `⚠️ WhatsApp: ${waRes.message}`);
        } else if (tool === 'youtube_fetch') {
          const yt = await fetchYouTubeVideos({
            accessToken: googleSession.accessToken,
            apiKey: secretConfig.youtubeApiKey,
            playlistId: args.playlistId || ''
          });
          setIntegrationFeeds(f => ({ ...f, youtubeVideos: yt.videos, youtubeChannelTitle: yt.channelTitle }));
          results.push(`▶️ ${yt.videos.length}টি YouTube ভিডিও লোড হয়েছে (${yt.channelTitle || 'Playlist'})`);
        }
      } catch (err) {
        results.push(`❌ ${tool} ব্যর্থ: ${err.message}`);
      }
    }
    return results;
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
        lockOS,
        activeTab,
        setActiveTab,
        showPinModal,
        setShowPinModal,
        verifyPin,
        secretConfig,
        updateSecretConfig,
        googleSession,
        saveGoogleSession,
        integrationFeeds,
        setIntegrationFeeds,
        pomodoro,
        applyPomodoroPreset,
        togglePomodoroRun,
        dismissPomodoroNotice,
        audioPlayer,
        playAudioTrack,
        toggleAudioPlayPause,
        stopAudioTrack,
        aiMessages,
        setAiMessages,
        activeArtifact,
        setActiveArtifact,
        showCopilotDrawer,
        setShowCopilotDrawer,
        executeAITools,
        publicInquiries,
        loadPublicInquiries,
        updateProfile,
        addProject,
        deleteProject,
        sendClientMessage,
        deleteMessage,
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
        upsertSecondBrainNote,
        deleteSecondBrainNote,
        saveDailyJournal,
        addFlashcard,
        reviewFlashcard,
        deleteFlashcard,
        createCustomSection,
        deleteCustomSection,
        addCustomSectionItem,
        toggleCustomSectionItem,
        deleteCustomSectionItem,
        saveMediaVideo,
        removeMediaVideo,
        addAudioTrack,
        deleteAudioTrack,
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
      <audio
        ref={audioElRef}
        onEnded={() => setAudioPlayer((p) => ({ ...p, isPlaying: false }))}
        onPause={() => setAudioPlayer((p) => ({ ...p, isPlaying: false }))}
        onPlay={() => setAudioPlayer((p) => ({ ...p, isPlaying: true }))}
        className="hidden"
      />
      {children}
    </OSContext.Provider>
  );
};

export const useOS = () => useContext(OSContext);
