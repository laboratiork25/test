import axios from 'axios';

let handler = async (m, { conn, text, usedPrefix, command }) => {
  console.log('Input ricevuto:', text);

  if (!text || !/^https?:\/\/[^\s]+tiktok\.com/.test(text)) {
    return m.reply(`❗ Usa il comando così:\n${usedPrefix + command} <link TikTok valido>\n\n📌 Esempio:\n${usedPrefix + command} https://vt.tiktok.com/ZSjXNEnbC/`);
  }

  const apiUrl = `https://api.siputzx.my.id/api/tiktok?url=${encodeURIComponent(text.trim())}`;
  console.log('API chiamata:', apiUrl);

  try {
    const response = await axios.get(apiUrl);
    console.log('Risposta API completa:', response.data);

    const data = response.data;
    if (!data || !data.result) {
      console.log('❌ Risultato mancante o struttura inattesa');
      return m.reply('⚠️ Nessun risultato valido trovato. Forse il link è scaduto o l’API ha cambiato formato.');
    }

    const result = data.result;
    const videoUrl = result.video;
    console.log('Video URL:', videoUrl);

    if (!videoUrl) {
      console.log('❌ Campo video mancante nella risposta');
      return m.reply('⚠️ Il video non è disponibile o non può essere scaricato.');
    }

    const caption = [
      '🎵 TikTok scaricato con successo!',
      `👤 Autore: ${result.author?.nickname || 'Sconosciuto'}`,
      `📝 Descrizione: ${result.desc || 'Nessuna'}`,
      `🔗 ${text.trim()}`
    ].join('\n');

    return conn.sendMessage(m.chat, {
      video: { url: videoUrl },
      caption
    }, { quoted: m });

  } catch (e) {
    console.error('🔴 Errore axios:', e.response?.status, e.response?.data || e.message);
    return m.reply('❌ Errore durante il download del video. Verifica che il link sia corretto o riprova più tardi.');
  }
};

handler.help = ['tiktok <url>'];
handler.tags = ['downloader'];
handler.command = /^tiktok$/i;

export default handler;