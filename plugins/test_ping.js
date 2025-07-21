import axios from 'axios'

let handler = async (m, { conn, text, args, command }) => {
  let imageUrl = text || (m.quoted?.mimetype?.startsWith('image') ? await conn.downloadAndUpload(m.quoted, 'url') : null)

  // Se l'utente risponde a un'immagine
  if (!imageUrl && m.quoted && m.quoted.mimetype && m.quoted.mimetype.startsWith('image')) {
    let buffer = await m.quoted.download()
    let file = await conn.uploadFile(buffer)
    imageUrl = file?.url
  }

  if (!imageUrl && m.msg?.mimetype?.startsWith('image')) {
    let buffer = await m.download()
    let file = await conn.uploadFile(buffer)
    imageUrl = file?.url
  }

  if (!imageUrl) return m.reply(`❗ Per favore, invia o rispondi a un'immagine o usa un link diretto.\n\nEsempio: *.ghibli <immagine>*`)

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