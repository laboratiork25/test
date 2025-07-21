import axios from 'axios';

global.tempEmails = global.tempEmails || {};

const headers = {
  'x-rapidapi-host': 'tempmail-so.p.rapidapi.com',
  // 'x-rapidapi-key': 'LA_TUA_API_KEY' // opzionale
};

const handler = async (m, { conn, command }) => {
  const sender = m.sender;
  const userData = global.tempEmails[sender];

  switch (command) {
    case 'creaemail': {
      try {
        const { data } = await axios.get('https://tempmail-so.p.rapidapi.com/request/domains', { headers });
        const domain = data[0] || 'tempmail.wtf';
        const username = `user_${Math.random().toString(36).substring(7)}`;
        const email = `${username}@${domain}`;

        global.tempEmails[sender] = {
          email,
          id: username
        };

        return m.reply(`📧 Email temporanea creata:\n\n✉️ *${email}*\n\nUsa *.emailinbox* per vedere i messaggi.`);
      } catch (e) {
        console.error(e);
        return m.reply('❌ Errore nella creazione dell\'email temporanea.');
      }
    }

    case 'emailinfo': {
      if (!userData) return m.reply('⚠️ Nessuna email salvata. Usa *.creaemail*');
      return m.reply(`📧 Email salvata:\n\n✉️ *${userData.email}*\n🆔 *ID inbox:* ${userData.id}`);
    }

    case 'emailinbox': {
      if (!userData) return m.reply('❗ Prima crea una email con *.creaemail*');
      try {
        const { data } = await axios.get(`https://tempmail-so.p.rapidapi.com/request/mail/id/${userData.id}`, { headers });

        if (!data.length) return m.reply(`📭 Nessun messaggio su *${userData.email}*`);

        let msg = `📥 Messaggi per *${userData.email}*:\n\n`;
        for (let i = 0; i < Math.min(5, data.length); i++) {
          msg += `📌 *Mittente:* ${data[i].mail_from}\n📄 *Oggetto:* ${data[i].mail_subject}\n🕒 *Data:* ${data[i].mail_date}\n\n`;
        }

        return m.reply(msg.trim());
      } catch (e) {
        console.error(e);
        return m.reply('❌ Errore nel recupero dei messaggi.');
      }
    }

    default:
      return m.reply('❌ Comando non riconosciuto.');
  }
};

handler.command = /^(creaemail|emailinfo|emailinbox)$/i;
export default handler;