/**
 * WhatsApp Integration Service
 * Supports:
 * 1) Official Meta WhatsApp Cloud API (real automated HTTPS dispatch)
 * 2) External Automation Webhook (OpenClaw / n8n)
 * 3) Direct wa.me 1-click composer URL for personal mobile numbers
 */

export function sanitizePhoneForWhatsApp(rawPhone) {
  const digits = String(rawPhone || '').replace(/\D/g, '');
  if (!digits) return '';
  // Normalize Bangladeshi local 017... -> 88017...
  if (digits.startsWith('01') && digits.length === 11) {
    return `88${digits}`;
  }
  return digits;
}

export function buildWhatsAppLink(phone, message = '') {
  const clean = sanitizePhoneForWhatsApp(phone);
  const encoded = encodeURIComponent(message || '');
  return clean ? `https://wa.me/${clean}?text=${encoded}` : `https://wa.me/?text=${encoded}`;
}

export async function sendWhatsAppMessage({
  toPhone,
  message,
  cloudToken,
  phoneNumberId,
  webhookUrl
}) {
  const recipient = sanitizePhoneForWhatsApp(toPhone);
  if (!recipient || !message) {
    return { success: false, mode: 'none', message: 'ফোন নম্বর এবং মেসেজ টেক্সট প্রয়োজন।' };
  }

  // Option 1: Official Meta WhatsApp Cloud API
  if (cloudToken && phoneNumberId) {
    try {
      const resp = await fetch(
        `https://graph.facebook.com/v20.0/${encodeURIComponent(phoneNumberId)}/messages`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${cloudToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            to: recipient,
            type: 'text',
            text: { body: message }
          })
        }
      );
      const data = await resp.json();
      if (!resp.ok) {
        return {
          success: false,
          mode: 'meta_cloud',
          message: data?.error?.message || `Meta API HTTP ${resp.status}`
        };
      }
      return {
        success: true,
        mode: 'meta_cloud',
        messageId: data?.messages?.[0]?.id,
        message: 'WhatsApp Cloud API-এর মাধ্যমে মেসেজ পাঠানো হয়েছে!'
      };
    } catch (err) {
      return { success: false, mode: 'meta_cloud', message: err.message };
    }
  }

  // Option 2: External n8n / OpenClaw Webhook Bridge
  if (webhookUrl && !webhookUrl.includes('yourdomain.com')) {
    try {
      const resp = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channel: 'whatsapp',
          to: recipient,
          message,
          timestamp: new Date().toISOString()
        })
      });
      if (!resp.ok) {
        return { success: false, mode: 'webhook', message: `Webhook HTTP ${resp.status}` };
      }
      return {
        success: true,
        mode: 'webhook',
        message: 'OpenClaw/n8n WhatsApp Webhook ট্রিগার হয়েছে!'
      };
    } catch (err) {
      return { success: false, mode: 'webhook', message: err.message };
    }
  }

  // Option 3: Open wa.me direct chat window
  const link = buildWhatsAppLink(recipient, message);
  return {
    success: true,
    mode: 'deep_link',
    url: link,
    message: 'সরাসরি WhatsApp চ্যাট লিংক তৈরি হয়েছে (Send করতে ট্যাপ করুন)।'
  };
}
