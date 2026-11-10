import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Terminal, Globe, Target, Smartphone, Mail } from 'lucide-react';

export default function CommandPalette({
  isOpen,
  onClose,
  onOpenLifeOS,
  onOpenDownload
}) {
  const [query, setQuery] = useState('');

  const commands = [
    { id: 'work', label: 'Selected Work & Ventures (JACKFRU)', icon: Globe, action: () => { window.location.hash = '#work'; } },
    { id: 'capabilities', label: 'Capabilities & Engagement Tiers', icon: Target, action: () => { window.location.hash = '#capabilities'; } },
    { id: 'contact', label: 'Initiate Consultation / Inquiry', icon: Mail, action: () => { window.location.hash = '#contact'; } },
    { id: 'life-os', label: 'Open Private Workspace (Life OS)', icon: Terminal, action: onOpenLifeOS, badge: 'Locked' },
    { id: 'download', label: 'Owner Mobile Client (.apk)', icon: Smartphone, action: onOpenDownload, badge: 'Private' }
  ];

  const filtered = commands.filter((c) =>
    c.label.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          window.dispatchEvent(new CustomEvent('open-command-palette'));
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
      <div
        onClick={onClose}
        className="fixed inset-0 z-50 flex items-start justify-center pt-24 p-4 bg-black/25 backdrop-blur-md"
      >
        <motion.div
          onClick={(e) => e.stopPropagation()}
          initial={{ opacity: 0, scale: 0.97, y: -12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.97, y: -12 }}
          transition={{ duration: 0.18 }}
          className="relative w-full max-w-lg overflow-hidden rounded-[24px] bg-white border border-black/[0.08] shadow-[0_24px_64px_rgba(0,0,0,0.14)] text-[#1d1d1f]"
        >
          {/* Search Input Bar */}
          <div className="flex items-center px-5 border-b border-black/[0.06]">
            <Search className="w-4 h-4 text-[#86868b] shrink-0" />
            <input
              autoFocus
              type="text"
              placeholder="Jump to section or action..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full px-3.5 py-4 bg-transparent text-sm text-[#1d1d1f] placeholder-[#86868b] focus:outline-none"
            />
            <span className="text-[10px] text-[#86868b] font-medium px-2 py-0.5 rounded-md bg-[#f5f5f7]">
              ESC
            </span>
          </div>

          {/* Command List */}
          <div className="p-2 max-h-72 overflow-y-auto space-y-0.5">
            {filtered.length > 0 ? (
              filtered.map((cmd) => {
                const Icon = cmd.icon;
                return (
                  <button
                    key={cmd.id}
                    onClick={() => {
                      cmd.action();
                      onClose();
                    }}
                    className="w-full flex items-center justify-between px-3.5 py-3 rounded-2xl hover:bg-[#f5f5f7] transition-colors text-left cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4 text-[#6e6e73] group-hover:text-[#1d1d1f] transition-colors" />
                      <span className="text-[13px] font-medium text-[#1d1d1f]">
                        {cmd.label}
                      </span>
                    </div>
                    {cmd.badge && (
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#f5f5f7] text-[#6e6e73]">
                        {cmd.badge}
                      </span>
                    )}
                  </button>
                );
              })
            ) : (
              <div className="p-6 text-center text-xs text-[#86868b]">
                No matching sections found.
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
