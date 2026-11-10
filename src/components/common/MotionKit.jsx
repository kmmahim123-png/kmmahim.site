import React, { useRef, useState, useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Smartphone, Download, Zap, ShieldCheck, CheckCircle2 } from 'lucide-react';

// --- 3D TILT CARD COMPONENT ---
export function TiltCard({ children, className = '', maxTilt = 12 }) {
  const cardRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 25 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 25 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], [maxTilt, -maxTilt]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], [-maxTilt, maxTilt]);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;

    x.set(xPct);
    y.set(yPct);
    setMousePos({ x: mouseX, y: mouseY });
  };

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => {
    setIsHovered(false);
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: 'preserve-3d',
      }}
      whileHover={{ scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className={`relative group overflow-hidden ${className}`}
    >
      {/* Dynamic 3D Spotlight Glow */}
      {isHovered && (
        <div
          className="pointer-events-none absolute -inset-px transition-opacity duration-300 z-10"
          style={{
            background: `radial-gradient(400px circle at ${mousePos.x}px ${mousePos.y}px, rgba(99, 102, 241, 0.18), transparent 80%)`,
          }}
        />
      )}
      <div style={{ transform: 'translateZ(20px)' }}>{children}</div>
    </motion.div>
  );
}

// --- ANIMATED NUMBER COUNTER ---
export function AnimatedCounter({ value, prefix = '', suffix = '', duration = 1.2 }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const num = Number(value) || 0;
    let startTimestamp = null;
    const startValue = 0;

    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / (duration * 1000), 1);
      const easeProgress = 1 - Math.pow(1 - progress, 3); // easeOutCubic
      setDisplayValue(Math.floor(startValue + (num - startValue) * easeProgress));

      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        setDisplayValue(num);
      }
    };

    window.requestAnimationFrame(step);
  }, [value, duration]);

  return (
    <span>
      {prefix}
      {displayValue.toLocaleString()}
      {suffix}
    </span>
  );
}

// --- SECRET PWA INSTALL & APK DOWNLOAD WIDGET (LAYER 2 ONLY) ---
export function SecretPWAWidget() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true) {
      setIsInstalled(true);
    }

    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    });

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      setShowGuide(true);
      return;
    }

    setIsInstalling(true);
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
    setIsInstalling(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 rounded-2xl bg-gradient-to-br from-indigo-950/70 via-slate-900 to-cyan-950/40 border border-indigo-500/40 shadow-xl shadow-indigo-950/40 relative overflow-hidden"
    >
      <div className="absolute -top-10 -right-10 w-28 h-28 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />

      <div className="flex items-center justify-between gap-3 mb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/30">
            <Smartphone className="w-4 h-4"/>
          </div>
          <div>
            <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
              <span>RU Insiders & Life OS Mobile Hub</span>
              <span className="px-1.5 py-0.2 rounded text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                🔒 Private Node
              </span>
            </h4>
            <span className="text-[10px] text-cyan-300 font-mono">
              {isInstalled ? '✅ App Currently Installed' : '⚡ 2 Ways to Get App: Direct APK or 1-Tap PWA'}
            </span>
          </div>
        </div>

        <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
          <Zap className="w-3 h-3 animate-pulse"/>
          <span>3× Faster Offline Cache</span>
        </span>
      </div>

      <p className="text-[11px] text-slate-300 leading-relaxed mb-3">
        ফোনে সরাসরি অ্যান্ড্রয়েড APK ডাউনলোড করুন অথবা ক্রোম ব্রাউজার থেকে প্লে-স্টোরের মতো হোমস্ক্রিনে ইনস্টল করে নিন।
      </p>

      {/* Action Buttons: 1) Direct APK Download 2) 1-Tap PWA Install */}
      <div className="flex flex-wrap items-center gap-2.5">
        {/* Direct APK Download Link */}
        <motion.a
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          href="/kmmahim-life-os.apk"
          download="kmmahim-life-os.apk"
          className="flex-1 py-2 px-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-xs font-bold text-white flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40 cursor-pointer"
        >
          <Download className="w-3.5 h-3.5"/>
          <span>📥 Direct Android APK ডাউনলোড (.apk)</span>
        </motion.a>

        {/* PWA 1-Tap Install */}
        {!isInstalled ? (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleInstallClick}
            disabled={isInstalling}
            className="flex-1 py-2 px-3.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-xs font-bold text-white flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 cursor-pointer"
          >
            <Smartphone className="w-3.5 h-3.5 animate-bounce"/>
            <span>⚡ হোমস্ক্রিনে অ্যাপ ইনস্টল (PWA)</span>
          </motion.button>
        ) : (
          <div className="flex-1 py-2 px-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center justify-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400"/>
            <span>PWA Active on Device</span>
          </div>
        )}
      </div>

      {/* Browser Guide Accordion if beforeinstallprompt is waiting */}
      {showGuide && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-3 p-3 rounded-xl bg-slate-950/90 border border-indigo-500/30 text-xs space-y-1.5"
        >
          <div className="flex items-center justify-between text-cyan-300 font-bold text-[11px]">
            <span>📲 ব্রাউজার থেকে ইনস্টল করার সহজ নিয়ম:</span>
            <button
              onClick={() => setShowGuide(false)}
              className="text-slate-400 hover:text-white px-1.5 py-0.5 rounded bg-slate-800 text-[10px]"
            >
              ✕ Close
            </button>
          </div>
          <p className="text-[11px] text-slate-300">
            • <strong>Chrome (Android):</strong> উপরে ডানের ৩-ডট মেনু (⋮) ট্যাপ করে <strong>"Install app"</strong> অথবা <strong>"Add to Home screen"</strong> চাপুন।
          </p>
          <p className="text-[11px] text-slate-300">
            • <strong>Safari (iPhone):</strong> নিচের শেয়ার বাটন (⎙) ট্যাপ করে <strong>"Add to Home Screen"</strong> চাপুন।
          </p>
          <p className="text-[11px] text-emerald-400">
            • <strong>অথবা:</strong> বামদিকের সবুজ <strong>"📥 Direct Android APK ডাউনলোড"</strong> বাটনে ট্যাপ করে সরাসরি APK ইনস্টল করে নিন!
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}

