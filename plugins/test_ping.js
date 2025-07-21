import axios from 'axios';
const tempmails = {}; // salviamo gli indirizzi temporanei per ID utente

const rapidHeaders = {
  'x-rapidapi-host': 'tempmail-so.p.rapidapi.com',
  'x-rapidapi-key': 'INSERISCI_LA_TUA_API_KEY' // ← INSERISCI LA TUA API KEY QUI
};

const handler = async (m, { text, args, command, conn }) => {
  const userId = m.sender;

  if (command === 'createmail') {
    try {
      const res = await axios.get('https://tempmail-so.p.rapidapi.com/new', { headers: rapidHeaders });
      const email = res.data.email;
      tempmails[userId] = email;
      await m.reply(`📧 Email temporanea generata:\n\n*${email}*\n\nUsa *.mailinbox* per controllare i messaggi.`);
    } catch (err) {
      console.error(err);
      await m.reply('❌ Errore durante la creazione dell’email temporanea.');
    }
  }

  if (command === 'mailinbox') {
    const email = tempmails[userId];
    if (!email) return m.reply('⚠️ Nessuna email temporanea trovata. Usa prima *.createmail*');

    try {
      const res = await axios.get('https://tempmail-so.p.rapidapi.com/emails', {
        headers: rapidHeaders,
        params: { email }
      });

      const mails = res.data;
      if (mails.length === 0) return m.reply('📭 Nessun messaggio trovato.');

      let msg = `📨 Messaggi in arrivo per *${email}*:\n\n`;
      mails.slice(0, 5).forEach((mail, i) => {
        msg += `🔹 *${i + 1}. Da:* ${mail.from.address}\n📌 *Oggetto:* ${mail.subject}\n📅 ${mail.date}\n\n`;
      });

      await m.reply(msg.trim());
    } catch (err) {
      console.error(err);
      await m.reply('❌ Errore durante il recupero dei messaggi.');
    }
  }

  if (command === 'mailreset') {
    if (!tempmails[userId]) return m.reply('❗ Non hai una email temporanea da resettare.');
    delete tempmails[userId];
    await m.reply('♻️ Email temporanea resettata. Usa *.createmail* per crearne una nuova.');
  }
};

handler.help = ['createmail', 'mailinbox', 'mailreset'];
handler.tags = ['tools'];
handler.command = /^(createmail|mailinbox|mailreset)$/i;

export default handler;