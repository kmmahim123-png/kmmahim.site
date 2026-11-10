/**
 * Multi-Provider AI Copilot Engine for KM Mahim Life OS & Second Brain
 * User enters ANY single API Key (Gemini / OpenAI / Anthropic / Groq / OpenRouter)
 * and gets full structured OS Tool-Calling + Claude-style Artifact Canvas.
 */

import { getLocalDateStr } from '../utils/dateUtils.js';

export const AI_PROVIDERS = {
  gemini: {
    id: 'gemini',
    label: 'Google Gemini',
    defaultModel: 'gemini-2.5-flash',
    hint: 'aistudio.google.com থেকে ফ্রি API Key পাওয়া যায় (AIza...)'
  },
  openai: {
    id: 'openai',
    label: 'OpenAI (GPT-4o)',
    defaultModel: 'gpt-4o-mini',
    hint: 'platform.openai.com (sk-...)'
  },
  anthropic: {
    id: 'anthropic',
    label: 'Anthropic Claude',
    defaultModel: 'claude-3-7-sonnet-latest',
    hint: 'console.anthropic.com (sk-ant-...)'
  },
  groq: {
    id: 'groq',
    label: 'Groq (Ultra-Fast Free Llama)',
    defaultModel: 'llama-3.3-70b-versatile',
    hint: 'console.groq.com থেকে ফ্রি API Key (gsk_...)'
  },
  openrouter: {
    id: 'openrouter',
    label: 'OpenRouter (All Models)',
    defaultModel: 'google/gemini-2.5-flash',
    hint: 'openrouter.ai (sk-or-...)'
  }
};

