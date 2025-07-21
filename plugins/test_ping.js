import axios from 'axios'

let handler = async (m, { text, command }) => {
  if (!text) return m.reply('❗ Per favore, inserisci un prompt per generare il video.\n\nEsempio: *.aivideo una tigre nella neve*')

  const options = {
    method: 'POST',
    url: 'https://runwayml.p.rapidapi.com/extend',
    headers: {
      'x-rapidapi-key': '8bb342ee47mshe971e098cd28310p140553jsn9c0337559f2d',
      'x-rapidapi-host': 'runwayml.p.rapidapi.com',
      'Content-Type': 'application/json'
    },
    data: {
      uuid: '', // opzionale, lasciamo vuoto per nuova generazione
      model: 'gen2',
      text_prompt: text,
      motion: 5, // quantità di movimento (1–10)
      seed: 0,   // randomizzazione
      callback_url: '' // puoi lasciarlo vuoto
    }
  }

  try {
    m.react('🎥')
    const res = await axios.request(options)
    const data = res.data

    if (data && data.status === 'processing') {
      return m.reply(`📽️ Video in generazione!\nAttendi qualche istante e visita:\n🔗 ${data.result_url || '[Nessun URL fornito]'}\n\n⚠️ Potrebbe impiegare qualche minuto.`)
    } else {
      return m.reply(`⚠️ Errore: la richiesta non è stata accettata.\nControlla se il tuo piano RapidAPI consente l'uso di RunwayML.`)
    }
  } catch (err) {
    console.error(err.response?.data || err.message)
    m.reply('❌ Errore durante la generazione del video. Controlla la tua chiave o i limiti di RapidAPI.')
  }
}

handler.help = ['aivideo <testo>']
handler.tags = ['ai', 'video']
handler.command = /^aivideo$/i

export default handler