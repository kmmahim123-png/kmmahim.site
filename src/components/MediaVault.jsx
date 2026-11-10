import React, { useState, useEffect, useRef } from 'react';
import { useOS } from '../context/OSContext';
import {
  authorizeGoogleWorkspace,
  fetchYouTubeVideos,
  searchYouTubeVideos,
  fetchTrendingYouTubeVideos,
  fetchLikedYouTubeVideos,
  fetchYouTubeSubscriptions,
  fetchMyYouTubePlaylists,
  fetchChannelUploads,
  fetchSubscribedFeed,
  extractYouTubeVideoId,
  extractYouTubePlaylistId
} from '../services/googleIntegrations';
import { SoundFX } from './common/SoundEffects';
import YouTubePlayer from './common/YouTubePlayer';
import {
  Youtube, Play, Pause, Plus, Trash2, Headphones, Download, BookmarkPlus,
  RefreshCw, Info, Square, Search, Heart, Flame, Tv, ListVideo,
  SkipBack, SkipForward, Bookmark, Plug, PictureInPicture2
} from 'lucide-react';

export default function MediaVault() {
  const {
    data,
    secretConfig,
    googleSession,
    saveGoogleSession,
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

  const isGoogleConnected = Boolean(
    googleSession.accessToken && googleSession.expiresAt > Date.now()
  );

  // Hub Tabs: 'feed' | 'search' | 'subs' | 'liked' | 'playlists' | 'saved' | 'audio'
  const [ytTab, setYtTab] = useState('feed');
  const [ytInput, setYtInput] = useState('');
  const [searchQ, setSearchQ] = useState('');
  const [ytNote, setYtNote] = useState('');
  const [activeVideo, setActiveVideo] = useState(
    savedVideos[0] || channelVideos[0] || null
  );
  const [loadingYt, setLoadingYt] = useState(false);
  const [ytStatus, setYtStatus] = useState('');

  const [subsList, setSubsList] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [useNoCookie, setUseNoCookie] = useState(false);
  const playerWrapRef = useRef(null);

  const openFloatingMiniPlayer = (videoId) => {
    if (!videoId) return;
    const w = window.open(
      `https://www.youtube.com/watch?v=${videoId}`,
      'mahim_yt_mini',
      'popup=yes,width=960,height=560,menubar=no,toolbar=no,location=no,status=no'
    );
    if (!w) {
      window.open(`https://www.youtube.com/watch?v=${videoId}`, '_blank', 'noopener,noreferrer');
    }
  };

  const selectVideoAndScroll = (vid) => {
    if (!vid) return;
    setActiveVideo(vid);
    SoundFX.click();
    requestAnimationFrame(() => {
      playerWrapRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
  };

  // Background Audio Track Form
  const [audTitle, setAudTitle] = useState('');
  const [audUrl, setAudUrl] = useState('');

  const visibleVideos =
    ytTab === 'saved'
      ? savedVideos
      : channelVideos.length > 0
      ? channelVideos
      : savedVideos;

  // Auto-load Subscribed Feed or BD Trending when opening Media tab if feed is empty & credentials exist
  useEffect(() => {
    if (channelVideos.length === 0 && (isGoogleConnected || secretConfig.youtubeApiKey)) {
      loadHomeFeed();
    }
  }, [isGoogleConnected]);

  const handleReconnectGoogle = async () => {
    if (!secretConfig.googleClientId) {
      setYtStatus('⚠️ প্রথমে Connect ট্যাবে গিয়ে আপনার Google OAuth Client ID সেভ করুন।');
      return;
    }
    setLoadingYt(true);
    try {
      const sess = await authorizeGoogleWorkspace(secretConfig.googleClientId);
      saveGoogleSession(sess);
      setYtStatus('✅ Google অ্যাকাউন্ট রিকানেক্ট হয়েছে! এখন লোড হচ্ছে...');
      SoundFX.success();
    } catch (err) {
      setYtStatus(`⚠️ ${err.message}`);
    } finally {
      setLoadingYt(false);
    }
  };

  const loadHomeFeed = async () => {
    setLoadingYt(true);
    setYtStatus('');
    try {
      if (isGoogleConnected) {
        const res = await fetchSubscribedFeed({
          accessToken: googleSession.accessToken,
          apiKey: secretConfig.youtubeApiKey,
          maxChannels: 8
        });
        setSubsList(res.subscriptions);
        if (res.videos.length > 0) {
          setIntegrationFeeds((f) => ({
            ...f,
            youtubeVideos: res.videos,
            youtubeChannelTitle: 'My Subscriptions Feed'
          }));
          if (!activeVideo) setActiveVideo(res.videos[0]);
          setYtStatus(`✅ আপনার ${res.subscriptions.length}টি সাবস্ক্রাইব করা চ্যানেল থেকে ${res.videos.length}টি লেটেস্ট ভিডিও লোড হয়েছে!`);
          return;
        }
      }
      // Fallback to Bangladesh Trending if user has no subscriptions or only API Key
      const trending = await fetchTrendingYouTubeVideos({
        accessToken: googleSession.accessToken,
        apiKey: secretConfig.youtubeApiKey,
        regionCode: 'BD',
        maxResults: 16
      });
      setIntegrationFeeds((f) => ({
        ...f,
        youtubeVideos: trending,
        youtubeChannelTitle: 'Trending Bangladesh'
      }));
      if (!activeVideo && trending[0]) setActiveVideo(trending[0]);
      setYtStatus(`🔥 ${trending.length}টি ট্রেন্ডিং ভিডিও লোড হয়েছে।`);
    } catch (err) {
      setYtStatus(`⚠️ ${err.message}`);
    } finally {
      setLoadingYt(false);
    }
  };

  const handleSearchYouTube = async (e) => {
    e?.preventDefault();
    if (!searchQ.trim()) return;
    setLoadingYt(true);
    setYtStatus('');
    try {
      const vids = await searchYouTubeVideos({
        accessToken: googleSession.accessToken,
        apiKey: secretConfig.youtubeApiKey,
        query: searchQ.trim(),
        maxResults: 16
      });
      setIntegrationFeeds((f) => ({
        ...f,
        youtubeVideos: vids,
        youtubeChannelTitle: `Search: ${searchQ}`
      }));
      if (vids[0]) setActiveVideo(vids[0]);
      setYtStatus(`🔍 "${searchQ}" — ${vids.length}টি ভিডিও পাওয়া গেছে।`);
      setYtTab('search');
    } catch (err) {
      setYtStatus(`⚠️ ${err.message}`);
    } finally {
      setLoadingYt(false);
    }
  };

  const handleLoadSubscriptions = async () => {
    setYtTab('subs');
    setLoadingYt(true);
    setYtStatus('');
    try {
      const subs = await fetchYouTubeSubscriptions({
        accessToken: googleSession.accessToken,
        maxResults: 30
      });
      setSubsList(subs);
      setYtStatus(`📺 আপনার ${subs.length}টি সাবস্ক্রিপশন চ্যানেল লোড হয়েছে — যেকোনো চ্যানেলে ক্লিক করুন।`);
    } catch (err) {
      setYtStatus(`⚠️ ${err.message}`);
    } finally {
      setLoadingYt(false);
    }
  };

  const handleSelectChannel = async (ch) => {
    setLoadingYt(true);
    setYtStatus('');
    try {
      const vids = await fetchChannelUploads({
        accessToken: googleSession.accessToken,
        apiKey: secretConfig.youtubeApiKey,
        channelId: ch.channelId,
        maxResults: 16
      });
      setIntegrationFeeds((f) => ({
        ...f,
        youtubeVideos: vids,
        youtubeChannelTitle: ch.title
      }));
      if (vids[0]) setActiveVideo(vids[0]);
      setYtStatus(`▶️ "${ch.title}" চ্যানেলের ${vids.length}টি ভিডিও লোড হয়েছে।`);
    } catch (err) {
      setYtStatus(`⚠️ ${err.message}`);
    } finally {
      setLoadingYt(false);
    }
  };

  const handleLoadLiked = async () => {
    setYtTab('liked');
    setLoadingYt(true);
    setYtStatus('');
    try {
      const vids = await fetchLikedYouTubeVideos({
        accessToken: googleSession.accessToken,
        apiKey: secretConfig.youtubeApiKey,
        maxResults: 20
      });
      setIntegrationFeeds((f) => ({
        ...f,
        youtubeVideos: vids,
        youtubeChannelTitle: 'Liked Videos'
      }));
      if (vids[0]) setActiveVideo(vids[0]);
      setYtStatus(`❤️ আপনার লাইক করা ${vids.length}টি ভিডিও লোড হয়েছে।`);
    } catch (err) {
      setYtStatus(`⚠️ ${err.message}`);
    } finally {
      setLoadingYt(false);
    }
  };

  const handleLoadPlaylists = async () => {
    setYtTab('playlists');
    setLoadingYt(true);
    setYtStatus('');
    try {
      const pls = await fetchMyYouTubePlaylists({
        accessToken: googleSession.accessToken,
        maxResults: 25
      });
      setPlaylists(pls);
      setYtStatus(`📂 আপনার ${pls.length}টি প্লেলিস্ট লোড হয়েছে — যেকোনো প্লেলিস্টে ট্যাপ করুন।`);
    } catch (err) {
      setYtStatus(`⚠️ ${err.message}`);
    } finally {
      setLoadingYt(false);
    }
  };

  const handleOpenPlaylist = async (plId, label = 'Playlist') => {
    setLoadingYt(true);
    setYtStatus('');
    try {
      const res = await fetchYouTubeVideos({
        accessToken: googleSession.accessToken,
        apiKey: secretConfig.youtubeApiKey,
        playlistId: plId,
        maxResults: 24
      });
      setIntegrationFeeds((f) => ({
        ...f,
        youtubeVideos: res.videos,
        youtubeChannelTitle: label
      }));
      if (res.videos[0]) setActiveVideo(res.videos[0]);
      setYtStatus(`📂 "${label}" থেকে ${res.videos.length}টি ভিডিও লোড হয়েছে।`);
    } catch (err) {
      setYtStatus(`⚠️ ${err.message}`);
    } finally {
      setLoadingYt(false);
    }
  };

  const handleAddSingleVideoOrPlaylist = (e) => {
    e.preventDefault();
    const plId = extractYouTubePlaylistId(ytInput);
    const vidId = extractYouTubeVideoId(ytInput);
    if (plId && !vidId) {
      handleOpenPlaylist(plId, 'Imported Playlist');
      return;
    }
    if (!vidId) {
      setSearchQ(ytInput);
      handleSearchYouTube({ preventDefault: () => {} });
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

  const stepQueue = (dir) => {
    if (!visibleVideos.length || !activeVideo) return;
    const idx = visibleVideos.findIndex((v) => v.id === activeVideo.id);
    const nextIdx = (idx + dir + visibleVideos.length) % visibleVideos.length;
    setActiveVideo(visibleVideos[nextIdx]);
    SoundFX.click();
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
            <span>Focus YouTube & Media Hub</span>
          </h1>
          <p className="text-xs text-slate-400">
            YouTube অ্যাপে না ঢুকেই এখান থেকেই Search, Subscriptions, Liked Videos ও Playlists দেখুন এবং পাশে নোট লিখুন
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {!isGoogleConnected && (
            <button
              onClick={handleReconnectGoogle}
              disabled={loadingYt}
              className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5"
            >
              <Plug className="w-3.5 h-3.5" />
              <span>Reconnect Google</span>
            </button>
          )}
          <button
            onClick={loadHomeFeed}
            disabled={loadingYt}
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-2 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingYt ? 'animate-spin' : ''}`} />
            <span>Refresh Feed</span>
          </button>
        </div>
      </div>

      {/* Sub Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 glass-pill p-1.5 rounded-2xl text-xs">
        {[
          { id: 'feed', label: 'Home / Feed', icon: Flame, fn: () => { setYtTab('feed'); loadHomeFeed(); } },
          { id: 'search', label: 'Search YouTube', icon: Search, fn: () => setYtTab('search') },
          { id: 'subs', label: 'Subscriptions', icon: Tv, fn: handleLoadSubscriptions },
          { id: 'liked', label: 'Liked Videos', icon: Heart, fn: handleLoadLiked },
          { id: 'playlists', label: 'My Playlists', icon: ListVideo, fn: handleLoadPlaylists },
          { id: 'saved', label: `Saved (${savedVideos.length})`, icon: Bookmark, fn: () => setYtTab('saved') },
          { id: 'audio', label: 'Background Audio', icon: Headphones, fn: () => setYtTab('audio') }
        ].map((tab) => {
          const Icon = tab.icon;
          const active = ytTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                SoundFX.click();
                tab.fn();
              }}
              className={`px-3 py-1.5 rounded-xl font-semibold flex items-center gap-1.5 transition ${
                active ? 'bg-rose-600 text-white shadow' : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Search All YouTube + Paste Link Bar */}
      {ytTab !== 'audio' && (
        <div className="grid md:grid-cols-2 gap-3">
          <form onSubmit={handleSearchYouTube} className="glass-crystal rounded-2xl p-2.5 flex gap-2">
            <input
              type="text"
              placeholder="YouTube-এ যেকোনো ভিডিও সার্চ করুন (e.g. Sports Science, Podcasts)..."
              value={searchQ}
              onChange={(e) => setSearchQ(e.target.value)}
              className="flex-1 px-3.5 py-2 rounded-xl glass-input text-xs"
            />
            <button
              type="submit"
              disabled={loadingYt}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-1.5"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Search</span>
            </button>
          </form>

          <form onSubmit={handleAddSingleVideoOrPlaylist} className="glass-crystal rounded-2xl p-2.5 flex gap-2">
            <input
              type="text"
              placeholder="অথবা সরাসরি Video / Playlist URL পেস্ট করুন..."
              value={ytInput}
              onChange={(e) => setYtInput(e.target.value)}
              className="flex-1 px-3.5 py-2 rounded-xl glass-input text-xs"
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Play / Save</span>
            </button>
          </form>
        </div>
      )}

      {ytStatus && (
        <div className="p-3 rounded-2xl bg-slate-900/90 border border-white/10 text-xs text-cyan-300">
          {ytStatus}
        </div>
      )}

      {/* Channel / Playlist Selector Chips */}
      {ytTab === 'subs' && subsList.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {subsList.map((ch) => (
            <button
              key={ch.channelId}
              onClick={() => handleSelectChannel(ch)}
              className="px-3 py-1.5 rounded-full glass-crystal hover:border-rose-400 text-xs text-white flex items-center gap-2 transition"
            >
              {ch.thumbnail && <img src={ch.thumbnail} alt="" className="w-5 h-5 rounded-full" />}
              <span>{ch.title}</span>
            </button>
          ))}
        </div>
      )}

      {ytTab === 'playlists' && playlists.length > 0 && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {playlists.map((pl) => (
            <button
              key={pl.id}
              onClick={() => handleOpenPlaylist(pl.id, pl.title)}
              className="p-3 rounded-2xl glass-crystal hover:border-rose-400 text-left flex items-center gap-3 transition"
            >
              {pl.thumbnail && <img src={pl.thumbnail} alt="" className="w-16 h-11 rounded-lg object-cover shrink-0" />}
              <div className="min-w-0">
                <p className="text-xs font-bold text-white truncate">{pl.title}</p>
                <span className="text-[10px] text-slate-400">{pl.count} videos</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Theater Player + Timestamped Notes */}
      {ytTab !== 'audio' && (
        <div className="grid lg:grid-cols-12 gap-6">
          <div ref={playerWrapRef} className="lg:col-span-8 glass-crystal rounded-3xl overflow-hidden">
            {activeVideo ? (
              <>
                <YouTubePlayer
                  videoId={activeVideo.id}
                  title={activeVideo.title}
                  useNoCookie={useNoCookie}
                  onSwitchMode={(nextMode) => setUseNoCookie(nextMode)}
                  onOpenPopup={openFloatingMiniPlayer}
                />
                <div className="p-4 flex flex-wrap items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-sm text-white truncate">{activeVideo.title}</h3>
                    <span className="text-[11px] text-slate-400">{activeVideo.channel}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <button
                      onClick={() => setUseNoCookie((v) => !v)}
                      className="px-2.5 py-1.5 rounded-xl glass-pill text-[10px] font-mono text-slate-300 hover:text-white"
                      title="Switch between Standard and Privacy YouTube embed"
                    >
                      {useNoCookie ? 'Mode: No-Cookie' : 'Mode: Standard'}
                    </button>
                    <button
                      onClick={() => openFloatingMiniPlayer(activeVideo.id)}
                      className="px-2.5 py-1.5 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-200 hover:bg-rose-500/30 text-xs font-bold flex items-center gap-1"
                      title="Open clean Floating Mini-Window player"
                    >
                      <PictureInPicture2 className="w-3.5 h-3.5" />
                      <span>Mini Window</span>
                    </button>
                    <button
                      onClick={() => stepQueue(-1)}
                      className="p-2 rounded-xl glass-pill hover:bg-white/10 text-slate-200"
                      title="Previous Video"
                    >
                      <SkipBack className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => stepQueue(1)}
                      className="p-2 rounded-xl glass-pill hover:bg-white/10 text-slate-200"
                      title="Next Video"
                    >
                      <SkipForward className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        saveMediaVideo(activeVideo);
                        SoundFX.success();
                        setYtStatus(`⭐ "${activeVideo.title}" Saved Vault-এ যুক্ত হয়েছে!`);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold flex items-center gap-1"
                    >
                      <Bookmark className="w-3.5 h-3.5" />
                      <span>Save</span>
                    </button>
                    <a
                      href={`https://www.youtube.com/watch?v=${activeVideo.id}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 rounded-xl glass-pill text-xs text-cyan-300"
                    >
                      YouTube ↗
                    </a>
                  </div>
                </div>
              </>
            ) : (
              <div className="aspect-video flex flex-col items-center justify-center p-8 text-center text-xs text-slate-400">
                <Youtube className="w-10 h-10 text-rose-500/60 mb-2" />
                <p>উপরে <b>Search</b> করুন, <b>Refresh Feed</b> চাপুন অথবা <b>Subscriptions</b> দেখুন।</p>
              </div>
            )}
          </div>

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
      )}

      {/* Video Library Grid */}
      {ytTab !== 'audio' && visibleVideos.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-bold text-white">
              {ytTab === 'saved' ? 'Saved Vault' : integrationFeeds.youtubeChannelTitle || 'Video Feed'} ({visibleVideos.length})
            </span>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {visibleVideos.map((v) => (
              <div
                key={v.id}
                onClick={() => selectVideoAndScroll(v)}
                className={`glass-crystal rounded-2xl overflow-hidden cursor-pointer border transition ${
                  activeVideo?.id === v.id ? 'border-rose-500 ring-1 ring-rose-500/40' : 'border-white/10 hover:border-white/25'
                }`}
              >
                <img src={v.thumbnail} alt={v.title} className="w-full h-36 object-cover" />
                <div className="p-3 flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-white line-clamp-2">{v.title}</h4>
                    <span className="text-[10px] text-slate-400 block mt-0.5">{v.channel}</span>
                  </div>
                  {savedVideos.some((sv) => sv.id === v.id) && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeMediaVideo(v.id);
                      }}
                      className="p-1 rounded bg-white/5 hover:bg-rose-600 text-slate-400 hover:text-white shrink-0"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
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

        <div className="p-3 rounded-xl bg-indigo-950/30 border border-indigo-500/20 flex items-start gap-2 text-[11px] text-slate-400">
          <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
          <span>
            অফিসিয়াল YouTube এম্বেড প্লেয়ারে ডিস্ট্র্যাকশন ছাড়া সব ভিডিও দেখা যায় (কপিরাইট/YouTube নীতিমালার কারণে YouTube স্ট্রিম সরাসরি ডাউনলোড বা অ্যাড-বাইপাস করা যায় না); তবে উপরের Audio Vault-এ নিজের MP3/পডকাস্ট ব্যাকগ্রাউন্ডে শোনা ও ডাউনলোড করা যায়।
          </span>
        </div>
      </div>
    </div>
  );
}
