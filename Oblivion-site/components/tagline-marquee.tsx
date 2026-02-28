'use client';

import { motion } from 'framer-motion';

export default function TaglineMarquee() {
  const taglines = [
    'Context is everything',
    'It remembers what you build',
    'Zero-friction execution',
    'The silent operator',
  ];

  return (
    <section className="relative py-16 overflow-hidden border-y border-neutral-800">
      <div className="flex overflow-hidden">
        <motion.div
          className="flex gap-16 whitespace-nowrap"
          animate={{ x: [0, -2000] }}
          transition={{
            duration: 40,
            repeat: Infinity,
            ease: 'linear',
          }}
        >
          {[...taglines, ...taglines].map((tagline, idx) => (
            <div
              key={idx}
              className="text-neutral-400 text-lg tracking-wide font-light"
            >
              {tagline}
              <span className="mx-8 text-neutral-700">•</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
