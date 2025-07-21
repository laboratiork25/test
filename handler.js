import { generateWAMessageFromContent } from "@whiskeysockets/baileys"
import { smsg } from './lib/simple.js'
import { format } from 'util'
import { fileURLToPath } from 'url'
import path, { join } from 'path'
import { unwatchFile, watchFile } from 'fs'
import fs from 'fs'
import chalk from 'chalk'

global.ignoredUsersGlobal = new Set()
global.ignoredUsersGroup = {}
global.groupSpam = {}

/**
 * @type {import('@whiskeysockets/baileys')}
 */
const { proto } = (await import('@whiskeysockets/baileys')).default
const isNumber = x => typeof x === 'number' && !isNaN(x)
const delay = ms => isNumber(ms) && new Promise(resolve => setTimeout(function () {
    clearTimeout(this)
    resolve()
}, ms))

/**
 * Handle messages upsert
 * @param {import('@whiskeysockets/baileys').BaileysEventMap<unknown>['messages.upsert']} groupsUpdate 
 */
export async function handler(chatUpdate) {
    this.msgqueque = this.msgqueque || []
    if (!chatUpdate)
        return
    this.pushMessage(chatUpdate.messages).catch(console.error)
    let m = chatUpdate.messages[chatUpdate.messages.length - 1]
    if (!m)
        return
    if (global.db.data == null)
        await global.loadDatabase()

    // Inizializza l'utente se non esiste
    if (!global.db.data.users[m.sender]) {
        global.db.data.users[m.sender] = {}
    }

    // Sezione Antispam - Inizio
    const isROwner = [conn.decodeJid(global.conn.user.id), ...global.owner.map(([number]) => number)].map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(m.sender)
    const isOwner = isROwner || m.fromMe
    const user = global.db.data.users[m.sender] || {}
    
    if (!global.groupSpam[m.chat]?.isSuspended) {
        const isPremium = user.premium || false
        const cooldownTime = isOwner ? 0 : (isPremium ? 2000 : 4000)
        const lastSpam = user.spam || 0
        const now = Date.now()
        
        if (now - lastSpam < cooldownTime) {
            const waitTime = ((cooldownTime - (now - lastSpam)) / 1000).toFixed(1)
            console.log(`[SPAM] Utente ${m.sender} deve aspettare ancora ${waitTime}s`)
            if (!isOwner && !isPremium) {
                return conn.sendMessage(m.chat, {
                    text: `⏳ *Attendi ancora* ${waitTime} *secondi prima di usare un altro comando.*`,
                }, { quoted: m })
            }
        }
        global.db.data.users[m.sender].spam = now
    }

    if (m.isGroup && !isOwner) {
        if (!global.groupSpam[m.chat]) {
            global.groupSpam[m.chat] = {
                count: 0,
                firstCommandTimestamp: 0,
                isSuspended: false
            }
        }

        const groupData = global.groupSpam[m.chat]
        const now = Date.now()

        if (groupData.isSuspended) {
            return
        }
        
        if (now - groupData.firstCommandTimestamp > 60000) {
            groupData.count = 1
            groupData.firstCommandTimestamp = now
        } else {
            groupData.count++
        }
        
        if (groupData.count > 8) {
            groupData.isSuspended = true
            await conn.reply(m.chat, `『 ⚠ 』 Anti-spam comandi\n\n> Rilevati troppi comandi in un minuto, aspettate 15 secondi prima di riutilizzare i comandi.`, m)
            setTimeout(() => {
                delete global.groupSpam[m.chat]
                console.log(`[Anti-Spam] Comandi riattivati per il gruppo: ${m.chat}`)
            }, 15000)
            return
        }
    }
    // Sezione Antispam - Fine

    try {
        m = smsg(this, m) || m
        if (!m)
            return
        m.exp = 0
        m.limit = false
        try {
            let user = global.db.data.users[m.sender]
            if (typeof user !== 'object')
                global.db.data.users[m.sender] = {}
            if (user) {
                if (!isNumber(user.messaggi)) user.messaggi = 0
                if (!isNumber(user.blasphemy)) user.blasphemy = 0
                if (!isNumber(user.msg)) user.msg = {}
                if (!isNumber(user.exp)) user.exp = 0
                if (!isNumber(user.money)) user.money = 0 
                if (!isNumber(user.warn)) user.warn = 0
                if (!isNumber(user.joincount)) user.joincount = 2   
                if (!isNumber(user.limit)) user.limit = 20
                if (!('premium' in user)) user.premium = false
                if (!isNumber(user.premiumDate)) user.premiumDate = -1
                if (!isNumber(user.tprem)) user.tprem = 0
                if (!user.premium) user.premium = false
                if (!user.premium) user.premiumTime = 0
                if (!('name' in user)) user.name = m.name
                if (!('muto' in user)) user.muto = false
            } else {
                global.db.data.users[m.sender] = {
                    messaggi: 0,
                    spam: 0
                }
            }

            let chat = global.db.data.chats[m.chat]
            if (typeof chat !== 'object')
                global.db.data.chats[m.chat] = {}
            if (chat) {
                if (!('isBanned' in chat)) chat.isBanned = false
                if (!('welcome' in chat)) chat.welcome = true
                if (!('detect' in chat)) chat.detect = true
                if (!('sWelcome' in chat)) chat.sWelcome = ''
                if (!('sBye' in chat)) chat.sBye = ''
                if (!('sPromote' in chat)) chat.sPromote = ''
                if (!('sDemote' in chat)) chat.sDemote = ''
                if (!('delete' in chat)) chat.delete = false
                if (!('gpt' in chat)) chat.gpt = false
                if (!('bestemmiometro' in chat)) chat.bestemmiometro = false
                if (!('antielimina' in chat)) chat.antielimina = false
                if (!('antiLink' in chat)) chat.antiLink = true
                if (!('antiinsta' in chat)) chat.antiinsta = false
                if (!('antitiktok' in chat)) chat.antitiktok = false
                if (!('antiLink2' in chat)) chat.antiLink2 = false
                if (!('antiviewonce' in chat)) chat.antiviewonce = false
                if (!('antitrava' in chat)) chat.antitrava = true
                if (!('antiArab' in chat)) chat.antiArab = false
                if (!('modoadmin' in chat)) chat.modoadmin = false
                if (!('antiporno' in chat)) chat.antiporno = true
                if (!isNumber(chat.expired)) chat.expired = 0
                if (!isNumber(chat.messaggi)) chat.messaggi = 0
                if (!isNumber(chat.blasphemy)) chat.blasphemy = 0
                if (!('name' in chat)) chat.name = m.name
                if (!('name' in chat)) chat.name = this.getName(m.chat)
                if (!('antivirus' in chat)) chat.antivirus = false
                if (!('antispamcomandi' in chat)) chat.antispamcomandi = true
                if (!('antibestemmie' in chat)) chat.antibestemmie = false
                if (!('antibot' in chat)) chat.antibot = false
                if (!('antimedia' in chat)) chat.antimedia = false 
                if (!('antisondaggi' in chat)) chat.antisondaggi = false
            } else {
                global.db.data.chats[m.chat] = {
                    name: this.getName(m.chat),
                    isBanned: false,
                    welcome: true,
                    detect: true,
                    sWelcome: '',
                    sBye: '',
                    sPromote: '',
                    sDemote: '',
                    delete: false,
                    modohorny: false,
                    gpt: true,
                    bestemmiometro: true,
                    antiporno: true,
                    antielimina: false,
                    audios: false,
                    antiLinkfast: true,
                    antiLink: true,
                    antiLink2: false,
                    antilinkbase: false,
                    antitiktokbase: false,
                    antiinsta: true,
                    antitiktok: true,
                    antiviewonce: false,
                    antiToxic: false,
                    antitrava: true,
                    antiArab: true,
                    modoadmin: false,
                    antiPorno: true,
                    muto: false,
                    expired: 0,
                    messaggi: 0,
                    blasphemy: 0,
                    premium: false,
                    premiumTime: 0,
                    tprem: 0,
                    money: 0, 
                    warn: 0,
                    name: m.name,
                    antivirus: false,
                    antispamcomandi: true,
                    antibestemmie: false,
                    antibot: false,
                    antimedia: false,
                    antisondaggi: false,
                }
            }

            let settings = global.db.data.settings[this.user.jid]
            if (typeof settings !== 'object') global.db.data.settings[this.user.jid] = {}
            if (settings) {
                if (!('self' in settings)) settings.self = false
                if (!('autoread' in settings)) settings.autoread = false
                if (!('restrict' in settings)) settings.restrict = true
                if (!('antiCall' in settings)) settings.antiCall = false
                if (!('antiPrivate' in settings)) settings.antiprivato = false
                if (!('jadibot' in settings)) settings.jadibot = true   
            } else {
                global.db.data.settings[this.user.jid] = {
                    self: false,
                    autoread: false,
                    restrict: true,
                    antiCall: false,
                    antiPrivate: false,
                    jadibot: true,
                }
            }
        } catch (e) {
            console.error(e)
        }

        if (opts['nyimak'])
            return
        if (!m.fromMe && opts['self'])
            return
        if (opts['pconly'] && m.chat.endsWith('g.us'))
            return
        if (opts['gconly'] && !m.chat.endsWith('g.us'))
            return
        if (opts['swonly'] && m.chat !== 'status@broadcast')
            return
        if (typeof m.text !== 'string')
            m.text = ''

        const isMods = isOwner || global.mods.map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(m.sender)
        const isPrems = isROwner || isOwner || isMods || global.db.data.users[m.sender].premiumTime > 0

        if (opts['queque'] && m.text && !(isMods || isPrems)) {
            let queque = this.msgqueque, time = 1000 * 5
            const previousID = queque[queque.length - 1]
            queque.push(m.id || m.key.id)
            setInterval(async function () {
                if (queque.indexOf(previousID) === -1) clearInterval(this)
                await delay(time)
            }, time)
        }

        if (m.isBaileys)
            return
        m.exp += Math.ceil(Math.random() * 10)

        let usedPrefix
        let _user = global.db.data && global.db.data.users && global.db.data.users[m.sender]

        const groupMetadata = (m.isGroup ? ((conn.chats[m.chat] || {}).metadata || await this.groupMetadata(m.chat).catch(_ => null)) : {}) || {}
        const participants = (m.isGroup ? groupMetadata.participants : []) || []
        const user = (m.isGroup ? participants.find(u => conn.decodeJid(u.id) === m.sender) : {}) || {}
        const bot = (m.isGroup ? participants.find(u => conn.decodeJid(u.id) == this.user.jid) : {}) || {}
        const isRAdmin = user?.admin == 'superadmin' || false
        const isAdmin = isRAdmin || user?.admin == 'admin' || false
        const isBotAdmin = bot?.admin || false

        const ___dirname = path.join(path.dirname(fileURLToPath(import.meta.url)), './plugins')
        for (let name in global.plugins) {
            let plugin = global.plugins[name]
            if (!plugin)
                continue
            if (plugin.disabled)
                continue
            const __filename = join(___dirname, name)
            if (typeof plugin.all === 'function') {
                try {
                    await plugin.all.call(this, m, {
                        chatUpdate,
                        __dirname: ___dirname,
                        __filename
                    })
                } catch (e) {
                    console.error(e)
                    for (let [jid] of global.owner.filter(([number, _, isDeveloper]) => isDeveloper && number)) {
                        let data = (await conn.onWhatsApp(jid))[0] || {}
                        if (data.exists)
                            m.reply(`[ ⚠ ] 𝐄𝐑𝐑𝐎𝐑𝐄`.trim(), data.jid)
                    }
                }
            }
            if (!opts['restrict'])
                if (plugin.tags && plugin.tags.includes('admin')) {
                    continue
                }
            const str2Regex = str => str.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&')
            let _prefix = plugin.customPrefix ? plugin.customPrefix : conn.prefix ? conn.prefix : global.prefix
            let match = (_prefix instanceof RegExp ?
                [[_prefix.exec(m.text), _prefix]] :
                Array.isArray(_prefix) ?
                    _prefix.map(p => {
                        let re = p instanceof RegExp ?
                            p :
                            new RegExp(str2Regex(p))
                        return [re.exec(m.text), re]
                    }) :
                    typeof _prefix === 'string' ?
                        [[new RegExp(str2Regex(_prefix)).exec(m.text), new RegExp(str2Regex(_prefix))]] :
                        [[[], new RegExp]]
            ).find(p => p[1])
            if (typeof plugin.before === 'function') {
                if (await plugin.before.call(this, m, {
                    match,
                    conn: this,
                    participants,
                    groupMetadata,
                    user,
                    bot,
                    isROwner,
                    isOwner,
                    isRAdmin,
                    isAdmin,
                    isBotAdmin,
                    isPrems,
                    chatUpdate,
                    __dirname: ___dirname,
                    __filename
                }))
                    continue
            }
            if (typeof plugin !== 'function')
                continue
            if ((usedPrefix = (match[0] || '')[0])) {
                let noPrefix = m.text.replace(usedPrefix, '')
                let [command, ...args] = noPrefix.trim().split` `.filter(v => v)
                args = args || []
                let _args = noPrefix.trim().split` `.slice(1)
                let text = _args.join` `
                command = (command || '').toLowerCase()
                let fail = plugin.fail || global.dfail
                let isAccept = plugin.command instanceof RegExp ?
                    plugin.command.test(command) :
                    Array.isArray(plugin.command) ?
                        plugin.command.some(cmd => cmd instanceof RegExp ?
                            cmd.test(command) :
                            cmd === command
                        ) :
                        typeof plugin.command === 'string' ?
                            plugin.command === command :
                            false

                if (!isAccept)
                    continue
                m.plugin = name
                if (m.chat in global.db.data.chats || m.sender in global.db.data.users) {
                    let chat = global.db.data.chats[m.chat]
                    let user = global.db.data.users[m.sender]
                    if (name != 'owner-unbanchat.js' && chat?.isBanned)
                        return
                    if (name != 'owner-unbanuser.js' && user?.banned)
                        return
                }
                let hl = _prefix 
                let adminMode = global.db.data.chats[m.chat].modoadmin
                let mystica = `${plugin.botAdmin || plugin.admin || plugin.group || plugin || noPrefix || hl || m.text.slice(0, 1) == hl || plugin.command}`
                if (adminMode && !isOwner && !isROwner && m.isGroup && !isAdmin && mystica) return   

                if (plugin.rowner && plugin.owner && !(isROwner || isOwner)) {
                    fail('owner', m, this)
                    continue
                }
                if (plugin.rowner && !isROwner) {
                    fail('rowner', m, this)
                    continue
                }
                if (plugin.owner && !isOwner) {
                    fail('owner', m, this)
                    continue
                }
                if (plugin.mods && !isMods) {
                    fail('mods', m, this)
                    continue
                }
                if (plugin.premium && !isPrems) {
                    fail('premium', m, this)
                    continue
                }
                if (plugin.group && !m.isGroup) {
                    fail('group', m, this)
                    continue
                } else if (plugin.botAdmin && !isBotAdmin) {
                    fail('botAdmin', m, this)
                    continue
                } else if (plugin.admin && !isAdmin) {
                    fail('admin', m, this)
                    continue
                }
                if (plugin.private && m.isGroup) {
                    fail('private', m, this)
                    continue
                }
                if (plugin.register == true && _user.registered == false) {
                    fail('unreg', m, this)
                    continue
                }
                m.isCommand = true
                let xp = 'exp' in plugin ? parseInt(plugin.exp) : 17
                if (xp > 2000) 
                    m.reply('Exp limit')
                else if (plugin.money && global.db.data.users[m.sender].money < plugin.money * 1) { 
                    fail('senzasoldi', m, this)
                    continue   
                } 
                m.exp += xp
                if (!isPrems && plugin.limit && global.db.data.users[m.sender].limit < plugin.limit * 1) {
                    this.reply(m.chat, `diamanti terminati`, m)
                    continue
                }
                if (plugin.level > _user.level) {
                    this.reply(m.chat, `livello troppo basso`, m)
                    continue
                }
                let extra = {
                    match,
                    usedPrefix,
                    noPrefix,
                    _args,
                    args,
                    command,
                    text,
                    conn: this,
                    participants,
                    groupMetadata,
                    user,
                    bot,
                    isROwner,
                    isOwner,
                    isRAdmin,
                    isAdmin,
                    isBotAdmin,
                    isPrems,
                    chatUpdate,
                    __dirname: ___dirname,
                    __filename
                }
                try {
                    await plugin.call(this, m, extra)
                    if (!isPrems) {
                        m.limit = m.limit || plugin.limit || false
                        m.money = m.money || plugin.money || false 
                    }
                } catch (e) {
                    m.error = e
                    console.error(e)
                    if (e) {
                        let text = format(e)
                        for (let key of Object.values(global.APIKeys))
                            text = text.replace(new RegExp(key, 'g'), '#HIDDEN#')
                        if (e.name)
                            for (let [jid] of global.owner.filter(([number, _, isDeveloper]) => isDeveloper && number)) {
                                let data = (await conn.onWhatsApp(jid))[0] || {}
                                if (data.exists)
                                    m.reply(`[ � ] 𝐄𝐑𝐑𝐎𝐑𝐄`.trim(), data.jid)
                            }
                        m.reply(text)
                    }
                } finally {
                    if (typeof plugin.after === 'function') {
                        try {
                            await plugin.after.call(this, m, extra)
                        } catch (e) {
                            console.error(e)
                        }
                        if (m.money) 
                            m.reply(+m.money + ' 𝙂𝘼𝙏𝘼𝘾𝙊𝙄𝙉𝙎 🐱 𝙐𝙎𝘼𝘿𝙊(𝙎)') 
                    }
                    if (m.limit)
                        m.reply(+m.limit + ' diamante usato')
                } 
                break 
            }
        }
    } catch (e) {
        console.error(e)
    } finally {
        if (opts['queque'] && m.text) {
            const quequeIndex = this.msgqueque.indexOf(m.id || m.key.id)
            if (quequeIndex !== -1)
                this.msgqueque.splice(quequeIndex, 1)
        }

        let chat, user, stats = global.db.data.stats
        if (m) { 
            let utente = global.db.data.users[m.sender]
            if (utente?.muto == true) {
                let bang = m.key.id
                let cancellazzione = m.key.participant
                await conn.sendMessage(m.chat, {
                    delete: {
                        remoteJid: m.chat, 
                        fromMe: false, 
                        id: bang, 
                        participant: cancellazzione
                    }
                })
            }

            if (m.sender && (user = global.db.data.users[m.sender]) && (chat = global.db.data.chats[m.chat])) {
                user.exp += m.exp
                user.limit -= m.limit * 1
                user.money -= m.money * 1 
                user.messaggi += 1
                chat.messaggi += 1
            }

            let stat
            if (m.plugin) {
                let now = +new Date
                if (m.plugin in stats) {
                    stat = stats[m.plugin]
                    if (!isNumber(stat.total))
                        stat.total = 1
                    if (!isNumber(stat.success))
                        stat.success = m.error != null ? 0 : 1
                    if (!isNumber(stat.last))
                        stat.last = now
                    if (!isNumber(stat.lastSuccess))
                        stat.lastSuccess = m.error != null ? 0 : now
                } else
                    stat = stats[m.plugin] = {
                        total: 1,
                        success: m.error != null ? 0 : 1,
                        last: now,
                        lastSuccess: m.error != null ? 0 : now
                    }
                stat.total += 1
                stat.last = now
                if (m.error == null) {
                    stat.success += 1
                    stat.lastSuccess = now
                }
            }
        }

        try {
            if (!opts['noprint']) await (await import(`./lib/print.js`)).default(m, this)
        } catch (e) {
            console.log(m, m.quoted, e)
        }
        if (opts['autoread'])
            await this.readMessages([m.key])
    }
}

