'use client';

import { motion } from 'framer-motion';
import { Github, Twitter, Youtube } from 'lucide-react';

export default function ProtocolSection() {
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

  const socialLinks = [
    {
      icon: Twitter,
      href: 'https://x.com',
      label: 'X',
    },
    {
      icon: Youtube,
      href: 'https://youtube.com',
      label: 'YouTube',
    },
    {
      icon: Github,
      href: 'https://github.com',
      label: 'GitHub',
    },
  ];

  return (
    <section className="relative py-32 px-4 md:px-8 border-t border-neutral-800">
      <div className="max-w-6xl mx-auto">
        <motion.div
          className="text-center space-y-12"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          {/* Headline */}
          <motion.div variants={itemVariants} className="space-y-4">
            <h2 className="text-5xl md:text-6xl font-light tracking-tighter text-white">
              Follow the Protocol.
            </h2>
            <p className="text-lg text-neutral-400 font-light">
              Watch the build in real-time.
            </p>
          </motion.div>

          {/* Social Icons */}
          <motion.div
            variants={itemVariants}
            className="flex justify-center gap-12"
          >
            {socialLinks.map((social, idx) => {
              const Icon = social.icon;
              return (
                <motion.a
                  key={idx}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div
                    className="
                      p-4 rounded border border-neutral-800 bg-neutral-950/20 
                      group-hover:border-neutral-400 group-hover:bg-neutral-950/40
                      transition-all duration-300
                    "
                  >
                    <Icon className="w-5 h-5 text-neutral-400 group-hover:text-neutral-100 transition-colors" />
                  </div>
                  <span className="text-xs text-neutral-600 mt-2 block text-center">
                    {social.label}
                  </span>
                </motion.a>
              );
            })}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
