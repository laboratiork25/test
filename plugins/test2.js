import axios from 'axios';

let handler = async (m, { conn, text, usedPrefix, command }) => {
  const livelliValidi = ['noob', 'easy', 'medium', 'hard', 'impossible', 'impossible1', 'impossible2', 'impossible3', 'impossible4', 'impossible5'];
  const livello = text?.toLowerCase().trim() || 'easy';

  if (!livelliValidi.includes(livello)) {
    return m.reply(`❗ Livello non valido.\nUsa uno di questi livelli:\n${livelliValidi.join(', ')}\n\n📌 Esempio:\n${usedPrefix + command} hard`);
  }

  try {
    const { data } = await axios.get(`https://api.siputzx.my.id/api/games/maths?level=${livello}`);
    if (!data || !data.question) throw '⚠️ Errore nella risposta dell’API.';

    const timeout = 30 * 1000; // 30 secondi per rispondere
    const question = data.question;
    const answer = data.answer;

    // Salva temporaneamente la risposta corretta
    conn.mathGame = conn.mathGame || {};
    conn.mathGame[m.sender] = {
      answer,
      timeout: setTimeout(() => {
        m.reply(`⏰ Tempo scaduto!\n❌ La risposta corretta era: *${answer}*`);
        delete conn.mathGame[m.sender];
      }, timeout)
    };

    m.reply(`🧠 *Domanda di matematica (${livello}):*\n\n${question}\n\n⏳ Hai *30 secondi* per rispondere.\nRispondi semplicemente con il numero!`);

  } catch (e) {
    console.log(e);
    return m.reply('❌ Errore durante il recupero della domanda. Riprova più tardi.');
  }
};

// Gestione della risposta dell’utente
handler.before = async (m, { conn }) => {
  if (!conn.mathGame || !conn.mathGame[m.sender]) return false;
  const game = conn.mathGame[m.sender];

  if (m.text.trim() === String(game.answer)) {
    clearTimeout(game.timeout);
    delete conn.mathGame[m.sender];
    m.reply('✅ *Risposta corretta!*\n🎉 Complimenti!');
    return true;
  }

  return false;
};

handler.help = ['math <livello>'];
handler.tags = ['game'];
handler.command = /^math$/i;

export default handler;