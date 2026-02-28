'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useState } from 'react';

interface AccessModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AccessModal({ isOpen, onClose }: AccessModalProps) {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setIsSubmitted(true);
      setTimeout(() => {
        onClose();
        setEmail('');
        setIsSubmitted(false);
      }, 1500);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            <motion.div
              className="relative w-full max-w-md bg-neutral-950 border border-neutral-800 rounded p-8"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <motion.button
                onClick={onClose}
                className="absolute top-6 right-6 p-1 hover:bg-neutral-900 rounded transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <X className="w-4 h-4 text-neutral-500 hover:text-neutral-300" />
              </motion.button>

              {/* Content */}
              {!isSubmitted ? (
                <motion.div
                  className="space-y-6"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <div className="space-y-2">
                    <h3 className="text-2xl font-light text-white">Request Access</h3>
                    <p className="text-sm text-neutral-400">
                      Join the Oblivion AI protocol. Limited invitations available.
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      required
                      className="
                        w-full px-4 py-3 bg-neutral-900 border border-neutral-800 
                        text-neutral-100 placeholder-neutral-600 text-sm
                        focus:outline-none focus:border-neutral-400 focus:ring-1 focus:ring-neutral-400/30
                        transition-all duration-300
                      "
                    />

                    <button
                      type="submit"
                      className="
                        w-full px-4 py-3 bg-neutral-900 border border-neutral-700 
                        text-neutral-100 text-sm font-light tracking-wide
                        hover:border-neutral-500 hover:bg-neutral-800
                        transition-all duration-300
                      "
                    >
                      Request Access
                    </button>
                  </form>

                  <p className="text-xs text-neutral-600 text-center">
                    We'll send you an invitation shortly.
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  className="space-y-4 text-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <div className="flex justify-center mb-4">
                    <motion.div
                      className="text-3xl"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 0.6 }}
                    >
                      ✓
                    </motion.div>
                  </div>
                  <p className="text-white font-light">Access Requested</p>
                  <p className="text-sm text-neutral-400">
                    Check your email for the protocol.
                  </p>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
