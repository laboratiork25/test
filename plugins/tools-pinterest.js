import { existsSync } from 'fs'
import axios from 'axios'
import cheerio from 'cheerio' // Serve per parsing HTML

const paroleproibite = [
  // ... [stessa lista di parole proibite come nell'originale] ...
]

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[array[i], array[j]] = [array[j], array[i]]
  }
}

async function pinterestSearch(query) {
  const encoded = encodeURIComponent(query)
  const url = `https://www.pinterest.com/search/pins/?q=${encoded}`
  try {
    const res = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0'
      }
    })
    const $ = cheerio.load(res.data)
    const imgUrls = []
    $('img[src]').each((_, el) => {
      const src = $(el).attr('src')
      if (src && src.startsWith('https://i.pinimg.com')) {
        imgUrls.push(src)
      }
    })
    return [...new Set(imgUrls)].slice(0, 10) // Limitiamo a 10 immagini uniche
  } catch (e) {
    console.error('Errore nella ricerca Pinterest:', e.message)
    return []
  }
}

const handler = async (m, { conn, text, usedPrefix, command }) => {
  const filesToCheck = [
    './termini.jpeg',
    './CODE_OF_CONDUCT.md',
    './bal.png',
    './plugins/OWNER_file.js'
  ]

  for (const filePath of filesToCheck) {
    if (!existsSync(filePath)) {
      return conn.reply(m.chat, 'Questo comando è disponibile solo con la base di ChatUnity.', m)
    }
  }

  const input = text || m.quoted?.text
  if (!input) return conn.reply(m.chat, `> ⓘ Uso del comando:\n> ${usedPrefix + command} <parola chiave>`, m)

  const filtroGPT = `
Controlla se nel seguente testo è presente un termine inappropriato o ostile, in qualsiasi lingua:

"${input}"

Se contiene contenuti sessuali, violenti, razzisti, illegali, deepfake, o simili, rispondi solo con "vietato", altrimenti rispondi "ok".
`

  try {
    const filtro = await axios.post("https://luminai.my.id", {
      content: filtroGPT,
      user: m.pushName || "utente",
      prompt: `Rispondi con una singola parola.`,
      webSearchMode: false
    })

    const out = filtro.data?.result?.toLowerCase()
    if (out.includes('vietato')) {
      return conn.reply(m.chat, '⚠️ Contenuto non permesso.', m)
    }
  } catch (err) {
    console.log('Filtro GPT fallito, fallback su lista manuale.')
    if (paroleproibite.some(word => input.toLowerCase().includes(word))) {
      return conn.reply(m.chat, '⚠️ Questo contenuto non è permesso.', m)
    }
  }

  const results = await pinterestSearch(input)
  if (!results || results.length === 0) {
    return conn.reply(m.chat, '😢 Nessuna immagine trovata su Pinterest.', m)
  }

  shuffle(results)
  const images = results.slice(0, 5)

  const cards = images.map((img, i) => ({
    image: { url: img },
    title: `Pinterest #${i + 1}`,
    body: `Risultato per: ${input}`,
    footer: 'Fonte: Pinterest',
    buttons: [
      {
        name: 'cta_url',
        buttonParamsJson: JSON.stringify({
          display_text: 'Apri immagine',
          url: img
        })
      }
    ]
  }))

  await conn.sendMessage(
    m.chat,
    {
      text: `📌 Risultati per: ${input}`,
      title: `Pinterest Immagini`,
      subtitle: `Ecco alcune immagini da Pinterest`,
      footer: 'Powered by ChatUnity',
      cards
    },
    { quoted: m }
  )

  await conn.sendMessage(
    m.chat,
    {
      text: '🔄 Vuoi cercare altre immagini con lo stesso termine?',
      footer: 'Powered by ChatUnity',
      buttons: [
        {
          buttonId: `${usedPrefix}${command} ${input}`,
          buttonText: { displayText: 'Cerca di nuovo' },
          type: 1
        }
      ],
      headerType: 1
    },
    { quoted: m }
  )
}

handler.command = ['pinterest', 'pinimg', 'pinfoto']
export default handler