import axios from 'axios';

let handler = async (m, { conn, command, usedPrefix }) => {
  const mentions = m.mentionedJid || [];

  let user1, user2;

  if (command === 'crush') {
    if (mentions.length !== 1) {
      return m.reply(`❗ Usa il comando così:\n${usedPrefix + command} @utente`);
    }
    user1 = m.sender;
    user2 = mentions[0];
  } else if (command === 'ship') {
    if (mentions.length < 2) {
      return m.reply(`❗ Usa il comando così:\n${usedPrefix + command} @utente1 @utente2`);
    }
    user1 = mentions[0];
    user2 = mentions[1];
  }

  // Verifica JID validi
  if (!user1 || !user2 || typeof user1 !== 'string' || typeof user2 !== 'string') {
    return m.reply('❌ Errore: utenti non validi.');
  }

  // Ottieni nomi con fallback
  let name1 = 'Utente 1';
  let name2 = 'Utente 2';
  try { name1 = await conn.getName(user1); } catch {}
  try { name2 = await conn.getName(user2); } catch {}

  // Ottieni avatar o fallback
  let avatar1, avatar2;
  try {
    avatar1 = await conn.profilePictureUrl(user1, 'image');
  } catch {
    avatar1 = 'https://telegra.ph/file/6880771a42bad09dd6087.jpg';
  }

  try {
    avatar2 = await conn.profilePictureUrl(user2, 'image');
  } catch {
    avatar2 = 'https://telegra.ph/file/6880771a42bad09dd6087.jpg';
  }

  // Sfondo e percentuale
  const background = 'https://i.ibb.co/4YBNyvP/images-76.jpg';
  const percent = Math.floor(Math.random() * 101);

  // Chiamata API
  const apiUrl = `https://api.siputzx.my.id/api/canvas/ship?avatar1=${encodeURIComponent(avatar1)}&avatar2=${encodeURIComponent(avatar2)}&background=${encodeURIComponent(background)}&persen=${percent}`;

  try {
    const response = await axios.get(apiUrl, { responseType: 'arraybuffer' });
    const buffer = Buffer.from(response.data, 'binary');

    let caption = '';
    if (command === 'crush') {
      caption = `💘 *@${user1.split('@')[0]}* ❤️ *@${user2.split('@')[0]}*\n🔮 Compatibilità: *${percent}%*`;
    } else {
      caption = `💘 *@${user1.split('@')[0]}* ❤️ *@${user2.split('@')[0]}*\n🔮 Compatibilità: *${percent}%*`;
    }

    await conn.sendMessage(m.chat, {
      image: buffer,
      caption,
      mentions: [user1, user2]
    }, { quoted: m });

  } catch (err) {
    console.error(err);
    return m.reply('❌ Errore durante la generazione dell’immagine.');
  }
};

handler.help = ['ship @utente1 @utente2', 'crush @utente'];
handler.tags = ['fun'];
handler.command = /^(ship|crush)$/i;

export default handler;