export function buildOSSystemPrompt(data, integrationState = {}) {
  const today = getLocalDateStr();
  const wallets = data.finance?.wallets || {};
  const totalBal = Object.values(wallets).reduce((s, v) => s + Number(v || 0), 0);
  const recentTx = (data.finance?.transactions || []).slice(0, 8);
  const pendingGoals = (data.goals || []).filter((g) => !g.completed).slice(0, 12);
  const todayMeals = data.meals?.logs?.[today] || { breakfast: 0, lunch: 0, dinner: 0, guest: 0 };
  const todayHabits = data.habits?.dailyLogs?.[today] || {};
  const customHabits = data.habits?.customHabits || [];
  const noteTitles = (data.secondBrain?.notes || []).map((n) => `${n.title} [${n.folder}]`).slice(0, 20);
  const customSecTitles = (data.customSections || []).map((s) => `${s.id}: ${s.title} (${s.type})`);

  return `You are "Mahim AI", the personal OS Copilot & Second Brain assistant for KM Mahim (Entrepreneur, Web Architect, Sports Science student at University of Rajshahi).
Current Local Date: ${today}

=== LIVE OS CONTEXT ===
- Wallets Total: ৳${totalBal} (cash: ${wallets.cash || 0}, bkash: ${wallets.bkash || 0}, nagad: ${wallets.nagad || 0}, bank: ${wallets.bank || 0})
- Recent Transactions: ${JSON.stringify(recentTx.map((t) => ({ type: t.type, amt: t.amount, cat: t.category, note: t.note, date: t.date })))}
- Debts: ${JSON.stringify((data.finance?.debts || []).filter((d) => !d.settled))}
- Meals Today (${today}): ${JSON.stringify(todayMeals)}, Rate/Meal: ৳${data.meals?.ratePerMeal || 55}
- Habits Today: Namaz=${JSON.stringify(todayHabits.namaz || {})}, Gym=${Boolean(todayHabits.gym?.done)}, CustomHabits=${JSON.stringify(customHabits.map((c) => ({ id: c.id, label: c.label })))}
- Pending Goals: ${JSON.stringify(pendingGoals.map((g) => ({ id: g.id, title: g.title, tf: g.timeframe })))}
- Second Brain Notes: ${JSON.stringify(noteTitles)}
- Custom Sections: ${JSON.stringify(customSecTitles)}
- Connected Services: GoogleOAuth=${Boolean(integrationState.googleAccessToken)}, WhatsAppCloud=${Boolean(integrationState.whatsappConfigured)}, Webhook=${Boolean(data.agents?.webhookUrl && !data.agents.webhookUrl.includes('yourdomain.com'))}

=== AVAILABLE ACTIONS (TOOLS) ===
Return actions ONLY when the user asks you to record, modify, create, trigger, or fetch something:
1. add_transaction: { "type": "out"|"in", "amount": number, "wallet": "cash"|"bkash"|"nagad"|"bank", "category": string, "note": string, "date": "YYYY-MM-DD" }
2. set_wallet_balance: { "wallet": "cash"|"bkash"|"nagad"|"bank", "amount": number }
3. add_debt: { "person": string, "type": "receivable"|"payable", "amount": number, "note": string }
4. log_meal: { "date": "YYYY-MM-DD", "breakfast": number, "lunch": number, "dinner": number, "guest": number }
5. add_meal_deposit: { "amount": number, "note": string, "deductFromWallet": "cash"|"bkash"|"nagad"|"bank"|"none" }
6. toggle_namaz: { "date": "YYYY-MM-DD", "waqt": "fajr"|"zuhr"|"asr"|"maghrib"|"isha", "done": boolean }
7. log_gym: { "date": "YYYY-MM-DD", "done": boolean, "muscle": string, "weightLog": string }
8. add_custom_habit: { "label": string, "emoji": string }
9. add_goal: { "title": string, "timeframe": "daily"|"weekly"|"monthly"|"yearly", "category": string, "deadline": string }
10. complete_goal: { "titleContains": string }
11. create_note: { "title": string, "folder": "Projects"|"Areas"|"Resources"|"Archives"|"Ideas", "tags": string[], "content": string }
12. add_flashcard: { "front": string, "back": string, "topic": string }
13. create_custom_section: { "title": string, "description": string, "type": "checklist"|"tracker"|"youtube_feed"|"notes"|"links"|"webhook", "items": [{ "label": string, "value": string }] }
14. update_public_now: { "nowStatus": string }
15. add_project: { "title": string, "category": string, "description": string, "metrics": string }
16. gmail_list: { "query": string, "maxResults": number }
17. gmail_send: { "to": string, "subject": string, "body": string }
18. calendar_list: { "maxResults": number }
19. calendar_create: { "summary": string, "description": string, "startIso": "YYYY-MM-DDTHH:mm:ss+06:00" }
20. contacts_search: { "query": string }
21. whatsapp_send: { "toPhone": string, "message": string }
22. youtube_fetch: { "playlistId": string }
23. navigate_tab: { "tab": "overview"|"ai_desk"|"second_brain"|"connections"|"media"|"custom"|"finance"|"meals"|"habits"|"goals"|"social"|"agents"|"cms" }

=== RESPONSE FORMAT (STRICT JSON ONLY) ===
Reply ONLY with valid JSON (no markdown wrapping outside JSON):
{
  "reply": "Clear, helpful response in the user's language (Bengali, Banglish, or English).",
  "actions": [
    { "tool": "...", "args": { ... }, "summary": "Human-readable 1-line summary of action" }
  ],
  "artifact": null OR {
    "title": "Artifact Title",
    "type": "markdown",
    "content": "Detailed markdown report, plan, table, proposal, code, or study guide"
  }
}
Important: Only claim an external action (Gmail/Calendar/Contacts/WhatsApp/YouTube) succeeded after the tool executes; for "gmail_send" or "whatsapp_send" or "calendar_create", include them in actions so the user can approve/run them safely.`;
}

