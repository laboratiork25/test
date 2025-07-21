import axios from 'axios';

let handler = async (m, { conn, text, usedPrefix, command }) => {
  // Prendi immagine da testo o da messaggio citato o da profilo taggato
  let url = text || (m.quoted && m.quoted.image ? await conn.getFile(m.quoted) : null);

  // Se c’è un tag e non testo, prova a prendere la foto profilo del taggato
  if (!url && m.mentionedJid && m.mentionedJid.length > 0) {
    try {
      url = await conn.profilePictureUrl(m.mentionedJid[0], 'image');
    } catch {
      return m.reply('❌ Impossibile ottenere la foto profilo del taggato.');
    }
  }

  if (!url) return m.reply(`❗ Usa: ${usedPrefix + command} <url immagine> oppure tagga un utente con ${usedPrefix + command} @utente`);

  try {
    // Chiamata API con URL immagine
    const response = await axios.get('https://api.siputzx.my.id/api/m/facepalm', {
      params: { image: url }
    });

    if (!response.data || !response.data.result) return m.reply('❌ Nessun risultato dall’API.');

    // Invia immagine risultante
    await conn.sendMessage(m.chat, { image: { url: response.data.result }, caption: '🤦‍♂️ Facepalm!' }, { quoted: m });
  } catch (e) {
    console.error(e);
    m.reply('❌ Errore nel chiamare l’API facepalm.');
  }
};

handler.help = ['facepalm <url/tag>'];
handler.tags = ['image', 'fun'];
handler.command = /^facepalm$/i;

export default handler;