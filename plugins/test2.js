import axios from 'axios';

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text || !/^https?:\/\/(www\.)?(vt|tiktok)\.com/.test(text)) {
    return m.reply(`❗ Usa il comando così:\n${usedPrefix + command} <link TikTok>\n\n📌 Esempio:\n${usedPrefix + command} https://vt.tiktok.com/ZSjXNEnbC/`);
  }

  const api = `https://api.siputzx.my.id/api/tiktok?url=${encodeURIComponent(text)}`;

  try {
    const { data } = await axios.get(api);

    if (!data || !data.result) {
      return m.reply('⚠️ Nessun risultato valido trovato. Forse il link è scaduto.');
    }

    const result = data.result;
    const video = result.video;

    if (!video) {
      return m.reply('⚠️ Il video non è disponibile o non può essere scaricato.');
    }

    await conn.sendMessage(m.chat, {
      video: { url: video },
      caption: `🎵 *TikTok scaricato con successo!*\n👤 Autore: ${result.author?.nickname || 'Sconosciuto'}\n📝 Descrizione: ${result.desc || 'Nessuna'}\n\n🔗 ${text}`
    }, { quoted: m });

  } catch (e) {
    console.log('[TikTok API Error]', e?.response?.data || e.message || e);
    return m.reply('❌ Errore durante il download del video. Verifica che il link sia corretto o riprova più tardi.');
  }
};

handler.help = ['tiktok <url>'];
handler.tags = ['downloader'];
handler.command = /^tiktok$/i;

export default handler;