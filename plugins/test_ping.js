import axios from 'axios'

let emailStorage = {} // Memorizza email temporanee per ogni utente

const rapidApiKey = '8bb342ee47mshe971e098cd28310p140553jsn9c0337559f2d'

let handler = async (m, { command, conn, text }) => {
  const userId = m.sender

  if (command === 'emailtemp') {
    try {
      const res = await axios.get('https://tempmail-so.p.rapidapi.com/request/domains/', {
        headers: {
          'x-rapidapi-host': 'tempmail-so.p.rapidapi.com',
          'x-rapidapi-key': rapidApiKey
        }
      })

      const domains = res.data
      const username = `user${Math.floor(Math.random() * 100000)}`
      const email = `${username}${domains[0]}`

      emailStorage[userId] = email

      await m.reply(`📧 Email temporanea creata:\n\n👉 *${email}*\n\nUsa *.emailmsg* per leggere i messaggi.`)
    } catch (err) {
      console.error(err)
      await m.reply('❌ Errore durante la creazione dell’email temporanea.')
    }
  }

  if (command === 'emailmsg') {
    const email = emailStorage[userId]
    if (!email) return await m.reply('❗ Prima devi generare un\'email con *.emailtemp*')

    try {
      const res = await axios.get(`https://tempmail-so.p.rapidapi.com/request/mail/id/${email}`, {
        headers: {
          'x-rapidapi-host': 'tempmail-so.p.rapidapi.com',
          'x-rapidapi-key': rapidApiKey
        }
      })

      const messages = res.data
      if (!messages.length) return await m.reply(`📭 Nessun messaggio trovato su *${email}*`)

      let list = `📥 Messaggi per *${email}*:\n\n`
      for (let msg of messages.slice(0, 5)) {
        list += `🟣 *Da:* ${msg.mail_from}\n📌 *Oggetto:* ${msg.mail_subject}\n📝 *Testo:* ${msg.mail_text_only.slice(0, 200)}...\n\n`
      }

      await m.reply(list.trim())
    } catch (err) {
      console.error(err)
      await m.reply('❌ Errore durante il recupero dei messaggi.')
    }
  }
}

handler.command = ['emailtemp', 'emailmsg']
handler.tags = ['tools']
handler.help = ['emailtemp', 'emailmsg']

export default handler