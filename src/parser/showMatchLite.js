
const showMatch = async ({
                             matchs,
                             bot,
                             chatId
                         }) => {
    const now = new Date()
    const match = matchs[0]
    const time = {
        hours: match.time.hours - (now.getHours() + 2),
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
                await bot.sendMessage(chatId, `Матч подходит к концу! Ссылка: ${currMatch.link}`)
            })
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