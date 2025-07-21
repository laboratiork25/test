import axios from 'axios';

global.tempEmails = global.tempEmails || {}; // archivio email utenti

const headers = {
  'x-rapidapi-host': 'tempmail-so.p.rapidapi.com',
  // Inserisci la tua chiave se ne richiede una (altrimenti rimuovi Authorization)
  // 'x-rapidapi-key': 'YOUR_RAPIDAPI_KEY'
};

// 📩 .creaemail
let creaemail = async (m, { conn }) => {
  try {
    const { data } = await axios.get('https://tempmail-so.p.rapidapi.com/request/domains', { headers });
    const domain = data[0] || 'tempmail.wtf'; // default fallback
    const username = `user_${Math.random().toString(36).substring(7)}`;
    const email = `${username}@${domain}`;

    const { data: inboxData } = await axios.get(`https://tempmail-so.p.rapidapi.com/request/mail/id/${username}`, { headers });

    global.tempEmails[m.sender] = {
      email,
      id: username
    };

    m.reply(`📧 Email temporanea creata:\n\n✉️ *${email}*\n\nUsa *.emailinbox* per controllare i messaggi.`);
  } catch (e) {
    console.error(e);
    m.reply('❌ Errore nella creazione dell\'email temporanea.');
  }
};

// 📬 .emailinbox
let emailinbox = async (m, { conn }) => {
  const userData = global.tempEmails[m.sender];
  if (!userData) return m.reply('❗ Prima devi creare un\'email con *.creaemail*');

  try {
    const { data } = await axios.get(`https://tempmail-so.p.rapidapi.com/request/mail/id/${userData.id}`, { headers });

    if (!data.length) return m.reply(`📭 Nessun messaggio ricevuto su *${userData.email}*`);

    let msg = `📥 Messaggi ricevuti su *${userData.email}*:\n\n`;
    for (let i = 0; i < Math.min(5, data.length); i++) {
      msg += `📌 *Mittente:* ${data[i].mail_from}\n📄 *Oggetto:* ${data[i].mail_subject}\n🕒 *Data:* ${data[i].mail_date}\n\n`;
    }

    m.reply(msg.trim());
  } catch (e) {
    console.error(e);
    m.reply('❌ Errore nel recupero dei messaggi.');
  }
};

// ℹ️ .emailinfo
let emailinfo = (m) => {
  const userData = global.tempEmails[m.sender];
  if (!userData) return m.reply('⚠️ Nessuna email trovata. Usa *.creaemail* per crearne una.');

  m.reply(`📧 Email associata:\n\n✉️ *${userData.email}*\n🆔 *ID inbox:* ${userData.id}`);
};

creaemail.command = /^creaemail$/i;
emailinbox.command = /^emailinbox$/i;
emailinfo.command = /^emailinfo$/i;

export default [creaemail, emailinbox, emailinfo];