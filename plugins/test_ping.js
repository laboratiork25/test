import axios from 'axios'

let handler = async (m, { conn, text, command }) => {
  let imageUrl = text

  // Se rispondi a un'immagine
  if (!imageUrl && m.quoted && m.quoted.mimetype && m.quoted.mimetype.startsWith('image')) {
    // Scarica immagine in buffer
    let buffer = await conn.downloadMedia(m.quoted)
    // Qui serve host esterno per upload, altrimenti non puoi fornire URL all'API
    // Se hai un metodo per upload, usalo qui e metti imageUrl = URL ottenuto
    return m.reply('⚠️ Per favore fornisci un link diretto all\'immagine perché il bot non supporta upload automatico.')
  }

  if (!imageUrl) return m.reply(`❗ Per favore invia o rispondi a un'immagine o usa un link diretto.\nEsempio: *.ghibli <link_immagine>*`)

  m.react('🎨')

  const options = {
    method: 'POST',
    url: 'https://ghibli-image-generator-api-open-ai-4o-image-generation-free.p.rapidapi.com/aaaaaaaaaaaaaaaaaiimagegenerator/ghibli/generate.php',
    headers: {
      'x-rapidapi-key': '8bb342ee47mshe971e098cd28310p140553jsn9c0337559f2d',
      'x-rapidapi-host': 'ghibli-image-generator-api-open-ai-4o-image-generation-free.p.rapidapi.com',
      'Content-Type': 'application/json'
    },
    data: {
      prompt: 'Transform this image in the style of Studio Ghibli. Just like their biggest fan and admirer would, training for years to master the technique to near perfection.',
      filesUrl: [imageUrl],
      size: '1:1'
    }
  }

  try {
    const response = await axios.request(options)
    const ghibliImage = response.data?.data?.[0]?.outputUrl

    if (!ghibliImage) return m.reply('⚠️ Nessun risultato ricevuto. Riprova più tardi.')

    await conn.sendFile(m.chat, ghibliImage, 'ghibli.jpg', '🌸 Ecco la tua immagine in stile Studio Ghibli!', m)
  } catch (e) {
    console.error(e)
    m.reply('❌ Errore durante la trasformazione. Verifica la tua immagine o riprova più tardi.')
  }
}

handler.help = ['ghibli (rispondi o linka immagine)']
handler.tags = ['ai', 'image']
handler.command = /^ghibli$/i

export default handler