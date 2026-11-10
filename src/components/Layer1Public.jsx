import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOS } from '../context/OSContext';
import { TiltCard, AnimatedCounter, CircularHeroRadar } from './common/MotionKit';
import ParticleCanvas from './common/ParticleCanvas';
import { BorderBeam } from './common/BorderBeam';
import AppDownloadModal, { FloatingDownloadPill } from './common/AppDownloadModal';
import CommandPalette from './common/CommandPalette';
import { SoundFX } from './common/SoundEffects';
import {
  Sparkles, Code2, Cpu, Globe, ArrowUpRight, CheckCircle2,
  Send, Calendar, Download, Shield, Layers, Terminal, Phone,
  Mail, MapPin, Facebook, Linkedin, Twitter, Youtube, Lock,
  TrendingUp, Award, Zap, Volume2, VolumeX, Search, Palette,
  MessageCircle, ExternalLink, Check, Server, Star
} from 'lucide-react';

export default function Layer1Public() {
  const { data, setShowPinModal, isAuthenticated, setActiveLayer, sendClientMessage, syncStatus } = useOS();
  const { profile, projects, services } = data;

  // Secret 3-click detector on Logo
  const clickCountRef = useRef(0);
  const clickTimerRef = useRef(null);

  const handleSecretLogoClick = () => {
    clickCountRef.current += 1;
    if (clickTimerRef.current) clearTimeout(clickTimerRef.current);

    if (clickCountRef.current >= 3) {
      clickCountRef.current = 0;
      SoundFX.success();
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

  // Service Booking State
  const [selectedService, setSelectedService] = useState(services[0]?.title || '');
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [meetingDate, setMeetingDate] = useState('');
  const [projectNote, setProjectNote] = useState('');
  const [bookingSent, setBookingSent] = useState(false);
  const [projectFilter, setProjectFilter] = useState('All'); // 'All' | 'Brands' | 'AI' | 'Web'

  const handleBookingSubmit = (e) => {
    e.preventDefault();
    if (!clientName || !clientEmail) return;
    SoundFX.success();
    sendClientMessage({
      sender: clientName,
      email: clientEmail,
      service: selectedService,
      meetingDate: meetingDate || 'Flexible',
      text: projectNote || 'Interested in booking this service.'
    });
    setBookingSent(true);
    setClientName('');
    setClientEmail('');
    setProjectNote('');
    setTimeout(() => setBookingSent(false), 5000);
  };

  // Download vCard (.vcf)
  const downloadVCard = () => {
    SoundFX.laser();
    const vcard = `BEGIN:VCARD
VERSION:3.0
FN:${profile.name}
TITLE:${profile.tagline}
TEL;TYPE=CELL:${profile.phone}
EMAIL:${profile.email}
NOTE:${profile.department} - Entrepreneur, AI Builder & Web Architect
URL:https://kmmahim-site.vercel.app
END:VCARD`;
    const blob = new Blob([vcard], { type: 'text/vcard' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${profile.name.replace(/\s+/g, '_')}_Contact.vcf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // State for Approved 10 Recommendations & App Download Modal
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
  const [theme, setTheme] = useState('midnight'); // 'midnight' | 'oled' | 'matrix'

  useEffect(() => {
    const handlePaletteTrigger = () => setShowCommandPalette(true);
    window.addEventListener('open-command-palette', handlePaletteTrigger);
    return () => window.removeEventListener('open-command-palette', handlePaletteTrigger);
  }, []);

  const cycleTheme = () => {
    SoundFX.laser();
    setTheme((prev) => {
      if (prev === 'midnight') return 'oled';
      if (prev === 'oled') return 'matrix';
      return 'midnight';
    });
  };

  const toggleSound = () => {
    const next = SoundFX.toggleSound();
    setSoundOn(next);
  };

  const themeClasses = {
    midnight: 'bg-[#05070e] text-slate-100',
    oled: 'bg-[#000000] text-zinc-100',
    matrix: 'bg-[#030d06] text-emerald-100'
  }[theme];

  return (
    <div className={`min-h-screen ${themeClasses} selection:bg-indigo-500 selection:text-white relative transition-colors duration-500 overflow-x-hidden`}>
      {/* Precision Background Grid & Radial Spotlight */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[550px] bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.18),transparent_70%)] blur-2xl" />
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
      </div>

      {/* 1. Interactive Cyberpunk Particle Matrix */}
      <ParticleCanvas />

      {/* App Download Modal */}
      <AppDownloadModal
        isOpen={showDownloadModal}
        onClose={() => setShowDownloadModal(false)}
      />

      {/* Floating Download Mobile Pill */}
      <FloatingDownloadPill onClick={() => setShowDownloadModal(true)} />

      {/* 3. Command Palette Modal (Ctrl + K) */}
      <CommandPalette
        isOpen={showCommandPalette}
        onClose={() => setShowCommandPalette(false)}
        onOpenLifeOS={() => {
          if (isAuthenticated) setActiveLayer('private');
          else setShowPinModal(true);
        }}
        onOpenDownload={() => setShowDownloadModal(true)}
        onToggleSound={toggleSound}
        soundOn={soundOn}
      />

      {/* Top Navbar */}
      <header className="sticky top-0 z-40 backdrop-blur-2xl bg-slate-950/80 border-b border-slate-800/80 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          {/* Logo & Identity */}
          <div
            onClick={handleSecretLogoClick}
            title="Triple-click to unlock Private Life OS"
            className="flex items-center gap-3 cursor-pointer select-none group shrink-0"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-500 flex items-center justify-center font-black text-sm text-white shadow-lg shadow-indigo-600/30 group-hover:scale-105 group-active:scale-95 transition">
              KM
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold tracking-tight text-white leading-none text-sm sm:text-base">
                  {profile.name}
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <span className="text-[11px] text-cyan-400 font-medium font-mono">
                {profile.bnName} • Executive OS
              </span>
            </div>
          </div>

          {/* Live Telemetry Capsule */}
          <div className="hidden lg:flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-slate-800/80 text-[11px] text-slate-300 font-mono shadow-inner">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span>Rajshahi 27°C</span>
            <span className="text-slate-600">•</span>
            <span className="text-cyan-400">18ms Latency</span>
            <span className="text-slate-600">•</span>
            <span className="text-emerald-400">AI Mesh Active</span>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-300">
            <a href="#projects" className="hover:text-white transition">Ventures</a>
            <a href="#services" className="hover:text-white transition">Packages</a>
            <a href="#booking" className="hover:text-white transition">Book Sprint</a>
            <button
              onClick={() => {
                SoundFX.click();
                setShowCommandPalette(true);
              }}
              className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-[11px] text-slate-400 flex items-center gap-1.5 transition cursor-pointer"
            >
              <Search className="w-3 h-3 text-cyan-400" />
              <span>⌘K / Ctrl+K</span>
            </button>
          </nav>

          {/* Header Action Controls */}
          <div className="flex items-center gap-2">
            {/* Theme Switcher Button */}
            <button
              onClick={cycleTheme}
              title={`Switch Theme (${theme.toUpperCase()})`}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-cyan-400 transition cursor-pointer active:scale-95"
            >
              <Palette className="w-4 h-4" />
            </button>

            {/* Sound FX Toggle */}
            <button
              onClick={toggleSound}
              title={soundOn ? 'Mute Sound FX' : 'Enable Sound FX'}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-indigo-400 transition cursor-pointer active:scale-95"
            >
              {soundOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
            </button>

            {/* Download App Button */}
            <button
              onClick={() => {
                SoundFX.laser();
                setShowDownloadModal(true);
              }}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-950/40 transition cursor-pointer active:scale-95"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Download App</span>
              <span className="sm:hidden">App</span>
            </button>

            {/* Private Life OS Link if Unlocked */}
            {isAuthenticated && (
              <button
                onClick={() => {
                  SoundFX.click();
                  setActiveLayer('private');
                }}
                className="px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold flex items-center gap-1.5 text-white transition active:scale-95 cursor-pointer"
              >
                <Terminal className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Life OS</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-10 sm:pt-16 pb-24 relative z-10 space-y-24">
        {/* Split Hero */}
        <div>
          {/* Live "NOW" Status Bar */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-slate-900/90 border border-indigo-500/40 text-xs text-indigo-200 mb-8 shadow-xl shadow-indigo-950/40 backdrop-blur-xl"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="font-bold text-cyan-300 uppercase tracking-wider text-[10px] font-mono">NOW STATUS:</span>
            <span className="font-medium text-slate-200 text-xs">{profile.nowStatus}</span>
          </motion.div>

          <div className="grid lg:grid-cols-12 gap-10 items-center">
            {/* Left Column: Bold Editorial Copy */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="lg:col-span-8 space-y-6"
            >
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.08] text-white">
                Building Brands,{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-cyan-300 to-emerald-400">
                  Web Systems & AI Agents
                </span>{' '}
                That Scale.
              </h1>

              <p className="text-slate-300 text-base sm:text-lg max-w-2xl leading-relaxed">
                Hi, I’m <strong className="text-white">{profile.name} ({profile.bnName})</strong> — {profile.tagline}. 
                Synthesizing athletic discipline ({profile.department}) with rapid commercial execution, DTC brand supply chains, and autonomous multi-agent AI engineering.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <motion.a
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  href="#booking"
                  onClick={() => SoundFX.click()}
                  className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-xl shadow-indigo-600/30 transition cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Book Project / Sprint</span>
                  <span className="text-[10px] opacity-80 font-mono">(৳ / $)</span>
                </motion.a>

                <motion.a
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  href="#projects"
                  onClick={() => SoundFX.click()}
                  className="px-6 py-3.5 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-slate-200 font-bold text-xs sm:text-sm flex items-center gap-2 transition cursor-pointer"
                >
                  <Layers className="w-4 h-4 text-cyan-400" />
                  <span>Explore Ventures</span>
                </motion.a>

                <button
                  onClick={downloadVCard}
                  className="px-4 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white font-semibold text-xs flex items-center gap-2 transition cursor-pointer"
                  title="Download KM Mahim Contact Card"
                >
                  <Download className="w-4 h-4 text-emerald-400" />
                  <span>Save vCard</span>
                </button>
              </div>

              {/* Trust & Stack Badges */}
              <div className="pt-3 flex flex-wrap items-center gap-4 text-xs text-slate-400 font-mono">
                <span className="flex items-center gap-1.5 text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Verified Founder
                </span>
                <span>•</span>
                <span className="text-cyan-300">Rajshahi University Sports Science</span>
                <span>•</span>
                <span className="text-indigo-300">OpenClaw + Grok + Hermes Core</span>
              </div>
            </motion.div>

            {/* Right Column: Executive Holographic Radar & Identity Card */}
            <div className="lg:col-span-4 space-y-4">
              <CircularHeroRadar
                profile={profile}
                onSecretClick={handleSecretLogoClick}
              />

              <TiltCard className="rounded-3xl bg-slate-900/90 backdrop-blur-2xl border border-slate-800 p-6 space-y-4 shadow-2xl shadow-indigo-950/40 relative overflow-hidden">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <span className="text-[10px] text-cyan-400 font-mono uppercase tracking-wider block">
                      Executive Profile
                    </span>
                    <h3 className="text-base font-bold text-white flex items-center gap-1.5">
                      <span>{profile.name}</span>
                      <span className="px-1.5 py-0.5 rounded text-[9px] bg-indigo-500/20 text-indigo-300 font-mono">
                        v4.2
                      </span>
                    </h3>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-mono flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Available
                  </span>
                </div>

                <div className="space-y-2 text-xs text-slate-300">
                  <div className="flex items-start gap-2.5">
                    <Globe className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                    <span>{profile.department}</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <MapPin className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span>{profile.location}</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Server className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Cloud: Supabase Synced</span>
                  </div>
                </div>

                {/* Tech Chips */}
                <div className="pt-2 border-t border-slate-800 flex flex-wrap gap-1.5">
                  {['OpenClaw', 'Grok 3', 'Hermes AI', 'Supabase', 'React 18', 'Capacitor'].map((tech) => (
                    <span
                      key={tech}
                      className="px-2 py-0.5 rounded-md bg-slate-950/80 border border-slate-800 text-[10px] font-mono text-slate-300"
                    >
                      {tech}
                    </span>
                  ))}
                </div>

                {/* Social Links Row */}
                <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-xs text-slate-400">Socials:</span>
                  <div className="flex items-center gap-2">
                    <a
                      href={profile.socials.facebook}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 rounded-xl bg-slate-800/80 hover:bg-indigo-600 text-slate-300 hover:text-white transition"
                    >
                      <Facebook className="w-3.5 h-3.5" />
                    </a>
                    <a
                      href={profile.socials.linkedin}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 rounded-xl bg-slate-800/80 hover:bg-indigo-600 text-slate-300 hover:text-white transition"
                    >
                      <Linkedin className="w-3.5 h-3.5" />
                    </a>
                    <a
                      href={profile.socials.twitter}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 rounded-xl bg-slate-800/80 hover:bg-indigo-600 text-slate-300 hover:text-white transition"
                    >
                      <Twitter className="w-3.5 h-3.5" />
                    </a>
                    <a
                      href={profile.socials.youtube}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 rounded-xl bg-slate-800/80 hover:bg-rose-600 text-slate-300 hover:text-white transition"
                    >
                      <Youtube className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </TiltCard>
            </div>
          </div>
        </div>

        {/* 4-Column Glowing KPI Metrics Bar */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 p-4 rounded-3xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-2xl shadow-2xl"
        >
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/70 flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-white font-mono">
                <AnimatedCounter value={3} />
              </div>
              <p className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Scaled Ventures</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/70 flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-white font-mono">
                <AnimatedCounter value={14} suffix="+" />
              </div>
              <p className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Web & AI Systems</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/70 flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-white font-mono">
                <AnimatedCounter value={4} />
              </div>
              <p className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">AI Agent Nodes</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/70 flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-white font-mono">
                <AnimatedCounter value={3} suffix="×" />
              </div>
              <p className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">PWA Offline Speed</p>
            </div>
          </div>
        </motion.div>

        {/* Bento Grid Showcase of Ventures */}
        <section id="projects" className="space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-800 pb-5">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-cyan-400 font-mono block">
                Portfolio & Scaled Ventures
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">
                What I’ve Built & Operated
              </h2>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
              {['All', 'Brand & Retail', 'AI & OS', 'Web Systems'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => {
                    SoundFX.click();
                    setProjectFilter(tab);
                  }}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition ${
                    projectFilter === tab
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/40'
                      : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Bento 1: JACKFRU Apparel (Flagship 8-col card) with Rotating BorderBeam */}
            {(projectFilter === 'All' || projectFilter === 'Brand & Retail') && (
              <TiltCard
                maxTilt={6}
                className="md:col-span-8 rounded-3xl bg-slate-900/90 border border-indigo-500/40 p-7 shadow-2xl relative overflow-hidden flex flex-col justify-between"
              >
                <BorderBeam size={300} duration={9} colorFrom="#6366f1" colorTo="#06b6d4" />
                <div className="relative z-10">
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <span className="px-3 py-1 rounded-lg text-xs font-bold bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 uppercase tracking-wider font-mono">
                      Global Brand & Physical Retail
                    </span>
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                      Founder
                    </span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    JACKFRU Apparel
                  </h3>
                  <p className="text-sm text-slate-300 mt-3 leading-relaxed max-w-xl">
                    Founded and scaled an apparel brand engineered for physical retail store distribution across Australia and local markets. Designed custom supply chains, retail packaging, and high-conversion commercial merchandising.
                  </p>
                </div>

                <div className="relative z-10 mt-8 pt-5 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-4 text-xs font-mono">
                    <span className="text-cyan-400">🇦🇺 Australia Retail Ready</span>
                    <span className="text-emerald-400">● Supply Chain Active</span>
                  </div>
                  <a
                    href="#booking"
                    onClick={() => SoundFX.click()}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white flex items-center gap-1.5 transition"
                  >
                    <span>Brand Architecture</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </TiltCard>
            )}

            {/* Bento 2: Autonomous AI Life OS (4-col card) */}
            {(projectFilter === 'All' || projectFilter === 'AI & OS') && (
              <TiltCard
                maxTilt={8}
                className="md:col-span-4 rounded-3xl bg-slate-900/80 border border-slate-800 p-6 shadow-xl flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                      AI & Full-Stack OS
                    </span>
                    <span className="text-[10px] text-emerald-400 font-mono">Synced</span>
                  </div>
                  <h3 className="text-lg font-bold text-white">Autonomous AI Agent Hub</h3>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                    Dual-layer command system orchestrating OpenClaw, Grok, and Hermes agents for autonomous social posting and task management.
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800 text-xs flex items-center justify-between">
                  <span className="text-[11px] text-indigo-400 font-mono">4 Active Nodes</span>
                  <button
                    onClick={() => {
                      SoundFX.click();
                      if (isAuthenticated) setActiveLayer('private');
                      else setShowPinModal(true);
                    }}
                    className="text-xs font-semibold text-cyan-300 hover:text-white flex items-center gap-1 cursor-pointer"
                  >
                    <span>Open OS</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </TiltCard>
            )}

            {/* Bento 3: High-Conversion Web Platforms (6-col card) */}
            {(projectFilter === 'All' || projectFilter === 'Web Systems') && (
              <TiltCard
                maxTilt={8}
                className="md:col-span-6 rounded-3xl bg-slate-900/80 border border-slate-800 p-6 shadow-xl flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                      Web & Conversion
                    </span>
                    <span className="text-[10px] text-cyan-400 font-mono">99.9% Uptime</span>
                  </div>
                  <h3 className="text-lg font-bold text-white">High-Conversion Web Platforms</h3>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                    Tailored web architectures built for clinics, e-commerce, and agencies with AI automated booking workflows.
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800 text-xs flex items-center justify-between">
                  <span className="text-emerald-400 font-medium">Fast UI • SEO Ready</span>
                  <a href="#services" onClick={() => SoundFX.click()} className="text-slate-300 hover:text-white font-semibold flex items-center gap-1">
                    <span>View Packages</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </TiltCard>
            )}

            {/* Bento 4: Athletic Discipline (6-col card) */}
            {(projectFilter === 'All') && (
              <TiltCard
                maxTilt={8}
                className="md:col-span-6 rounded-3xl bg-slate-900/80 border border-slate-800 p-6 shadow-xl flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-purple-500/10 text-purple-300 border border-purple-500/20">
                      Athletics & Science
                    </span>
                    <span className="text-[10px] text-purple-400 font-mono">RU Alumni</span>
                  </div>
                  <h3 className="text-lg font-bold text-white">Athletic Mindset × Tech Execution</h3>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                    Dept. of Physical Education & Sports Science, Rajshahi University. Bringing rigorous athletic conditioning, daily discipline, and peak stamina into building technology ventures.
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800 text-xs flex items-center justify-between">
                  <span className="text-purple-400 font-medium">Daily Gym & Namaz Discipline</span>
                  <span className="text-slate-500 font-mono text-[10px]">RU Campus</span>
                </div>
              </TiltCard>
            )}

            {/* Dynamic Custom Projects from CMS */}
            {projects?.slice(3).map((proj) => (
              <TiltCard
                key={proj.id}
                maxTilt={8}
                className="md:col-span-6 rounded-3xl bg-slate-900/80 border border-slate-800 p-6 shadow-xl flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                      {proj.category}
                    </span>
                    <span className="text-[10px] text-emerald-400 font-mono">{proj.badge || 'Live'}</span>
                  </div>
                  <h3 className="text-lg font-bold text-white">{proj.title}</h3>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">{proj.description}</p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800 text-xs flex items-center justify-between">
                  <span className="text-slate-300 font-mono">{proj.metrics}</span>
                  <a href="#booking" onClick={() => SoundFX.click()} className="text-cyan-400 font-semibold flex items-center gap-1">
                    <span>Discuss Project</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </TiltCard>
            ))}
          </div>
        </section>

        {/* Services & Instant Project Booking Console */}
        <section id="services" className="space-y-8">
          <div className="border-b border-slate-800 pb-5">
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-400 font-mono block">
              Services & Packages
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">
              Select Your Solution Package
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Click any package to auto-fill the instant booking terminal below.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {services.map((srv) => {
              const isSelected = selectedService === srv.title;
              return (
                <motion.div
                  key={srv.id}
                  whileHover={{ y: -4 }}
                  onClick={() => {
                    SoundFX.click();
                    setSelectedService(srv.title);
                  }}
                  className={`p-6 rounded-3xl border transition cursor-pointer relative flex flex-col justify-between ${
                    isSelected
                      ? 'bg-gradient-to-b from-indigo-950/60 to-slate-900 border-indigo-500 shadow-2xl shadow-indigo-600/20'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {isSelected && (
                    <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                  )}

                  <div className="space-y-3">
                    <span className="text-[10px] uppercase font-mono tracking-wider px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-cyan-400">
                      {srv.category}
                    </span>
                    <h3 className="text-lg font-bold text-white">{srv.title}</h3>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-black text-emerald-400">
                        ৳{srv.price.toLocaleString()}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">/ {srv.delivery}</span>
                    </div>

                    <div className="space-y-2 pt-3 border-t border-slate-800/80">
                      {srv.features.map((f, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs text-slate-300">
                          <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                          <span>{f}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    type="button"
                    className={`mt-6 w-full py-2.5 rounded-xl font-bold text-xs transition ${
                      isSelected
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                    }`}
                  >
                    {isSelected ? '✓ Selected' : 'Choose Package'}
                  </button>
                </motion.div>
              );
            })}
          </div>

          {/* Interactive Booking Terminal */}
          <div id="booking" className="p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-xl font-black text-white flex items-center gap-2">
                  <span>Instant Project Booking & Request Terminal</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Submissions route directly to KM Mahim's Life OS & Broker Agent for immediate triage.
                </p>
              </div>

              {/* Quick WhatsApp Alternative */}
              <a
                href={`https://wa.me/8801700000000?text=Hi%20Mahim,%20I%20am%20interested%20in%20${encodeURIComponent(selectedService)}`}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 rounded-xl bg-emerald-600/20 border border-emerald-500/40 hover:bg-emerald-600/30 text-emerald-300 text-xs font-bold flex items-center gap-2 transition"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Quick WhatsApp Chat</span>
              </a>
            </div>

            {bookingSent && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-200 text-xs font-semibold flex items-center gap-3"
              >
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>
                  Thank you! Your booking for <strong>"{selectedService}"</strong> was routed to KM Mahim’s OS Inbox. Expect a reply within 2 hours.
                </span>
              </motion.div>
            )}

            <form onSubmit={handleBookingSubmit} className="space-y-4">
              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-[11px] font-mono uppercase text-slate-400 block mb-1">
                    Selected Package
                  </label>
                  <input
                    type="text"
                    value={selectedService}
                    onChange={(e) => setSelectedService(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-indigo-300 font-semibold focus:border-indigo-500 outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-mono uppercase text-slate-400 block mb-1">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. John Doe / Shakib"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-indigo-500 outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-mono uppercase text-slate-400 block mb-1">
                    Email or WhatsApp *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="contact@company.com"
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-indigo-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-mono uppercase text-slate-400 block mb-1">
                  Project Scope or Specific Requirements
                </label>
                <textarea
                  rows="3"
                  placeholder="Describe your goals, timeline, and any tech stack preferences..."
                  value={projectNote}
                  onChange={(e) => setProjectNote(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-indigo-500 outline-none"
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                <span className="text-[11px] text-slate-400 font-mono">
                  ⚡ End-to-end encrypted • Synced with Private Life OS
                </span>

                <button
                  type="submit"
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition active:scale-95"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Instant Request</span>
                </button>
              </div>
            </form>
          </div>
        </section>
      </main>

      {/* Obsidian Executive Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/90 py-10 text-xs text-slate-500 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-slate-300 font-bold mb-1">
              <span>{profile.name} ({profile.bnName})</span>
              <span className="text-[10px] text-emerald-400 font-mono font-normal">
                ● Telemetry Nominal
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              {profile.tagline} • Rajshahi University
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={downloadVCard}
              className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-[11px] transition"
            >
              Download vCard
            </button>

            <button
              onClick={() => {
                SoundFX.click();
                setShowPinModal(true);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 text-[11px] transition"
            >
              <Lock className="w-3 h-3" />
              <span>Private OS Access</span>
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
