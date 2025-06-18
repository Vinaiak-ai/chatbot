function initChatting() {
    Bot.iframe.contentDocument.getElementById('text-input').style.display = 'block'
    Bot.iframe.contentDocument.getElementById('send').style.display = 'block'
    Bot.iframe.contentDocument.getElementById('text-input').focus()
    Bot.reply('How may I assist you?')
}
function remember() {
    let children = Bot.iframe.contentDocument.getElementById('chat-area').children
    AI.remember(children[children.length - 3].innerHTML, children[children.length - 1].innerHTML)
}

export const quickAccesses = {
    "programs": {
        'callBack': () => {
            Bot.updateQuickAccess({
                "General query": {
                    'callback': () => {
                        bot.createbox("General query", 'user')
                        bot.resetquickaccess()
                        AI.setcontext([])
                    }
                },
                "Admissions": {
                    'callback': () => {
                        bot.createbox("Admissions", 'user')
                        bot.resetquickaccess()
                        AI.setcontext(["Admissions"])
                    }
                },
            })
        }
    }
}
export const mcq = {
    "General query": {
        "callBack": () => {
            Bot.createBox("General query", 'user')
            AI.setContext([])
            initChatting()
            Bot.removeMcq()
        }
    },
    "Admissions": {
        'callback': () => {
            bot.createbox("Admissions", 'user')
            initChatting()
            Bot.removeMcq()
            AI.setcontext(["Admissions"])
        }
    },
}
