import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Terminal, Globe, Target, Smartphone, Mail } from 'lucide-react';

export default function CommandPalette({
  isOpen,
  onClose,
  onOpenLifeOS,
  onOpenDownload,
  customCommands = null,
  darkTheme = false
}) {
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);

  const defaultCommands = [
    { id: 'work', label: 'Selected Work & Ventures (JACKFRU)', icon: Globe, action: () => { window.location.hash = '#work'; } },
    { id: 'capabilities', label: 'Capabilities & Engagement Tiers', icon: Target, action: () => { window.location.hash = '#capabilities'; } },
    { id: 'contact', label: 'Initiate Consultation / Inquiry', icon: Mail, action: () => { window.location.hash = '#contact'; } },
    { id: 'life-os', label: 'Open Private Workspace (Life OS)', icon: Terminal, action: onOpenLifeOS, badge: 'Locked' },
    { id: 'download', label: 'Owner Mobile Client (.apk)', icon: Smartphone, action: onOpenDownload, badge: 'Private' }
  ];

  const commands = customCommands || defaultCommands;
  const filtered = commands.filter((c) =>
    `${c.label} ${c.badge || ''}`.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    setActiveIndex(0);
  }, [query, isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else window.dispatchEvent(new CustomEvent('open-command-palette'));
      }
      if (!isOpen) return;

      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex((i) => (filtered.length ? (i + 1) % filtered.length : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex((i) => (filtered.length ? (i - 1 + filtered.length) % filtered.length : 0));
      } else if (e.key === 'Enter' && filtered[activeIndex]) {
        e.preventDefault();
        filtered[activeIndex].action?.();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, filtered, activeIndex]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div
        onClick={onClose}
        className="fixed inset-0 z-50 flex items-start justify-center pt-20 sm:pt-24 p-4 bg-black/35 backdrop-blur-md"
      >
        <motion.div
          onClick={(e) => e.stopPropagation()}
          initial={{ opacity: 0, scale: 0.97, y: -12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.97, y: -12 }}
          transition={{ duration: 0.18 }}
          className={`relative w-full max-w-lg overflow-hidden rounded-[24px] border shadow-[0_24px_64px_rgba(0,0,0,0.2)] ${
            darkTheme
              ? 'bg-slate-900 border-white/15 text-white'
              : 'bg-white border-black/[0.08] text-[#1d1d1f]'
          }`}
        >
          {/* Search Input Bar */}
          <div className={`flex items-center px-5 border-b ${darkTheme ? 'border-white/10' : 'border-black/[0.06]'}`}>
            <Search className="w-4 h-4 opacity-60 shrink-0" />
            <input
              autoFocus
              type="text"
              placeholder={customCommands ? 'নোট, গোল, আইডিয়া, মডিউল খুঁজুন (↑↓ Enter)...' : 'Jump to section or action...'}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full px-3.5 py-4 bg-transparent text-sm placeholder:opacity-50 focus:outline-none"
            />
            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-md ${darkTheme ? 'bg-white/10 text-slate-300' : 'bg-[#f5f5f7] text-[#86868b]'}`}>
              ESC
            </span>
          </div>

          {/* Command List */}
          <div className="p-2 max-h-80 overflow-y-auto space-y-0.5">
            {filtered.length > 0 ? (
              filtered.map((cmd, idx) => {
                const Icon = cmd.icon || Search;
                const isSelected = idx === activeIndex;
                return (
                  <button
                    key={cmd.id}
                    type="button"
                    onMouseEnter={() => setActiveIndex(idx)}
                    onClick={() => {
                      cmd.action?.();
                      onClose();
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl transition-colors text-left cursor-pointer ${
                      darkTheme
                        ? isSelected
                          ? 'bg-indigo-600/30 text-white'
                          : 'hover:bg-white/5 text-slate-200'
                        : isSelected
                        ? 'bg-[#f5f5f7] text-[#1d1d1f]'
                        : 'hover:bg-[#f5f5f7]/60 text-[#1d1d1f]'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Icon className="w-4 h-4 opacity-70 shrink-0" />
                      <span className="text-[13px] font-medium truncate">
                        {cmd.label}
                      </span>
                    </div>
                    {cmd.badge && (
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0 ${
                        darkTheme ? 'bg-white/10 text-cyan-300' : 'bg-[#f5f5f7] text-[#6e6e73]'
                      }`}>
                        {cmd.badge}
                      </span>
                    )}
                  </button>
                );
              })
            ) : (
              <div className="p-6 text-center text-xs opacity-60">
                No matching items found.
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
