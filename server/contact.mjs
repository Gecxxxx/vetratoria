const countries = ['dahab', 'vietnam', 'russia'];
const sports = ['', 'Виндсёрфинг', 'Вингфойл', 'Кайтсёрфинг', 'Сёрфинг', 'Детский'];
const reply = (status, body, origin = '') => Response.json(body, { status, headers: {
  'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex', 'X-Content-Type-Options': 'nosniff',
  ...(origin ? { 'Access-Control-Allow-Origin': origin, 'Vary': 'Origin' } : {})
} });
const hash = async (value) => Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value))), b => b.toString(16).padStart(2, '0')).join('');
const settings = (env, country) => ({ token: env.TELEGRAM_BOT_TOKEN, chat: env[`CONTACT_CHAT_${country.toUpperCase()}`] });
const configured = (env, country) => countries.includes(country) && env.CONTACT_DB && env.CONTACT_HASH_SECRET && settings(env, country).token && settings(env, country).chat;

export function validateContact(data, now = Date.now()) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('validation');
  const limits = { name: 100, contact: 200, country: 20, sport: 40, intent: 120, direction: 120, message: 1200, source: 300, pageUrl: 500, requestId: 36 };
  const value = {};
  for (const [key, max] of Object.entries(limits)) {
    if (data[key] !== undefined && typeof data[key] !== 'string') throw new Error('validation');
    value[key] = (data[key] || '').trim();
    if (value[key].length > max || /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(value[key])) throw new Error('validation');
  }
  if (!value.name || !countries.includes(value.country) || !sports.includes(value.sport)) throw new Error('validation');
  const contact = value.contact;
  if (!(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact) || /^@[A-Za-z0-9_]{5,32}$/.test(contact) || (/^\+?[\d\s().-]+$/.test(contact) && contact.replace(/\D/g, '').length >= 7 && contact.replace(/\D/g, '').length <= 15))) throw new Error('validation');
  if (!/^[0-9a-f-]{36}$/i.test(value.requestId) || !value.source.startsWith('/') || value.source.startsWith('//')) throw new Error('validation');
  const page = new URL(value.pageUrl);
  if (!['https:', 'http:'].includes(page.protocol) || page.pathname !== value.source || page.search || page.hash) throw new Error('validation');
  if (data.website || !Number.isFinite(data.startedAt) || now - data.startedAt < 2000 || now - data.startedAt > 86400000) throw new Error('spam');
  value.attribution = {};
  for (const key of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'yclid']) {
    const item = data.attribution?.[key];
    if (item !== undefined && (typeof item !== 'string' || item.length > 160)) throw new Error('validation');
    if (item) value.attribution[key] = item.replace(/[\r\n]/g, ' ');
  }
  return value;
}

