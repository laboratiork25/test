import fs from 'fs';

const sources = JSON.parse(fs.readFileSync('./rss_sources.json', 'utf8'));

async function fetchCategory(cat) {
  const feeds = sources[cat] || [];
  let news = [];

  for (const src of feeds.slice(0, 20)) {
    try {
      const xml = await fetch(src.url).then(r => r.text());
      const match = xml.match(/<item>([\s\S]*?)<\/item>/);
      const txt = match?.[1] || '';
      const title = ((txt.match(/<title><!\[CDATA\[(.*?)\]\]/) || txt.match(/<title>(.*?)<\/title>/)) || [])[1];
      const link = (txt.match(/<link>(.*?)<\/link>/) || [])[1];
      if (title && link) news.push({ title, link, source: src.name });
    } catch { }
  }

  if (!news.length) return null;

  let text = `📰 *Notizie — ${cat.toUpperCase()}*\n\n`;
  news.slice(0, 10).forEach(n => {
    text += `• *${n.title}*\n  _${n.source}_\n  🔗 ${n.link}\n\n`;
  });
  return text.trim();
}

let handler = async (m, { conn }) => {
  const buttons = Object.keys(sources).map(cat => ({
    buttonId: `.selectNews ${cat}`,
    buttonText: { displayText: cat.charAt(0).toUpperCase() + cat.slice(1) },
    type: 1
  }));

  await conn.sendMessage(m.chat, {
    text: '📡 Seleziona una categoria di notizie:',
    footer: 'Notiziario | .news per Sport • .notiziario per Generali',
    buttons,
    headerType: 1
  }, { quoted: m });
};
handler.command = /^selectNews$/i;
handler.help = ['selectNews'];
handler.tags = ['news'];

export default handler;