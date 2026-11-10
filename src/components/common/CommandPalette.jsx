import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Terminal, Globe, Wallet, Target, Lightbulb, Bot, Volume2, VolumeX, Download, X } from 'lucide-react';
import { SoundFX } from './SoundEffects';

export default function CommandPalette({
  isOpen,
  onClose,
  onOpenLifeOS,
  onOpenDownload,
  onToggleSound,
  soundOn
}) {
  const [query, setQuery] = useState('');

  const commands = [
    { id: 'life-os', label: 'Unlock / Open Private Life OS', icon: Terminal, action: onOpenLifeOS, badge: 'PIN: 2526' },
    { id: 'download', label: 'Download Android APK & Install PWA', icon: Download, action: onOpenDownload, badge: 'APK 4.5MB' },
    { id: 'sound', label: soundOn ? 'Mute Sci-Fi Audio FX' : 'Enable Sci-Fi Audio FX', icon: soundOn ? Volume2 : VolumeX, action: onToggleSound, badge: soundOn ? 'ON' : 'OFF' },
    { id: 'projects', label: 'Explore Projects & Brands (JACKFRU)', icon: Globe, action: () => { window.location.hash = '#projects'; onClose(); } },
    { id: 'services', label: 'Book a Project / Service Package', icon: Target, action: () => { window.location.hash = '#services'; onClose(); } },
  ];

  const filtered = commands.filter((c) =>
    c.label.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        SoundFX.laser();
        if (isOpen) onClose();
        else {
          // Trigger open via parent
          const event = new CustomEvent('open-command-palette');
          window.dispatchEvent(event);
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl text-slate-100"
        >
          {/* Search Input Bar */}
          <div className="flex items-center px-4 border-b border-slate-800">
            <Search className="w-5 h-5 text-slate-400 shrink-0" />
            <input
              autoFocus
              type="text"
              placeholder="Type a command or search (e.g. Life OS, Download, Sound)..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full px-3.5 py-4 bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none"
            />
            <span className="text-[10px] text-slate-500 font-mono px-1.5 py-0.5 rounded bg-slate-800">ESC</span>
          </div>

          {/* Command List */}
          <div className="p-2 max-h-72 overflow-y-auto space-y-1">
            {filtered.length > 0 ? (
              filtered.map((cmd) => {
                const Icon = cmd.icon;
                return (
                  <button
                    key={cmd.id}
                    onClick={() => {
                      SoundFX.click();
                      cmd.action();
                      onClose();
                    }}
                    className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-800/90 transition text-left cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition">
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-semibold text-slate-200 group-hover:text-white">
                        {cmd.label}
                      </span>
                    </div>
                    {cmd.badge && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-cyan-400">
                        {cmd.badge}
                      </span>
                    )}
                  </button>
                );
              })
            ) : (
              <div className="p-6 text-center text-xs text-slate-500">
                No matching commands found.
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
