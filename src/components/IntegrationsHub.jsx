import React, { useState } from 'react';
import { useOS } from '../context/OSContext';
import {
  authorizeGoogleWorkspace,
  listGmailMessages,
  sendGmailMessage,
  listCalendarEvents,
  createCalendarEvent,
  listGoogleContacts
} from '../services/googleIntegrations';
import { sendWhatsAppMessage, buildWhatsAppLink } from '../services/whatsappService';
import { SoundFX } from './common/SoundEffects';
import {
  Plug, Mail, Calendar, Users, MessageCircle, ShieldCheck,
  RefreshCw, Send, ExternalLink, Key, Lock, Plus
} from 'lucide-react';

export default function IntegrationsHub() {
  const {
    data,
    updateProfile,
    secretConfig,
    updateSecretConfig,
    googleSession,
    saveGoogleSession,
    integrationFeeds,
    setIntegrationFeeds
  } = useOS();

  const [activeSub, setActiveSub] = useState('google'); // 'google' | 'gmail' | 'calendar' | 'contacts' | 'whatsapp' | 'security'
  const [statusMsg, setStatusMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Gmail Compose
  const [mailTo, setMailTo] = useState('');
  const [mailSubject, setMailSubject] = useState('');
  const [mailBody, setMailBody] = useState('');

  // Calendar Create
  const [evTitle, setEvTitle] = useState('');
  const [evStart, setEvStart] = useState('');

  // Contacts Search
  const [contactQ, setContactQ] = useState('');

  // WhatsApp Send
  const [waPhone, setWaPhone] = useState('');
  const [waText, setWaText] = useState('');

  // Security PIN
  const [newPin, setNewPin] = useState(data.profile?.pin || '2526');

  const isGoogleConnected = Boolean(googleSession.accessToken && googleSession.expiresAt > Date.now());

  const handleConnectGoogle = async () => {
    setLoading(true);
    setStatusMsg('');
    try {
      const sess = await authorizeGoogleWorkspace(secretConfig.googleClientId);
      saveGoogleSession(sess);
      SoundFX.success();
      setStatusMsg('✅ Google Workspace (Gmail, Calendar, Contacts, YouTube) সফলভাবে যুক্ত হয়েছে!');
    } catch (err) {
      setStatusMsg(`⚠️ ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadGmail = async () => {
    setLoading(true);
    setStatusMsg('');
    try {
      const emails = await listGmailMessages(googleSession.accessToken, '', 10);
      setIntegrationFeeds((f) => ({ ...f, emails }));
      setStatusMsg(`📧 ${emails.length}টি সর্বশেষ ইমেইল লোড হয়েছে।`);
    } catch (err) {
      setStatusMsg(`⚠️ Gmail: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMail = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await sendGmailMessage(googleSession.accessToken, {
        to: mailTo,
        subject: mailSubject,
        body: mailBody
      });
      SoundFX.success();
      setMailTo('');
      setMailSubject('');
      setMailBody('');
      setStatusMsg('✅ ইমেইল সফলভাবে পাঠানো হয়েছে!');
    } catch (err) {
      setStatusMsg(`⚠️ Send Failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadCalendar = async () => {
    setLoading(true);
    setStatusMsg('');
    try {
      const events = await listCalendarEvents(googleSession.accessToken, 15);
      setIntegrationFeeds((f) => ({ ...f, events }));
      setStatusMsg(`📅 ${events.length}টি আসন্ন ক্যালেন্ডার ইভেন্ট লোড হয়েছে।`);
    } catch (err) {
      setStatusMsg(`⚠️ Calendar: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createCalendarEvent(googleSession.accessToken, {
        summary: evTitle,
        startIso: evStart
      });
      SoundFX.success();
      setEvTitle('');
      setEvStart('');
      await handleLoadCalendar();
    } catch (err) {
      setStatusMsg(`⚠️ Calendar Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadContacts = async (q = '') => {
    setLoading(true);
    setStatusMsg('');
    try {
      const contacts = await listGoogleContacts(googleSession.accessToken, q, 40);
      setIntegrationFeeds((f) => ({ ...f, contacts }));
      setStatusMsg(`👥 ${contacts.length}টি কন্টাক্ট লোড হয়েছে।`);
    } catch (err) {
      setStatusMsg(`⚠️ Contacts: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSendWA = async (e) => {
    e.preventDefault();
    setLoading(true);
    const res = await sendWhatsAppMessage({
      toPhone: waPhone,
      message: waText,
      cloudToken: secretConfig.metaWaToken,
      phoneNumberId: secretConfig.metaWaPhoneId,
      webhookUrl: secretConfig.whatsappWebhookUrl
    });
    if (res.mode === 'deep_link' && res.url) {
      window.open(res.url, '_blank', 'noopener,noreferrer');
    }
    setStatusMsg(res.success ? `✅ ${res.message}` : `⚠️ ${res.message}`);
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black flex items-center gap-2.5 text-white">
            <Plug className="w-6 h-6 text-cyan-400" />
            <span>Connected Ecosystem (Gmail • Calendar • Contacts • WhatsApp)</span>
          </h1>
          <p className="text-xs text-slate-400">
            আপনার Google ও WhatsApp যুক্ত করলে এখান থেকে এবং AI Copilot দিয়ে সরাসরি সব কিছু নিয়ন্ত্রণ করতে পারবেন
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1 glass-pill p-1 rounded-xl text-xs">
          {[
            { id: 'google', label: '🔑 Google Setup' },
            { id: 'gmail', label: '📧 Gmail' },
            { id: 'calendar', label: '📅 Calendar' },
            { id: 'contacts', label: '👥 Contacts' },
            { id: 'whatsapp', label: '💬 WhatsApp' },
            { id: 'security', label: '🔒 Lock & Security' }
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => {
                SoundFX.click();
                setActiveSub(t.id);
              }}
              className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                activeSub === t.id ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {statusMsg && (
        <div className="p-3.5 rounded-2xl bg-indigo-500/15 border border-indigo-500/35 text-xs text-indigo-100">
          {statusMsg}
        </div>
      )}

      {/* TAB 1: GOOGLE WORKSPACE SETUP */}
      {activeSub === 'google' && (
        <div className="grid lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 glass-crystal rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-white">Google OAuth 2.0 Connection</h3>
              <span
                className={`text-[10px] font-mono px-2.5 py-1 rounded-full ${
                  isGoogleConnected
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                }`}
              >
                {isGoogleConnected ? '● Connected' : 'Not Connected'}
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">
                  Google Cloud OAuth Client ID (Gmail + Calendar + Contacts + YouTube একসাথে চলবে)
                </label>
                <input
                  type="text"
                  placeholder="xxxxx.apps.googleusercontent.com"
                  value={secretConfig.googleClientId || ''}
                  onChange={(e) => updateSecretConfig({ googleClientId: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs font-mono"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">
                  YouTube Data API Key (ঐচ্ছিক — OAuth ছাড়া পাবলিক Playlist লোড করার জন্য)
                </label>
                <input
                  type="password"
                  placeholder="AIza..."
                  value={secretConfig.youtubeApiKey || ''}
                  onChange={(e) => updateSecretConfig({ youtubeApiKey: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs font-mono"
                />
              </div>

              <button
                onClick={handleConnectGoogle}
                disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-bold text-xs flex items-center justify-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                <span>{isGoogleConnected ? 'Reconnect / Refresh Google Token' : 'Connect Google Account Now'}</span>
              </button>
            </div>
          </div>

          <div className="lg:col-span-5 glass-crystal rounded-3xl p-6 space-y-3 text-xs text-slate-300 leading-relaxed">
            <h4 className="font-bold text-sm text-white flex items-center gap-2">
              <Key className="w-4 h-4 text-amber-400" />
              <span>ফ্রি Google Client ID কীভাবে পাবেন?</span>
            </h4>
            <ol className="list-decimal pl-4 space-y-1.5 text-[11px]">
              <li>
                <b>console.cloud.google.com</b>-এ একটি প্রোজেক্ট তৈরি করে <b>Gmail API</b>, <b>Google Calendar API</b>, <b>People API (Contacts)</b> ও <b>YouTube Data API v3</b> এনাবল করুন।
              </li>
              <li>
                <i>OAuth Consent Screen</i>-এ নিজের Gmail-টি Test User হিসেবে যোগ করুন।
              </li>
              <li>
                <i>Credentials → Create OAuth Client ID (Web Application)</i>-এ গিয়ে Authorized JavaScript Origin-এ <code className="text-cyan-300">https://kmmahim.site</code>, <code className="text-cyan-300">https://kmmahim-site.vercel.app</code> (এবং লোকালের জন্য <code className="text-cyan-300">http://localhost:5173</code>) বসান।
              </li>
              <li>Client ID এখানে পেস্ট করে <b>Connect</b> চাপুন—এরপর AI-কে বললেই ইমেইল, ক্যালেন্ডার ও কন্টাক্টস চালাবে!</li>
            </ol>
          </div>
        </div>
      )}

      {/* TAB 2: GMAIL */}
      {activeSub === 'gmail' && (
        <div className="grid lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 glass-crystal rounded-3xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <Mail className="w-4 h-4 text-rose-400" />
                <span>Gmail Inbox ({integrationFeeds.emails?.length || 0})</span>
              </h3>
              <button
                onClick={handleLoadGmail}
                disabled={!isGoogleConnected || loading}
                className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white disabled:opacity-50"
              >
                {isGoogleConnected ? 'Refresh Inbox' : 'Connect Google First'}
              </button>
            </div>

            <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
              {(integrationFeeds.emails || []).length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-8">
                  {isGoogleConnected ? 'Refresh Inbox চাপুন অথবা AI Copilot-কে "আমার মেইল চেক করো" বলুন।' : 'প্রথমে Google Setup ট্যাব থেকে কানেক্ট করুন।'}
                </p>
              ) : (
                integrationFeeds.emails.map((em) => (
                  <div key={em.id} className="p-3.5 rounded-2xl bg-slate-950/60 border border-white/10 text-xs space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-white truncate">{em.subject}</span>
                      {em.unread && <span className="text-[9px] px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300">UNREAD</span>}
                    </div>
                    <div className="text-[10px] text-cyan-400 font-mono truncate">{em.from}</div>
                    <p className="text-[11px] text-slate-400">{em.snippet}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          <form onSubmit={handleSendMail} className="lg:col-span-5 glass-crystal rounded-3xl p-5 space-y-3">
            <h3 className="font-bold text-sm text-white">Send Email via Gmail API</h3>
            <input
              type="email"
              required
              placeholder="Recipient Email..."
              value={mailTo}
              onChange={(e) => setMailTo(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs"
            />
            <input
              type="text"
              required
              placeholder="Subject..."
              value={mailSubject}
              onChange={(e) => setMailSubject(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs"
            />
            <textarea
              rows="5"
              required
              placeholder="Message body..."
              value={mailBody}
              onChange={(e) => setMailBody(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs"
            />
            <button
              type="submit"
              disabled={!isGoogleConnected || loading}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send Email</span>
            </button>
          </form>
        </div>
      )}

      {/* TAB 3: GOOGLE CALENDAR */}
      {activeSub === 'calendar' && (
        <div className="grid lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 glass-crystal rounded-3xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-cyan-400" />
                <span>Upcoming Google Calendar Events</span>
              </h3>
              <button
                onClick={handleLoadCalendar}
                disabled={!isGoogleConnected || loading}
                className="px-3 py-1.5 rounded-xl bg-indigo-600 text-xs font-bold text-white disabled:opacity-50"
              >
                Load Events
              </button>
            </div>

            <div className="space-y-2.5 max-h-[360px] overflow-y-auto">
              {(integrationFeeds.events || []).length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-8">কোনো ইভেন্ট লোড করা হয়নি।</p>
              ) : (
                integrationFeeds.events.map((ev) => (
                  <div key={ev.id} className="p-3.5 rounded-2xl bg-slate-950/60 border border-white/10 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-white">{ev.summary}</p>
                      <span className="text-[10px] font-mono text-cyan-300">{ev.start}</span>
                    </div>
                    {ev.htmlLink && (
                      <a href={ev.htmlLink} target="_blank" rel="noreferrer" className="text-indigo-300 hover:text-white">
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          <form onSubmit={handleCreateEvent} className="lg:col-span-5 glass-crystal rounded-3xl p-5 space-y-3">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <Plus className="w-4 h-4 text-emerald-400" />
              <span>Add Event to Google Calendar</span>
            </h3>
            <input
              type="text"
              required
              placeholder="Event Title (e.g. Sports Science Exam / Client Call)"
              value={evTitle}
              onChange={(e) => setEvTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs"
            />
            <input
              type="datetime-local"
              required
              value={evStart}
              onChange={(e) => setEvStart(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs"
            />
            <button
              type="submit"
              disabled={!isGoogleConnected || loading}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white disabled:opacity-50"
            >
              Create Calendar Event
            </button>
          </form>
        </div>
      )}

      {/* TAB 4: GOOGLE CONTACTS */}
      {activeSub === 'contacts' && (
        <div className="glass-crystal rounded-3xl p-5 space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <input
              type="text"
              placeholder="নাম দিয়ে কন্টাক্ট খুঁজুন..."
              value={contactQ}
              onChange={(e) => setContactQ(e.target.value)}
              className="flex-1 min-w-[200px] px-3.5 py-2.5 rounded-xl glass-input text-xs"
            />
            <button
              onClick={() => handleLoadContacts(contactQ)}
              disabled={!isGoogleConnected || loading}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 text-xs font-bold text-white disabled:opacity-50"
            >
              Search / Sync Google Contacts
            </button>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[420px] overflow-y-auto">
            {(integrationFeeds.contacts || []).map((c) => (
              <div key={c.id} className="p-3.5 rounded-2xl bg-slate-950/60 border border-white/10 text-xs space-y-1.5">
                <div className="font-bold text-white flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{c.name}</span>
                </div>
                {c.phone && <div className="text-[11px] font-mono text-emerald-300">{c.phone}</div>}
                {c.email && <div className="text-[11px] text-slate-400 truncate">{c.email}</div>}
                {c.phone && (
                  <a
                    href={buildWhatsAppLink(c.phone, `আসসালামু আলাইকুম ${c.name}, `)}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[10px] text-emerald-400 hover:underline pt-1"
                  >
                    <MessageCircle className="w-3 h-3" />
                    <span>Message on WhatsApp</span>
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: WHATSAPP CLOUD & WEBHOOK */}
      {activeSub === 'whatsapp' && (
        <div className="grid lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6 glass-crystal rounded-3xl p-5 space-y-3 text-xs">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-emerald-400" />
              <span>WhatsApp Bridge Configuration</span>
            </h3>
            <p className="text-[11px] text-slate-400">
              সার্ভার ছাড়াই অটোমেটেড WhatsApp পাঠাতে Meta Cloud API অথবা আপনার n8n/OpenClaw Webhook বসান। কিছু না বসালেও সরাসরি <b>wa.me</b> চ্যাট খুলবে।
            </p>
            <div>
              <label className="text-[10px] text-slate-400 block mb-1">Meta WhatsApp Cloud Access Token (Optional)</label>
              <input
                type="password"
                placeholder="EAAG..."
                value={secretConfig.metaWaToken || ''}
                onChange={(e) => updateSecretConfig({ metaWaToken: e.target.value })}
                className="w-full px-3 py-2 rounded-xl glass-input text-xs font-mono"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 block mb-1">Meta Phone Number ID (Optional)</label>
              <input
                type="text"
                placeholder="1092837465..."
                value={secretConfig.metaWaPhoneId || ''}
                onChange={(e) => updateSecretConfig({ metaWaPhoneId: e.target.value })}
                className="w-full px-3 py-2 rounded-xl glass-input text-xs font-mono"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 block mb-1">External n8n / OpenClaw WhatsApp Webhook URL</label>
              <input
                type="text"
                placeholder="https://n8n.yourdomain.com/webhook/whatsapp"
                value={secretConfig.whatsappWebhookUrl || ''}
                onChange={(e) => updateSecretConfig({ whatsappWebhookUrl: e.target.value })}
                className="w-full px-3 py-2 rounded-xl glass-input text-xs font-mono"
              />
            </div>
          </div>

          <form onSubmit={handleSendWA} className="lg:col-span-6 glass-crystal rounded-3xl p-5 space-y-3">
            <h3 className="font-bold text-sm text-white">Quick Send WhatsApp Message</h3>
            <input
              type="text"
              required
              placeholder="Phone Number (e.g. 017xxxxxxxx)"
              value={waPhone}
              onChange={(e) => setWaPhone(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs"
            />
            <textarea
              rows="4"
              required
              placeholder="আপনার মেসেজ লিখুন..."
              value={waText}
              onChange={(e) => setWaText(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-2"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send via WhatsApp</span>
            </button>
          </form>
        </div>
      )}

      {/* TAB 6: SECURITY, PERSISTENT LOCK & SESSION SETTINGS */}
      {activeSub === 'security' && (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="glass-crystal rounded-3xl p-6 space-y-4 text-xs">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Reload & Passcode Session Settings</span>
            </h3>
            <p className="text-slate-400">
              এখন রিলোড করলেও আপনার নির্ধারিত দিন পর্যন্ত Layer-2 আনলক থাকবে। কাজ শেষে হেডারের <b>Lock OS</b> বাটন চাপলে সাথে সাথে লক হয়ে যাবে।
            </p>
            <div>
              <label className="text-[11px] text-slate-300 block mb-1">
                এই ডিভাইসে কত দিন আনলক মনে রাখবে (Days):
              </label>
              <select
                value={secretConfig.rememberDays ?? 7}
                onChange={(e) => updateSecretConfig({ rememberDays: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs"
              >
                <option value={1} className="bg-slate-900">১ দিন (24 Hours)</option>
                <option value={7} className="bg-slate-900">৭ দিন (7 Days Recommended)</option>
                <option value={30} className="bg-slate-900">৩০ দিন (Trusted Personal Device)</option>
              </select>
            </div>
          </div>

          <div className="glass-crystal rounded-3xl p-6 space-y-4 text-xs">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <Lock className="w-4 h-4 text-cyan-400" />
              <span>Change Private PIN</span>
            </h3>
            <div className="flex gap-2">
              <input
                type="password"
                value={newPin}
                onChange={(e) => setNewPin(e.target.value)}
                className="flex-1 px-3.5 py-2.5 rounded-xl glass-input text-sm font-mono"
              />
              <button
                type="button"
                onClick={() => {
                  if (!newPin.trim()) return;
                  updateProfile({ pin: newPin.trim() });
                  SoundFX.success();
                  setStatusMsg('✅ প্রাইভেট PIN আপডেট হয়েছে!');
                }}
                className="px-4 py-2.5 rounded-xl bg-indigo-600 text-white font-bold"
              >
                Update PIN
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