export async function participantsUpdate({ id, participants, action }) {
    if (opts['self'])
        return
    if (this.isInit) 
        return
    if (global.db.data == null)
        await loadDatabase()
}

export async function groupsUpdate(groupsUpdate) {
    if (opts['self'])
        return
    for (const groupUpdate of groupsUpdate) {
        const id = groupUpdate.id
        if (!id) continue
        let chats = global.db.data.chats[id], text = ''
        if (groupUpdate.icon) text = (chats.sIcon || this.sIcon || conn.sIcon || '```immagine modificata```').replace('@icon', groupUpdate.icon)
        if (groupUpdate.revoke) text = (chats.sRevoke || this.sRevoke || conn.sRevoke || '```link reimpostato, nuovo link:```\n@revoke').replace('@revoke', groupUpdate.revoke)
        if (!text) continue
        await this.sendMessage(id, { text, mentions: this.parseMention(text) })
    }
}

export async function callUpdate(callUpdate) {
    let isAnticall = global.db.data.settings[this.user.jid].antiCall
    if (!isAnticall) return
    for (let nk of callUpdate) {
        if (nk.isGroup == false) {
            if (nk.status == "offer") {
                let callmsg = await this.reply(nk.from, `ciao @${nk.from.split('@')[0]}, c'è anticall.`, false, { mentions: [nk.from] })
                let vcard = `BEGIN:VCARD\nVERSION:5.0\nN:;𝐂𝐡𝐚𝐭𝐔𝐧𝐢𝐭𝐲;;;\nFN:𝐂𝐡𝐚𝐭𝐔𝐧𝐢𝐭𝐲\nORG:𝐂𝐡𝐚𝐭𝐔𝐧𝐢𝐭𝐲\nTITLE:\nitem1.TEL;waid=393515533859:+39 3515533859\nitem1.X-ABLabel:𝐂𝐡𝐚𝐭𝐔𝐧𝐢𝐭𝐲\nX-WA-BIZ-DESCRIPTION:ofc\nX-WA-BIZ-NAME:𝐂𝐡𝐚𝐭𝐔𝐧𝐢𝐭𝐲\nEND:VCARD`
                await this.sendMessage(nk.from, { contacts: { displayName: 'Unlimited', contacts: [{ vcard }] }}, {quoted: callmsg})
                await this.updateBlockStatus(nk.from, 'block')
            }
        }
    }
}

