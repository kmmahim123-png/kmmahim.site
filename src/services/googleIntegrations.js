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

// --- YOUTUBE ACCOUNT VIDEOS / PLAYLISTS ---
export async function fetchYouTubeVideos({ accessToken, apiKey, playlistId = '', maxResults = 16 }) {
  let targetPlaylistId = playlistId?.trim() || '';

  const ytFetch = async (endpoint) => {
    const sep = endpoint.includes('?') ? '&' : '?';
    const finalUrl =
      accessToken && !apiKey
        ? endpoint
        : apiKey
        ? `${endpoint}${sep}key=${encodeURIComponent(apiKey)}`
        : endpoint;

    const headers = accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
    const resp = await fetch(finalUrl, { headers });
    const json = await resp.json().catch(() => ({}));
    if (!resp.ok) {
      throw new Error(json?.error?.message || `YouTube API HTTP ${resp.status}`);
    }
    return json;
  };

  let channelTitle = '';

  if (!targetPlaylistId) {
    if (!accessToken && !apiKey) {
      throw new Error('Google অ্যাকাউন্ট কানেক্ট করুন অথবা YouTube Data API Key দিন।');
    }
    if (accessToken) {
      const ch = await ytFetch(
        'https://www.googleapis.com/youtube/v3/channels?part=snippet,contentDetails&mine=true'
      );
      const first = ch.items?.[0];
      if (!first) {
        throw new Error('এই Google অ্যাকাউন্টে কোনো YouTube চ্যানেল পাওয়া যায়নি।');
      }
      channelTitle = first.snippet?.title || 'My YouTube Channel';
      targetPlaylistId = first.contentDetails?.relatedPlaylists?.uploads || '';
    } else {
      throw new Error('API Key ব্যবহার করলে একটি Playlist ID অথবা Channel ID দিন।');
    }
  }

  const plResp = await ytFetch(
    `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&playlistId=${encodeURIComponent(
      targetPlaylistId
    )}&maxResults=${maxResults}`
  );

  const videos = (plResp.items || [])
    .map((item) => {
      const vidId = item.contentDetails?.videoId || item.snippet?.resourceId?.videoId;
      if (!vidId) return null;
      return {
        id: vidId,
        title: item.snippet?.title || 'Untitled Video',
        channel: item.snippet?.videoOwnerChannelTitle || channelTitle || 'YouTube',
        publishedAt: item.snippet?.publishedAt?.slice(0, 10) || '',
        thumbnail:
          item.snippet?.thumbnails?.high?.url ||
          item.snippet?.thumbnails?.medium?.url ||
          `https://i.ytimg.com/vi/${vidId}/hqdefault.jpg`
      };
    })
    .filter(Boolean);

  return { channelTitle, playlistId: targetPlaylistId, videos };
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
