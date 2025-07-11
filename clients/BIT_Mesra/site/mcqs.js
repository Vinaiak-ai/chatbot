function initChatting() {
    Bot.iframe.contentDocument.getElementById('text-input').style.display = 'block'
    Bot.iframe.contentDocument.getElementById('send').style.display = 'block'
    Bot.iframe.contentDocument.getElementById('text-input').focus()
    Bot.iframe.contentDocument.getElementById("quick-access").style.display = "block"
    Bot.reply('How may I assist you?')
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
                "Admission": {
                    'callBack': () => {
                        Bot.createBox("Admission", 'user')
                        Bot.resetQuickAccess()
                        AI.setContext(["Admission"])
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
    "Admission": {
        'callBack': () => {
            Bot.createBox("Admission", 'user')
            initChatting()
            Bot.removeMcq()
            AI.setContext(["Admission"])
        }
    },
}
