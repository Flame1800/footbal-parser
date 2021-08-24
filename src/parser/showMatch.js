const puppeteer = require('puppeteer')

const showMatch = async ({
                             match,
                             bot,
                             chatId
                         }) => {
    const now = new Date()
    const time = {
        hours: match.time.hours - now.getHours(),
        minutes: match.time.minutes - now.getMinutes()
    }

    if (time.minutes < 0) {
        time.minutes = 60 - (time.minutes * -1)
        time.hours -= 1
    }
    const miliseconds = (time.hours * 60 * 60 * 1000) + (time.minutes * 60 * 1000)
    // const triggerTime = 70 * 60 * 1000
    const triggerTime = 10000

    await bot.sendMessage(chatId, `Ссылка: ${match.link}, Через: ${time.hours} часов и ${time.minutes} минут начнется матч`)

    console.log(miliseconds, triggerTime)

    if (miliseconds >= 0) {
        setTimeout(async () => {
            console.log(`Матч ${match.link} в процессе обработки`)
            try {
                const browser = await puppeteer.launch({
                    args: ['--no-sandbox', '--disable-setuid-sandbox'],
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
                    await bot.sendMessage(chatId, `!Неудачный матч! Ссылка: ${result.match.link}, ударов в створ: ${result.scores.length} (для теста)`)
                }
            } catch (error) {
                console.log(error) 
            }
        }, miliseconds + triggerTime)
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