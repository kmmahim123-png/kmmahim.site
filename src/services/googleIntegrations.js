/**
 * Real Google Workspace & YouTube Client Integrations (Pure Client OAuth 2.0 via GIS + REST APIs)
 * Works directly in browser/PWA without needing a custom backend once the owner supplies a Google OAuth Client ID.
 */

export const GOOGLE_SCOPES = [
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/contacts.readonly',
  'https://www.googleapis.com/auth/youtube.readonly'
].join(' ');

let gisPromise = null;

export function loadGoogleIdentityScript() {
  if (typeof window === 'undefined') return Promise.reject(new Error('Window unavailable'));
  if (window.google?.accounts?.oauth2) return Promise.resolve();
  if (gisPromise) return gisPromise;

  gisPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => {
      gisPromise = null;
      reject(new Error('Google Identity script লোড করা যায়নি (ইন্টারনেট বা এড-ব্লকার চেক করুন)।'));
    };
    document.head.appendChild(script);
  });
  return gisPromise;
}

export async function authorizeGoogleWorkspace(clientId, scopes = GOOGLE_SCOPES) {
  if (!clientId || !clientId.trim()) {
    throw new Error('প্রথমে আপনার Google OAuth Client ID সেট করুন।');
  }
  await loadGoogleIdentityScript();

  return new Promise((resolve, reject) => {
    try {
      const tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: clientId.trim(),
        scope: scopes,
        callback: (resp) => {
          if (resp.error) {
            reject(new Error(resp.error_description || resp.error));
            return;
          }
          const expiresAt = Date.now() + (Number(resp.expires_in || 3600) - 60) * 1000;
          resolve({
            accessToken: resp.access_token,
            expiresAt,
            scope: resp.scope
          });
        }
      });
      tokenClient.requestAccessToken({ prompt: 'consent' });
    } catch (err) {
      reject(err);
    }
  });
}

async function googleFetch(url, accessToken, options = {}) {
  if (!accessToken) throw new Error('Google অ্যাকাউন্ট কানেক্ট করা নেই।');
  const resp = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });
  const data = await resp.json().catch(() => ({}));
  if (!resp.ok) {
    throw new Error(data?.error?.message || `Google API HTTP ${resp.status}`);
  }
  return data;
}

