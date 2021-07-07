const puppeteer = require('puppeteer')
const fs = require('fs')
const showMatch = require('./showMatch')
const moment = require('moment')

const link = 'https://www.nowgoal3.com'
const matchLiveLink = 'https://www.nowgoal3.com/match/live-'

const parseMatch = async ({
    bot,
    chatId
}) => {
    try {
        const browser = await puppeteer.launch({
            headless: false,
            slowMo: 100,
            devtools: true
        })
        const page = await browser.newPage()

        await page.setViewport({
            width: 1400,
            height: 900
        })
        await page.goto(link, {
            waitUntil: 'domcontentloaded'
        })
        await page.waitForSelector('tr.tds').catch(e => console.log(e))

        const html = await page.evaluate(async () => {
            const list = []
            const listItems = document.querySelectorAll('td.blue')

            listItems.forEach(item => {
                const count = item.querySelector('b').innerText
                const id = item.getAttribute('onclick', OpenDetail).replace(/\D+/g, "")

                list.push({
                    count,
                    id
                })
            })
            return list
        })

        const filteredList = html.filter(({
            count
        }) => count === '-')

        const matchValues = []

        for (let i = 0; i < filteredList.length; i++) {
            const link = `${matchLiveLink}${filteredList[i].id}`
            await page.goto(link, {
                waitUntil: 'domcontentloaded'
            })
            await page.waitForSelector('span[name=timeData]').catch(e => console.log(e))
            console.log(i)

            const liveMatch = await page.evaluate(async () => {
                const startTime = document.querySelector('#match_time')?.getAttribute('data-t') || new Date()

                const comparisions = document.querySelectorAll('.fx-comparision')
                let currStats = []
                comparisions.forEach(comparision => {
                    const minute = comparision.querySelector('span.fx-c-3').querySelector('span').innerText
                    if (minute === '76~90') {
                        const uls = comparision.querySelectorAll('ul')

                        uls.forEach(ul => {
                            const lis = ul.querySelectorAll('li')
                            lis.forEach(li => {
                                if (li.getAttribute('style') === null) {
                                    const value = li.querySelector('.fx-c2')
                                    currStats.push(value)
                                }
                            })
                        })
                    }
                })

                const nededValues = currStats.slice(0, 4)
                const redValues = []

                nededValues.forEach(item => {
                    if (item.classList.contains('red')) {
                        redValues.push(item.innerText)
                    }
                })

                return {
                    redValues,
                    startTime
                }
            })

            const matchTime = new Date(liveMatch.startTime)
            const now = new Date()
            const time = {
                hours: (matchTime.getHours() + 5) - now.getHours(),
                minutes: matchTime.getMinutes() - now.getMinutes()
            }

            if (time.minutes < 0) {
                time.minutes = 60 - (time.minutes * -1) 
                time.hours -= 1
            }


            if (time.hours >= 0) {
                console.log(`${time.hours}:${time.minutes}`, liveMatch.redValues, link)
                matchValues.push({
                    link,
                    time,
                    values: liveMatch.redValues
                })
            }
        }

        const profitMatches = matchValues.filter(({
            values
        }) => values.length >= 3)



        fs.writeFile('matchList.json', JSON.stringify(profitMatches), (e) => {
            if (e) throw e
        })

        if (profitMatches.length > 0) {
            await bot.sendMessage(chatId, `Найдено ${profitMatches.length} выгодных матчей, ждите ссылки, на самые выигрышные матчи`)

            profitMatches.forEach((item) => {
                showMatch({
                    match: item,
                    bot,
                    chatId
                })
            })

        } else {
            await bot.sendMessage(chatId, `Выгодных матчей не найдено`)
        }


    } catch (error) {
        console.log(error)
    }
}

module.exports = ({
    bot,
    chatId
}) => {
    parseMatch({
        bot,
        chatId
    })
}