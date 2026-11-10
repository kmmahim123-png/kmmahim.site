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

// --- SECRET PWA INSTALL WIDGET (LAYER 2 ONLY) ---
export function SecretPWAWidget() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  useEffect(() => {
    // Check if app is already running in standalone mode (PWA installed)
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
      // Fallback instruction for browsers that don't trigger prompt directly
      alert('📲 এই অ্যাপটি ফোনে ইনস্টল করতে: ব্রাউজারের ৩-ডট মেনু (⋮) ট্যাপ করে "Install app" অথবা "Add to Home screen" চাপুন!');
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
              <span>RU Insiders & Life OS App</span>
              <span className="px-1.5 py-0.2 rounded text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                🔒 Private Node
              </span>
            </h4>
            <span className="text-[10px] text-cyan-300 font-mono">
              {isInstalled ? '✅ App Currently Installed' : '⚡ 1-Tap Home Screen Install Ready'}
            </span>
          </div>
        </div>

        <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
          <Zap className="w-3 h-3 animate-pulse"/>
          <span>3× Faster Cache</span>
        </span>
      </div>

      <p className="text-[11px] text-slate-300 leading-relaxed mb-3">
        শুধুমাত্র আপনার প্রাইভেট কন্ট্রোল রুম থেকে অ্যাক্সেসযোগ্য। প্লে-স্টোরের মতো অফলাইনে ইনস্ট্যান্ট লোড হবে।
      </p>

      <div className="flex flex-wrap items-center gap-2">
        {!isInstalled ? (
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            animate={{
              boxShadow: [
                '0 0 0 rgba(79, 70, 229, 0)',
                '0 0 15px rgba(79, 70, 229, 0.4)',
                '0 0 0 rgba(79, 70, 229, 0)',
              ],
            }}
            transition={{ repeat: Infinity, duration: 2.2 }}
            onClick={handleInstallClick}
            disabled={isInstalling}
            className="flex-1 py-2 px-3.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-xs font-bold text-white flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 animate-bounce"/>
            <span>📲 ফোনে অ্যাপ হিসেবে ইনস্টল করুন (1-Tap)</span>
          </motion.button>
        ) : (
          <div className="flex-1 py-2 px-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center justify-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400"/>
            <span>Installed & Offline Synchronized</span>
          </div>
        )}

        <div className="px-2.5 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-[10px] text-slate-400 flex items-center gap-1">
          <ShieldCheck className="w-3 h-3 text-indigo-400"/>
          <span>Gated Panel</span>
        </div>
      </div>
    </motion.div>
  );
}
