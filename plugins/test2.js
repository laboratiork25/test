import axios from 'axios';

let handler = async (m, { conn, text, command }) => {
  let imageUrl;

  // Se c'è una immagine citata (media)
  if (m.quoted?.mimetype?.startsWith('image')) {
    let media = await m.quoted.download();
    let res = await conn.uploadToImgur ? await conn.uploadToImgur(media) : null;

    if (!res?.link) return m.reply('❌ Impossibile caricare l’immagine. Riprova.');
    imageUrl = res.link;
  }

  // Se l'input è un link immagine diretto
  else if (text && text.startsWith('http') && /\.(jpg|jpeg|png|webp)$/i.test(text)) {
    imageUrl = text;
  }

  // Se c'è un utente taggato, prendi la sua immagine profilo
  else if (m.mentionedJid?.length) {
    try {
      imageUrl = await conn.profilePictureUrl(m.mentionedJid[0], 'image');
    } catch {
      imageUrl = 'https://telegra.ph/file/6880771a42bad09dd6087.jpg';
    }
  }

  // Se niente viene fornito, usa la tua stessa foto profilo
  else {
    try {
      imageUrl = await conn.profilePictureUrl(m.sender, 'image');
    } catch {
      imageUrl = 'https://telegra.ph/file/6880771a42bad09dd6087.jpg';
    }
  }

  // Chiamata API
  const apiUrl = `https://api.siputzx.my.id/api/image2ghibli?image=${encodeURIComponent(imageUrl)}`;

  try {
    const response = await axios.get(apiUrl, { responseType: 'arraybuffer' });
    const buffer = Buffer.from(response.data, 'binary');

    await conn.sendMessage(m.chat, {
      image: buffer,
      caption: '✨ Ecco la tua immagine in stile Ghibli!',
    }, { quoted: m });
  } catch (err) {
    console.error(err);
    await m.reply('❌ Errore nella generazione. L’immagine potrebbe essere incompatibile o l’API non ha risposto.');
  }
};

handler.help = ['ghibli <@utente | link immagine | rispondi a immagine>'];
handler.tags = ['ai', 'fun', 'tools'];
handler.command = /^ghibli$/i;

export default handler;