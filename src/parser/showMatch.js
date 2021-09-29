const puppeteer = require('puppeteer')

const showMatch = async ({
                             matchs,
                             bot,
                             chatId
                         }) => {
    const now = new Date()
    const match = matchs[0]
    const time = {
        hours: match.time.hours - now.getHours(),
        minutes: match.time.minutes - now.getMinutes()
    }

    if (time.minutes < 0) {
        time.minutes = 60 - (time.minutes * -1)
        time.hours -= 1
    }
    const miliseconds = (time.hours * 60 * 60 * 1000) + (time.minutes * 60 * 1000)
    const triggerTime = 70 * 60 * 1000

    if (miliseconds >= 0) {
        setTimeout(() => {
            matchs.forEach(async currMatch => {
<<<<<<< HEAD
=======
                console.log(`Матч ${currMatch.link} в процессе обработки`)
                await bot.sendMessage(chatId, `Матч подходит к концу! Ссылка: ${currMatch.link}`)
>>>>>>> 46089d5693ed6520e5b8295755d0b69ef3d056d5
                try {
                    const browser = await puppeteer.launch({
                        args: ['--no-sandbox', '--disable-setuid-sandbox'],
                        headless: true,
                        slowMo: 100
                    })

                    const page = await browser.newPage()
                    page.setDefaultNavigationTimeout(0)
    
                    await page.setViewport({
                        width: 1400,
                        height: 900
                    })
                    await page.goto(currMatch.link, {
                        waitUntil: 'domcontentloaded'
                    })
                    await page.waitForSelector('div.fx20').catch(e => console.log(e))
    
                    const matchScores = await page.evaluate(async () => {
                        const stats = document.querySelector('ul.stat').querySelectorAll('li')
                        let profitScores = 0
    
                        stats.forEach(stat => {
                            const title = stat.querySelector('.stat-title').innerText
    
                            if (title === 'Shots On Goal') {
                                const scores = stat.querySelectorAll('.stat-c')
    
                                scores.forEach(score => {
                                    profitScores += Number(score.innerHTML)
                                })
                            }
                        })
                        return profitScores
                    })
    
                    const result = {
                        match: currMatch,
                        scores: matchScores,
                        isProfit: matchScores >= 5
                    }
    
    
                    if (result.isProfit) {
                        await bot.sendMessage(chatId, `!Выгодный матч! ${result.match.link}, ударов в створ: ${result.scores} `)
                    } else {
                        await bot.sendMessage(chatId, `!Неудачный матч! ${result.match.link}, ударов в створ: ${result.scores}`)
                    }
                } catch (error) {
                    console.log(error)
                    await bot.sendMessage(chatId, `Не удалось загрузить страницу! ${currMatch.link}.`)
                }
            });
        }, miliseconds + triggerTime)
    }
}

module.exports = ({
                      matchs,
                      bot,
                      chatId
                  }) => {
    showMatch({
        matchs,
        bot,
        chatId
    })
}