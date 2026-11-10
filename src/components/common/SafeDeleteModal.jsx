import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { SoundFX } from './SoundEffects';

export default function SafeDeleteModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'ডেটা মুছে ফেলার নিশ্চিতকরণ',
  description = 'আপনি কি আসলেই এই ডেটা ডিলিট করতে চান? এটি করলে আর ফেরত পাওয়া যাবে না।'
}) {
  const [confirmText, setConfirmText] = useState('');

  if (!isOpen) return null;

  const isConfirmed =
    confirmText.trim().toUpperCase() === 'DELETE' ||
    confirmText.trim() === 'ডিলিট';

  const handleConfirm = (e) => {
    e.preventDefault();
    if (!isConfirmed) return;
    SoundFX.laser();
    onConfirm();
    setConfirmText('');
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 12 }}
          className="relative w-full max-w-md glass-crystal rounded-3xl p-6 space-y-4 border-rose-500/40 shadow-2xl shadow-rose-950/50"
        >
          <button
            onClick={() => {
              SoundFX.click();
              setConfirmText('');
              onClose();
            }}
            className="absolute top-4 right-4 p-1.5 rounded-xl bg-white/5 hover:bg-white/15 text-slate-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">{title}</h3>
              <span className="text-[10px] font-mono uppercase tracking-wider text-rose-400">
                Protected Deletion Gate
              </span>
            </div>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">{description}</p>

          <form onSubmit={handleConfirm} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-amber-300 block mb-1.5">
                নিশ্চিত করতে নিচের বক্সে <span className="font-mono bg-rose-500/20 px-1.5 py-0.5 rounded text-white border border-rose-500/40">DELETE</span> লিখুন:
              </label>
              <input
                type="text"
                autoFocus
                placeholder="Type DELETE to confirm..."
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm font-mono text-white tracking-wider focus:border-rose-500"
              />
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => {
                  SoundFX.click();
                  setConfirmText('');
                  onClose();
                }}
                className="flex-1 py-2.5 rounded-xl glass-pill hover:bg-white/10 text-xs font-bold text-slate-300 transition"
              >
                বাতিল করুন
              </button>

              <button
                type="submit"
                disabled={!isConfirmed}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                  isConfirmed
                    ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-900/50 cursor-pointer'
                    : 'bg-slate-800/60 text-slate-500 cursor-not-allowed opacity-50'
                }`}
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>ডিলিট নিশ্চিত করুন</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
