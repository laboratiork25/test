import axios from 'axios';

let handler = async (m, { conn, usedPrefix, command, text }) => {
  let user = m.mentionedJid?.[0] || m.quoted?.sender || m.sender;

  let ppUrl;
  try {
    ppUrl = await conn.profilePictureUrl(user, 'image');
  } catch {
    ppUrl = 'https://telegra.ph/file/6880771a42bad09dd6087.jpg'; // fallback profilo
  }

  if (!ppUrl || !ppUrl.startsWith('http')) {
    return m.reply('❌ Impossibile ottenere la foto profilo dell’utente.');
  }

  try {
    // URL dell'API con immagine come parametro GET
    const apiUrl = `https://api.siputzx.my.id/api/canvas/gay?image=${encodeURIComponent(ppUrl)}`;

    const res = await axios.get(apiUrl, {
      responseType: 'arraybuffer',
    });

    const imageBuffer = Buffer.from(res.data, 'binary');

    await conn.sendMessage(m.chat, {
      image: imageBuffer,
      caption: `🌈 Percentuale gay di @${user.split('@')[0]}`,
      mentions: [user],
    }, { quoted: m });

  } catch (err) {
    console.error(err);
    return m.reply('❌ Errore: l’API ha rifiutato la richiesta. Potrebbe essere un problema con l’immagine.');
  }
};

handler.help = ['gay @user'];
handler.tags = ['fun'];
handler.command = /^gayy$/i;

export default handler;