const puppeteer = require('puppeteer')

const showMatch = async ({
    match,
    bot,
    chatId
}) => {
    const now = new Date()
    const time = {
        hours: match.time - now.getHours(),
        minutes: match.time- now.getMinutes()
    }

    if (time.minutes < 0) {
        time.minutes = 60 - (time.minutes * -1) 
        time.hours -= 1
    }
    const miliseconds = (time.hours * 60 * 60 * 1000) + (time.minutes * 60 * 1000)
    if (time.hours >= 0) {
        setTimeout(async () => {
            try {
                const browser = await puppeteer.launch({
                    headless: true,
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
                    match,
                    scores: matchScores,
                    isProfit: matchScores >= 5
                }  
    
    
                if (result.isProfit) {
                    await bot.sendMessage(chatId, `Ссылка: ${result.match.link}, ударов в створ: ${result.scores} `)
                } else {
                    await bot.sendMessage(chatId, `!Неудачный матч! Ссылка: ${result.match.link}, ударов в створ: ${result.scores.length} `)
                }
            } catch (error) {
                console.log(error)
            }
        }, miliseconds + 70 * 60 * 1000)
    }
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