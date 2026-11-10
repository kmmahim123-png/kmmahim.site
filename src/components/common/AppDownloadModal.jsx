import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Smartphone, Download, X, CheckCircle2, Zap, Shield, ArrowDownCircle, ExternalLink } from 'lucide-react';
import { SoundFX } from './SoundEffects';

export default function AppDownloadModal({ isOpen, onClose }) {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

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

  const handlePWAInstall = async () => {
    SoundFX.click();
    if (!deferredPrompt) {
      alert('📲 এই অ্যাপটি ফোনে ইনস্টল করতে: ব্রাউজারের ৩-ডট মেনু (⋮) ট্যাপ করে "Install app" অথবা "Add to Home screen" চাপুন!');
      return;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstalled(true);
      SoundFX.success();
    }
    setDeferredPrompt(null);
  };

  const handleDirectApk = () => {
    SoundFX.laser();
    setIsDownloading(true);
    // Programmatic click to download
    const link = document.createElement('a');
    link.href = '/kmmahim-life-os.apk';
    link.download = 'kmmahim-life-os.apk';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => {
      setIsDownloading(false);
      SoundFX.success();
    }, 2000);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-md p-6 overflow-hidden rounded-3xl bg-slate-900 border border-indigo-500/40 shadow-2xl shadow-indigo-950/80 text-slate-100"
        >
          {/* Ambient Glow */}
          <div className="absolute -top-16 -right-16 w-36 h-36 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

          <button
            onClick={() => {
              SoundFX.click();
              onClose();
            }}
            className="absolute top-4 right-4 p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 via-cyan-500 to-emerald-400 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-1.5">
                <span>KM Mahim Life OS App</span>
                <span className="px-1.5 py-0.2 rounded text-[9px] bg-emerald-500/20 text-emerald-300 font-mono">
                  v2.0 Native
                </span>
              </h3>
              <p className="text-xs text-cyan-300 font-mono">Android APK & PWA 1-Tap Ready</p>
            </div>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed mb-5">
            মোবাইলে সরাসরি কোনো ঝামেলা ছাড়া অ্যাপটি ইনস্টল বা ডাউনলোড করতে নিচের যেকোনো একটি অপশন বেছে নিন:
          </p>

          <div className="space-y-3">
            {/* OPTION 1: DIRECT ANDROID APK (Guaranteed to work on all phones) */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleDirectApk}
              className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/70 to-slate-900 border border-emerald-500/40 hover:border-emerald-400 shadow-lg cursor-pointer flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white transition">
                  <Download className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white group-hover:text-emerald-300 transition">
                    ১. Direct Android APK ডাউনলোড (.apk)
                  </h4>
                  <span className="text-[11px] text-emerald-400 font-mono block">
                    {isDownloading ? '📥 ডাউনলোডিং শুরু হয়েছে...' : 'সাইজ: ৪.৫ MB • যেকোনো ফোনে চলবে'}
                  </span>
                </div>
              </div>
              <ArrowDownCircle className="w-5 h-5 text-emerald-400 shrink-0 group-hover:translate-y-0.5 transition" />
            </motion.div>

            {/* OPTION 2: 1-TAP PWA INSTALL (Browser based) */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handlePWAInstall}
              className="p-4 rounded-2xl bg-gradient-to-r from-indigo-950/70 to-slate-900 border border-indigo-500/40 hover:border-indigo-400 shadow-lg cursor-pointer flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white group-hover:text-indigo-300 transition">
                    ২. ১-ট্যাপ হোমস্ক্রিন অ্যাপ (PWA)
                  </h4>
                  <span className="text-[11px] text-cyan-300 font-mono block">
                    {isInstalled ? '✅ অলরেডি ইনস্টল করা আছে' : 'প্লে-স্টোরের মতো ৩× ফাস্ট অফলাইন ক্যাশ'}
                  </span>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-indigo-400 shrink-0" />
            </motion.div>
          </div>

          {/* Quick Manual Guide */}
          <div className="mt-4 p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] text-slate-400 space-y-1">
            <span className="font-semibold text-slate-300 block">💡 সমস্যা হলে ব্রাউজার মেনু ট্রাই করুন:</span>
            <p>• <strong>Chrome:</strong> ৩-ডট মেনু (⋮) ট্যাপ করে <strong>"Install app"</strong> চাপুন।</p>
            <p>• <strong>iPhone Safari:</strong> নিচে শেয়ার আইকন (⎙) থেকে <strong>"Add to Home Screen"</strong> চাপুন।</p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

// Floating Mobile Pill (Always visible on small screens so user can download anytime)
export function FloatingDownloadPill({ onClick }) {
  return (
    <motion.button
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => {
        SoundFX.click();
        onClick();
      }}
      className="fixed bottom-5 right-4 z-40 md:hidden px-4 py-2.5 rounded-full bg-gradient-to-r from-emerald-600 via-indigo-600 to-cyan-600 text-white font-bold text-xs flex items-center gap-2 shadow-2xl shadow-indigo-950/80 border border-cyan-400/30 cursor-pointer"
    >
      <Download className="w-4 h-4 animate-bounce" />
      <span>📲 ডাউনলোড অ্যাপ (APK)</span>
    </motion.button>
  );
}
