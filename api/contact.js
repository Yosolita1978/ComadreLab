export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email, need, timeline, message, business, website } = req.body;

  const text =
    `📩 New Contact Form\n\n` +
    `Name: ${name || 'N/A'}\n` +
    `Email: ${email || 'N/A'}\n` +
    `Need: ${need || 'N/A'}\n` +
    `Timeline: ${timeline || 'N/A'}\n` +
    `Message: ${message || 'N/A'}\n` +
    `Business: ${business || 'N/A'}\n` +
    `Website: ${website || 'N/A'}`;

  const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
  const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

  try {
    const telegramRes = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: CHAT_ID, text: text }),
      }
    );

    if (!telegramRes.ok) {
      throw new Error('Telegram API error');
    }

    await fetch('https://formspree.io/f/mnjzlpzn', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ name, email, need, timeline, message, business, website }),
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to send notification' });
  }
}
