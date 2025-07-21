import axios from 'axios';

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text || !text.includes('tiktok')) {
    return m.reply(`❗ Usa il comando così:\n${usedPrefix + command} <link TikTok>\n\n📌 Esempio:\n${usedPrefix + command} https://vt.tiktok.com/ZSjXNEnbC/`);
  }

  try {
    const apiUrl = `https://api.siputzx.my.id/api/tiktok?url=${encodeURIComponent(text.trim())}`;
    const { data } = await axios.get(apiUrl);

    if (!data || !data.result || !data.result.video) {
      return m.reply('❌ Nessun video trovato. Verifica il link.');
    }

    const videoUrl = data.result.video;
    const caption = `🎵 *TikTok scaricato con successo!*\n\n📥 Autore: ${data.result.author.nickname || 'Sconosciuto'}\n📃 Descrizione: ${data.result.desc || 'Nessuna'}\n\n🔗 Link originale:\n${text}`;

    await conn.sendMessage(m.chat, {
      video: { url: videoUrl },
      caption,
    }, { quoted: m });

  } catch (err) {
    console.error(err);
    return m.reply('❌ Errore durante il download. Verifica che il link sia corretto o riprova più tardi.');
  }
};

handler.help = ['tiktok <url>'];
handler.tags = ['downloader'];
handler.command = /^tiktok$/i;

export default handler;