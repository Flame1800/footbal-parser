const puppeteer = require('puppeteer')
const fs = require('fs')

const showMatch = async ({
    match,
    bot,
    chatId
}) => {
    const msTime = (match.time.hours * 60 * 60 * 1000) + (match.time.minutes * 60 * 1000)
    setTimeout(async () => {
        try {
            const browser = await puppeteer.launch({
                headless: false,
                slowMo: 100
            })
            const page = await browser.newPage()

            await page.setViewport({
                width: 1400,
                height: 900
            })

            await page.goto(match.link, {
                waitUntil: 'domcontentloaded'
            })
            await page.waitForSelector('div.fx20').catch(e => console.log(e))

            const matchScores = await page.evaluate(async () => {
                const stats = document.querySelector('ul.stat').querySelectorAll('li')
                const profitScores = []

                stats.forEach(stat => {
                    const title = stat.querySelector('.stat-title').innerText

                    if (title === 'Shots On Goal') {
                        const scores = stat.querySelectorAll('.stat-c')

                        scores.forEach(score => {
                            profitScores.push(score.innerHTML)
                        })
                    }
                })
                return profitScores
            })

            const result = {
                match,
                scores: matchScores,
                isProfit: matchScores >= 5
            }

            fs.writeFile('finalMatchs.json', JSON.stringify(bestMatches), (e) => {
                if (e) throw e
            })


            if (result.isProfit) {
                await bot.sendMessage(chatId, `Ссылка: ${result.match.link}, ударов в створ: ${result.scores.length} `)
            } else {
                await bot.sendMessage(chatId, `!Неудачный матч! Ссылка: ${result.match.link}, ударов в створ: ${result.scores.length} `)
                await bot.sendMessage(chatId, `Матчи где больше пяти ударов в створ не найдены.`)
            }
        } catch (error) {
            console.log(error)
        }
    }, msTime + 3000000 / 2)
}

module.exports = ({
    match,
    bot,
    chatId
}) => {
    showMatch({
        match,
        bot,
        chatId
    })
}