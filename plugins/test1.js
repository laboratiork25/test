import axios from 'axios';
import { downloadMediaMessage } from '@whiskeysockets/baileys'; // o il tuo metodo per ottenere la immagine profilo

let handler = async (m, { conn, usedPrefix, command, text }) => {
  const taggedUser = m.mentionedJid?.[0] || m.quoted?.sender || m.sender;

  try {
    const ppUrl = await conn.profilePictureUrl(taggedUser, 'image').catch(() => null);
    if (!ppUrl) return m.reply('❌ Impossibile ottenere la foto profilo dell\'utente.');

    const response = await axios.get(`https://api.siputzx.my.id/api/canvas/gay?image=${encodeURIComponent(ppUrl)}`, {
      responseType: 'arraybuffer',
    });

    const buffer = Buffer.from(response.data, 'binary');

    await conn.sendMessage(m.chat, {
      image: buffer,
      caption: `🌈 Wow! Ecco il risultato gay di <@${taggedUser.split('@')[0]}>`,
      mentions: [taggedUser],
    }, { quoted: m });
  } catch (e) {
    console.error(e);
    await m.reply('⚠️ Si è verificato un errore. Riprova più tardi.');
  }
};

handler.help = ['gay @utente'];
handler.tags = ['fun'];
handler.command = /^gayy$/i;

export default handler;