function parseAIJsonResponse(rawText) {
  const trimmed = String(rawText || '').trim();
  if (!trimmed) {
    return { reply: 'কোনো উত্তর পাওয়া যায়নি।', actions: [], artifact: null };
  }
  const stripped = trimmed
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

  try {
    const parsed = JSON.parse(stripped);
    return {
      reply: parsed.reply || trimmed,
      actions: Array.isArray(parsed.actions) ? parsed.actions : [],
      artifact: parsed.artifact || null
    };
  } catch {
    const firstBrace = stripped.indexOf('{');
    const lastBrace = stripped.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace > firstBrace) {
      try {
        const sliced = JSON.parse(stripped.slice(firstBrace, lastBrace + 1));
        return {
          reply: sliced.reply || stripped,
          actions: Array.isArray(sliced.actions) ? sliced.actions : [],
          artifact: sliced.artifact || null
        };
      } catch {
        // Fallback to plain text response
      }
    }
    return { reply: trimmed, actions: [], artifact: null };
  }
}

export async function runAICopilotPrompt({
  provider = 'gemini',
  apiKey,
  model,
  messages = [],
  systemPrompt
}) {
  const cleanKey = String(apiKey || '').trim();
  if (!cleanKey) {
    throw new Error('প্রথমে আপনার AI API Key বসান (Gemini, OpenAI, Claude বা Groq)।');
  }

  const chosenModel = (model || AI_PROVIDERS[provider]?.defaultModel || '').trim();

  if (provider === 'gemini') {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
      chosenModel
    )}:generateContent?key=${encodeURIComponent(cleanKey)}`;

    const contents = messages.map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: String(m.content || '') }]
    }));

    const resp = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents,
        generationConfig: {
          temperature: 0.35,
          responseMimeType: 'application/json'
        }
      })
    });
    const json = await resp.json().catch(() => ({}));
    if (!resp.ok) {
      throw new Error(json?.error?.message || `Gemini HTTP ${resp.status}`);
    }
    const text = json?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    return parseAIJsonResponse(text);
  }

  if (provider === 'anthropic') {
    const resp = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': cleanKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: chosenModel,
        max_tokens: 2048,
        system: systemPrompt,
        messages: messages.map((m) => ({
          role: m.role === 'assistant' ? 'assistant' : 'user',
          content: String(m.content || '')
        }))
      })
    });
    const json = await resp.json().catch(() => ({}));
    if (!resp.ok) {
      throw new Error(json?.error?.message || `Claude HTTP ${resp.status}`);
    }
    const text = json?.content?.[0]?.text || '';
    return parseAIJsonResponse(text);
  }

  // OpenAI, Groq, OpenRouter (all share standard Chat Completions API)
  const endpoint =
    provider === 'groq'
      ? 'https://api.groq.com/openai/v1/chat/completions'
      : provider === 'openrouter'
      ? 'https://openrouter.ai/api/v1/chat/completions'
      : 'https://api.openai.com/v1/chat/completions';

  const resp = await fetch(endpoint, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${cleanKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: chosenModel,
      temperature: 0.35,
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages.map((m) => ({
          role: m.role === 'assistant' ? 'assistant' : 'user',
          content: String(m.content || '')
        }))
      ]
    })
  });
  const json = await resp.json().catch(() => ({}));
  if (!resp.ok) {
    throw new Error(json?.error?.message || `${provider} HTTP ${resp.status}`);
  }
  const text = json?.choices?.[0]?.message?.content || '';
  return parseAIJsonResponse(text);
}

/**
 * Simple helper for non-tool tasks (like Social Poster AI caption rewrite or note summarization)
 */
export async function generateSimpleAI({ provider, apiKey, model, instruction, input }) {
  const res = await runAICopilotPrompt({
    provider,
    apiKey,
    model,
    systemPrompt: `You are a concise writing assistant. Reply ONLY in JSON: {"reply": "your improved text", "actions": [], "artifact": null}`,
    messages: [{ role: 'user', content: `${instruction}\n\nInput:\n${input}` }]
  });
  return res.reply;
}
