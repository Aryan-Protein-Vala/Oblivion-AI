'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';

interface EmailSignupProps {
  onSignup: () => void;
}

export default function EmailSignup({ onSignup }: EmailSignupProps) {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setIsSubmitted(true);
      onSignup();
      setTimeout(() => {
        setEmail('');
        setIsSubmitted(false);
      }, 3000);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: 'easeOut' },
    },
  };

  return (
    <section className="relative py-32 px-4 md:px-8 border-t border-neutral-800">
      <div className="max-w-2xl mx-auto">
        <motion.div
          className="text-center space-y-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.4 }}
        >
          {/* Headline */}
          <motion.div variants={itemVariants} className="space-y-3">
            <p className="text-xs uppercase tracking-widest text-neutral-500 font-light">
              Initialize sequence
            </p>
            <h2 className="text-4xl md:text-5xl font-light tracking-tighter text-white">
              Join the Oblivion AI waitlist.
            </h2>
          </motion.div>

          {/* Form */}
          <motion.form
            variants={itemVariants}
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            <div className="relative group">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="
                  w-full px-6 py-4 bg-neutral-950 border border-neutral-800 
                  text-neutral-100 placeholder-neutral-600 
                  focus:outline-none focus:border-neutral-400 focus:ring-1 focus:ring-neutral-400/30
                  transition-all duration-300
                "
              />
              {/* Soft glow on focus */}
              <div
                className="
                  absolute inset-0 rounded opacity-0 group-focus-within:opacity-20
                  pointer-events-none transition-opacity duration-300
                "
                style={{
                  boxShadow: '0 0 20px rgba(245, 245, 245, 0.1) inset',
                }}
              />
            </div>

            <motion.button
              type="submit"
              disabled={isSubmitted}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`
                w-full px-6 py-3 font-light text-sm tracking-wide
                transition-all duration-300
                ${
                  isSubmitted
                    ? 'bg-neutral-800 text-neutral-400 border-neutral-700'
                    : 'bg-neutral-900 border-neutral-700 text-neutral-100 hover:bg-neutral-800 hover:border-neutral-500'
                }
                border
              `}
            >
              {isSubmitted ? '✓ Access Requested' : 'Initialize Sequence'}
            </motion.button>
          </motion.form>

          {/* Subtle note */}
          <motion.p
            variants={itemVariants}
            className="text-xs text-neutral-600 font-light tracking-wide"
          >
            You'll be added to the private protocol.
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
}
