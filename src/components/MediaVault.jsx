import React, { useState } from 'react';
import { useOS } from '../context/OSContext';
import {
  fetchYouTubeVideos,
  extractYouTubeVideoId,
  extractYouTubePlaylistId
} from '../services/googleIntegrations';
import { SoundFX } from './common/SoundEffects';
import {
  Youtube, Play, Pause, Plus, Trash2, Headphones, Download,
  BookmarkPlus, RefreshCw, Info, Square
} from 'lucide-react';

export default function MediaVault() {
  const {
    data,
    secretConfig,
    googleSession,
    integrationFeeds,
    setIntegrationFeeds,
    saveMediaVideo,
    removeMediaVideo,
    addAudioTrack,
    deleteAudioTrack,
    audioPlayer,
    playAudioTrack,
    toggleAudioPlayPause,
    stopAudioTrack,
    upsertSecondBrainNote
  } = useOS();

  const savedVideos = data.mediaVault?.savedVideos || [];
  const audioTracks = data.mediaVault?.audioTracks || [];
  const channelVideos = integrationFeeds.youtubeVideos || [];

  const [ytInput, setYtInput] = useState('');
  const [ytNote, setYtNote] = useState('');
  const [activeVideo, setActiveVideo] = useState(
    savedVideos[0] || channelVideos[0] || null
  );
  const [loadingYt, setLoadingYt] = useState(false);
  const [ytStatus, setYtStatus] = useState('');

  // Background Audio Track Form (Personal MP3 / Direct Podcast Streams)
  const [audTitle, setAudTitle] = useState('');
  const [audUrl, setAudUrl] = useState('');

  const allVideos = [...savedVideos, ...channelVideos.filter((cv) => !savedVideos.some((sv) => sv.id === cv.id))];

  const handleFetchChannel = async () => {
    setLoadingYt(true);
    setYtStatus('');
    try {
      const playlistId = extractYouTubePlaylistId(ytInput);
      const res = await fetchYouTubeVideos({
        accessToken: googleSession.accessToken,
        apiKey: secretConfig.youtubeApiKey,
        playlistId,
        maxResults: 16
      });
      setIntegrationFeeds((f) => ({
        ...f,
        youtubeVideos: res.videos,
        youtubeChannelTitle: res.channelTitle
      }));
      if (res.videos[0] && !activeVideo) setActiveVideo(res.videos[0]);
      setYtStatus(`✅ ${res.videos.length}টি ভিডিও লোড হয়েছে (${res.channelTitle || 'YouTube'})`);
    } catch (err) {
      setYtStatus(`⚠️ ${err.message}`);
    } finally {
      setLoadingYt(false);
    }
  };

  const handleAddSingleVideo = (e) => {
    e.preventDefault();
    const vidId = extractYouTubeVideoId(ytInput);
    if (!vidId) {
      handleFetchChannel();
      return;
    }
    const vid = {
      id: vidId,
      title: `Saved YouTube Video (${vidId})`,
      channel: 'Saved Vault',
      thumbnail: `https://i.ytimg.com/vi/${vidId}/hqdefault.jpg`
    };
    saveMediaVideo(vid);
    setActiveVideo(vid);
    setYtInput('');
    SoundFX.success();
  };

  const handleSaveVideoNoteToBrain = () => {
    if (!activeVideo || !ytNote.trim()) return;
    SoundFX.success();
    upsertSecondBrainNote({
      title: `Video Note: ${activeVideo.title}`,
      folder: 'Resources',
      tags: ['YouTube', 'StudyNote'],
      content: `Source: https://www.youtube.com/watch?v=${activeVideo.id}\n\n${ytNote}`
    });
    setYtNote('');
  };

  const handleLocalAudioUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const objUrl = URL.createObjectURL(file);
    addAudioTrack({ title: file.name, artist: 'Local File', url: objUrl });
    playAudioTrack({ title: file.name, artist: 'Local File', url: objUrl });
    e.target.value = '';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black flex items-center gap-2.5 text-white">
            <Youtube className="w-6 h-6 text-rose-500" />
            <span>Focus Media & YouTube Studio Vault</span>
          </h1>
          <p className="text-xs text-slate-400">
            আপনার YouTube চ্যানেল/প্লেলিস্টের ভিডিও দেখুন ডিস্ট্র্যাকশন ছাড়া, পাশে Second Brain নোট লিখুন, আর ব্যাকগ্রাউন্ডে অডিও/পডকাস্ট শুনুন
          </p>
        </div>

        <button
          onClick={handleFetchChannel}
          disabled={loadingYt}
          className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-2 transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loadingYt ? 'animate-spin' : ''}`} />
          <span>Load My YouTube Account</span>
        </button>
      </div>

      {/* Honest Policy & Capability Notice */}
      <div className="p-3.5 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 flex items-start gap-2.5 text-[11px] text-slate-300">
        <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
        <div>
          <b>স্বচ্ছ তথ্য:</b> অফিসিয়াল YouTube প্লেয়ার কেবল ফোকাসড থিয়েটার ভিউ দেয় (সাইডবার/কমেন্ট ঝামেলা ছাড়া)—YouTube-এর নীতিমালার কারণে ব্রাউজার অ্যাপ থেকে সরাসরি YouTube-এর বিজ্ঞাপন বাইপাস বা কপিরাইটেড YouTube ভিডিও ডাউনলোড করা যায় না। তবে নিচের <b>Audio & Podcast Vault</b>-এ যেকোনো ফ্রি অডিও/MP3/পডকাস্ট লিংক বা ফাইল যোগ করলে তা <b>ব্যাকগ্রাউন্ডে (লক-স্ক্রিন কন্ট্রোলসহ)</b> বাজানো ও সরাসরি ডাউনলোড করা যাবে।
        </div>
      </div>

      {ytStatus && (
        <div className="p-3 rounded-xl bg-slate-900 border border-white/10 text-xs text-cyan-300">
          {ytStatus}
        </div>
      )}

      {/* Video Add / Playlist Input */}
      <form onSubmit={handleAddSingleVideo} className="glass-crystal rounded-3xl p-4 flex flex-wrap gap-2.5">
        <input
          type="text"
          placeholder="যেকোনো YouTube Video URL অথবা Playlist লিংক/ID দিন..."
          value={ytInput}
          onChange={(e) => setYtInput(e.target.value)}
          className="flex-1 min-w-[220px] px-4 py-2.5 rounded-xl glass-input text-xs"
        />
        <button
          type="submit"
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Video / Load Playlist</span>
        </button>
      </form>

      {/* Theater Player + Timestamped Second Brain Notes */}
      <div className="grid lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 glass-crystal rounded-3xl overflow-hidden">
          {activeVideo ? (
            <>
              <div className="aspect-video bg-black">
                <iframe
                  title={activeVideo.title}
                  src={`https://www.youtube.com/embed/${activeVideo.id}?rel=0&modestbranding=1`}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
              <div className="p-4 flex items-center justify-between gap-2">
                <div>
                  <h3 className="font-bold text-sm text-white">{activeVideo.title}</h3>
                  <span className="text-[11px] text-slate-400">{activeVideo.channel}</span>
                </div>
                <a
                  href={`https://www.youtube.com/watch?v=${activeVideo.id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-xl glass-pill text-xs text-cyan-300"
                >
                  Open on YouTube
                </a>
              </div>
            </>
          ) : (
            <div className="aspect-video flex flex-col items-center justify-center p-8 text-center text-xs text-slate-400">
              <Youtube className="w-10 h-10 text-rose-500/60 mb-2" />
              <p>উপরে <b>Load My YouTube Account</b> চাপুন অথবা যেকোনো YouTube লিংক পেস্ট করুন।</p>
            </div>
          )}
        </div>

        {/* Side-by-Side Study Notes */}
        <div className="lg:col-span-4 glass-crystal rounded-3xl p-5 flex flex-col justify-between space-y-3">
          <div className="space-y-2 flex-1 flex flex-col">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <BookmarkPlus className="w-4 h-4 text-emerald-400" />
              <span>Video-to-Second Brain Notes</span>
            </h3>
            <p className="text-[11px] text-slate-400">
              ভিডিও দেখতে দেখতে মূল পয়েন্ট লিখুন এবং ১-ক্লিকে Second Brain-এ সেভ করুন।
            </p>
            <textarea
              rows="8"
              placeholder="লেকচার/ভিডিও থেকে গুরুত্বপূর্ণ নোট..."
              value={ytNote}
              onChange={(e) => setYtNote(e.target.value)}
              className="flex-1 w-full px-3.5 py-2.5 rounded-2xl glass-input text-xs resize-none"
            />
          </div>
          <button
            type="button"
            onClick={handleSaveVideoNoteToBrain}
            disabled={!activeVideo || !ytNote.trim()}
            className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold disabled:opacity-40"
          >
            Save Note to Second Brain
          </button>
        </div>
      </div>

      {/* Video Library Grid */}
      {allVideos.length > 0 && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {allVideos.map((v) => (
            <div
              key={v.id}
              onClick={() => setActiveVideo(v)}
              className={`glass-crystal rounded-2xl overflow-hidden cursor-pointer border transition ${
                activeVideo?.id === v.id ? 'border-rose-500' : 'border-white/10 hover:border-white/25'
              }`}
            >
              <img src={v.thumbnail} alt={v.title} className="w-full h-32 object-cover" />
              <div className="p-3 flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-white line-clamp-2">{v.title}</h4>
                  <span className="text-[10px] text-slate-400">{v.channel}</span>
                </div>
                {savedVideos.some((sv) => sv.id === v.id) && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeMediaVideo(v.id);
                    }}
                    className="p-1 rounded bg-white/5 hover:bg-rose-600 text-slate-400 hover:text-white"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* BACKGROUND AUDIO & PODCAST VAULT */}
      <div className="glass-crystal rounded-3xl p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
          <div>
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <Headphones className="w-4 h-4 text-cyan-400" />
              <span>Background Audio & Podcast Player (অন্য ট্যাবে গেলেও চলবে)</span>
            </h3>
            <p className="text-[11px] text-slate-400">
              আপনার নিজের MP3, ফোকাস মিউজিক বা ডাইরেক্ট পডকাস্ট অডিও URL এখানে যোগ করলে ব্যাকগ্রাউন্ডে শুনতে ও ডাউনলোড করতে পারবেন
            </p>
          </div>

          <label className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white cursor-pointer">
            + ফোনের অডিও ফাইল চালান
            <input type="file" accept="audio/*" onChange={handleLocalAudioUpload} className="hidden" />
          </label>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!audTitle || !audUrl) return;
            addAudioTrack({ title: audTitle, artist: 'Saved Audio', url: audUrl });
            setAudTitle('');
            setAudUrl('');
            SoundFX.success();
          }}
          className="grid sm:grid-cols-3 gap-2.5"
        >
          <input
            type="text"
            placeholder="Track Title (e.g. Deep Focus Binaural)"
            value={audTitle}
            onChange={(e) => setAudTitle(e.target.value)}
            className="px-3.5 py-2 rounded-xl glass-input text-xs"
          />
          <input
            type="url"
            placeholder="Direct Audio URL (https://.../audio.mp3)"
            value={audUrl}
            onChange={(e) => setAudUrl(e.target.value)}
            className="px-3.5 py-2 rounded-xl glass-input text-xs"
          />
          <button type="submit" className="py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold">
            + Add Audio Stream
          </button>
        </form>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {audioTracks.map((tr) => {
            const isCurrent = audioPlayer.currentTrack?.id === tr.id;
            return (
              <div key={tr.id} className="p-3.5 rounded-2xl bg-slate-950/60 border border-white/10 flex items-center justify-between gap-2 text-xs">
                <div className="min-w-0">
                  <p className="font-bold text-white truncate">{tr.title}</p>
                  <span className="text-[10px] text-slate-400">{tr.artist}</span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => (isCurrent ? toggleAudioPlayPause() : playAudioTrack(tr))}
                    className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white"
                  >
                    {isCurrent && audioPlayer.isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  </button>
                  {isCurrent && (
                    <button onClick={stopAudioTrack} className="p-2 rounded-xl bg-white/5 text-slate-300">
                      <Square className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <a
                    href={tr.url}
                    download={tr.title}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-xl bg-white/5 hover:bg-emerald-600 text-slate-300 hover:text-white"
                    title="Download direct audio"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </a>
                  <button
                    onClick={() => deleteAudioTrack(tr.id)}
                    className="p-2 rounded-xl bg-white/5 hover:bg-rose-600 text-slate-400 hover:text-white"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
