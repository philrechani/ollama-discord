const Discord = require('discord.js');
const fetch = require('node-fetch')
console.log(Discord.IntentsBitField)

const llamaNumber = '1182421638684360835'

var toggleHistory = false



const messageTemplate = { "role": "user", "content": "" }

//chat models: chatllama, mistral

//add memory: (I'm thinking a boilerplate prompt that includes all interactions with it (and possibly the discord server) to retrain itself as it "sleeps." on sleep, it retrains itself)
//also, I can have it store userId's in a database so it can refer to them specifically and (perhaps randomly) respond to them

const responseTemplate = {
    "model": "mistral",
    "messages": [
        messageTemplate
    ],
    "stream": false
}

const client = new Discord.Client({
    intents: [
        Discord.IntentsBitField.Flags.Guilds,
        Discord.IntentsBitField.Flags.GuildMessages,
        Discord.IntentsBitField.Flags.MessageContent,
        Discord.IntentsBitField.Flags.GuildPresences,
        Discord.IntentsBitField.Flags.GuildMessageTyping
    ]
});

function codeFilter(str) {
    
    const regex = /```(.*?)```/g;
    let match;
    var result = new Array()
    while (match = regex.exec(str)) {
        console.log(match[1]);
        result.push(match[1])
    }
    return result
}

function chunkString(str, len) {
    var size = Math.ceil(str.length / len);
    var result = new Array(size);

    var offset = 0;
    var regexResult = codeFilter(str)
    if (regexResult.length > 0){
        
    }
    for (var i = 0; i < size; i++) {
        result[i] = str.substring(offset, offset + len);
        offset += len;
    }
    return result;
}

var str = "Hello, World!";
var chunks = chunkString(str, 3);
console.log(chunks);

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});


client.on(Discord.Events.MessageCreate, msg => {
    if (msg.content === 'ping') {
        msg.reply('Pong!');
    }
    console.log('message author: ')
    console.log(msg.author)

    if (msg.content === 'toggleHistory' & msg.author.id === '282972834572271618') {
        toggleHistory = !toggleHistory
        msg.reply('Toggled history tracking to: ' + toggleHistory.toString())
    }

    if (msg.content.includes(`<@${client.user.id}>`)) {
        console.log('success')

        
        var newMessage = msg.content.replace(`<@${client.user.id}>`, '')

        if (toggleHistory === false) {

            responseTemplate.messages[0].content = newMessage

        }

        if (toggleHistory === true) {
            if (responseTemplate.messages.length === 1) {
                responseTemplate.messages[0].content = newMessage
            }
            if (responseTemplate.messages.length > 1) {

                messageTemplate.role = "user"
                messageTemplate.content = newMessage
                responseTemplate.messages.push(messageTemplate)
            }

        }


        fetch('http://127.0.0.1:11434/api/chat', {

            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(responseTemplate)
        })
            .then(response => response.json())
            .then(data => {
                console.log(data);

                //to do: refine message splitting

                if (data.message.content.length < 2000) {
                    msg.reply(data.message.content)
                }
                if (data.message.content.length >= 2000) {
                    messages = chunkString(data.message.content, 1999)
                    messages.forEach((element, index) => {
                        console.log(index)
                        msg.reply(element)
                    })
                }
                if (toggleHistory === true) {

                    responseTemplate.messages.push(data.message)
                }

                console.log('message history length:')
                console.log(responseTemplate.messages.length)
            })
            .catch(error => {
                console.error('Error:', error);
            });
    }
});

client.login('MTE4MjQyMTYzODY4NDM2MDgzNQ.GhEBqv.TEmWssNzxJGjEireVFpGgkcOV7ENjYPy_Zw5B0');