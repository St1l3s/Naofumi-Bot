
const express = require('express');
const app = express();
app.get("/", (request, response) => {
    const ping = new Date();
  ping.setHours(ping.getHours() - 3);
  console.log(`Ping recebido às ${ping.getUTCHours()}:${ping.getUTCMinutes()}:${ping.getUTCSeconds()}`);
  response.sendStatus(200);
});

app.listen(process.env.PORT);

const Discord = require("discord.js")
const client = new Discord.Client(); 
const config = require("./config.json");
const Timeout = new Discord.Collection();
const ms = require("ms")
const default_prefix = config.prefix
const db = require("quick.db");
const firebase = require("firebase"
)
console.log(`</BOT> Iniciando...`)  
   
client.commands = new Discord.Collection()
client.aliases = new Discord.Collection()

const fs = require("fs")
//Aliases and Commands Load
fs.readdir('./comandos/', (err, files) => {
  let jsfile = files.filter(f => f.split('.').pop() === 'js')
  if(jsfile.length <= 0) return console.log('Comando não encontrado!')
  jsfile.forEach((f, i) => {
      console.log(`</CMD> ${f} Carregado. ✓`)
  let pull = require(`./comandos/${f}`)
client.commands.set(pull.config.name, pull)
pull.config.aliases.forEach(alias => {
client.aliases.set(alias, pull.config.name)
      });
  });
});

//Run Commands
client.on("message", async message => {
 
if(message.author.bot || message.channel.type === "dm") return;
if (message.author.bot) return;

let prefix = db.fetch(`prefixo_${message.guild.id}`)
if(prefix === null) prefix = default_prefix;

if (!message.content.startsWith(prefix)) return;
if(message.content === prefix) return;

let messageArray = message.content.split(" ");
let cmdName = messageArray[0]

let args = messageArray.slice(1)
  
let commandFile = client.commands.get(cmdName.slice(prefix.length)) || client.commands.get(client.aliases.get(cmdName.slice(prefix.length))) 

if(commandFile) {
  
   commandFile.run(client, message, args)
  
} else {
  
  //console.log(e.stack)
   await message.delete().catch(O_o => {})
   message.channel.send(`<a:vermelho_sirene:737381389040615505> **O Comando \`\`\`${cmdName}\`\`\` não foi Encontrado, Utilize \`\`\`${prefix}ajuda\`\`\`.**`).then(msg => msg.delete({ timeout: `5000` })).catch(O_o => {})
}
});
 
 //Responder Menção
client.on("message", message => {
  //if (message.content.startsWith(`<@${client.user.id}>`)) {
  if(message.content.startsWith(`<@!${client.user.id}>`) || message.content.startsWith(`<@${client.user.id}>`)){
  
   let prefix = db.fetch(`prefixo_${message.guild.id}`)
   if(prefix === null) prefix = default_prefix;
  
  let embed = new Discord.MessageEmbed()
.setColor("#080000")
.setDescription(`<a:W_Lua:765563479889149954> **| Esta com Duvidas? Utilize ${prefix}ajuda ou ${prefix}help.**`)

message.reply(embed).then(msg => msg.delete({ timeout: `10000` }))
}
});

//Ant Invite
client.on("message", async message => {

const bannedWords = [`https://discord.gg`, `discord.gg/`, `https://invite.gg`, `https://discord.me`]
const Discord = require("discord.js")

if(bannedWords.some(word => message.content.toLowerCase().includes(word))) {
if(message.author.id === message.guild.ownerID && message.author.id === config.dono1) return;
if(!message.member.hasPermission("ADMINISTRATOR")) return;

  
let link = await db.fetch(`antlink_${message.guild.id}`)

if(link === false) {
return;
}
if(link === true) {
  
await message.delete();
let embed = new Discord.RichEmbed()
.setTitle("**ANT-INVITES**")
.setDescription(`**É Proibido Divulgar links de Outros Servidores aqui.**`)
.setColor(config.cor)
.setThumbnail(message.author.avatarURL)

message.reply(embed).then(msg => msg.delete({ timeout: `10000`}))
}
}

});

//AFK sistem
client.on("message", async message => {
  
  let afk = new db.table("AFKs"),
      authorStatus = await afk.fetch(message.author.id),
      mentioned = message.mentions.members.first();
  
  if (mentioned) {
    let status = await afk.fetch(mentioned.id);
    
    if (status) {
      const embed = new Discord.MessageEmbed()
      .setColor(config.cor)
      .setDescription(`**O Usuário ${mentioned.user} está AFK pelo Motivo:** **${status}**`)
      message.channel.send(`${message.author}`,embed).then(i => i.delete({timeout: 5000}));
    }
  }
  
  if (authorStatus) {
    const embed = new Discord.MessageEmbed()
    .setColor(config.cor)
    .setDescription(`**${message.author} saiu do modo AFK.**`)
    message.channel.send(embed).then(i => i.delete({timeout: 5000}));
    afk.delete(message.author.id)
  }
  
});