export async function deleteUpdate(message) {
    try {
        const { fromMe, id, participant } = message
        if (fromMe)
            return
        let msg = this.serializeM(this.loadMessage(id))
        if (!msg)
            return
        let chat = global.db.data.chats[msg.chat] || {}
    } catch (e) {
        console.error(e)
    }
}

global.dfail = (type, m, conn) => {
    let msg = {
        rowner: '𝐐𝐮𝐞𝐬𝐭𝐨 𝐜𝐨𝐦𝐚𝐧𝐝𝐨 𝐞̀ 𝐬𝐨𝐥𝐨 𝐩𝐞𝐫 𝐨𝐰𝐧𝐞𝐫 🕵🏻‍♂️',
        owner: '𝐐𝐮𝐞𝐬𝐭𝐨 𝐜𝐨𝐦𝐚𝐧𝐝𝐨 𝐞̀ 𝐬𝐨𝐥𝐨 𝐩𝐞𝐫 𝐨𝐰𝐧𝐞𝐫 🕵🏻‍♂️',
        mods: '𝐐𝐮𝐞𝐬𝐭𝐨 𝐜𝐨𝐦𝐚𝐧𝐝𝐨 𝐥𝐨 𝐩𝐨𝐬𝐬𝐨𝐧𝐨 𝐮𝐭𝐢𝐥𝐢𝐳𝐳𝐚𝐫𝐞 𝐬𝐨𝐥𝐨 𝐚𝐝𝐦𝐢𝐧 𝐞 𝐨𝐰𝐧𝐞𝐫 ⚙️',
        premium: '𝐐𝐮𝐞𝐬𝐭𝐨 𝐜𝐨𝐦𝐚𝐧𝐝𝐨 𝐞̀ 𝐩𝐞𝐫 𝐦𝐞𝐦𝐛𝐫𝐢 𝐩𝐫𝐞𝐦𝐢𝐮𝐦 ✅',
        group: '𝐐𝐮𝐞𝐬𝐭𝐨 𝐜𝐨𝐦𝐚𝐧𝐝𝐨 𝐩𝐮𝐨𝐢 𝐮𝐭𝐢𝐥𝐢𝐳𝐳𝐚𝐫𝐥𝐨 𝐢𝐧 𝐮𝐧 𝐠𝐫𝐮𝐩𝐩𝐨 👥',
        private: '𝐐𝐮𝐞𝐬𝐭𝐨 𝐜𝐨𝐦𝐚𝐧𝐝𝐨 𝐩𝐮𝐨𝐢 𝐮𝐭𝐢𝐥𝐢𝐧𝐢𝐳𝐧𝐚𝐫𝐥𝐨 𝐢𝐧 𝐜𝐡𝐚𝐭 𝐩𝐫𝐢𝐯𝐚𝐭𝐚 👤',
        admin: '𝐐𝐮𝐞𝐬𝐭𝐨 𝐜𝐨𝐦𝐚𝐧𝐝𝐨 𝐞̀ 𝐩𝐞𝐫 𝐬𝐨𝐥𝐢 𝐚𝐝𝐦𝐢𝐧 👑',
        botAdmin: '𝐃𝐞𝐯𝐢 𝐝𝐚𝐫𝐞 𝐚𝐝𝐦𝐢𝐧 𝐚𝐥 𝐛𝐨𝐭 👑',
        restrict: '🔐 𝐑𝐞𝐬𝐭𝐫𝐢𝐜𝐭 𝐞 𝐝𝐢𝐬𝐚𝐭𝐭𝐢𝐯𝐚𝐭𝐨 🔐'
    }[type]
    if (msg) return conn.sendMessage(m.chat, { 
        text: ' ', 
        contextInfo: {
            "externalAdReply": {
                "title": `${msg}`, 
                "body": ``, 
                "previewType": "PHOTO",
                "thumbnail": fs.readFileSync('./accessdenied2.png'),
                "mediaType": 1,
                "renderLargerThumbnail": true
            }
        }
    }, {quoted: m})
}

let file = global.__filename(import.meta.url, true)
watchFile(file, async () => {
    unwatchFile(file)
    console.log(chalk.redBright("Update 'handler.js'"))
    if (global.reloadHandler) console.log(await global.reloadHandler())
})