// --- CIRCULAR HERO RADAR COMPONENT (A1: Profile Hero & Live Radar Node) ---
export function CircularHeroRadar({ profile, onSecretClick }) {
  return (
    <div className="relative flex flex-col items-center justify-center p-4 text-center select-none">
      {/* Outer Breathing Pulse Radar Waves (A3: Breathing Pulse Glow) */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <motion.div
          animate={{ scale: [1, 1.25, 1], opacity: [0.35, 0.08, 0.35] }}
          transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
          className="w-52 h-52 sm:w-60 sm:h-60 rounded-full border border-indigo-500/30 bg-indigo-500/5 blur-sm"
        />
        <motion.div
          animate={{ scale: [1, 1.45, 1], opacity: [0.22, 0, 0.22] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }}
          className="w-60 h-60 sm:w-72 sm:h-72 rounded-full border border-cyan-500/20"
        />
      </div>

      {/* 360° Rotating Gradient Orbital Ring with Orbiting Satellites */}
      <div className="relative w-44 h-44 sm:w-52 sm:h-52 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-0 rounded-full border-2 border-dashed border-indigo-500/40"
        >
          {/* Orbiting Satellite Dots */}
          <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-cyan-400 shadow-[0_0_12px_#22d3ee]" />
          <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_10px_#34d399]" />
        </motion.div>

        {/* Inner 3D Tilt Circular Badge */}
        <TiltCard
          maxTilt={14}
          className="w-36 h-36 sm:w-44 sm:h-44 rounded-full bg-gradient-to-br from-slate-900 via-indigo-950/80 to-slate-950 border-2 border-indigo-500/50 shadow-2xl shadow-indigo-950/80 flex flex-col items-center justify-center p-3 relative z-10 cursor-pointer overflow-hidden group"
        >
          <div
            onClick={onSecretClick}
            title="Triple-click for Secret Life OS Gate"
            className="w-full h-full flex flex-col items-center justify-center text-center"
          >
            {/* Live Center Radar Ping */}
            <div className="relative flex items-center justify-center mb-1">
              <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 shadow-[0_0_8px_#10b981]" />
            </div>

            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 via-cyan-400 to-emerald-400 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-indigo-500/40 mb-1 group-hover:scale-105 transition">
              KM
            </div>

            <h3 className="font-black text-white text-xs sm:text-sm tracking-tight leading-tight">
              {profile.name}
            </h3>
            <span className="text-[10px] text-cyan-300 font-medium">
              {profile.bnName}
            </span>

            <div className="mt-1 px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-[8px] text-indigo-300 font-mono flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>ACTIVE OS NODE</span>
            </div>
          </div>
        </TiltCard>
      </div>

      <p className="mt-2 text-[10px] text-slate-400 font-mono tracking-wider">
        RADAR STATUS: <span className="text-emerald-400 font-semibold">100% ONLINE</span>
      </p>
    </div>
  );
}

// --- CIRCULAR FINANCE DONUT DIAL (A2: Interactive Donut Pie-Chart Dial) ---
const CATEGORY_COLORS = {
  'Food & Meal': '#f43f5e',
  'Gym & Fitness': '#06b6d4',
  'Study & Academic': '#f59e0b',
  'Business / JACKFRU': '#6366f1',
  'Client Project': '#10b981',
  'Personal & Care': '#ec4899',
  'Tech & AI APIs': '#8b5cf6',
  'Other': '#64748b'
};

export function CircularFinanceDonut({
  totalBalance = 0,
  totalIn = 0,
  totalOut = 0,
  categoryBreakdown = []
}) {
  const [hoveredSlice, setHoveredSlice] = useState(null);

  const radius = 72;
  const strokeWidth = 14;
  const circumference = 2 * Math.PI * radius; // ~452.39

  const totalExpense = categoryBreakdown.reduce((sum, [, val]) => sum + val, 0) || 1;

  // Build segments
  let accumulated = 0;
  const segments = categoryBreakdown.map(([cat, amount]) => {
    const fraction = amount / totalExpense;
    const strokeDash = fraction * circumference;
    const offset = accumulated;
    accumulated += strokeDash;
    return {
      category: cat,
      amount,
      percentage: Math.round(fraction * 100),
      strokeDasharray: `${strokeDash} ${circumference - strokeDash}`,
      strokeDashoffset: -offset,
      color: CATEGORY_COLORS[cat] || '#818cf8'
    };
  });

  return (
    <TiltCard
      maxTilt={8}
      className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/30 shadow-2xl shadow-indigo-950/50 flex flex-col items-center relative overflow-hidden"
    >
      {/* Outer Breathing Pulse Radar Glow (A3: Breathing Pulse Glow) */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.25, 0.05, 0.25] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
          className="w-56 h-56 rounded-full bg-gradient-to-tr from-indigo-500/20 via-cyan-500/20 to-rose-500/10 blur-xl"
        />
      </div>

      <div className="w-full flex items-center justify-between mb-4 border-b border-slate-800/80 pb-3 relative z-10">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">
            Interactive Financial Ring
          </span>
          <h3 className="text-sm font-bold text-white">Expense & Liquidity Dial</h3>
        </div>
        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          60 FPS Live
        </span>
      </div>

      {/* Circular Donut Arc Dial */}
      <div className="relative w-56 h-56 flex items-center justify-center relative z-10">
        <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 200 200">
          {/* Background track circle */}
          <circle
            cx="100"
            cy="100"
            r={radius}
            fill="transparent"
            stroke="rgba(30, 41, 59, 0.6)"
            strokeWidth={strokeWidth}
          />

          {/* Slices */}
          {segments.length > 0 ? (
            segments.map((s, idx) => (
              <motion.circle
                key={idx}
                cx="100"
                cy="100"
                r={radius}
                fill="transparent"
                stroke={s.color}
                strokeWidth={hoveredSlice?.category === s.category ? strokeWidth + 4 : strokeWidth}
                strokeDasharray={s.strokeDasharray}
                strokeDashoffset={s.strokeDashoffset}
                strokeLinecap="round"
                className="cursor-pointer transition-all duration-300"
                onMouseEnter={() => setHoveredSlice(s)}
                onMouseLeave={() => setHoveredSlice(null)}
                style={{
                  filter: hoveredSlice?.category === s.category ? `drop-shadow(0 0 8px ${s.color})` : 'none',
                }}
              />
            ))
          ) : (
            <circle
              cx="100"
              cy="100"
              r={radius}
              fill="transparent"
              stroke="#6366f1"
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              opacity={0.4}
            />
          )}
        </svg>

        {/* Center Display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4 pointer-events-none">
          {hoveredSlice ? (
            <motion.div
              key="hovered"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.15 }}
            >
              <span
                className="text-[10px] font-bold uppercase tracking-wider block"
                style={{ color: hoveredSlice.color }}
              >
                {hoveredSlice.category}
              </span>
              <span className="text-xl font-black text-white block">
                ৳{hoveredSlice.amount.toLocaleString()}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                {hoveredSlice.percentage}% of Expense
              </span>
            </motion.div>
          ) : (
            <motion.div
              key="default"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              <span className="text-[9px] font-bold uppercase tracking-widest text-indigo-300 block">
                Net Worth Liquidity
              </span>
              <span className="text-2xl font-black text-white block my-0.5">
                ৳<AnimatedCounter value={totalBalance} />
              </span>
              <span className="text-[10px] text-emerald-400 font-semibold block">
                In: ৳{totalIn.toLocaleString()}
              </span>
            </motion.div>
          )}
        </div>
      </div>

      {/* Category Legend Chips */}
      <div className="w-full mt-4 flex flex-wrap justify-center gap-1.5 relative z-10">
        {segments.map((s, idx) => (
          <button
            key={idx}
            onMouseEnter={() => setHoveredSlice(s)}
            onMouseLeave={() => setHoveredSlice(null)}
            className={`px-2 py-1 rounded-lg text-[10px] font-medium border transition flex items-center gap-1.5 cursor-pointer ${
              hoveredSlice?.category === s.category
                ? 'bg-slate-800 text-white border-slate-600 scale-105'
                : 'bg-slate-950/60 text-slate-400 border-slate-800/80 hover:text-slate-200'
            }`}
          >
            <span
              className="w-2 h-2 rounded-full shrink-0"
              style={{ backgroundColor: s.color, boxShadow: `0 0 6px ${s.color}` }}
            />
            <span>{s.category}</span>
            <span className="text-slate-500 font-mono">({s.percentage}%)</span>
          </button>
        ))}
      </div>
    </TiltCard>
  );
}