//Ant Fake
client.on("guildMemberAdd", async member => {
  let fake = db.fetch(`antfake_${member.guild.id}`)
  if(fake === null) {
    return;
  }
  if(fake === true) {
  
    let reason = "Ant Fake | Conta com Menos de 3 dias.";
    
  const timeAccount = moment(new Date()).diff(member.user.createdAt, "days");
  const minimumDays = 3;

  if (timeAccount < minimumDays) {
    await member.ban(reason);
  }
  }
  });
  
//Logs Mensagens deletadas
  client.on("messageDelete", message => {
    
  let msg = message
  if(msg === " ") return;
    
  let chat = db.fetch(`logs_${message.guild.id}`)
  if(!chat) return;
  let channel = client.guilds.cache.get(message.guild.id).channels.cache.get(`${chat}`)
  
let embed = new Discord.MessageEmbed()
 .setAuthor(`${client.user.username} | Logs Mensagem`, client.user.avatarURL())
 .addField("<a:engrenagens:732598985075851295> **Infos:**", `
ㅤ<:User:784853514341974016>❯ **Autor:** ${message.author}
ㅤ<:chat:738556332285886504>❯ **Canal:** ${message.channel}`)
 .addField("<:Mensagem:785290756880334918> **Mensagem Deletada:**", `> ${msg}`)
 .setColor(config.cor)
 .setThumbnail(message.guild.iconURL({ dynamic: true, size: 4096 }))
  
  channel.send(embed)
  
});

//Logs Mensagem Editada
client.on("messageUpdate", (oldMessage, newMessage) => {
 
 if(oldMessage.author.bot) return;
 
  let chat = db.fetch(`logs_${oldMessage.guild.id}`)
  if(chat === null) return;
  let channel = client.guilds.cache.get(oldMessage.guild.id).channels.cache.get(chat)
  
  if(oldMessage === null || oldMessage === " ") return;
  if(newMessage === null || oldMessage === " ") return;
  
let embed = new Discord.MessageEmbed()
 .setAuthor(`${client.user.username} | Logs Mensagem`, client.user.avatarURL())
 .addField("<a:engrenagens:732598985075851295> **Infos:**", `
ㅤ<:User:784853514341974016>❯ **Autor:** ${oldMessage.author}
ㅤ<:chat:738556332285886504>❯ **Canal:** ${oldMessage.channel}`)
 .addField("<:Mensagem:785290756880334918> **Mensagem Antiga:**", `> ${oldMessage}`)
 .addField("<:Mensagem:785290756880334918> **Mensagem Nova:**", `> ${newMessage}`)
 .setColor(config.cor)
 .setThumbnail(oldMessage.guild.iconURL({ dynamic: true, size: 4096 }))
  
  channel.send(embed)
});

//GuildMember nickname update
client.on("guildMemberUpdate", async (oldMember, newMember) => {
  
  let channel = db.fetch(`logs_${oldMember.guild.id}`)
  
  let canal = client.guilds.cache.get(oldMember.guild.id).channels.cache.get(channel)
  
  if(!canal) return;

var nickmembros = [oldMember.nickname, newMember.nickname]

if(nickmembros[0] == null) nickmembros[0] = "Sem Apelido";

if(nickmembros[1] == null) nickmembros[1] = "Apelido Removido";

if(oldMember.nickname != newMember.nickname) {
    
    let nicknameUpdate = new Discord.MessageEmbed()
 .setAuthor(`${client.user.username} | Logs Membros`, client.user.avatarURL())
 .addField("<a:engrenagens:732598985075851295> **Infos:**", `
ㅤ<:User:784853514341974016>❯ **Autor:** ${oldMember}
ㅤ<a:engrenagens:732598985075851295>❯ **Alteração:** Apelido Alterado.`)
 .addField("**Antigo Apelido:**", `${nickmembros[0]}`)
 .addField("**Novo Apelido:**", `${nickmembros[1]}`)
 .setColor(config.cor)
 .setThumbnail(oldMember.guild.iconURL({ dynamic: true, size: 4096 }))
    
    canal.send(nicknameUpdate)
  }
  
});

//Welcome Card
client.on("guildMemberAdd", async member => {
  
  const { registerFont, createCanvas, loadImage } = require("canvas")
 
 let channel = db.fetch(`welchannel_${member.guild.id}`)
 
 let canal = client.guilds.cache.get(member.guild.id).channels.cache.get(channel)
  
  if(!canal) return;
  
const canvas = createCanvas(1024, 450)
const ctx = canvas.getContext('2d')

let background = await loadImage("https://cdn.discordapp.com/attachments/785965039231827998/786978668555010088/1607700560576.png")
ctx.drawImage(background, 0, 0, canvas.width, canvas.height)

let avatar = await loadImage(member.user.avatarURL({ format: "png", size: 4096 }))

ctx.font = 'bold 80px Arial';
ctx.textAlign = 'center';
ctx.fillStyle = '#FFFFFF'
ctx.fillText("BEM-VINDO", 512, 85)

ctx.font = 'bold 40px Arial'
ctx.textAlign = "left";
ctx.fillStyle = "#FFFFFF"
ctx.fillText(member.user.username, 370, 200)
ctx.fillText(`#${member.user.discriminator}`, 390, 270)
ctx.fillText(`Bem Vindo ao ${member.guild.name}`, 335, 385)

ctx.arc(160, 220, 110, 0, Math.PI * 2, true);
ctx.lineWidth = 15;
ctx.strokeStyle = "#FFFFFF",
ctx.stroke();
ctx.closePath();
ctx.clip();
ctx.drawImage(avatar, 50, 110, 220, 220)

const attach = new Discord.MessageAttachment(canvas.toBuffer(), "welcome.png")

canal.send(attach)

});