// Only Telegram acknowledgement is acceptance. No personal data is stored in D1 or logs.
export async function handleContact(request, env, send = fetch) {
  const url = new URL(request.url);
  const origin = request.headers.get('Origin');
  const allowed = new Set([url.origin, ...(env.CONTACT_ALLOWED_ORIGINS || '').split(',').map(x => x.trim()).filter(Boolean)]);
  if (origin && !allowed.has(origin)) return reply(403, { ok: false, code: 'origin' });
  const cors = origin && allowed.has(origin) ? origin : '';
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: { 'Access-Control-Allow-Origin': cors, 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type', 'Vary': 'Origin', 'Cache-Control': 'no-store' } });
  if (request.method === 'GET') {
    const country = url.searchParams.get('country') || '';
    let available = Boolean(configured(env, country));
    if (available) {
      try { await env.CONTACT_DB.prepare('SELECT id FROM contact_requests LIMIT 1').first(); await env.CONTACT_DB.prepare('SELECT key FROM contact_limits LIMIT 1').first(); }
      catch { available = false; }
    }
    return reply(200, { available }, cors);
  }
  if (request.method !== 'POST') return reply(405, { ok: false, code: 'method' }, cors);
  if (!origin) return reply(403, { ok: false, code: 'origin' }, cors);
  if (!request.headers.get('Content-Type')?.startsWith('application/json')) return reply(415, { ok: false, code: 'content_type' }, cors);
  let data;
  try {
    const reader = request.body?.getReader();
    if (!reader) throw new Error('validation');
    let size = 0, body = '';
    const decoder = new TextDecoder();
    while (true) {
      const chunk = await reader.read();
      if (chunk.done) break;
      size += chunk.value.byteLength;
      if (size > 16384) { await reader.cancel(); return reply(413, { ok: false, code: 'size' }, cors); }
      body += decoder.decode(chunk.value, { stream: true });
    }
    data = validateContact(JSON.parse(body + decoder.decode()));
    if (!allowed.has(new URL(data.pageUrl).origin)) throw new Error('validation');
  } catch { return reply(400, { ok: false, code: 'validation' }, cors); }
  if (!configured(env, data.country)) return reply(503, { ok: false, code: 'unavailable' }, cors);
  const ip = request.headers.get('CF-Connecting-IP');
  if (!ip) return reply(503, { ok: false, code: 'unavailable' }, cors);
  const db = env.CONTACT_DB;
  const now = Date.now();
  const fingerprint = await hash(env.CONTACT_HASH_SECRET + JSON.stringify({ ...data, requestId: '' }));
  try {
    const previous = await db.prepare('SELECT fingerprint, status FROM contact_requests WHERE id = ?').bind(data.requestId).first();
    if (previous) {
      if (previous.fingerprint !== fingerprint) return reply(409, { ok: false, code: 'conflict' }, cors);
      return previous.status === 'accepted' ? reply(200, { ok: true, accepted: true, requestId: data.requestId }, cors) : reply(409, { ok: false, code: previous.status }, cors);
    }
    const key = await hash(`${env.CONTACT_HASH_SECRET}:${ip}:${Math.floor(now / 600000)}`);
    const limit = await db.prepare('INSERT INTO contact_limits (key, count, expires) VALUES (?, 1, ?) ON CONFLICT(key) DO UPDATE SET count = count + 1 RETURNING count').bind(key, now + 600000).first();
    if (limit.count > 5) return reply(429, { ok: false, code: 'rate_limit' }, cors);
    // UNIQUE fingerprint also prevents resending the same data under a fresh request ID.
    const claim = await db.prepare("INSERT OR IGNORE INTO contact_requests (id, fingerprint, status, created) VALUES (?, ?, 'pending', ?) RETURNING id").bind(data.requestId, fingerprint, now).first();
    if (!claim) return reply(409, { ok: false, code: 'duplicate' }, cors);
    const { token, chat } = settings(env, data.country);
    let result;
    try {
      const response = await send(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, signal: AbortSignal.timeout(12000),
        body: JSON.stringify({ chat_id: chat, disable_web_page_preview: true, text: [
          `Заявка ${data.requestId}`, `Страна: ${data.country}`, `Спорт: ${data.sport || 'не выбран'}`,
          `Запрос: ${data.intent}`, `Имя: ${data.name}`, `Контакт: ${data.contact}`, data.message,
          `Источник: ${data.pageUrl}`, ...Object.entries(data.attribution).map(([k,v]) => `${k}: ${v}`)
        ].filter(Boolean).join('\n') })
      });
      result = response.ok && (await response.json()).ok === true;
    } catch {
      // A network timeout can happen after delivery; never silently resend it.
      await db.prepare("UPDATE contact_requests SET status = 'uncertain' WHERE id = ?").bind(data.requestId).run();
      return reply(502, { ok: false, code: 'uncertain' }, cors);
    }
    if (!result) {
      await db.prepare('DELETE FROM contact_requests WHERE id = ?').bind(data.requestId).run();
      return reply(502, { ok: false, code: 'delivery' }, cors);
    }
    await db.prepare("UPDATE contact_requests SET status = 'accepted' WHERE id = ?").bind(data.requestId).run();
    // Bounded retention of hashes only. No request bodies, raw IPs, tokens or contacts.
    await db.prepare('DELETE FROM contact_limits WHERE expires < ?').bind(now).run();
    await db.prepare('DELETE FROM contact_requests WHERE created < ?').bind(now - 7 * 86400000).run();
    return reply(200, { ok: true, accepted: true, requestId: data.requestId }, cors);
  } catch { return reply(503, { ok: false, code: 'unavailable' }, cors); }
}
