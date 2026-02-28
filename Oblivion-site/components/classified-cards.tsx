'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';

const cards = [
  {
    title: 'System-Wide Observation Layer',
    id: 'observation',
  },
  {
    title: 'Persistent Vector Memory',
    id: 'memory',
  },
  {
    title: 'Local Execution Engine',
    id: 'execution',
  },
  {
    title: 'Multi-Model Orchestration',
    id: 'orchestration',
  },
];

export default function ClassifiedCards() {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: 'easeOut' },
    },
  };

  return (
    <section className="relative py-32 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="grid md:grid-cols-2 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {cards.map((card) => (
            <motion.div
              key={card.id}
              variants={cardVariants}
              onMouseEnter={() => setHoveredId(card.id)}
              onMouseLeave={() => setHoveredId(null)}
              className="group relative"
            >
              <div
                className={`
                  relative p-8 backdrop-blur-md transition-all duration-500
                  ${
                    hoveredId === card.id
                      ? 'border-neutral-400 bg-neutral-950/40'
                      : 'border-neutral-800 bg-neutral-950/20'
                  }
                  border rounded
                `}
              >
                {/* Glow effect on hover */}
                {hoveredId === card.id && (
                  <motion.div
                    className="absolute inset-0 rounded opacity-30 pointer-events-none"
                    style={{
                      boxShadow: '0 0 20px rgba(245, 245, 245, 0.1) inset',
                    }}
                    layoutId="glow"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.3 }}
                    transition={{ duration: 0.3 }}
                  />
                )}

                <div className="relative z-10">
                  <h3 className="text-lg md:text-xl font-light tracking-tight text-white mb-4">
                    {card.title}
                  </h3>

                  {/* Status text on hover */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{
                      opacity: hoveredId === card.id ? 1 : 0,
                      y: hoveredId === card.id ? 0 : 10,
                    }}
                    transition={{ duration: 0.3 }}
                    className="text-xs text-neutral-500 uppercase tracking-widest font-light"
                  >
                    Status: In active development
                  </motion.div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
