'use client';

import { motion } from 'framer-motion';

export default function Footer() {
  return (
    <footer className="relative border-t border-neutral-800 py-12 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 text-center md:text-left"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          {/* Copyright */}
          <p className="text-xs text-neutral-600 font-light uppercase tracking-widest">
            Oblivion AI © 2026
          </p>

          {/* Status */}
          <p className="text-xs text-neutral-600 font-light uppercase tracking-widest">
            Founder OS · Stealth Mode
          </p>
        </motion.div>
      </div>
    </footer>
  );
}
