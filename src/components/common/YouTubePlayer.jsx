import React, { useEffect, useRef, useState } from 'react';
import { AlertTriangle, PictureInPicture2, RefreshCw } from 'lucide-react';

let ytApiPromise = null;

/**
 * Loads the official YouTube IFrame Player API script once per session.
 */
function ensureYouTubeIframeApi() {
  if (typeof window === 'undefined') return Promise.reject(new Error('No window'));
  if (window.YT?.Player) return Promise.resolve(window.YT);
  if (ytApiPromise) return ytApiPromise;

  ytApiPromise = new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      ytApiPromise = null;
      reject(new Error('YouTube IFrame API load timeout'));
    }, 6000);

    const prevReady = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      clearTimeout(timeout);
      if (typeof prevReady === 'function') {
        try { prevReady(); } catch {}
      }
      resolve(window.YT);
    };

    const existing = document.querySelector('script[src="https://www.youtube.com/iframe_api"]');
    if (!existing) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      tag.async = true;
      tag.onerror = () => {
        clearTimeout(timeout);
        ytApiPromise = null;
        reject(new Error('YouTube IFrame API blocked'));
      };
      document.head.appendChild(tag);
    }
  });

  return ytApiPromise;
}

function getErrorDescription(code) {
  if (code === 101 || code === 150) {
    return 'চ্যানেল মালিক এই ভিডিওটির সাইটের ভেতরে Embed প্লেব্যাক বন্ধ রেখেছেন। Floating Mini-Player-এ সরাসরি চলবে।';
  }
  if (code === 100) {
    return 'ভিডিওটি পাওয়া যায়নি অথবা প্রাইভেট করা হয়েছে।';
  }
  return 'ব্রাউজারের AdBlock/Privacy এক্সটেনশন বা Google কুকির কারণে YouTube Embed আটকে গেছে — নিচের Mini Window বা No-Cookie চেষ্টা করুন।';
}

/**
 * YouTube embed player backed by the official YT.Player API with strict referrer policy,
 * automatic No-Cookie retry on embed errors, and a non-blocking stall recovery bar.
 */
export default function YouTubePlayer({
  videoId,
  title,
  useNoCookie,
  onSwitchMode,
  onOpenPopup
}) {
  const containerRef = useRef(null);
  const autoRetriedRef = useRef({});
  const onSwitchModeRef = useRef(onSwitchMode);
  onSwitchModeRef.current = onSwitchMode;
  const [fallbackRawIframe, setFallbackRawIframe] = useState(false);
  const [issue, setIssue] = useState(null);

  useEffect(() => {
    const hostEl = containerRef.current;
    if (!hostEl || !videoId) return undefined;

    let cancelled = false;
    let playerInstance = null;
    let stallTimer = null;

    setIssue(null);
    setFallbackRawIframe(false);
    hostEl.innerHTML = '';

    const applyIframePolicies = () => {
      const iframe = hostEl.querySelector('iframe');
      if (!iframe) return;
      iframe.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
      iframe.setAttribute(
        'allow',
        'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'
      );
      iframe.setAttribute('allowfullscreen', '');
      iframe.className = 'w-full h-full border-0';
      if (title) iframe.title = title;
    };

    const mountTarget = document.createElement('div');
    mountTarget.className = 'w-full h-full';
    hostEl.appendChild(mountTarget);

    ensureYouTubeIframeApi()
      .then((YT) => {
        if (cancelled || !YT?.Player) return;
        const embedHost = useNoCookie
          ? 'https://www.youtube-nocookie.com'
          : 'https://www.youtube.com';

        playerInstance = new YT.Player(mountTarget, {
          width: '100%',
          height: '100%',
          host: embedHost,
          videoId,
          playerVars: {
            rel: 0,
            playsinline: 1,
            enablejsapi: 1,
            origin: window.location.origin,
            widget_referrer: window.location.href
          },
          events: {
            onReady: () => {
              if (!cancelled) applyIframePolicies();
            },
            onStateChange: (ev) => {
              if (cancelled) return;
              if (ev.data === 3) {
                clearTimeout(stallTimer);
                stallTimer = setTimeout(() => {
                  if (!cancelled) {
                    setIssue({
                      code: 'stall',
                      message:
                        'ভিডিওটি লোড/প্লে হতে আটকে আছে ("An error occurred" হলে ব্রাউজার এক্সটেনশন বা কুকি Embed ব্লক করছে)। নিচের Mini Window-তে নির্বিঘ্নে চলবে।'
                    });
                  }
                }, 4500);
              } else if (ev.data === 1 || ev.data === 2 || ev.data === 0) {
                clearTimeout(stallTimer);
                setIssue(null);
              }
            },
            onError: (ev) => {
              if (cancelled) return;
              clearTimeout(stallTimer);
              const code = ev?.data;
              if (!useNoCookie && !autoRetriedRef.current[videoId] && code !== 100) {
                autoRetriedRef.current[videoId] = true;
                onSwitchModeRef.current?.(true);
                return;
              }
              setIssue({ code, message: getErrorDescription(code) });
            }
          }
        });

        applyIframePolicies();
      })
      .catch(() => {
        if (!cancelled) setFallbackRawIframe(true);
      });

    return () => {
      cancelled = true;
      clearTimeout(stallTimer);
      try {
        playerInstance?.destroy?.();
      } catch {}
      if (hostEl) hostEl.innerHTML = '';
    };
  }, [videoId, useNoCookie]);

  return (
    <div>
      <div className="aspect-video bg-black">
        {fallbackRawIframe ? (
          <iframe
            key={`${videoId}-${useNoCookie ? 'nc' : 'std'}-raw`}
            title={title || 'YouTube Video'}
            src={`https://${useNoCookie ? 'www.youtube-nocookie.com' : 'www.youtube.com'}/embed/${videoId}?rel=0&playsinline=1&enablejsapi=1&origin=${encodeURIComponent(window.location.origin)}`}
            className="w-full h-full border-0"
            referrerPolicy="strict-origin-when-cross-origin"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        ) : (
          <div ref={containerRef} className="w-full h-full" />
        )}
      </div>

      {issue && (
        <div className="px-4 py-2.5 bg-amber-500/10 border-t border-amber-500/25 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-start gap-2 text-amber-200 min-w-0 flex-1">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <span>{issue.message}</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => onSwitchMode?.(!useNoCookie)}
              className="px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-semibold flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" />
              <span>{useNoCookie ? 'Standard Try' : 'No-Cookie Try'}</span>
            </button>
            <button
              type="button"
              onClick={() => onOpenPopup?.(videoId)}
              className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold flex items-center gap-1.5"
            >
              <PictureInPicture2 className="w-3.5 h-3.5" />
              <span>Mini Window-তে চালান</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
