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
    <div className={`pointer-events-none absolute -inset-px rounded-[inherit] overflow-hidden ${className}`}>
      <motion.div
        animate={{
          offsetDistance: ['0%', '100%']
        }}
        transition={{
          duration,
          ease: 'linear',
          repeat: Infinity
        }}
        style={{
          width: size,
          aspectRatio: '1',
          background: `radial-gradient(circle, ${colorFrom} 10%, ${colorTo} 40%, transparent 70%)`,
          offsetPath: 'rect(0 100% 100% 0 round 1rem)',
          position: 'absolute',
          filter: 'blur(3px)',
          opacity: 0.85
        }}
      />
    </div>
  );
}
