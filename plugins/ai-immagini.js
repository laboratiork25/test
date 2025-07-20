import { googleImage } from '@bochilteam/scraper'
import { existsSync } from 'fs'
import axios from 'axios'

const paroleproibite = [
  'sangue', 'gore', 'decapitazione', 'omicidio', 'suicidio', 'cadavere', 'corpo morto',
  'autolesionismo', 'arma', 'sparare', 'mutilazione',
  'porno', 'sessuale', 'nudo', 'nuda', 'nudità', 'sex', 'xxx', 'hardcore', 'orgia',
  'tette', 'seni', 'pene', 'vagina', 'culo', 'anale', 'masturbazione', 'fellatio',
  '69', 'sesso', 'gay sex', 'lesbica', 'incesto', 'fetish', 'bdsm',
  'nazista', 'hitler', 'razzismo', 'omofobia', 'islamofobia', 'antisemitismo',
  'terrorismo', 'pedofilia', 'necrofili',
  'droga', 'eroina', 'cocaina', 'stupefacenti', 'pedopornografia', 'bestialità',
  'stupri', 'stupro', 'violentare', 'tortura', 'traffico di organi', 'snuff',
  'deepfake', 'fake nudes', 'fake porno', 'modifica porno',
  'impiccarsi', 'tagliarsi', 'soffocare', 'morire', 'uccidersi', 'suicidarsi',
  'sexy', 'sensuale', 'hot girl', 'hot boy', 'cam girl', 'webcam sex', 'striptease'
]

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[array[i], array[j]] = [array[j], array[i]]
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

  const randomOffset = Math.floor(Math.random() * 10)
  const query = `${input} ${randomOffset}`
  const res = await googleImage(query)
  if (!res || res.length === 0) return conn.reply(m.chat, 'Nessuna immagine trovata 😢', m)

  shuffle(res)
  const images = res.slice(0, 5)

  const cards = images.map((img, i) => ({
    image: { url: img },
    title: `Immagine #${i + 1}`,
    body: `Risultato per: ${input}`,
    footer: 'Powered by ChatUnity',
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
      text: `🔍 Risultati per: ${input}`,
      title: `Risultati immagini`,
      subtitle: `Ecco le immagini trovate su Google`,
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
          buttonId: `${usedPrefix}cercaimmagine ${input}`,
          buttonText: { displayText: 'Cerca di nuovo' },
          type: 1
        }
      ],
      headerType: 1
    },
    { quoted: m }
  )
}

handler.command = ['cercaimmagine']
export default handler