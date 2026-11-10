import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
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
  TrendingUp, Award, Zap, Volume2, VolumeX, Search, Palette
} from 'lucide-react';

export default function Layer1Public() {
  const { data, setShowPinModal, isAuthenticated, setActiveLayer, sendClientMessage } = useOS();
  const { profile, projects, services } = data;

  // Secret 3-click detector on Logo
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

  // Service Booking State
  const [selectedService, setSelectedService] = useState(services[0]?.title || '');
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [meetingDate, setMeetingDate] = useState('');
  const [projectNote, setProjectNote] = useState('');
  const [bookingSent, setBookingSent] = useState(false);

  const handleBookingSubmit = (e) => {
    e.preventDefault();
    if (!clientName || !clientEmail) return;
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
    setTimeout(() => setBookingSent(false), 4000);
  };

  // Download vCard (.vcf)
  const downloadVCard = () => {
    const vcard = `BEGIN:VCARD
VERSION:3.0
FN:${profile.name}
TITLE:${profile.tagline}
TEL;TYPE=CELL:${profile.phone}
EMAIL:${profile.email}
NOTE:${profile.department}
END:VCARD`;
    const blob = new Blob([vcard], { type: 'text/vcard' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${profile.name.replace(/\s+/g, '_')}_Contact.vcf`;
    a.click();
    SoundFX.click();
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
    midnight: 'bg-slate-950 text-slate-100',
    oled: 'bg-[#000000] text-zinc-100',
    matrix: 'bg-[#030d06] text-emerald-100'
  }[theme];

  return (
    <div className={`min-h-screen ${themeClasses} selection:bg-indigo-500 selection:text-white relative transition-colors duration-500`}>
      {/* 1. Interactive Cyberpunk Particle Matrix (Recommendation #1) */}
      <ParticleCanvas />

      {/* App Download Modal (Fix for 'app akare download hosse na') */}
      <AppDownloadModal
        isOpen={showDownloadModal}
        onClose={() => setShowDownloadModal(false)}
      />

      {/* Floating Download Mobile Pill (Always 1-Tap accessible on phones) */}
      <FloatingDownloadPill onClick={() => setShowDownloadModal(true)} />

      {/* 3. Command Palette Modal (Recommendation #3: Ctrl + K) */}
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

      {/* Ambient Glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-cyan-500/15 rounded-full blur-3xl" />
      </div>

      {/* Navbar with Telemetry, Sound FX, Theme Switcher & Download App */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-slate-950/80 border-b border-slate-800/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-2">
          <div
            onClick={handleSecretLogoClick}
            title="Triple-click for Command OS"
            className="flex items-center gap-3 cursor-pointer select-none group shrink-0"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center font-black text-lg text-white shadow-lg shadow-indigo-500/25 group-active:scale-95 transition">
              KM
            </div>
            <div>
              <span className="font-bold tracking-tight text-white block leading-none">
                {profile.name}
              </span>
              <span className="text-[11px] text-cyan-400 font-medium">
                {profile.bnName}
              </span>
            </div>
          </div>

          {/* 7. Live Telemetry Capsule (Recommendation #7) */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/80 border border-slate-800 text-[11px] text-slate-300 font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Rajshahi 27°C</span>
            <span className="text-slate-600">•</span>
            <span className="text-cyan-400">18ms Latency</span>
            <span className="text-slate-600">•</span>
            <span className="text-indigo-400">AI Broker: Nominal</span>
          </div>

          <nav className="hidden md:flex items-center gap-5 text-sm text-slate-300">
            <a href="#projects" className="hover:text-white transition">Projects</a>
            <a href="#services" className="hover:text-white transition">Services</a>
            <button
              onClick={() => {
                SoundFX.click();
                setShowCommandPalette(true);
              }}
              className="px-2 py-1 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs text-slate-400 flex items-center gap-1.5 transition cursor-pointer"
            >
              <Search className="w-3 h-3 text-cyan-400" />
              <span>Ctrl + K</span>
            </button>
          </nav>

          <div className="flex items-center gap-2">
            {/* 10. Theme Switcher Button (Recommendation #10) */}
            <button
              onClick={cycleTheme}
              title={`Switch Theme (Current: ${theme.toUpperCase()})`}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-cyan-400 text-xs transition cursor-pointer"
            >
              <Palette className="w-3.5 h-3.5" />
            </button>

            {/* 5. Sound FX Toggle (Recommendation #5) */}
            <button
              onClick={toggleSound}
              title={soundOn ? 'Mute Sound FX' : 'Enable Sound FX'}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-indigo-400 text-xs transition cursor-pointer"
            >
              {soundOn ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5 text-slate-500" />}
            </button>

            {/* DOWNLOAD APP BUTTON (Prominently placed for 1-Tap APK/PWA) */}
            <button
              onClick={() => {
                SoundFX.laser();
                setShowDownloadModal(true);
              }}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-950/40 transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Download App</span>
              <span className="sm:hidden">App</span>
            </button>

            {isAuthenticated && (
              <button
                onClick={() => {
                  SoundFX.click();
                  setActiveLayer('private');
                }}
                className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
              >
                <Terminal className="w-3.5 h-3.5"/>
                <span className="hidden sm:inline">Life OS</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-12 pb-24 relative z-10">
        {/* Live "NOW" Bar */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-indigo-950/70 border border-indigo-500/40 text-xs text-indigo-200 mb-8 shadow-lg shadow-indigo-950/50 backdrop-blur-md"
        >
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span className="font-bold text-cyan-300 uppercase tracking-wider text-[11px]">NOW:</span>
          <span className="font-medium text-slate-200">{profile.nowStatus}</span>
        </motion.div>

        <div className="grid lg:grid-cols-12 gap-10 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="lg:col-span-8 space-y-6"
          >
            <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-[1.1]">
              Building Brands,{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-cyan-300 to-emerald-400">
                Web Systems & AI Agents
              </span>{' '}
              That Scale.
            </h1>

            <p className="text-slate-300 text-base sm:text-lg max-w-2xl leading-relaxed">
              Hi, I’m <strong className="text-white">{profile.name} ({profile.bnName})</strong> — {profile.tagline}. 
              Combining athletic discipline ({profile.department}) with rapid digital execution, apparel brand building, and autonomous AI workflows.
            </p>

            <div className="flex flex-wrap gap-3 pt-2">
              <motion.a
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                href="#services"
                className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-semibold text-sm flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition cursor-pointer"
              >
                <Sparkles className="w-4 h-4"/>
                <span>Book a Service / Project</span>
              </motion.a>
              <motion.a
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                href="#projects"
                className="px-6 py-3.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-slate-200 font-semibold text-sm flex items-center gap-2 transition cursor-pointer"
              >
                <Layers className="w-4 h-4 text-cyan-400"/>
                <span>Explore My Work</span>
              </motion.a>
            </div>
          </motion.div>

          {/* Identity Quick Card with 3D Tilt & Circular Radar Centerpiece (A1 + A3) */}
          <div className="lg:col-span-4 space-y-4">
            <CircularHeroRadar
              profile={profile}
              onSecretClick={handleSecretLogoClick}
            />

            <TiltCard className="rounded-2xl bg-slate-900/80 backdrop-blur-xl border border-slate-800 p-5 space-y-3.5 shadow-2xl shadow-indigo-950/40">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <p className="text-[11px] text-slate-400">Core Identity</p>
                  <h3 className="text-base font-bold text-white">{profile.name}</h3>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                  ● Available
                </span>
              </div>

              <div className="space-y-2 text-xs text-slate-300">
                <div className="flex items-start gap-2.5">
                  <Globe className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5"/>
                  <span>{profile.department}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <MapPin className="w-4 h-4 text-cyan-400 shrink-0"/>
                  <span>{profile.location}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Cpu className="w-4 h-4 text-emerald-400 shrink-0"/>
                  <span>AI Stack: OpenClaw • Grok • Hermes</span>
                </div>
              </div>

              <div id="links" className="pt-2.5 border-t border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-400">Socials:</span>
                <div className="flex items-center gap-2">
                  <a href={profile.socials.facebook} target="_blank" rel="noreferrer" className="p-2 rounded-lg bg-slate-800 hover:bg-indigo-600 transition">
                    <Facebook className="w-3.5 h-3.5"/>
                  </a>
                  <a href={profile.socials.linkedin} target="_blank" rel="noreferrer" className="p-2 rounded-lg bg-slate-800 hover:bg-indigo-600 transition">
                    <Linkedin className="w-3.5 h-3.5"/>
                  </a>
                  <a href={profile.socials.twitter} target="_blank" rel="noreferrer" className="p-2 rounded-lg bg-slate-800 hover:bg-indigo-600 transition">
                    <Twitter className="w-3.5 h-3.5"/>
                  </a>
                  <a href={profile.socials.youtube} target="_blank" rel="noreferrer" className="p-2 rounded-lg bg-slate-800 hover:bg-red-600 transition">
                    <Youtube className="w-3.5 h-3.5"/>
                  </a>
                </div>
              </div>
            </TiltCard>
          </div>
        </div>

        {/* Dynamic Metric Counter Strip (Ultra Motion) */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-900/40 border border-slate-800/80 backdrop-blur-md"
        >
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/60 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Award className="w-5 h-5"/>
            </div>
            <div>
              <div className="text-2xl font-black text-white">
                <AnimatedCounter value={3} />
              </div>
              <p className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Scaled Ventures</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/60 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Code2 className="w-5 h-5"/>
            </div>
            <div>
              <div className="text-2xl font-black text-white">
                <AnimatedCounter value={14} suffix="+" />
              </div>
              <p className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Web & AI Systems</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/60 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Cpu className="w-5 h-5"/>
            </div>
            <div>
              <div className="text-2xl font-black text-white">
                <AnimatedCounter value={4} />
              </div>
              <p className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">AI Agent Nodes</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/60 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Zap className="w-5 h-5"/>
            </div>
            <div>
              <div className="text-2xl font-black text-white">
                <AnimatedCounter value={3} suffix="×" />
              </div>
              <p className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">PWA Offline Speed</p>
            </div>
          </div>
        </motion.div>

        {/* Projects & Ventures 3D Bento Grid (Recommendation #6 + #2 BorderBeam) */}
        <section id="projects" className="mt-24">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-cyan-400">Portfolio & Scaled Ventures</p>
              <h2 className="text-2xl sm:text-3xl font-bold mt-1">What I’ve Built & Operated</h2>
            </div>
            <p className="text-xs text-slate-400">Interactive 3D Bento Architecture • Synced with Life OS</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Bento 1: JACKFRU Apparel (Flagship Hero - 8 columns) with Laser Border Beam */}
            <TiltCard
              maxTilt={7}
              className="md:col-span-8 rounded-3xl bg-gradient-to-br from-slate-900/90 via-indigo-950/40 to-slate-900/90 border border-indigo-500/40 p-7 shadow-2xl relative overflow-hidden flex flex-col justify-between"
            >
              <BorderBeam size={260} duration={9} colorFrom="#6366f1" colorTo="#06b6d4" />
              <div>
                <div className="flex items-center justify-between gap-3 mb-4">
                  <span className="px-3 py-1 rounded-lg text-xs font-bold bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 uppercase tracking-wider">
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

              <div className="mt-8 pt-5 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4 text-xs font-mono">
                  <span className="text-cyan-400">🇦🇺 Australia Retail Ready</span>
                  <span className="text-emerald-400">● Supply Chain Active</span>
                </div>
                <a
                  href="#services"
                  onClick={() => SoundFX.click()}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white flex items-center gap-1.5 transition"
                >
                  <span>Brand Architecture</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </TiltCard>

            {/* Bento 2: Autonomous AI Life OS (4 columns) */}
            <TiltCard
              maxTilt={10}
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

            {/* Bento 3: High-Conversion Business Platforms (6 columns) */}
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

            {/* Bento 4: Athletic Discipline × Sports Science (6 columns) */}
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
          </div>
        </section>

        {/* Services & Interactive Booking */}
        <section id="services" className="mt-24 grid lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 space-y-4">
            <p className="text-xs font-bold uppercase tracking-widest text-indigo-400">Services & Solutions</p>
            <h2 className="text-2xl sm:text-3xl font-bold">Work With Me</h2>
            <p className="text-sm text-slate-400">
              Select any service package below to book directly. Your request goes straight to my Private Life OS & AI Broker Agent.
            </p>

            <div className="space-y-4 pt-2">
              {services.map((srv) => {
                const active = selectedService === srv.title;
                return (
                  <div
                    key={srv.id}
                    onClick={() => setSelectedService(srv.title)}
                    className={`p-5 rounded-2xl border cursor-pointer transition ${
                      active
                        ? 'bg-indigo-950/40 border-indigo-500 shadow-lg shadow-indigo-500/10'
                        : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <span className="text-[11px] uppercase tracking-wider text-cyan-400 font-semibold">
                          {srv.category}
                        </span>
                        <h3 className="text-lg font-bold text-white">{srv.title}</h3>
                      </div>
                      <div className="text-right">
                        <span className="text-lg font-black text-emerald-400">৳{srv.price.toLocaleString()}</span>
                        <span className="block text-[11px] text-slate-400">Est. {srv.delivery}</span>
                      </div>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-2 mt-4">
                      {srv.features.map((f, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs text-slate-300">
                          <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 shrink-0"/>
                          <span>{f}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Direct Client Booking Form */}
          <div className="lg:col-span-5">
            <form
              onSubmit={handleBookingSubmit}
              className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4 sticky top-24"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="font-bold text-lg">Instant Project / Meeting Booking</h3>
                <Calendar className="w-5 h-5 text-cyan-400"/>
              </div>

              {bookingSent && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-medium">
                  ✅ Request delivered directly to KM Mahim’s Private OS Inbox!
                </div>
              )}

              <div>
                <label className="text-xs text-slate-400 block mb-1">Selected Service</label>
                <input
                  type="text"
                  value={selectedService}
                  onChange={(e) => setSelectedService(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-indigo-300 font-medium"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Your Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="John / Rahim"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Email / WhatsApp *</label>
                  <input
                    type="text"
                    required
                    placeholder="you@example.com"
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Preferred Meeting Date (Optional)</label>
                <input
                  type="date"
                  value={meetingDate}
                  onChange={(e) => setMeetingDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-300"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Project Details / Message</label>
                <textarea
                  rows="3"
                  placeholder="Tell me what you want to build or automate..."
                  value={projectNote}
                  onChange={(e) => setProjectNote(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 font-semibold text-sm flex items-center justify-center gap-2 transition"
              >
                <Send className="w-4 h-4"/>
                <span>Send Request to Mahim’s OS</span>
              </button>
            </form>
          </div>
        </section>
      </main>

      {/* Footer with Subtle Secret Access Hint */}
      <footer className="border-t border-slate-900 py-8 text-center text-xs text-slate-500">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} {profile.name} ({profile.bnName}). All rights reserved.</p>
          <button
            onClick={() => setShowPinModal(true)}
            className="inline-flex items-center gap-1.5 text-slate-600 hover:text-slate-400 transition"
          >
            <Lock className="w-3 h-3"/>
            <span>OS Node v1.0</span>
          </button>
        </div>
      </footer>
    </div>
  );
}
