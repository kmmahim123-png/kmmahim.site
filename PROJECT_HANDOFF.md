# KM Mahim Life OS & Portfolio — Coding Agent Handoff Reference

> **Purpose:** This file documents all external infrastructure, MCP endpoints, Supabase database details, Google OAuth setup, deployment rules, browser storage keys, Android APK build workarounds, and non-obvious architectural constraints that are **not obvious from reading application source files alone**.  
> **Security Note:** No private/secret API tokens (such as `.mcp.json` Stitch API keys, Gemini/OpenAI/Claude API keys, or Meta WhatsApp tokens) are stored inside this document so it is safe to share with coding agents. Look inside the local gitignored files noted below when running locally.

---

## 1. Live URLs, Repository & Hosting
- **Primary Custom Domain:** `https://kmmahim.site` (and `https://www.kmmahim.site`)
- **Vercel Default URL:** `https://kmmahim-site.vercel.app`
- **GitHub Repository (`origin`):** `https://github.com/kmmahim123-png/kmmahim.site.git`
- **Active Branch:** `main` (Every push to `origin/main` automatically triggers a Vercel production build and deployment via `npm run build` / `vite build`).
- **Two-Layer Site Architecture:**
  - **Layer 1 (Public):** Apple/editorial porcelain-white (`#fbfbfd`) portfolio, live `"NOW"` status synced from Supabase (`primary_os`), projects/services, and public contact form.
  - **Layer 2 (Private OS):** Dark glass command OS behind PIN gate. Unlock via **triple-clicking the header logo** or pressing **`Ctrl + Shift + L`** (default seed PIN: `"2526"`, overridable inside OS profile synced to cloud).

---

## 2. MCP (Model Context Protocol) Servers & Plugin Setup

### A. Workspace-Local `.mcp.json` (Gitignored — Used for THIS Project)
Located at `<repo-root>/.mcp.json` (excluded from git by `.gitignore`):
1. **`stitch`** (Google Stitch UI Design Generator)
   - URL: `https://stitch.googleapis.com/mcp`
   - Auth: `X-Goog-Api-Key` HTTP header (kept locally in gitignored `.mcp.json`).
2. **`supabase`** (**THE CORRECT Supabase Project for this website**)
   - URL: `https://mcp.supabase.com/mcp?project_ref=uqupazmycylfcqvsajnx&features=docs%2Caccount%2Cdatabase%2Cdebugging%2Cdevelopment%2Cfunctions%2Cbranching%2Cfeedback%2Cnotebooks`

### B. CRITICAL Global MCP Mismatch Warning
- Check `C:\Users\kmmah\.gemini\antigravity\mcp_config.json` before invoking a global `supabase` MCP tool:
  - The user's **global** `mcp_config.json` points to a **different** Supabase project ref: `skqtcsoovtnxxbhtracp`.
  - **This website uses `uqupazmycylfcqvsajnx`** (never `skqtcsoovtnxxbhtracp`).
- Installed Antigravity plugins under `C:\Users\kmmah\.gemini\config\plugins\`: `supabase`, `android-cli-plugin`. (Plugin-hosted `supabase_mcp` also requires interactive OAuth sign-in in the host UI if used.)

---

## 3. Supabase Database, Keys & Sync Architecture

### A. Project Credentials (Client/Publishable Only)
Configured in `.env`, `.env.example`, and fallback constants inside `src/services/supabaseClient.js`:
- **Project Ref:** `uqupazmycylfcqvsajnx`
- **API URL (`VITE_SUPABASE_URL` / `SUPABASE_URL`):** `https://uqupazmycylfcqvsajnx.supabase.co`
- **JWKS URL (`SUPABASE_JWKS_URL`):** `https://uqupazmycylfcqvsajnx.supabase.co/auth/v1/.well-known/jwks.json`
- **Publishable Key (`VITE_SUPABASE_ANON_KEY` / `SUPABASE_PUBLISHABLE_KEY`):** `sb_publishable_1zG_J9GBQqccT5G9Rm9DuQ_mZEfrnaD`
- **Note:** No Supabase `service_role` secret key exists in the repo; client writes rely on PostgreSQL RLS policies.