//Autorole
client.on("guildMemberAdd", async member => {
  let role = db.fetch(`autorole_${member.guild.id}`)
  
  if(!role) {
    return;
  } else {
  
  member.roles.add(role, ["Sistema de Autorole"]).catch(e => {})
  }
});

//Logs de entrada em servidores
client.on("guildCreate", async guild => {
  
  let canal = client.channels.cache.get("787090835284033576")
  let invite = servidor.channels.cache.random().id 
let invite2 = servidor.channels.cache.get(invite).createInvite()

let joined = new Discord.MessageEmbed()
.setDescription(`**Entrei em um novo Servidor**`)
.addField("**Servidor:**", `**Nome:** ${guild.name} (\`${guild.id}\`)`)
.addField("**Dono:**", `**Tag:** ${guild.owner.tag} (\`${guild.owner.id}\`)`)
.addField("**Membros:**", `${guild.members.cache.size} Usuários.`)
.addField("**Convite:**", `**[Convite](${invite2})**`)

  canal.send(joined)
  
});

  //Connect Firebase
  var firebaseConfig = {
    Infos do seu projeto na firebase
  };
  firebase.initializeApp(firebaseConfig);
  const database = firebase.database()
  
  //Sistema de Experiência
 client.on("message",msg => {
  if(msg.author.bot) return;
  if(msg.channel.type === "dm") return;
  
  let msg1 = db.fetch(`expsistem_${msg.guild.id}`)
          if(msg1 === null) return
          if(msg1 === true) {
  
  database.ref(`Servidores/${msg.guild.id}/${msg.author.id}`).once("value",function(user) {
    if(user.val() === null) {
      database.ref(`Servidores/${msg.guild.id}/${msg.author.id}`).update({
        xp: 0,
        nivel: 1,
        votes: 0,
        premium: false,
        user: msg.author.id
      })
    } else {
      
      /*if(user.val().premium === null) {
        database.ref(`Premium/${msg.author.id}`)
        .set({
          premium: false
        })
      }*/
      
      if(user.val().premium === true) {
        var xp = Math.floor(Math.random() * 10) + 5;
        database.ref(`Servidores/${msg.guild.id}/${msg.author.id}`).update({
          xp:user.val().xp + xp,
        })  
        
        let PrequireXp = Math.floor(0.2 * Math.sqrt(user.val().xp));
        
        if(user.val().xp > user.val().nivel * 200) {
        database.ref(`Servidores/${msg.guild.id}/${msg.author.id}`)
        .update({
          nivel:user.val().nivel + 1,
          xp: 0
        }).then(function() {
          
          let msg1 = db.fetch(`expmessage_${msg.guild.id}`)
          if(msg1 === null) return
          if(msg1 === true) {
          msg.channel.send(`**Parabéns, ${msg.author} Você subiu para o Level ${user.val().nivel+1}**`)
          }
        })          
        }   
      } else {
         var xp = Math.floor(Math.random() * 5) + 2;
        database.ref(`Servidores/${msg.guild.id}/${msg.author.id}`).update({
          xp:user.val().xp + xp,
        })
        
        if(user.val().xp > user.val().nivel * 200) {        
        database.ref(`Servidores/${msg.guild.id}/${msg.author.id}`)
        .update({
          nivel:user.val().nivel + 1,
          xp: 0
        }).then(function() {
          
          let msg2 = db.fetch(`expmessage_${msg.guild.id}`)
          if(msg2 === null) return
          if(msg2 === true) {
          msg.channel.send(`**Parabéns, ${msg.author} Você subiu para o Level ${user.val().nivel+1}**`)
          }
          
        })          
        }             
      }
    }
    })
  }
 });

//Iniciarndo Bot e Status Sistem
client.on("ready", () => {

console.log(`</BOT/> ${client.user.tag} foi Ativado em ${client.guilds.cache.size} Servidores.`)

  let activities = [
      `Encontrou Falhas? Use n!reportbug`,
      `Vote em mim, n!info`,
      `${client.guilds.cache.size.toLocaleString()} Servidores.`,
      `${client.users.cache.size.toLocaleString()} Usuários.`
    ],
    i = 0;
  setInterval( () => client.user.setActivity(`${activities[i++ % activities.length]}`, {
        type: "WATCHING"
      }), 1000 * 60); 
  client.user.setStatus("dnd").catch(console.error);
  
});

 
client.login(Sua Token)
