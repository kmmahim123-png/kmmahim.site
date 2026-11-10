import React from 'react';
import { motion } from 'framer-motion';

export function BorderBeam({
  size = 200,
  duration = 8,
  colorFrom = '#6366f1',
  colorTo = '#06b6d4',
  className = ''
}) {
  return (
    <div className={`pointer-events-none absolute -inset-[1px] rounded-[inherit] overflow-hidden ${className}`}>
      {/* Universal rotating gradient border compatible with all mobile & WebView engines */}
      <motion.div
        animate={{ rotate: [0, 360] }}
        transition={{
          duration,
          ease: 'linear',
          repeat: Infinity
        }}
        style={{
          width: '200%',
          height: '200%',
          position: 'absolute',
          top: '-50%',
          left: '-50%',
          background: `conic-gradient(from 0deg, transparent 0deg, transparent 280deg, ${colorFrom} 330deg, ${colorTo} 360deg)`,
          opacity: 0.9,
          filter: 'blur(1px)'
        }}
      />
      {/* Inner card overlay so only the 1.5px border glows */}
      <div className="absolute inset-[1.5px] rounded-[inherit] bg-slate-950/90 backdrop-blur-xl" />
    </div>
  );
}
