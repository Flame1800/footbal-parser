const TelegrammApi = require('node-telegram-bot-api')
const parserFind = require('./src/parser/findMatchs')

const token = '1883374056:AAHyjFm_cGVjfPzfmUhbQeO8TdEbfEjwFLE'

const bot = new TelegrammApi(token, { polling: true })

const startBot = () => {
    bot.setMyCommands([
        {command: '/info', description: 'Информация о боте'},
        {command: '/play', description: 'Запуск парсера'},
        {command: '/off', description: 'Отключение парсера'},
    ])

    bot.on('message', async msg => {
        const text = msg.text
        const chatId = msg.chat.id

        if  (text === '/start') {
            return bot.sendMessage(chatId, 'Добро пожаловать! Я бот парсер который собирает данные о футбольных матчах и перед завершениям отобранных матчей присылает выгодные, на которые можно поставить, что бы начать набери "/play", и "/off" что бы отключить.')
        }

        if  (text === '/info') {
            return bot.sendMessage(chatId, 'Я бот парсер который собирает данные о футбольных матчах и перед завершениям отобранных матчей присылает выгодные, на которые можно поставить, что бы начать набери "/play", и "/off" что бы отключить.')
        }

        if (text === '/play') {
                await bot.sendMessage(chatId, 'Парсер запущен, поиск...')
                return parserFind({ bot, chatId })
        }

        return bot.sendMessage(chatId, 'Я вас не понял, попробуйте еще раз!)') 
    })
}


startBot()