### B. Required Tables, Policies & Realtime SQL
Full bootstrap SQL is maintained in `src/components/common/SupabaseSyncModal.jsx` (run once in SQL Editor for `uqupazmycylfcqvsajnx`):
```sql
CREATE TABLE IF NOT EXISTS public.mahim_life_os (
  slot text PRIMARY KEY,
  owner text DEFAULT 'KM Mahim',
  data jsonb NOT NULL,
  updated_at timestamptz DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.mahim_life_os ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public all access" ON public.mahim_life_os;
CREATE POLICY "Allow public all access"
ON public.mahim_life_os FOR ALL USING (true) WITH CHECK (true);

ALTER PUBLICATION supabase_realtime ADD TABLE public.mahim_life_os;

CREATE TABLE IF NOT EXISTS public.public_inquiries (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  sender text NOT NULL,
  email text NOT NULL,
  service text,
  meeting_date text,
  text text,
  created_at timestamptz DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.public_inquiries ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public inquiry access" ON public.public_inquiries;
CREATE POLICY "Allow public inquiry access"
ON public.public_inquiries FOR ALL USING (true) WITH CHECK (true);
```
- **`mahim_life_os` active row:** `slot = 'primary_os'` stores the single JSONB state blob synced in realtime (`postgres_changes` channel `life_os_primary_os`) across Laptop and Mobile/APK.
- **`public_inquiries`:** Isolates visitor form submissions so public visitors never mutate `primary_os`.

### C. Sync & Merge Safeguards (`src/context/OSContext.jsx`)
- `hasUntouchedDemoOnly()` detects a fresh browser still containing only seed IDs (`t1`, `t2`, `d1`, `dep1`, `g1`, `g2`, `i1`) and pulls cloud data instead of overwriting cloud state.
- `smartMergeOSData()` merges Mobile and Web state by ID (`mergeArraysById`), strips demo seeds when merging real data, preserves non-default wallets, and combines `logs`/`dailyLogs`.

---

## 4. Browser Storage Keys & Secret Isolation
Do **not** push device-local API keys into `data` (`primary_os` cloud row). Secrets live strictly on the user's device:

| Storage | Key Name | Contents |
| :--- | :--- | :--- |
| `localStorage` | `KM_MAHIM_LIFE_OS_V1` | Full serialized Private OS state (`data`) |
| `localStorage` | `KM_MAHIM_SECRET_CONFIG_V1` | `{ aiProvider, aiModel, aiApiKey, rememberDays, googleClientId, youtubeApiKey, metaWaToken, metaWaPhoneId, whatsappWebhookUrl }` |
| `localStorage` | `KM_MAHIM_UNLOCK_UNTIL` | Timestamp (ms) until PIN stays unlocked across page reloads (default `rememberDays = 7`; cleared on **Lock OS**) |
| `localStorage` | `KM_MAHIM_ACTIVE_LAYER` | `'public'` \| `'private'` (restored across reloads if `UNLOCK_UNTIL` is valid) |
| `localStorage` | `KM_MAHIM_LAST_CLOUD_SYNC` | ISO timestamp of last Supabase sync |
| `localStorage` | `KM_MAHIM_PENDING_UPLOAD` | Offline pending upload flag (`'1'`) |
| `sessionStorage` | `KM_MAHIM_GOOGLE_TOKEN` | Ephemeral Google OAuth `{ accessToken, expiresAt, scope }` |

---

## 5. Google Cloud OAuth 2.0, Workspace APIs & YouTube Player Quirks

### A. Google OAuth 2.0 (Pure Client-Side GIS Flow)
- Implemented in `src/services/googleIntegrations.js` using `https://accounts.google.com/gsi/client` (`initTokenClient`, no backend proxy).
- **Google Cloud Console Context:**
  - Owner email / OAuth Test User: `kmmahim123@gmail.com`
  - Observed Google Cloud Project numeric ID prefix from owner's OAuth setup: `441305538762-...` (Owner pastes their full Web OAuth Client ID into the UI `Connect` tab -> saved to `KM_MAHIM_SECRET_CONFIG_V1.googleClientId`).
  - **Authorized JavaScript Origins required in Google Cloud Console:**
    - `https://kmmahim.site`
    - `https://www.kmmahim.site`
    - `https://kmmahim-site.vercel.app`
    - `http://localhost:5173`
    - `http://127.0.0.1:5173`
  - **OAuth Scopes (`GOOGLE_SCOPES`):**
    - `https://www.googleapis.com/auth/gmail.readonly`
    - `https://www.googleapis.com/auth/gmail.send`
    - `https://www.googleapis.com/auth/calendar`
    - `https://www.googleapis.com/auth/contacts.readonly`
    - `https://www.googleapis.com/auth/youtube.readonly`

