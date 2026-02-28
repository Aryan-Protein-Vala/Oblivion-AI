'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import HeroSection from '@/components/hero-section';
import TaglineMarquee from '@/components/tagline-marquee';
import MissionSection from '@/components/mission-section';
import ClassifiedCards from '@/components/classified-cards';
import ProtocolSection from '@/components/protocol-section';
import EmailSignup from '@/components/email-signup';
import Footer from '@/components/footer';
import AccessModal from '@/components/access-modal';

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <main className="overflow-hidden bg-background">
      <HeroSection onRequestAccess={() => setIsModalOpen(true)} />
      <TaglineMarquee />
      <MissionSection />
      <ClassifiedCards />
      <ProtocolSection />
      <EmailSignup onSignup={() => setIsModalOpen(true)} />
      <Footer />
      <AccessModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </main>
  );
}
