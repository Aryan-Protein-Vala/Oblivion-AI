'use client';

import { motion } from 'framer-motion';

export default function MissionSection() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
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
    <section className="relative py-32 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="grid md:grid-cols-2 gap-16 items-center"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          {/* Left side */}
          <motion.div
            variants={itemVariants}
            className="space-y-6"
          >
            <h2 className="text-5xl md:text-6xl font-light tracking-tighter text-white">
              We are building
              <br />
              <span className="text-neutral-400">an intelligence</span>
              <br />
              that lives natively
              <br />
              in your environment.
            </h2>
          </motion.div>

          {/* Right side */}
          <motion.div
            variants={itemVariants}
            className="space-y-8"
          >
            <div className="space-y-4">
              <p className="text-lg text-neutral-300 font-light leading-relaxed">
                Designed to observe, understand, and execute without prompts.
              </p>
              <p className="text-neutral-400 font-light text-sm tracking-wide">
                Code without the interface.
              </p>
            </div>

            <div className="space-y-4 pt-8 border-t border-neutral-800">
              <p className="text-lg text-neutral-300 font-light leading-relaxed">
                Your system state, fully parsed.
              </p>
              <p className="text-neutral-400 font-light text-sm tracking-wide">
                This is the next paradigm of human-computer symbiosis.
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