### B. YouTube Data API & Embedded Player Rules
1. **OAuth Bearer Priority (`ytApiGet`):** When `googleSession.accessToken` exists, calls **must NOT append `?key=`** alongside the Bearer header — sending a referrer-restricted `youtubeApiKey` breaks authenticated calls in browser CORS/restrictions. Only append `?key=` for unauthenticated/public fallback.
2. **YouTube Embed (`src/components/common/YouTubePlayer.jsx` + `index.html`):**
   - `index.html` sets global `<meta name="referrer" content="strict-origin-when-cross-origin" />`.
   - Uses official `YT.Player` (`https://www.youtube.com/iframe_api`) passing `enablejsapi: 1`, `origin: window.location.origin`, `widget_referrer: window.location.href`, and enforces `referrerpolicy="strict-origin-when-cross-origin"` on the mounted `iframe`.
   - **DOM Mount Quirk:** `YT.Player` replaces the target node with an `<iframe>`. `YouTubePlayer` imperatively creates a disposable child `<div>` inside `containerRef` so React unmount reconciliation never throws `removeChild` errors.
   - **Silent HTTP 403 Stall Handling:** When Chrome extensions (AdBlock/Privacy) or paused Google cookies cause `POST https://www.youtube.com/youtubei/v1/player` HTTP `403`, YouTube's embed stays stuck at player state `3` (Buffering) and **never fires `onError`**. `YouTubePlayer` detects both explicit `onError` (auto-retrying once in `www.youtube-nocookie.com`) and >4.5s state-`3` stalls, rendering a non-blocking recovery bar with a **Floating Mini-Player** button (`window.open(..., 'mahim_yt_mini', 'popup=yes,width=960,height=560')`).

---

## 6. AI Copilot & WhatsApp Automation
- **AI Engine (`src/services/aiEngine.js`):**
  - Client-direct calls using owner-supplied API key (`KM_MAHIM_SECRET_CONFIG_V1.aiApiKey`).
  - Supported providers & default models:
    - `gemini`: `gemini-2.5-flash`
    - `openai`: `gpt-4o-mini`
    - `anthropic`: `claude-3-7-sonnet-latest` (uses `'anthropic-dangerous-direct-browser-access': 'true'`)
    - `groq`: `llama-3.3-70b-versatile`
    - `openrouter`: `google/gemini-2.5-flash`
  - Prompt instructs strict JSON response `{ reply, actions, artifact }` supporting **24 OS tool actions** (Finance, Debts, Meals, Namaz, Gym, Habits, Goals, Second Brain Notes/Flashcards, Custom Sections, Public Profile NOW status/Projects, Gmail, Calendar, Contacts, WhatsApp, YouTube, Tab Navigation).
- **WhatsApp (`src/services/whatsappService.js`):**
  - Priority chain: (1) Meta WhatsApp Cloud API `v20.0` (`metaWaToken` + `metaWaPhoneId`), (2) External `OpenClaw`/`n8n` webhook (`whatsappWebhookUrl`), (3) Bangladeshi phone-normalized (`01... -> 8801...`) `https://wa.me/...` deep link.

---

## 7. Vercel, PWA Service Worker & Local Timezone Rules
- **`vercel.json`:**
  - `/kmmahim-life-os.apk` served with `Content-Type: application/vnd.android.package-archive`, `Content-Disposition: attachment; filename="kmmahim-life-os.apk"`, and `Cache-Control: no-cache, no-store, must-revalidate`.
  - `/sw.js` served with `no-cache, no-store, must-revalidate`.
  - SPA fallback rewrites all routes to `/index.html` while excluding `assets/`, `icons/`, `screenshots/`, `kmmahim-life-os.apk`, `sw.js`, `manifest.json`.
