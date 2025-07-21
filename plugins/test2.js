import axios from 'axios';

let handler = async (m, { conn, usedPrefix, command }) => {
  try {
    const response = await axios.get('https://api.siputzx.my.id/api/tools/voices');
    if (!response.data || !Array.isArray(response.data)) {
      return m.reply('❌ Risposta non valida dall\'API.');
    }

    let voices = response.data;
    let message = `🗣️ Voci disponibili per TTS:\n\n`;
    voices.forEach((voice, i) => {
      message += `${i + 1}. ${voice}\n`;
    });

    m.reply(message.trim());
  } catch (e) {
    console.error(e);
    m.reply('❌ Errore durante il recupero delle voci.');
  }
};

handler.help = ['voices'];
handler.tags = ['tools'];
handler.command = /^voices$/i;

export default handler;