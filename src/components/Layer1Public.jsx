import React, { useState, useRef } from 'react';
import { useOS } from '../context/OSContext';
import {
  Sparkles, Code2, Cpu, Globe, ArrowUpRight, CheckCircle2,
  Send, Calendar, Download, Shield, Layers, Terminal, Phone,
  Mail, MapPin, Facebook, Linkedin, Twitter, Youtube, Lock
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
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white">
      {/* Ambient Glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-cyan-500/15 rounded-full blur-3xl" />
      </div>

      {/* Navbar */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-slate-950/75 border-b border-slate-800/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div
            onClick={handleSecretLogoClick}
            title="Triple-click for Command OS"
            className="flex items-center gap-3 cursor-pointer select-none group"
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

          <nav className="hidden md:flex items-center gap-6 text-sm text-slate-300">
            <a href="#projects" className="hover:text-white transition">Projects & Brands</a>
            <a href="#services" className="hover:text-white transition">Services & Booking</a>
            <a href="#links" className="hover:text-white transition">Special Links</a>
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={downloadVCard}
              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400"/>
              <span>Save vCard</span>
            </button>
            {isAuthenticated && (
              <button
                onClick={() => setActiveLayer('private')}
                className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <Terminal className="w-3.5 h-3.5"/>
                <span>Open Life OS</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-12 pb-24 relative z-10">
        {/* Live "NOW" Bar */}
        <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-indigo-950/60 border border-indigo-500/30 text-xs text-indigo-200 mb-8">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-semibold text-indigo-400 uppercase tracking-wider">NOW:</span>
          <span>{profile.nowStatus}</span>
        </div>

        <div className="grid lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-8 space-y-6">
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
              <a
                href="#services"
                className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-semibold text-sm flex items-center gap-2 shadow-lg shadow-indigo-600/25 transition"
              >
                <Sparkles className="w-4 h-4"/>
                <span>Book a Service / Project</span>
              </a>
              <a
                href="#projects"
                className="px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 font-semibold text-sm flex items-center gap-2 transition"
              >
                <Layers className="w-4 h-4 text-cyan-400"/>
                <span>Explore My Work</span>
              </a>
            </div>
          </div>

          {/* Identity Quick Card */}
          <div className="lg:col-span-4 bg-slate-900/70 backdrop-blur-xl border border-slate-800 p-6 rounded-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <p className="text-xs text-slate-400">Core Identity</p>
                <h3 className="text-lg font-bold text-white">{profile.name}</h3>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Available for Projects
              </span>
            </div>

            <div className="space-y-2.5 text-xs text-slate-300">
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
                <span>AI Stack: OpenClaw • Grok • Hermes • Webhooks</span>
              </div>
            </div>

            <div id="links" className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-400">Connect:</span>
              <div className="flex items-center gap-2">
                <a href={profile.socials.facebook} target="_blank" rel="noreferrer" className="p-2 rounded-lg bg-slate-800 hover:bg-indigo-600 transition">
                  <Facebook className="w-4 h-4"/>
                </a>
                <a href={profile.socials.linkedin} target="_blank" rel="noreferrer" className="p-2 rounded-lg bg-slate-800 hover:bg-indigo-600 transition">
                  <Linkedin className="w-4 h-4"/>
                </a>
                <a href={profile.socials.twitter} target="_blank" rel="noreferrer" className="p-2 rounded-lg bg-slate-800 hover:bg-indigo-600 transition">
                  <Twitter className="w-4 h-4"/>
                </a>
                <a href={profile.socials.youtube} target="_blank" rel="noreferrer" className="p-2 rounded-lg bg-slate-800 hover:bg-red-600 transition">
                  <Youtube className="w-4 h-4"/>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Projects & Ventures Showcase */}
        <section id="projects" className="mt-24">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-cyan-400">Portfolio & Ventures</p>
              <h2 className="text-2xl sm:text-3xl font-bold mt-1">What I’ve Built & Operated</h2>
            </div>
            <p className="text-xs text-slate-400">Dynamically synced with Layer-2 Command OS</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {projects.map((proj) => (
              <div
                key={proj.id}
                className="group bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-indigo-500/50 rounded-2xl p-6 transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                      {proj.category}
                    </span>
                    <span className="text-[11px] text-cyan-400 font-mono">{proj.badge}</span>
                  </div>
                  <h3 className="text-xl font-bold text-white group-hover:text-indigo-300 transition">
                    {proj.title}
                  </h3>
                  <p className="text-sm text-slate-400 mt-2 leading-relaxed">
                    {proj.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="text-emerald-400 font-medium">{proj.metrics}</span>
                  <a
                    href={proj.link}
                    className="inline-flex items-center gap-1 text-slate-300 hover:text-white font-semibold"
                  >
                    <span>Details</span>
                    <ArrowUpRight className="w-3.5 h-3.5"/>
                  </a>
                </div>
              </div>
            ))}
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
