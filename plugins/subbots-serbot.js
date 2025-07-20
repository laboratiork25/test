
import { DisconnectReason, useMultiFileAuthState, fetchLatestBaileysVersion, makeCacheableSignalKeyStore, jidNormalizedUser } from '@whiskeysockets/baileys'
import qrcode from 'qrcode'
import fs from 'fs'
import pino from 'pino'
import crypto from 'crypto'
import NodeCache from 'node-cache'
import { makeWASocket } from '../lib/simple.js'
if (global.conns instanceof Array) {
console.log()
} else {
global.conns = []
}
let handler = async (m, { conn, args, usedPrefix, command, isOwner, isPrems, isROwner }) => {

const bot = global.db.data.settings[conn.user.jid] || {};

if (!bot.jadibotmd) return m.reply('💛 Questo comando è disattivato dal mio creatore.');

let parentw = args[0] && args[0] == "plz" ? conn : await global.conn;
if (!(args[0] && args[0] == 'plz' || (await global.conn).user.jid == conn.user.jid)) {
return conn.reply(m.chat, `「💭」Puoi usare questo comando solo nel bot principale.\n\n• Wa.me/${global.conn.user.jid.split`@`[0]}?text=${usedPrefix + command}`, m, rcanal);
}
async function serbot() {
let serbotFolder = crypto.randomBytes(10).toString('hex').slice(0, 8);
let folderSub = `./varebot-sub/${serbotFolder}`;
if (!fs.existsSync(folderSub)) {
fs.mkdirSync(folderSub, { recursive: true });
}
if (args[0]) {
fs.writeFileSync(`${folderSub}/creds.json`, Buffer.from(args[0], 'base64').toString('utf-8'));
}
const { state, saveCreds } = await useMultiFileAuthState(folderSub);
const msgRetryCounterCache = new NodeCache();
const { version } = await fetchLatestBaileysVersion();
const connectionOptions = {
logger: pino({ level: 'silent' }),
printQRInTerminal: true,
browser: ['varebot Sub-Bot', 'Edge', '2.0.0'],
auth: {
creds: state.creds,
keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" }).child({ level: "fatal" })),
},
markOnlineOnConnect: true,
generateAnteprimaLinkAltaQualità: true,
getMessage: async (chiave) => {
let jid = jidNormalizedUser(chiave.remoteJid);
let msg = await store.loadMessage(jid, chiave.id);
return msg?.message || "";
},
msgRetryCounterCache,
version
};
let conn = makeWASocket(connectionOptions);
conn.isInit = false;
let isInit = true;
async function connectionUpdate(update) {
const { connection, lastDisconnect, isNewLogin, qr } = update;
if (isNewLogin) {
conn.isInit = true;
}
if (qr) {
let txt = '*S U B B O T* ㌌\n\n> *Scansiona questo QR per diventare un Sub Bot*\n\n*💛 Passaggi per scansionare:*\n\n`1` : Clicca sui 3 puntini\n\n`2` : Tocca dispositivi collegati\n\n`3` : Scansiona questo QR\n\n> *Nota:* Questo codice QR scade in 30 secondi.';

let sendQR = await parentw.sendFile(m.chat, await qrcode.toDataURL(qr, { scale: 8 }), "qrcode.png", txt, m, null, rcanal);
setTimeout(() => {
parentw.sendMessage(m.chat, { delete: sendQR.key });
}, 30000);
}
const code = lastDisconnect?.error?.output?.statusCode || lastDisconnect?.error?.output?.payload?.statusCode;
if (code && code !== DisconnectReason.loggedOut && conn?.ws.socket == null) {
let i = global.conns.indexOf(conn);
if (i < 0) {
return console.log(await creloadHandler(true).catch(console.error));
}
delete global.conns[i];
global.conns.splice(i, 1);
if (code !== DisconnectReason.connectionClosed) {
await parentw.reply(conn.user.jid, "令 Connessione persa con il server.", m);
}
}
if (global.db.data == null) {
loadDatabase();
}
if (connection == "open") {
conn.isInit = true;
global.conns.push(conn);
await parentw.reply(m.chat, args[0] ? '🌺 Connesso con successo a WhatsApp.' : '令 Hai collegato un Sub-Bot con successo.', m, rcanal);
await sleep(5000);
if (args[0]) {
return;
}
await parentw.reply(conn.user.jid, `令 *Per ricollegare un Sub-Bot usa il tuo token*`, m, rcanal);
}
}
const timeoutId = setTimeout(() => {
if (!conn.user) {
try {
conn.ws.close()
} catch {}
conn.ev.removeAllListeners()
let i = global.conns.indexOf(conn)
if (i >= 0) {
delete global.conns[i]
global.conns.splice(i, 1)
}
fs.rmdirSync(`./varebot-sub/${serbotFolder}`, { recursive: true })
}
}, 30000)
let handler = await import("../handler.js")
let creloadHandler = async function (restatConn) {
try {
const Handler = await import(`../handler.js?update=${Date.now()}`).catch(console.error)
if (Object.keys(Handler || {}).length) {
handler = Handler
}
} catch (e) {
console.error(e)
}
if (restatConn) {
try {
conn.ws.close()
} catch {}
conn.ev.removeAllListeners()
conn = makeWASocket(connectionOptions)
isInit = true
}
if (!isInit) {
conn.ev.off("messages.upsert", conn.handler)
conn.ev.off("connection.update", conn.connectionUpdate)
conn.ev.off('creds.update', conn.credsUpdate)
} 
conn.handler = handler.handler.bind(conn)
conn.connectionUpdate = connectionUpdate.bind(conn)
conn.credsUpdate = saveCreds.bind(conn, true)
conn.ev.on("messages.upsert", conn.handler)
conn.ev.on("connection.update", conn.connectionUpdate)
conn.ev.on("creds.update", conn.credsUpdate)
isInit = false
return true
}
creloadHandler(false)
}
serbot()
}
handler.command = ["jadibot", "qr", "serbotqr"]
export default handler
function sleep(ms) {
return new Promise(resolve => setTimeout(resolve, ms))
}