- **Service Worker (`public/sw.js` & `index.html`):**
  - Current cache key: **`CACHE_NAME = 'km-mahim-os-v7'`** (always bump this version on UI/asset updates).
  - Bypasses cross-origin APIs (Supabase, Google, YouTube), `localhost`/`127.0.0.1`, and `*.apk` files; uses Network-First for navigations and same-origin assets.
  - **Native WebView Rule:** `index.html` skips SW registration and unregisters any existing SWs when `window.Capacitor !== undefined`, `protocol === 'capacitor:'`, or `hostname === 'localhost'`.
- **Date & Timezone (`src/utils/dateUtils.js`):**
  - Never use `new Date().toISOString().slice(0, 10)` for Bangladesh (`UTC+6`) daily keys — early morning 00:00–05:59 AM local time maps to the previous UTC date! Always use `getLocalDateStr()`.
  - Weekly goals reset anchored to **Friday** (`getGoalCycleKeys()` in `OSContext.jsx`).
- **Bundle Splitting (`vite.config.js`):**
  - `base: './'` (required for Capacitor WebView relative asset resolution).
  - Manual Rollup chunks: `vendor-react`, `vendor-motion`, `vendor-supabase`, plus React `lazy()` loading on Layer 2 sub-modules.

---

## 8. Android APK (Capacitor) Build Pipeline & Windows/OneDrive Gotchas
- **Capacitor Config (`capacitor.config.json`):** `appId: "com.kmmahim.os"`, `appName: "KM Mahim OS"`, `webDir: "dist"`, `server.androidScheme: "https"`.
- **Gradle Config (`android/app/build.gradle`, `android/variables.gradle`):**
  - `minSdkVersion: 24`, `compileSdkVersion: 36`, `targetSdkVersion: 36`, `JavaVersion.VERSION_17`.
- **Local Machine Paths (Windows):**
  - Android SDK (`android/local.properties`, gitignored): `sdk.dir=C:\\Users\\kmmah\\AppData\\Local\\Android\\Sdk`
  - JDK 17 Required for Gradle: `C:\Users\kmmah\AppData\Local\Android\Sdk\jdk-17`
- **CRITICAL Gotchas Before Rebuilding APK:**
  1. **Exclude Old APK from `assets/`:** `.gitignore` ignores `*.apk` except `!public/*.apk`. Vite copies `public/kmmahim-life-os.apk` into `dist/` during `vite build`. You MUST delete `dist/*.apk` and `android/app/src/main/assets/public/*.apk` before `npx cap sync android`, or the APK will bundle itself recursively and double in size!
  2. **Windows OneDrive Cloud Reparse Points:** Because this repo sits inside `C:\Users\kmmah\OneDrive\Documents\`, `npx cap sync android` leaves OneDrive reparse-tag files under `android/app/src/main/assets/` that can break Gradle (`mergeDebugAssets`). Rewrite files in-place with Node before invoking Gradle.
  3. **Canonical APK File Served on Vercel:** Always copy the final APK to **`public/kmmahim-life-os.apk`** (the repo root `kmmahim-life-os.apk` is an older untracked/gitignored artifact and is NOT served by Vercel).

- **Verified Working PowerShell Build Sequence:**
```powershell
npm run build
Remove-Item -Force -ErrorAction SilentlyContinue dist\*.apk, android\app\src\main\assets\public\*.apk
npx cap sync android
node -e "const fs=require('fs'),p=require('path');function fix(d){for(const e of fs.readdirSync(d,{withFileTypes:true})){const fp=p.join(d,e.name);if(e.isDirectory())fix(fp);else{const buf=fs.readFileSync(fp);fs.unlinkSync(fp);fs.writeFileSync(fp,buf);}}}fix('android/app/src/main/assets');"
$env:JAVA_HOME='C:\Users\kmmah\AppData\Local\Android\Sdk\jdk-17'
Push-Location android; .\gradlew.bat assembleDebug; $rc=$LASTEXITCODE; Pop-Location
Copy-Item -Force android\app\build\outputs\apk\debug\app-debug.apk public\kmmahim-life-os.apk
```
