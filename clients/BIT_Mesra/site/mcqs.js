function initChatting() {
    Bot.iframe.contentDocument.getElementById('text-input').style.display = 'block'
    Bot.iframe.contentDocument.getElementById('send').style.display = 'block'
    Bot.iframe.contentDocument.getElementById('text-input').focus()
    Bot.iframe.contentDocument.getElementById("quick-access").style.display = "block"
    Bot.reply('How may I assist you?')
}
function remember() {
    let children = Bot.iframe.contentDocument.getElementById('chat-area').children
    AI.remember(children[children.length - 3].innerHTML, children[children.length - 1].innerHTML)
}

export const quickAccesses = {
    "query": {
        'callBack': () => {
            Bot.updateQuickAccess({
                "General query": {
                    'callBack': () => {
                        Bot.createBox("General query", 'user')
                        Bot.resetQuickAccess()
                        AI.setContext([])
                    }
                },
                "Admissions": {
                    'callBack': () => {
                        Bot.createBox("Admissions", 'user')
                        Bot.resetQuickAccess()
                        AI.setContext(["Admissions"])
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
        'callBack': () => {
            Bot.createBox("Admissions", 'user')
            initChatting()
            Bot.removeMcq()
            AI.setContext(["Admissions"])
        }
    },
}
