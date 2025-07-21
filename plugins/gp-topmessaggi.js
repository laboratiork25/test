import fetch from 'node-fetch'
import fs from 'fs'

function sort(key, asc = true) {
  if (key) {
    return (a, b) => (asc ? a[key] - b[key] : b[key] - a[key])
  } else {
    return (a, b) => (asc ? a - b : b - a)
  }
}

function getMedaglia(pos) {
  if (pos === 1) return '🥇'
  if (pos === 2) return '🥈'
  if (pos === 3) return '🥉'
  return '🏅'
}

const handler = async (m, { conn, args, participants }) => {
  // ✅ Controllo esistenza file obbligatori
  const requiredFiles = [
    './bal.png',
    './termini.jpeg',
    './CODE_OF_CONDUCT.md',
    './plugins/OWNER_file.js'
  ]
  const missing = requiredFiles.find(path => !fs.existsSync(path))
  if (missing) {
    return await conn.sendMessage(m.chat, {
      text: '❗ Per usare questo comando usa la base di chatunity'
    }, { quoted: m })
  }

  if (!m.isGroup) return await m.reply("Questo comando funziona solo nei gruppi!")

  let maxEntries = 10
  if (args[0]) {
    let n = parseInt(args[0])
    if (!isNaN(n) && n >= 10 && n <= 100 && n % 10 === 0) {
      maxEntries = n
    }
  }

  let groupUsers = participants
    .filter(u => u.id !== conn.user.jid)
    .map(u => {
      let userData = global.db.data.users[u.id] || {}
      return { jid: u.id, messaggi: userData.messaggi || 0, userData }
    })

  let sorted = groupUsers.sort(sort('messaggi', false))
  let topList = sorted.slice(0, maxEntries)

  let cards = await Promise.all(topList.map(async ({ jid, messaggi, userData }, i) => {
    let rank = getMedaglia(i + 1)

    let displayName
    try {
      displayName = await conn.getName(jid)
    } catch {
      displayName = jid.split('@')[0]
    }

    let pic
    try {
      pic = await conn.profilePictureUrl(jid, 'image')
    } catch {
      pic = 'https://qu.ax/LoGxD.png'
    }

    // Ruolo
    let ruolo = 'Membro 🤍'
    try {
      let groupMeta = await conn.groupMetadata(m.chat)
      let participant = groupMeta.participants.find(p => p.id === jid)
      if (participant) {
        if (participant.admin === 'superadmin' || participant.admin === 'admin') ruolo = 'Admin 👑'
        if (groupMeta.owner === jid) ruolo = 'Founder ⚜'
      }
    } catch {}

    const gradi = [
      "Principiante I 😐", "Principiante II 😐",
      "Recluta I 🙂", "Recluta II 🙂",
      "Avanzato I 🫡", "Avanzato II 🫡",
      "Bomber I 😎", "Bomber II 😎",
      "Pro I 😤", "Pro II 😤",
      "Élite I 🤩", "Élite II 🤩",
      "Master I 💪🏼", "Master II 💪🏼",
      "Mitico I 🔥", "Mitico II 🔥",
      "Eroe I 🎖", "Eroe II 🎖",
      "Campione I 🏆", "Campione II 🏆",
      "Dominatore I 🥶", "Dominatore II 🥶",
      "Stellare I 💫", "Stellare II 💫",
      "Cosmico I 🔮", "Cosmico II 🔮",
      "Titano I 😈", "Titano II 😈",
      "Leggenda I ⭐", "Leggenda II ⭐"
    ]
    const livello = Math.floor(messaggi / 1000)
    const grado = livello >= 30 ? "Fuori classe ❤‍🔥" : (gradi[livello] || "-")

    let emojiGenere = "Non impostato"
    if (userData.genere === "maschio") emojiGenere = "🚹"
    else if (userData.genere === "femmina") emojiGenere = "🚺"

    let ig = userData.instagram
      ? `🌐 instagram.com/${userData.instagram}`
      : "🌐 Instagram: non impostato"

    let body =
      `${rank} ${displayName}\n` +
      `📝 Messaggi: ${messaggi}\n` +
      `🟣 Ruolo: ${ruolo}\n` +
      `🏅 Livello: ${grado}\n` +
      `🚻 Genere: ${emojiGenere}\n` +
      `${ig}`

    return {
      image: { url: pic },
      title: `#${i + 1}`,
      body,
      footer: `Top messaggi ${maxEntries} utenti`
    }
  }))

  await conn.sendMessage(m.chat, {
    title: `🏆 Top ${maxEntries} utenti per messaggi`,
    text: 'Guarda chi spacca di più nel gruppo! 🏅',
    footer: 'Usa .info @menzione per più informazioni di su ciascun utente',
    cards
  }, { quoted: m })
}

handler.command = ['topmessaggi']
handler.group = true
handler.admin = false

export default handler