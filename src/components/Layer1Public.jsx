import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOS } from '../context/OSContext';
import CommandPalette from './common/CommandPalette';
import {
  ArrowUpRight, ArrowRight, Check, Lock, Smartphone, Search, Terminal, X
} from 'lucide-react';

const appleEase = [0.16, 1, 0.3, 1];

export default function Layer1Public() {
  const { data, setShowPinModal, isAuthenticated, setActiveLayer, sendClientMessage } = useOS();
  const { profile, projects, services } = data;

  // Discreet triple-click detector on Brand Wordmark for Private OS
  const clickCountRef = useRef(0);
  const clickTimerRef = useRef(null);

  const handleSecretLogoClick = () => {
    clickCountRef.current += 1;
    if (clickTimerRef.current) clearTimeout(clickTimerRef.current);

    if (clickCountRef.current >= 3) {
      clickCountRef.current = 0;
      if (isAuthenticated) {
        setActiveLayer('private');
      } else {
        setShowPinModal(true);
      }
    } else {
      clickTimerRef.current = setTimeout(() => {
        clickCountRef.current = 0;
      }, 600);
    }
  };

  // State
  const [selectedService, setSelectedService] = useState(services[0]?.title || '');
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [meetingDate, setMeetingDate] = useState('');
  const [projectNote, setProjectNote] = useState('');
  const [bookingSent, setBookingSent] = useState(false);
  const [bookingBusy, setBookingBusy] = useState(false);
  const [workFilter, setWorkFilter] = useState('All');
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [activeCaseStudy, setActiveCaseStudy] = useState(null);

  useEffect(() => {
    const handlePaletteTrigger = () => setShowCommandPalette(true);
    window.addEventListener('open-command-palette', handlePaletteTrigger);
    return () => window.removeEventListener('open-command-palette', handlePaletteTrigger);
  }, []);

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!clientName || !clientEmail || bookingBusy) return;
    setBookingBusy(true);
    await sendClientMessage({
      sender: clientName,
      email: clientEmail,
      service: selectedService,
      meetingDate: meetingDate || 'Flexible',
      text: projectNote || 'Consultation inquiry.'
    });
    setBookingBusy(false);
    setBookingSent(true);
    setClientName('');
    setClientEmail('');
    setProjectNote('');
    setTimeout(() => setBookingSent(false), 5000);
  };

  const downloadVCard = () => {
    const vcard = `BEGIN:VCARD
VERSION:3.0
FN:${profile.name}
TITLE:${profile.tagline}
TEL;TYPE=CELL:${profile.phone}
EMAIL:${profile.email}
NOTE:${profile.department}
URL:https://kmmahim.site
END:VCARD`;
    const blob = new Blob([vcard], { type: 'text/vcard' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${profile.name.replace(/\s+/g, '_')}.vcf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const cleanNowStatus = (profile.nowStatus || '').replace(/[\u{1F300}-\u{1FAFF}]/gu, '').trim();

  // Architectural Portfolio Case Studies with Full Detail View
  const flagshipWork = [
    {
      id: 'fw1',
      index: '01',
      categoryGroup: 'Brand & Retail',
      eyebrow: 'Apparel & Global Supply Chain',
      title: 'JACKFRU Apparel',
      description:
        'Founded and structured a physical-first apparel label engineered for retail store distribution across Australia and domestic commercial channels. Built custom manufacturing workflows, packaging standards, and inventory logistics.',
      caseStudyDetails: {
        problem: 'Bridging local Bangladesh garment production with strict Australian physical retail quality and timeline standards.',
        architecture: 'Built direct factory QA checkpoints, standardized SKU sizing & packaging specs, and streamlined international dispatch.',
        outcome: 'Active commercial distribution footprint with repeatable manufacturing pipelines.'
      },
      specs: ['Australian Retail Ready', 'End-to-End Supply Chain', 'Commercial Merchandising'],
      span: 'md:col-span-7',
      actionLabel: 'Read Case Study',
      actionHref: '#contact'
    },
    {
      id: 'fw2',
      index: '02',
      categoryGroup: 'Systems & AI',
      eyebrow: 'Private Cognitive Infrastructure',
      title: 'Autonomous Life OS',
      description:
        'Two-layer web and native Android operating environment unifying personal financial ledgers, academic targets, multi-agent automation (OpenClaw, Grok, Hermes), and real-time cloud synchronization.',
      caseStudyDetails: {
        problem: 'Fragmented spreadsheets, disconnected habit trackers, and manual bookkeeping across phone and laptop.',
        architecture: 'React + Vite + Capacitor Android APK backed by Supabase PostgreSQL Realtime, Obsidian-style Second Brain, and Multi-Provider AI Tool Calling.',
        outcome: 'Sub-second cross-device state orchestration with voice & AI copilot automation.'
      },
      specs: ['React & Capacitor', 'Supabase Realtime', 'AI Second Brain'],
      span: 'md:col-span-5',
      actionLabel: 'Access Private System',
      isPrivateTrigger: true
    },
    {
      id: 'fw3',
      index: '03',
      categoryGroup: 'Web Platforms',
      eyebrow: 'Commercial Engineering',
      title: 'High-Conversion Web Platforms',
      description:
        'Bespoke responsive architectures developed for healthcare clinics, consumer commerce brands, and specialized service teams. Engineered for immediate loading, editorial clarity, and automated client booking.',
      caseStudyDetails: {
        problem: 'Slow, cluttered template websites losing mobile traffic and client conversion inquiries.',
        architecture: 'Code-split React SPAs, zero-bloat Tailwind typography, automated Supabase lead capture, and WhatsApp intake.',
        outcome: 'Sub-second perceived loads and higher qualified consultation bookings.'
      },
      specs: ['Sub-Second Load', 'Conversion Architecture', 'Automated Intake'],
      span: 'md:col-span-6',
      actionLabel: 'Read Case Study',
      actionHref: '#capabilities'
    },
    {
      id: 'fw4',
      index: '04',
      categoryGroup: 'Systems & AI',
      eyebrow: 'University of Rajshahi',
      title: 'Sports Science & Execution Discipline',
      description:
        'Studying within the Department of Physical Education & Sports Science at the University of Rajshahi. Translating structured athletic conditioning and physiological stamina directly into consistent engineering delivery.',
      caseStudyDetails: {
        problem: 'Maintaining cognitive consistency across software building, business operations, and academic research.',
        architecture: 'Integrated habit tracking, spaced-repetition study flashcards, and physiological periodization.',
        outcome: 'Repeatable daily sprint execution.'
      },
      specs: ['Physical Conditioning', 'Daily Routine Precision', 'Long-Horizon Focus'],
      span: 'md:col-span-6',
      actionLabel: 'Download Contact Card',
      isVCardTrigger: true
    }
  ];

  // Fixed: display ALL custom CMS projects added from Layer 2 (not hidden behind .slice(3))
  const DEFAULT_PROJECT_IDS = new Set(['p1', 'p2', 'p3']);
  const customProjects = (projects || [])
    .filter((p) => !DEFAULT_PROJECT_IDS.has(p.id))
    .map((p, i) => ({
      id: p.id,
      index: `0${i + 5}`,
      categoryGroup: 'Web Platforms',
      eyebrow: p.category || 'Selected Project',
      title: p.title,
      description: p.description,
      specs: [p.metrics || 'Production', p.badge || 'Featured'],
      span: 'md:col-span-6',
      actionLabel: 'Discuss Similar Scope',
      actionHref: '#contact'
    }));

  const allWork = [...flagshipWork, ...customProjects];
  const filteredWork =
    workFilter === 'All'
      ? allWork
      : allWork.filter((item) => item.categoryGroup === workFilter);

  return (
    <div className="min-h-screen bg-[#fbfbfd] text-[#1d1d1f] font-sans selection:bg-[#1d1d1f] selection:text-white">
      {/* Interactive Case Study Modal */}
      <AnimatePresence>
        {activeCaseStudy && (
          <div
            onClick={() => setActiveCaseStudy(null)}
            className="fixed inset-0 z-50 bg-black/30 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              className="bg-white rounded-[28px] border border-black/[0.08] max-w-xl w-full p-7 sm:p-9 space-y-5 shadow-[0_24px_60px_rgba(0,0,0,0.14)] relative text-[#1d1d1f]"
            >
              <button
                type="button"
                onClick={() => setActiveCaseStudy(null)}
                aria-label="Close case study"
                className="absolute top-6 right-6 p-2 rounded-full text-[#86868b] hover:text-[#1d1d1f] hover:bg-[#f5f5f7]"
              >
                <X className="w-4 h-4" />
              </button>
              <span className="text-[11px] uppercase tracking-[0.16em] text-[#86868b] font-medium block">
                {activeCaseStudy.index} / {activeCaseStudy.eyebrow}
              </span>
              <h3 className="font-display text-2xl sm:text-3xl font-semibold tracking-[-0.025em]">
                {activeCaseStudy.title}
              </h3>
              <p className="text-sm text-[#6e6e73] leading-relaxed">{activeCaseStudy.description}</p>
              {activeCaseStudy.caseStudyDetails && (
                <div className="space-y-3 pt-2 border-t border-black/[0.08] text-xs">
                  <div>
                    <span className="font-semibold text-[#1d1d1f] block">Challenge</span>
                    <p className="text-[#6e6e73] mt-0.5">{activeCaseStudy.caseStudyDetails.problem}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-[#1d1d1f] block">Architecture</span>
                    <p className="text-[#6e6e73] mt-0.5">{activeCaseStudy.caseStudyDetails.architecture}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-[#1d1d1f] block">Outcome</span>
                    <p className="text-[#6e6e73] mt-0.5">{activeCaseStudy.caseStudyDetails.outcome}</p>
                  </div>
                </div>
              )}
              <div className="flex flex-wrap gap-2 pt-2">
                {activeCaseStudy.specs.map((sp) => (
                  <span key={sp} className="px-3 py-1 rounded-full bg-[#f5f5f7] text-[11px] font-medium">
                    {sp}
                  </span>
                ))}
              </div>
              <a
                href="#contact"
                onClick={() => setActiveCaseStudy(null)}
                className="w-full block text-center py-3 rounded-full bg-[#1d1d1f] hover:bg-black text-white text-xs font-medium"
              >
                Discuss This Scope
              </a>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Minimal Spotlight Palette */}
      <CommandPalette
        isOpen={showCommandPalette}
        onClose={() => setShowCommandPalette(false)}
        onOpenLifeOS={() => {
          if (isAuthenticated) setActiveLayer('private');
          else setShowPinModal(true);
        }}
        onOpenDownload={() => {
          window.location.href = '/kmmahim-life-os.apk';
        }}
      />

      {/* Apple-Grade Sticky Translucent Header */}
      <header className="sticky top-0 z-40 bg-[#fbfbfd]/80 backdrop-blur-2xl border-b border-black/[0.06]">
        <div className="max-w-[1200px] mx-auto px-5 sm:px-8 h-16 flex items-center justify-between gap-4">
          {/* Wordmark */}
          <button
            type="button"
            onClick={handleSecretLogoClick}
            className="text-left focus:outline-none group flex items-baseline gap-2.5"
          >
            <span className="font-display font-semibold text-base tracking-[-0.02em] text-[#1d1d1f]">
              KM Mahim
            </span>
            <span className="text-xs text-[#86868b] font-normal hidden sm:inline">
              {profile.bnName}
            </span>
          </button>

          {/* Clean Center Navigation */}
          <nav className="hidden md:flex items-center gap-8 text-[13px] font-medium text-[#6e6e73]">
            <a href="#work" className="hover:text-[#1d1d1f] transition-colors">
              Selected Work
            </a>
            <a href="#capabilities" className="hover:text-[#1d1d1f] transition-colors">
              Capabilities
            </a>
            <a href="#about" className="hover:text-[#1d1d1f] transition-colors">
              About
            </a>
            <a href="#contact" className="hover:text-[#1d1d1f] transition-colors">
              Contact
            </a>
          </nav>

          {/* Clean Action Cluster */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowCommandPalette(true)}
              aria-label="Search"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#f5f5f7] hover:bg-[#ebebf0] text-[12px] font-medium text-[#6e6e73] hover:text-[#1d1d1f] transition-colors"
            >
              <Search className="w-3.5 h-3.5" />
              <span>⌘K</span>
            </button>

            {isAuthenticated && (
              <button
                type="button"
                onClick={() => setActiveLayer('private')}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-black/15 text-[12px] font-medium text-[#1d1d1f] hover:bg-[#f5f5f7] transition-colors"
              >
                <Terminal className="w-3.5 h-3.5" />
                <span>Life OS</span>
              </button>
            )}

            <a
              href="#contact"
              className="px-4 py-2 rounded-full bg-[#1d1d1f] hover:bg-black text-white text-[13px] font-medium tracking-[-0.01em] transition-all active:scale-[0.98]"
            >
              Start a Project
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-[1200px] mx-auto px-5 sm:px-8">
        {/* 1. EDITORIAL HERO SECTION */}
        <section id="about" className="pt-16 pb-20 sm:pt-28 sm:pb-28">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: appleEase }}
            className="max-w-4xl space-y-8"
          >
            <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-[#86868b]">
              Entrepreneur • Web Systems Architect • AI Automation Builder
            </p>

            <h1 className="font-display text-4xl sm:text-6xl lg:text-[72px] font-semibold tracking-[-0.035em] leading-[1.04] text-[#1d1d1f]">
              Building commercial brands, web systems, and autonomous tools with{' '}
              <span className="font-serif italic font-normal text-[#424245]">
                precision.
              </span>
            </h1>

            <p className="text-lg sm:text-[21px] text-[#6e6e73] max-w-2xl leading-[1.55] font-normal tracking-[-0.01em]">
              I’m <span className="text-[#1d1d1f] font-medium">{profile.name}</span> ({profile.bnName}).
              Operating from Rajshahi and Dhaka, I combine athletic discipline with modern full-stack architecture, AI agent automation, and retail brand execution.
            </p>

            {/* Primary Actions */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <a
                href="#contact"
                className="px-7 py-3.5 rounded-full bg-[#1d1d1f] hover:bg-black text-white text-sm font-medium inline-flex items-center gap-2 transition-all active:scale-[0.98]"
              >
                <span>Book a Consultation</span>
                <ArrowRight className="w-4 h-4" />
              </a>

              <a
                href="#work"
                className="px-7 py-3.5 rounded-full border border-[#d2d2d7] hover:border-[#1d1d1f] hover:bg-[#f5f5f7] text-[#1d1d1f] text-sm font-medium transition-all"
              >
                Explore Selected Work
              </a>

              <button
                type="button"
                onClick={downloadVCard}
                className="px-3 py-2 text-sm font-medium text-[#6e6e73] hover:text-[#1d1d1f] transition-colors underline underline-offset-4 decoration-black/20 hover:decoration-black"
              >
                Save Contact (.vcf)
              </button>
            </div>

            {/* Subtle Current Focus Line */}
            {cleanNowStatus && (
              <div className="pt-4 flex items-center gap-3 text-xs text-[#6e6e73]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#34c759] shrink-0" />
                <span>
                  <strong className="text-[#1d1d1f] font-medium">Current Focus:</strong>{' '}
                  {cleanNowStatus}
                </span>
              </div>
            )}
          </motion.div>

          {/* Clean Apple Typographic Metrics Strip */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15, ease: appleEase }}
            className="mt-20 sm:mt-24 grid grid-cols-2 lg:grid-cols-4 border-t border-b border-black/[0.08] divide-y lg:divide-y-0 lg:divide-x divide-black/[0.08]"
          >
            <div className="py-7 sm:py-8 lg:pr-8">
              <div className="font-display text-3xl sm:text-4xl font-semibold tracking-[-0.03em] text-[#1d1d1f]">
                03
              </div>
              <div className="text-sm font-medium text-[#1d1d1f] mt-1">Core Ventures</div>
              <p className="text-xs text-[#86868b] mt-1">
                Physical apparel retail, AI automation & web infrastructure
              </p>
            </div>

            <div className="py-7 sm:py-8 lg:px-8 pl-4 sm:pl-0">
              <div className="font-display text-3xl sm:text-4xl font-semibold tracking-[-0.03em] text-[#1d1d1f]">
                14+
              </div>
              <div className="text-sm font-medium text-[#1d1d1f] mt-1">Deployed Systems</div>
              <p className="text-xs text-[#86868b] mt-1">
                Custom web applications, booking engines & automated pipelines
              </p>
            </div>

            <div className="py-7 sm:py-8 lg:px-8">
              <div className="font-display text-3xl sm:text-4xl font-semibold tracking-[-0.03em] text-[#1d1d1f]">
                OpenClaw
              </div>
              <div className="text-sm font-medium text-[#1d1d1f] mt-1">Multi-Agent Core</div>
              <p className="text-xs text-[#86868b] mt-1">
                Integrated orchestration across OpenClaw, Grok & Hermes
              </p>
            </div>

            <div className="py-7 sm:py-8 lg:pl-8 pl-4 sm:pl-0">
              <div className="font-display text-3xl sm:text-4xl font-semibold tracking-[-0.03em] text-[#1d1d1f]">
                Rajshahi
              </div>
              <div className="text-sm font-medium text-[#1d1d1f] mt-1">Sports Science, RU</div>
              <p className="text-xs text-[#86868b] mt-1">
                Athletic conditioning applied to disciplined execution
              </p>
            </div>
          </motion.div>
        </section>

        {/* 2. SELECTED WORK / CASE STUDIES */}
        <section id="work" className="py-16 sm:py-24 border-t border-black/[0.06]">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-[#86868b] block mb-2">
                01 / Selected Work
              </span>
              <h2 className="font-display text-3xl sm:text-4xl font-semibold tracking-[-0.03em] text-[#1d1d1f]">
                Ventures & Engineering
              </h2>
            </div>

            {/* Clean Apple Segmented Category Tabs */}
            <div className="inline-flex items-center p-1 rounded-full bg-[#f5f5f7] border border-black/[0.04] overflow-x-auto no-scrollbar">
              {['All', 'Brand & Retail', 'Systems & AI', 'Web Platforms'].map((tab) => {
                const active = workFilter === tab;
                return (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setWorkFilter(tab)}
                    className={`relative px-4 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
                      active ? 'text-[#1d1d1f]' : 'text-[#6e6e73] hover:text-[#1d1d1f]'
                    }`}
                  >
                    {active && (
                      <motion.span
                        layoutId="workFilterPill"
                        transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                        className="absolute inset-0 rounded-full bg-white shadow-[0_1px_4px_rgba(0,0,0,0.08)]"
                      />
                    )}
                    <span className="relative z-10">{tab}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {filteredWork.map((item) => (
              <motion.article
                key={item.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.5, ease: appleEase }}
                className={`${item.span} bg-[#f5f5f7] hover:bg-[#efeff2] rounded-[28px] p-8 sm:p-10 flex flex-col justify-between transition-colors duration-300 border border-black/[0.04]`}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium uppercase tracking-[0.12em] text-[#86868b] text-[11px]">
                      {item.eyebrow}
                    </span>
                    <span className="font-mono text-[11px] text-[#86868b]">{item.index}</span>
                  </div>

                  <h3 className="font-display text-2xl sm:text-3xl font-semibold tracking-[-0.025em] text-[#1d1d1f]">
                    {item.title}
                  </h3>

                  <p className="text-[15px] text-[#6e6e73] leading-relaxed max-w-2xl">
                    {item.description}
                  </p>
                </div>

                <div className="mt-10 pt-6 border-t border-black/[0.06] flex flex-wrap items-center justify-between gap-4">
                  <div className="flex flex-wrap gap-2">
                    {item.specs.map((spec) => (
                      <span
                        key={spec}
                        className="px-3 py-1 rounded-full bg-white text-[11px] font-medium text-[#1d1d1f] border border-black/[0.06]"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>

                  {item.isPrivateTrigger ? (
                    <button
                      type="button"
                      onClick={() => {
                        if (isAuthenticated) setActiveLayer('private');
                        else setShowPinModal(true);
                      }}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1d1d1f] hover:opacity-70 transition-opacity"
                    >
                      <span>{item.actionLabel}</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  ) : item.isVCardTrigger ? (
                    <button
                      type="button"
                      onClick={downloadVCard}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1d1d1f] hover:opacity-70 transition-opacity"
                    >
                      <span>{item.actionLabel}</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  ) : item.caseStudyDetails ? (
                    <button
                      type="button"
                      onClick={() => setActiveCaseStudy(item)}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1d1d1f] hover:opacity-70 transition-opacity"
                    >
                      <span>{item.actionLabel}</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <a
                      href={item.actionHref}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1d1d1f] hover:opacity-70 transition-opacity"
                    >
                      <span>{item.actionLabel}</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </motion.article>
            ))}
          </div>
        </section>

        {/* 3. CAPABILITIES & STRUCTURED PACKAGES */}
        <section id="capabilities" className="py-16 sm:py-24 border-t border-black/[0.06]">
          <div className="max-w-2xl mb-12">
            <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-[#86868b] block mb-2">
              02 / Capabilities & Engagement
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-semibold tracking-[-0.03em] text-[#1d1d1f]">
              Clear scope. Predictable delivery.
            </h2>
            <p className="text-[15px] text-[#6e6e73] mt-3 leading-relaxed">
              Select an engagement structure below to pre-populate your consultation request. Every system is delivered cleanly with full ownership.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {services.map((srv) => {
              const active = selectedService === srv.title;
              return (
                <div
                  key={srv.id}
                  onClick={() => setSelectedService(srv.title)}
                  className={`rounded-[28px] p-8 flex flex-col justify-between cursor-pointer transition-all duration-300 border ${
                    active
                      ? 'bg-white border-[#1d1d1f] shadow-[0_12px_36px_rgba(0,0,0,0.06)]'
                      : 'bg-[#f5f5f7] border-transparent hover:bg-white hover:border-black/15'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.14em] text-[#86868b] font-medium mb-4">
                      <span>{srv.category}</span>
                      <span>{srv.delivery}</span>
                    </div>

                    <h3 className="font-display text-xl font-semibold tracking-[-0.02em] text-[#1d1d1f]">
                      {srv.title}
                    </h3>

                    <div className="mt-4 pb-6 border-b border-black/[0.08] flex items-baseline gap-1.5">
                      <span className="font-display text-3xl font-semibold tracking-[-0.03em] text-[#1d1d1f]">
                        ৳{srv.price.toLocaleString()}
                      </span>
                      <span className="text-xs text-[#86868b]">starting</span>
                    </div>

                    <ul className="mt-6 space-y-3">
                      {srv.features.map((f, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-[13px] text-[#424245]">
                          <Check className="w-4 h-4 text-[#1d1d1f] shrink-0 mt-0.5" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <a
                    href="#contact"
                    onClick={() => setSelectedService(srv.title)}
                    className={`mt-8 w-full py-3 rounded-full text-xs font-medium text-center transition-all ${
                      active
                        ? 'bg-[#1d1d1f] text-white'
                        : 'bg-white text-[#1d1d1f] border border-black/10 hover:border-[#1d1d1f]'
                    }`}
                  >
                    {active ? 'Selected for Inquiry' : 'Select Scope'}
                  </a>
                </div>
              );
            })}
          </div>
        </section>

        {/* 4. CONSULTATION & DIRECT INQUIRY */}
        <section id="contact" className="py-16 sm:py-28 border-t border-black/[0.06]">
          <div className="grid lg:grid-cols-12 gap-12 items-start">
            {/* Left Info */}
            <div className="lg:col-span-5 space-y-8">
              <div>
                <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-[#86868b] block mb-2">
                  03 / Contact
                </span>
                <h2 className="font-display text-3xl sm:text-4xl font-semibold tracking-[-0.03em] text-[#1d1d1f]">
                  Initiate a project conversation.
                </h2>
                <p className="text-[15px] text-[#6e6e73] mt-3 leading-relaxed">
                  Share your objectives, timeline, or automation requirements. Inquiries route directly to my personal management workspace.
                </p>
              </div>

              <div className="space-y-4 pt-4 border-t border-black/[0.08] text-sm">
                <div className="flex justify-between py-1">
                  <span className="text-[#86868b]">Direct Email</span>
                  <a href={`mailto:${profile.email}`} className="font-medium text-[#1d1d1f] hover:underline">
                    {profile.email}
                  </a>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-[#86868b]">WhatsApp</span>
                  <a
                    href={`https://wa.me/${profile.phone.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="font-medium text-[#1d1d1f] hover:underline"
                  >
                    Direct Message
                  </a>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-[#86868b]">Location</span>
                  <span className="font-medium text-[#1d1d1f]">{profile.location}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-[#86868b]">Department</span>
                  <span className="font-medium text-[#1d1d1f] text-right max-w-[230px]">
                    Physical Education & Sports Science, RU
                  </span>
                </div>
              </div>

              {/* Clean Text Social Links */}
              <div className="flex flex-wrap items-center gap-5 pt-2 text-xs font-medium text-[#6e6e73]">
                <a href={profile.socials.linkedin} target="_blank" rel="noreferrer" className="hover:text-[#1d1d1f] transition-colors">
                  LinkedIn ↗
                </a>
                <a href={profile.socials.twitter} target="_blank" rel="noreferrer" className="hover:text-[#1d1d1f] transition-colors">
                  X / Twitter ↗
                </a>
                <a href={profile.socials.facebook} target="_blank" rel="noreferrer" className="hover:text-[#1d1d1f] transition-colors">
                  Facebook ↗
                </a>
                <a href={profile.socials.youtube} target="_blank" rel="noreferrer" className="hover:text-[#1d1d1f] transition-colors">
                  YouTube ↗
                </a>
                {profile.socials.github && (
                  <a href={profile.socials.github} target="_blank" rel="noreferrer" className="hover:text-[#1d1d1f] transition-colors">
                    GitHub ↗
                  </a>
                )}
              </div>
            </div>

            {/* Right Clean Form */}
            <div className="lg:col-span-7">
              <form
                onSubmit={handleBookingSubmit}
                className="bg-white rounded-[28px] border border-black/[0.08] p-7 sm:p-10 shadow-[0_12px_40px_rgba(0,0,0,0.03)] space-y-5"
              >
                {bookingSent && (
                  <div className="p-4 rounded-2xl bg-[#f5f5f7] border border-black/10 text-xs font-medium text-[#1d1d1f] flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-[#34c759] shrink-0" />
                    <span>Your message has been delivered. Expect a response shortly.</span>
                  </div>
                )}

                <div>
                  <label className="text-xs font-medium text-[#1d1d1f] block mb-2">
                    Engagement Scope
                  </label>
                  <input
                    type="text"
                    value={selectedService}
                    onChange={(e) => setSelectedService(e.target.value)}
                    className="w-full px-4 py-3.5 rounded-2xl bg-[#f5f5f7] border border-transparent focus:border-[#1d1d1f] focus:bg-white text-sm text-[#1d1d1f] outline-none transition-all"
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-[#1d1d1f] block mb-2">
                      Your Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Full name"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      className="w-full px-4 py-3.5 rounded-2xl bg-[#f5f5f7] border border-transparent focus:border-[#1d1d1f] focus:bg-white text-sm text-[#1d1d1f] placeholder-[#86868b] outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-[#1d1d1f] block mb-2">
                      Email or Phone
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="you@company.com"
                      value={clientEmail}
                      onChange={(e) => setClientEmail(e.target.value)}
                      className="w-full px-4 py-3.5 rounded-2xl bg-[#f5f5f7] border border-transparent focus:border-[#1d1d1f] focus:bg-white text-sm text-[#1d1d1f] placeholder-[#86868b] outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-[#1d1d1f] block mb-2">
                    Target Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={meetingDate}
                    onChange={(e) => setMeetingDate(e.target.value)}
                    className="w-full px-4 py-3.5 rounded-2xl bg-[#f5f5f7] border border-transparent focus:border-[#1d1d1f] focus:bg-white text-sm text-[#1d1d1f] outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-[#1d1d1f] block mb-2">
                    Project Brief
                  </label>
                  <textarea
                    rows="4"
                    placeholder="Outline your objectives, timeline, or key deliverables..."
                    value={projectNote}
                    onChange={(e) => setProjectNote(e.target.value)}
                    className="w-full px-4 py-3.5 rounded-2xl bg-[#f5f5f7] border border-transparent focus:border-[#1d1d1f] focus:bg-white text-sm text-[#1d1d1f] placeholder-[#86868b] outline-none transition-all resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-4 rounded-full bg-[#1d1d1f] hover:bg-black text-white font-medium text-sm transition-all active:scale-[0.99]"
                >
                  Send Inquiry
                </button>
              </form>
            </div>
          </div>
        </section>
      </main>

      {/* QUIET ARCHITECTURAL FOOTER */}
      <footer className="border-t border-black/[0.08] py-10 bg-[#fbfbfd]">
        <div className="max-w-[1200px] mx-auto px-5 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#86868b]">
          <p>
            © {new Date().getFullYear()} {profile.name} ({profile.bnName}). All rights reserved.
          </p>

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={downloadVCard}
              className="hover:text-[#1d1d1f] transition-colors"
            >
              vCard
            </button>

            <button
              type="button"
              onClick={() => setShowPinModal(true)}
              className="inline-flex items-center gap-1 hover:text-[#1d1d1f] transition-colors"
            >
              <Lock className="w-3 h-3" />
              <span>Private OS</span>
            </button>

            {/* Discreet bottom-corner APK link exclusively for owner */}
            <a
              href="/kmmahim-life-os.apk"
              download="kmmahim-life-os.apk"
              title="Owner Mobile App"
              className="text-[#aeaeb2] hover:text-[#1d1d1f] transition-colors"
            >
              <Smartphone className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
