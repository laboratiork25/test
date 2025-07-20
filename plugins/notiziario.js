const sources = [
  { name: 'ANSA', url: 'https://www.ansa.it/sito/ansait_rss.xml' },
  { name: 'Repubblica', url: 'https://www.repubblica.it/rss/homepage/rss2.0.xml' },
  { name: 'La Stampa', url: 'https://www.lastampa.it/rss/homepage.xml' },
  { name: 'BBC World', url: 'http://feeds.bbci.co.uk/news/world/rss.xml' },
  { name: 'CNN', url: 'http://rss.cnn.com/rss/edition_world.rss' },
  { name: 'Reuters', url: 'http://feeds.reuters.com/reuters/topNews' },
  { name: 'Il Sole 24 Ore', url: 'https://www.ilsole24ore.com/rss/notizie.xml' }
];

async function getNews() {
  let news = [];

  for (const src of sources) {
    try {
      const res = await fetch(src.url);
      const xml = await res.text();
      const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].slice(0, 1); // solo la prima news per ogni fonte

      for (const item of items) {
        const titleMatch = item[1].match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/) || item[1].match(/<title>(.*?)<\/title>/);
        const linkMatch = item[1].match(/<link>(.*?)<\/link>/);

        if (titleMatch && linkMatch) {
          news.push({
            title: titleMatch[1],
            link: linkMatch[1],
            source: src.name
          });
        }
      }
    } catch (e) {
      console.error(`Errore su ${src.name}:`, e.message);
    }
  }

  if (!news.length) return null;

  let text = `📰 *Notiziario Giornaliero*\n\n`;
  for (const n of news) {
    text += `• *${n.title}*\n  _${n.source}_\n  🔗 ${n.link}\n\n`;
  }

  return text.trim();
}

let handler = async (m, { conn }) => {
  const text = await getNews();
  if (!text) return m.reply('📭 Nessuna notizia trovata.');
  await conn.sendMessage(m.chat, {
    text,
    footer: '🗞️ Notizie da fonti ufficiali',
    headerType: 1
  }, { quoted: m });
};

handler.command = /^notiziario$/i;
handler.tags = ['news'];
handler.help = ['notiziario'];

export default handler;