// --- GMAIL ---
export async function listGmailMessages(accessToken, query = '', maxResults = 10) {
  const qParam = query ? `&q=${encodeURIComponent(query)}` : '';
  const list = await googleFetch(
    `https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=${maxResults}${qParam}`,
    accessToken
  );
  const messages = list.messages || [];
  const details = await Promise.all(
    messages.slice(0, maxResults).map((m) =>
      googleFetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${m.id}?format=metadata&metadataHeaders=From&metadataHeaders=Subject&metadataHeaders=Date`,
        accessToken
      )
    )
  );
  return details.map((d) => {
    const hdrs = d.payload?.headers || [];
    const getH = (name) => hdrs.find((h) => h.name.toLowerCase() === name.toLowerCase())?.value || '';
    return {
      id: d.id,
      threadId: d.threadId,
      from: getH('From'),
      subject: getH('Subject') || '(No Subject)',
      date: getH('Date'),
      snippet: d.snippet || '',
      unread: (d.labelIds || []).includes('UNREAD')
    };
  });
}

export async function sendGmailMessage(accessToken, { to, subject, body }) {
  if (!to || !body) throw new Error('প্রাপকের ইমেইল এবং মেসেজ বডি প্রয়োজন।');
  const rawLines = [
    `To: ${to}`,
    `Subject: =?utf-8?B?${btoa(unescape(encodeURIComponent(subject || 'Message from KM Mahim OS')))}?=`,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset="UTF-8"',
    '',
    body
  ];
  const rawStr = rawLines.join('\r\n');
  const base64Url = btoa(unescape(encodeURIComponent(rawStr)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  return googleFetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', accessToken, {
    method: 'POST',
    body: JSON.stringify({ raw: base64Url })
  });
}

// --- GOOGLE CALENDAR ---
export async function listCalendarEvents(accessToken, maxResults = 15) {
  const timeMin = new Date().toISOString();
  const data = await googleFetch(
    `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${encodeURIComponent(timeMin)}&maxResults=${maxResults}&singleEvents=true&orderBy=startTime`,
    accessToken
  );
  return (data.items || []).map((ev) => ({
    id: ev.id,
    summary: ev.summary || '(Untitled Event)',
    description: ev.description || '',
    location: ev.location || '',
    start: ev.start?.dateTime || ev.start?.date || '',
    end: ev.end?.dateTime || ev.end?.date || '',
    htmlLink: ev.htmlLink || ''
  }));
}

export async function createCalendarEvent(accessToken, { summary, description = '', startIso, endIso }) {
  if (!summary || !startIso) throw new Error('ইভেন্টের নাম ও সময় প্রয়োজন।');
  const startDt = new Date(startIso);
  const endDt = endIso ? new Date(endIso) : new Date(startDt.getTime() + 60 * 60 * 1000);
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Dhaka';

  return googleFetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', accessToken, {
    method: 'POST',
    body: JSON.stringify({
      summary,
      description,
      start: { dateTime: startDt.toISOString(), timeZone },
      end: { dateTime: endDt.toISOString(), timeZone }
    })
  });
}

// --- GOOGLE CONTACTS ---
export async function listGoogleContacts(accessToken, query = '', pageSize = 50) {
  const url = query
    ? `https://people.googleapis.com/v1/people:searchContacts?query=${encodeURIComponent(query)}&readMask=names,phoneNumbers,emailAddresses&pageSize=${pageSize}`
    : `https://people.googleapis.com/v1/people/me/connections?personFields=names,phoneNumbers,emailAddresses&pageSize=${pageSize}&sortOrder=FIRST_NAME_ASCENDING`;

  const data = await googleFetch(url, accessToken);
  const list = query ? (data.results || []).map((r) => r.person) : data.connections || [];

  return list.map((p, idx) => ({
    id: p.resourceName || `c_${idx}`,
    name: p.names?.[0]?.displayName || 'Unnamed Contact',
    phone: p.phoneNumbers?.[0]?.value || '',
    email: p.emailAddresses?.[0]?.value || ''
  }));
}

// --- YOUTUBE ACCOUNT VIDEOS, SUBSCRIPTIONS, SEARCH, LIKED & PLAYLISTS ---
async function ytApiGet(endpoint, { accessToken = '', apiKey = '' } = {}) {
  const cleanToken = String(accessToken || '').trim();
  const cleanKey = String(apiKey || '').trim();
  if (!cleanToken && !cleanKey) {
    throw new Error('প্রথমে Google অ্যাকাউন্ট কানেক্ট করুন অথবা একটি বৈধ YouTube API Key দিন।');
  }

  const sep = endpoint.includes('?') ? '&' : '?';
  // Prefer OAuth Bearer token alone when logged in so a mismatched/blank API key cannot interfere
  const finalUrl = cleanToken ? endpoint : `${endpoint}${sep}key=${encodeURIComponent(cleanKey)}`;
  const headers = cleanToken ? { Authorization: `Bearer ${cleanToken}` } : {};

  let resp;
  try {
    resp = await fetch(finalUrl, { headers, mode: 'cors' });
  } catch (netErr) {
    throw new Error(
      `YouTube API নেটওয়ার্ক ব্লক হয়েছে (${netErr.message})। ব্রাউজারে Ad-Blocker/Shield বন্ধ করে এবং Ctrl+Shift+R দিয়ে পেজ রিফ্রেশ করে আবার চেষ্টা করুন।`
    );
  }

  const json = await resp.json().catch(() => ({}));
  if (!resp.ok) {
    throw new Error(json?.error?.message || `YouTube API HTTP ${resp.status}`);
  }
  return json;
}

function mapPlaylistOrVideoItems(items = [], fallbackChannel = 'YouTube') {
  return (items || [])
    .map((item) => {
      const vidId =
        typeof item.id === 'string'
          ? item.id
          : item.id?.videoId || item.contentDetails?.videoId || item.snippet?.resourceId?.videoId;
      if (!vidId) return null;
      return {
        id: vidId,
        title: item.snippet?.title || 'Untitled Video',
        channel:
          item.snippet?.videoOwnerChannelTitle || item.snippet?.channelTitle || fallbackChannel,
        publishedAt: item.snippet?.publishedAt?.slice(0, 10) || '',
        thumbnail:
          item.snippet?.thumbnails?.high?.url ||
          item.snippet?.thumbnails?.medium?.url ||
          `https://i.ytimg.com/vi/${vidId}/hqdefault.jpg`
      };
    })
    .filter(Boolean);
}

export async function fetchYouTubeVideos({ accessToken, apiKey, playlistId = '', maxResults = 20 }) {
  let targetPlaylistId = playlistId?.trim() || '';
  let channelTitle = '';

  if (!targetPlaylistId) {
    if (!accessToken) {
      throw new Error('আপনার চ্যানেল দেখতে Google Connect করুন, অথবা নিচের Search / Playlist বক্স ব্যবহার করুন।');
    }
    const ch = await ytApiGet(
      'https://www.googleapis.com/youtube/v3/channels?part=snippet,contentDetails&mine=true',
      { accessToken, apiKey }
    );
    const first = ch.items?.[0];
    if (!first) {
      return { channelTitle: 'No Channel Uploads', playlistId: '', videos: [] };
    }
    channelTitle = first.snippet?.title || 'My YouTube Channel';
    targetPlaylistId = first.contentDetails?.relatedPlaylists?.uploads || '';
    if (!targetPlaylistId) {
      return { channelTitle, playlistId: '', videos: [] };
    }
  }

  const plResp = await ytApiGet(
    `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&playlistId=${encodeURIComponent(
      targetPlaylistId
    )}&maxResults=${maxResults}`,
    { accessToken, apiKey }
  );

  return {
    channelTitle,
    playlistId: targetPlaylistId,
    videos: mapPlaylistOrVideoItems(plResp.items, channelTitle || 'YouTube')
  };
}

export async function searchYouTubeVideos({ accessToken, apiKey, query, maxResults = 16 }) {
  const q = String(query || '').trim();
  if (!q) throw new Error('সার্চ করার জন্য কিছু লিখুন।');
  const json = await ytApiGet(
    `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=${maxResults}&q=${encodeURIComponent(q)}`,
    { accessToken, apiKey }
  );
  return mapPlaylistOrVideoItems(json.items);
}

export async function fetchTrendingYouTubeVideos({ accessToken, apiKey, regionCode = 'BD', maxResults = 16 }) {
  const json = await ytApiGet(
    `https://www.googleapis.com/youtube/v3/videos?part=snippet&chart=mostPopular&regionCode=${regionCode}&maxResults=${maxResults}`,
    { accessToken, apiKey }
  );
  return mapPlaylistOrVideoItems(json.items);
}

export async function fetchLikedYouTubeVideos({ accessToken, apiKey, maxResults = 20 }) {
  const json = await ytApiGet(
    `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&myRating=like&maxResults=${maxResults}`,
    { accessToken, apiKey }
  );
  return mapPlaylistOrVideoItems(json.items);
}

export async function fetchYouTubeSubscriptions({ accessToken, maxResults = 30 }) {
  const json = await ytApiGet(
    `https://www.googleapis.com/youtube/v3/subscriptions?part=snippet&mine=true&order=alphabetical&maxResults=${maxResults}`,
    { accessToken }
  );
  return (json.items || []).map((it) => ({
    channelId: it.snippet?.resourceId?.channelId || '',
    title: it.snippet?.title || 'Channel',
    thumbnail: it.snippet?.thumbnails?.default?.url || ''
  })).filter((c) => c.channelId);
}

export async function fetchMyYouTubePlaylists({ accessToken, maxResults = 25 }) {
  const json = await ytApiGet(
    `https://www.googleapis.com/youtube/v3/playlists?part=snippet,contentDetails&mine=true&maxResults=${maxResults}`,
    { accessToken }
  );
  return (json.items || []).map((pl) => ({
    id: pl.id,
    title: pl.snippet?.title || 'Playlist',
    count: pl.contentDetails?.itemCount || 0,
    thumbnail: pl.snippet?.thumbnails?.medium?.url || ''
  }));
}

export async function fetchChannelUploads({ accessToken, apiKey, channelId, maxResults = 12 }) {
  const ch = await ytApiGet(
    `https://www.googleapis.com/youtube/v3/channels?part=snippet,contentDetails&id=${encodeURIComponent(channelId)}`,
    { accessToken, apiKey }
  );
  const first = ch.items?.[0];
  const uploadsId = first?.contentDetails?.relatedPlaylists?.uploads;
  if (!uploadsId) return [];
  const res = await fetchYouTubeVideos({ accessToken, apiKey, playlistId: uploadsId, maxResults });
  return res.videos;
}

export async function fetchSubscribedFeed({ accessToken, apiKey, maxChannels = 6 }) {
  const subs = await fetchYouTubeSubscriptions({ accessToken, maxResults: maxChannels });
  const lists = await Promise.all(
    subs.slice(0, maxChannels).map((s) =>
      fetchChannelUploads({ accessToken, apiKey, channelId: s.channelId, maxResults: 3 }).catch(() => [])
    )
  );
  const combined = lists.flat();
  combined.sort((a, b) => (b.publishedAt || '').localeCompare(a.publishedAt || ''));
  return { subscriptions: subs, videos: combined };
}

export function extractYouTubeVideoId(input = '') {
  const str = String(input).trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(str)) return str;
  const match = str.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  return match ? match[1] : '';
}

export function extractYouTubePlaylistId(input = '') {
  const str = String(input).trim();
  const match = str.match(/[?&]list=([a-zA-Z0-9_-]+)/);
  if (match) return match[1];
  if (/^(PL|UU|LL|FL|OL)[a-zA-Z0-9_-]{10,}$/.test(str)) return str;
  return '';
}
