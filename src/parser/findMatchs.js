const puppeteer = require('puppeteer')
const fs = require('fs')
const showMatch = require('./showMatch')

const link = 'https://www.nowgoal3.com'
const matchLiveLink = 'https://www.nowgoal3.com/match/live-'

const parseMatch = async ({
    bot,
    chatId
}) => {
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
                    id: id.substring(0, 7)  
                })
            })
            return list
        })

        const filteredList = html.filter(({
            count
        }) => count === '-')

        const matchValues = []

        const legrhArr = filteredList.length
        for (let i = 0; i < legrhArr; i++) {
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

                const neededValues = currStats.slice(0, 4)
                const redValues = []

                neededValues.forEach(item => {
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

            const time = {
                hours: (matchTime.getHours() + 5),
                minutes: matchTime.getMinutes(),
                date: new Date()
            }

            time.string = `${time.hours}:${time.minutes}`

            matchValues.push({
                link,
                time,
                values: liveMatch.redValues
            })
        }

        const profitMatches = matchValues.filter(({
            values
        }) => values.length >= 3)


        const complectProfitMatches = profitMatches.reduce((acc, current) => {
            const property = current.time.string
            acc[property] = acc[property] || []
            acc[property].push(current)
            return acc
        }, {})

        const sortedComplectMatches = Object.values(complectProfitMatches).sort((a,b) => new Date(a.date) - new Date(b.date))
 
        fs.writeFile('matchList.json', JSON.stringify(sortedComplectMatches), (e) => {
            if (e) throw e
        })

        if (profitMatches.length > 0) {
            await bot.sendMessage(chatId, `Найдено ${profitMatches.length} выгодных матчей, ждите ссылки, на самые выигрышные матчи`)

            sortedComplectMatches.forEach((item) => {
                showMatch({
                    matchs: item,
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