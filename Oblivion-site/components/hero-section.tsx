'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

interface HeroSectionProps {
  onRequestAccess: () => void;
}

export default function HeroSection({ onRequestAccess }: HeroSectionProps) {
  return (
    <section className="relative flex h-screen items-center justify-center overflow-hidden">
      {/* Subtle background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-black to-neutral-900 opacity-50" />
      
      <motion.div
        className="relative z-10 text-center space-y-8 px-4 max-w-3xl"
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2, ease: 'easeOut' }}
      >
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="text-xs tracking-widest text-neutral-400 uppercase font-light"
        >
          Neural Protocol
        </motion.div>

        {/* Main headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="text-6xl md:text-7xl font-light tracking-tighter text-white leading-tight"
        >
          The Unseen
          <br />
          <span className="font-extralight text-neutral-300">Co-Founder.</span>
        </motion.h1>

        {/* Subheading */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="text-lg md:text-xl text-neutral-400 font-light max-w-2xl mx-auto"
        >
          Autonomous execution for the builder class.
          <br />
          <span className="text-neutral-500">Coming soon.</span>
        </motion.p>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="pt-4"
        >
          <button
            onClick={onRequestAccess}
            className="px-8 py-3 border border-neutral-600 text-neutral-100 hover:border-neutral-400 hover:bg-neutral-950 transition-all duration-300 text-sm tracking-wide font-light"
          >
            Request Access
          </button>
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2.5, repeat: Infinity }}
      >
        <div className="text-xs text-neutral-600 uppercase tracking-widest mb-2">
          Scroll
        </div>
        <div className="w-0.5 h-8 bg-gradient-to-b from-neutral-500 to-transparent" />
      </motion.div>
    </section>
  );
}
