const server = "https://coach.zenlearn.ai";
const xhr = new XMLHttpRequest();
xhr.open(
    "GET",
    "https://cdn.jsdelivr.net/npm/marked@13.0.2/marked.min.js",
    false,
);
xhr.send();
eval(xhr.responseText);
const renderer = new marked.Renderer();
renderer.link = (link) => {
    const extention = link.href.split(".").pop();
    if (extention === "png" || extention === "jpg" || extention === "jpeg")
        return `<img src="${link.href}" alt="${link.title || link.text}" title="${link.title || ""}" onclick="window.open(this.src, '_blank')">`;
    if (extention === "mp4")
        return `<video muted autoplay controls><source src="${link.href}" title="${link.title || ""}" type="video/mp4">\
            ${link.title || link.text}.\
        </video>`;
    return `<a href="${link.href}" title="${link.title || ""}" target="_blank">${marked.parse(link.text || link.title || "click here")}</a>`;
};
renderer.image = (link) => {
    return `<img src="${link.href}" alt="${link.title || link.text}" title="${link.title || ""}" onclick="window.open(this.src, '_blank')">`;
};

function arraysEqual(arr1, arr2) {
    if (arr1.length !== arr2.length) return false;
    for (let i = 0; i < arr1.length; i++) {
        if (arr1[i] !== arr2[i]) return false;
    }
    return true;
}
class AI {
    static replyNo = 0;
    static clientId;
    static context = "";
    static keepAliveXhr;
    static keepAliveRequested = true;
    static isTutor = false;
    constructor(organisationId, captchaKey) {
        AI.keepAliveXhr = new XMLHttpRequest();
        AI.keepAliveXhr.onload = null;
        fetch(server + "/chat/new").then(res => res.json()).then(data => AI.clientId = data.data)
    }
    static setContext(context) {
        if (AI.context != "" && !arraysEqual(AI.context, context)) {
            xhr.open("POST", server + "/forget", true);
            xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
            xhr.onload = null;
            xhr.send(JSON.stringify({ id: AI.clientId }));
        }
        AI.context = context;
    }
    static answer(query) {
        if (AI.isTutor && typeof query !== "object")
            throw Error("When at tutor state, query should be an object");
        if (!AI.isTutor && typeof query !== "string")
            throw Error("When not at tutor state, query should be a string");
        return new Promise((resolve, _reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open("POST", server + '/chat/' + AI.clientId, true);
            xhr.onload = () => {
                let output = JSON.parse(xhr.responseText).data
                if (output.includes(']'))
                    output = output.split(']')[1];
                output = output.replaceAll('```', '\n');

                if (xhr.status == 200) resolve(output);
                else resolve("An error occured! Try logging in again to the chatbot");
            };
            xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
            xhr.send(
                JSON.stringify({ message: query }),
            );
        });
    }
    static remember(query, reply) {

    }
    static keepAlive() {
        AI.keepAliveRequested = true;
    }
    static getData(context) {
        const xhr = new XMLHttpRequest()
        xhr.open('POST', server + '/data/fetch', true)
        xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8")
        xhr.send(JSON.stringify({ id: AI.clientId, context: context }))
        return new Promise((resolve, reject) => {
            xhr.onload = () => {
                if (xhr.status === 200)
                    resolve(xhr.responseText)
                else resolve("An error occurred while fetching the data. Report to the administrator and try later!")
            }
        })
    }
    static quit() {
        clearInterval(AI.keepAliveIntervalId);
    }
}
class Bot {
    static landscapeWidth = 30;
    static portraitWidth = 100;
    static landscapeHeight = 98;
    static portraitHeight = 98;
    static audios = {
        openFrame: new Audio(
            "https://chatbot.vinaiak.com/chatbot/frontend/resources/Open.wav",
        ),
        reply: new Audio(
            "https://chatbot.vinaiak.com/chatbot/frontend/resources/Bot_Reply.wav",
        ),
        ask: new Audio(
            "https://chatbot.vinaiak.com/chatbot/frontend/resources/User_Send.wav",
        ),
        closeFrame: new Audio(
            "https://chatbot.vinaiak.com/chatbot/frontend/resources/window_close.wav",
        ),
    };
    static exists = false;
    static loaded = false;
    static replying = false;
    /** @type {HTMLIFrameElement} */
    static iframe;
    static optionsCallBacks = {};
    static queue = [];
    static makeTutor() {
        AI.isTutor = true;
        Bot.iframe.contentDocument.getElementById("text-input").style.paddingLeft =
            "5.5dvh";
        Bot.iframe.contentDocument.getElementById(
            "image-input-icon",
        ).style.display = "block";
    }
    static unmakeTutor() {
        AI.isTutor = false;
        Bot.iframe.contentDocument.getElementById("text-input").style.paddingLeft =
            "2dvh";
        Bot.iframe.contentDocument.getElementById(
            "image-input-icon",
        ).style.display = "none";
    }
    static hideFrame() {
        Bot.iframe.style.display = "none";
        Bot.iframe.removeEventListener("animationend", Bot.hideFrame);
    }
    static closeFrame() {
        Bot.iframe.addEventListener("animationend", Bot.hideFrame);
        Bot.iframe.style.animation = "frame-closing 0.3s ease-out";
        Bot.audios.closeFrame.play();
    }
    static generateFrameAnimation() {
        let width =
            window.innerHeight > window.innerWidth
                ? (window.innerWidth * Bot.portraitWidth) / 100
                : (window.innerWidth * Bot.landscapeWidth) / 100;
        return `
        @keyframes fadeIn {
          0% {
            opacity: 0;
          }    
          100% {
            opacity: 1;
          }
        }
        @keyframes frame-closing {
            100%{
              right: -${width}px;
            }
          }
        `;
    }
    static resizeIframe() {
        if (window.innerHeight > window.innerWidth) {
            Bot.iframe.style.width = Bot.portraitWidth + "dvw"
            Bot.iframe.style.height = Bot.portraitHeight + "dvh";
        } else {
            Bot.iframe.style.width = Bot.landscapeWidth + "dvw"
            Bot.iframe.style.height = Bot.landscapeHeight + "dvh";
        }
        document.getElementById("frame-animation").textContent =
            Bot.generateFrameAnimation();
    }
    static createWaiting() {
        let waitingBox = document.createElement("div");
        waitingBox.className = "box bot waiting";
        waitingBox.style.display = "none";
        for (let i = 0; i < 3; i++) {
            let dot = document.createElement("div");
            dot.className = "dot";
            dot.textContent = ".";
            waitingBox.appendChild(dot);
        }
        Bot.iframe.contentDocument
            .getElementById("chat-area")
            .appendChild(waitingBox);
    }
    static startWaiting() {
        let waiting = Bot.iframe.contentDocument.querySelector(".box.bot.waiting");
        waiting.parentNode.removeChild(waiting);
        waiting.style.display = "flex";
        Bot.iframe.contentDocument.getElementById("chat-area").appendChild(waiting);
        Bot.iframe.contentDocument.getElementById("chat-area").scrollTo({
            top: Bot.iframe.contentDocument.getElementById("chat-area").scrollHeight,
            behavior: "smooth",
        });
        Bot.replying = true;
    }
    static stopWaiting() {
        Bot.iframe.contentDocument.querySelector(".box.bot.waiting").style.display =
            "none";
        Bot.replying = false;
    }
    static createAvtar() {
        let avtar = document.createElement("img");
        avtar.src = Bot.avtarPath;
        avtar.className = "avtar bot";
        avtar.style.width = "2rem";
        avtar.style.height = "2rem";
        Bot.iframe.contentDocument.getElementById("chat-area").appendChild(avtar);
    }
    /**
     * @param {string} text
     * @param {'bot'|'user'} type
     * @param {boolean | undefined} format if true text is treated as markdown else as raw HTML
     * @param {(()=>void) | undefined} callBack 
     * @returns {HTMLDivElement | null} box
    */
    static createBox(text, type, format, callBack) {
        if (Bot.replying) {
            Bot.queue.push({
                text: text,
                type: type,
                format: format,
                callBack: callBack,
            });
            return null;
        }
        const chats =
            Bot.iframe.contentDocument.getElementById("chat-area").children;
        if (
            type == "bot" &&
            (chats.length <= 1 ||
                chats[chats.length - 1].className == "box user" ||
                (chats[chats.length - 1].className == "box bot waiting" &&
                    chats[chats.length - 2].className == "box user"))
        ) {
            Bot.createAvtar();
            Bot.audios.reply.play();
        }
        let box = document.createElement("div");
        box.className = "box " + type;
        box.innerHTML =
            (type == "bot" && format == undefined) || format
                ? marked.parse(text.replace(/\u00A0/g, " "), { renderer })
                : text;
        for (const a of box.querySelectorAll("a")) a.target = "_blank";
        const chatArea = Bot.iframe.contentDocument.getElementById("chat-area");
        chatArea.appendChild(box);
        chatArea.scrollTo({
            top:
                chatArea.scrollHeight -
                chatArea.querySelector(".box:last-child").scrollHeight -
                window.innerHeight * 0.3,
            behavior: "smooth",
        });
        if (callBack != undefined) callBack();
        if (Bot.queue.length) {
            const { text, type, format, callBack } = Bot.queue[0];
            Bot.queue.shift();
            this.createBox(text, type, format, callBack);
        }
        return box;
    }
    static createOptions(options, containerClassId, optionClassName) {
        if (!Bot.optionsCallBacks.hasOwnProperty(containerClassId))
            Bot.optionsCallBacks[containerClassId] = [
                () => {
                    let creator = Bot.optionsCallBacks[containerClassId][0];
                    Bot.optionsCallBacks[containerClassId] = [creator];
                    Bot.iframe.contentDocument
                        .getElementById(containerClassId)
                        .parentNode.replaceChild(
                            this.createOptions(options, containerClassId, optionClassName),
                            Bot.iframe.contentDocument.getElementById(containerClassId),
                        );
                },
            ];
        let optionContainer = document.createElement("div");
        optionContainer.id = containerClassId;
        if (this.optionsCallBacks[containerClassId].length > 1) {
            let back = document.createElement("button");
            back.className = "option navigator";
            back.textContent = "\u2190";
            back.title = "previous menu";
            back.addEventListener("click", async () => {
                Bot.optionsCallBacks[containerClassId].pop();
                await Bot.optionsCallBacks[containerClassId][
                    Bot.optionsCallBacks[containerClassId].length - 1
                ]();
            });
            optionContainer.appendChild(back);
        }
        if (this.optionsCallBacks[containerClassId].length > 2) {
            let exit = document.createElement("button");
            exit.className = "option navigator";
            exit.textContent = "×";
            exit.title = "start menu";
            exit.addEventListener("click", Bot.optionsCallBacks[containerClassId][0]);
            optionContainer.appendChild(exit);
        }
        let optionNames = Object.keys(options);
        for (let optionName of optionNames) {
            let option = document.createElement("button");
            option.className = optionClassName;
            option.textContent = optionName;
            if (options[optionName]["id"]) option.id = options[optionName]["id"];
            option.addEventListener("click", async () => {
                if (!options[optionName]["skipBack"])
                    Bot.optionsCallBacks[containerClassId].push(
                        options[optionName]["callBack"],
                    );
                await options[optionName]["callBack"]();
            });
            optionContainer.appendChild(option);
        }
        return optionContainer;
    }
    constructor(
        organisationId,
        captchaKey,
        placeholder,
        title,
        avtarPath,
        quickAccesses,
        onload,
        targetElement,
        openOnLoad,
    ) {
        if (Bot.exists)
            throw new Error(
                "Invalid call to Bot.constructor(). Instance of singleton-class Bot already exists",
            );
        new AI(organisationId, captchaKey);
        // window.addEventListener("beforeunload", AI.quit);
        Bot.avtarPath = avtarPath;
        let frameStyles = document.createElement("style");
        frameStyles.id = "frame-animation";
        document.head.appendChild(frameStyles);
        Bot.iframe = document.createElement("iframe");
        Bot.iframe.title = "chat bot frame";
        fetch("https://chatbot.vinaiak.com/chatbot/frontend/inject.html")
            .then((response) => {
                return response.text();
            })
            .then((data) => {
                Bot.iframe.contentDocument.open();
                Bot.iframe.contentDocument.write(data);
                Bot.iframe.contentDocument.close();
                Bot.exists = true;
            });
        Bot.resizeIframe()
        Bot.iframe.id = "bot-iframe";
        Bot.iframe.style.position = "fixed";
        Bot.iframe.style.bottom = "1dvh";
        Bot.iframe.style.right = "1px";
        Bot.iframe.style.display = "none";
        Bot.iframe.style.overflow = "hidden";
        Bot.iframe.style.border = "none";
        Bot.iframe.style.boxShadow = "0 0 5px rgb(100,100,100)";
        Bot.iframe.style.borderRadius = "10px";
        Bot.iframe.onload = () => {
            if (!Bot.exists) return;
            Bot.iframe.contentDocument.getElementById("background-img").src =
                "https://chatbot.vinaiak.com/chatbot/frontend/resources/doodle.svg";
            Bot.iframe.contentDocument.getElementById("text-input").placeholder =
                placeholder;
            Bot.iframe.contentDocument.querySelector("#heading .title").innerHTML =
                title;
            Bot.iframe.contentDocument
                .getElementById("close")
                .addEventListener("click", Bot.closeFrame);
            Bot.iframe.contentDocument
                .getElementById("send")
                .addEventListener("click", (event) => {
                    event.preventDefault();
                    Bot.iframe.contentDocument.querySelector(
                        "#image-input-icon img",
                    ).src =
                        "https://chatbot.vinaiak.com/chatbot/frontend/resources/image.svg";
                    Bot.reply();
                });
            Bot.iframe.contentDocument
                .getElementById("image-input")
                .addEventListener("input", (event) => {
                    if (event.target.files[0])
                        Bot.iframe.contentDocument.querySelector(
                            "#image-input-icon img",
                        ).src = URL.createObjectURL(event.target.files[0]);
                    else
                        Bot.iframe.contentDocument.querySelector(
                            "#image-input-icon img",
                        ).src =
                            "https://chatbot.vinaiak.com/chatbot/frontend/resources/image.svg";
                    Bot.iframe.contentDocument.getElementById("text-input").focus();
                });

            Bot.iframe.contentDocument
                .getElementById("text-input")
                .addEventListener("keydown", (event) => {
                    if (event.key == "Enter" && !event.shiftKey) {
                        event.preventDefault();
                        Bot.iframe.contentDocument.querySelector(
                            "#image-input-icon img",
                        ).src =
                            "https://chatbot.vinaiak.com/chatbot/frontend/resources/image.svg";
                        Bot.reply();
                    }
                });
            Bot.iframe.contentDocument.querySelector("#heading .avtar").src =
                avtarPath;
            Bot.iframe.contentDocument
                .querySelector("main")
                .appendChild(
                    Bot.createOptions(quickAccesses || {}, "quick-access", "option"),
                );
            Bot.createWaiting();
            if (openOnLoad === undefined || openOnLoad) Bot.openFrame();
            window.addEventListener("resize", Bot.resizeIframe);
            onload(Bot.iframe.contentDocument);
            Bot.loaded = true;
        };
        (targetElement || document.body).appendChild(Bot.iframe);
    }
    static destructor() {
        if (!Bot.exists)
            throw new Error(
                "Invalid call to Bot.destructor(). Bot already doesn't exist",
            );
        Bot.iframe.parentNode.removeChild(Bot.iframe);
        Bot.exists = false;
    }
    //public
    static openFrame() {
        Bot.iframe.style.animation = "fadeIn 0.5s ease-out";
        Bot.iframe.style.display = "block";
        Bot.iframe.contentDocument.getElementById("text-input").focus();
        Bot.audios.openFrame.play();
    }
    static updateQuickAccess(options) {
        Bot.iframe.contentDocument
            .querySelector("main")
            .replaceChild(
                Bot.createOptions(options, "quick-access", "option"),
                Bot.iframe.contentDocument.getElementById("quick-access"),
            );
    }
    static resetQuickAccess() {
        Bot.optionsCallBacks["quick-access"][0]();
    }
    static async reply(text) {
        if (Bot.replying) {
            console.error(
                "Bot.reply() failed. one Bot.reply() call is already processing",
            );
            return;
        }
        let query;
        if (!text) {
            query = Bot.iframe.contentDocument.getElementById("text-input").value;
            if (!query) {
                return;
            }
            Bot.iframe.contentDocument.getElementById("text-input").value = "";
            if (AI.isTutor) {
                let image =
                    Bot.iframe.contentDocument.getElementById("image-input").files[0];
                Bot.createBox(
                    (image ? `<img src=${URL.createObjectURL(image)}><br>` : "") + query,
                    "user",
                );
                image = image
                    ? await new Promise((resolve, reject) => {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                            resolve(event.target.result);
                        };
                        reader.readAsDataURL(image);
                    })
                    : null;
                query = {
                    question: query,
                    images: image ? [image] : [],
                };
                Bot.iframe.contentDocument.getElementById("image-input").value = "";
            } else Bot.createBox(query, "user", false);
        }
        Bot.audios.ask.play();
        Bot.startWaiting();
        let replyText = text || (await AI.answer(query));
        Bot.stopWaiting();
        Bot.createBox(replyText, "bot");
    }
    static createMcq(options, id = "mcq") {
        Bot.iframe.contentDocument
            .getElementById("chat-area")
            .appendChild(Bot.createOptions(options, id, "option"));
    }
    static updateMcq(options, id = "mcq") {
        Bot.iframe.contentDocument
            .getElementById("chat-area")
            .replaceChild(
                Bot.createOptions(options, id, "option"),
                Bot.iframe.contentDocument.getElementById(id),
            );
    }
    static removeMcq(id = "mcq") {
        delete this.optionsCallBacks[id];
        Bot.iframe.contentDocument
            .getElementById("chat-area")
            .removeChild(Bot.iframe.contentDocument.getElementById(id));
    }
    static customiseCss(css) {
        Bot.iframe.contentDocument.head.appendChild(css);
    }
    /**
     * @param {{
     * watermark?: boolean,
     * heading?: string,
     * boxBoder?: string,
     * userBox?: string,
     * botBox?: string,
     * link?: string,
     * mcq?: string
     * }} colors 
    */
    static customiseColor(colors) {
        if (colors.watermark === false)
            Bot.iframe.contentDocument.querySelector("#heading .credit").textContent = ''
        if (colors.heading)
            Bot.iframe.contentDocument.getElementById('heading').style.backgroundColor = colors.heading
        let extraCss = ''
        if (colors.boxBoder)
            extraCss += `.box.bot {box-shadow: 0 0 2dvh ${colors.boxBoder} !important;
background-color: ${colors.botBox || 'white'} !important;}
`
        if (colors.userBox)
            extraCss += `.box.user {background-color: ${colors.userBox} !important;
border: 2dvw solid ${colors.userBox} !important;}
`
        if (colors.link)
            extraCss += `a{color:${colors.link} !important;}
`
        if (colors.mcq)
            extraCss += `.option{box-shadow: 0 0 2px 2px ${colors.mcq} !important;}
.option:hover{background-color: ${colors.mcq} !important;}
`
        if (extraCss) {
            const styles = document.createElement('style')
            styles.textContent = extraCss
            Bot.iframe.contentDocument.head.appendChild(styles)
        }
    }
}
const captchaKey = "6LfgWgAqAAAAAAUnB69cbKEuxMVJJxDzs9lSP65v";

{
    let captchaScript = document.createElement("script");
    captchaScript.src =
        "https://www.google.com/recaptcha/enterprise.js?render=" + captchaKey;
    captchaScript.id = "captcha";
    captchaScript.async = false;
    document.body.appendChild(captchaScript);
    let components = document.createElement("script");
    components.async = false;
    components.src =
        "https://chatbot.vinaiak.com/chatbot/frontend/components.js";
    document.body.appendChild(components);
}

let personalData_className = ''

function addBot(targetElement) {
    let frameNotOpened = false;
    targetElement = targetElement || document.body;
    const captchaKey = "6LfgWgAqAAAAAAUnB69cbKEuxMVJJxDzs9lSP65v";

    {
        const styles = document.createElement("link");
        styles.rel = "stylesheet";
        styles.href =
            "https://chatbot.vinaiak.com/clients/SBPS_Ranchi/site/styles.css";
        document.head.appendChild(styles);
    }
    const loginIcon = document.createElement("div");
    loginIcon.id = "bot-loginIcon";
    loginIcon.innerHTML =
        '<img src="https://chatbot.vinaiak.com/clients/SBPS_Ranchi/site/resources/icon.gif" alt="AI assistants"</img>';
    targetElement.appendChild(loginIcon);
    let captchaScript = document.createElement("script");
    captchaScript.src =
        "https://www.google.com/recaptcha/enterprise.js?render=" + captchaKey;
    captchaScript.id = "captcha";
    targetElement.appendChild(captchaScript);

    loginIcon.onclick = () => {
        if (Bot.exists) {
            Bot.openFrame();
            setTimeout(() => {
                document.getElementById("bot-loginIcon").style.display = "none";
            }, 400);
            return;
        } else {
            setTimeout(() => {
                document.getElementById("bot-loginIcon").style.display = "none";
                if (!Bot.loaded) frameNotOpened = true;
                else Bot.openFrame();
            }, 500);
        }

        new Bot(
            3,
            captchaKey,
            "Ask me about Zen learn ",
            "Zen learn AI",
            "https://chatbot.vinaiak.com/clients/rohit/site/resources/logo.png",
            null,
            (frame) => {
                Bot.iframe.style.bottom = "5dvh";
                frame.getElementById("close").addEventListener("click", () => {
                    document.getElementById("bot-loginIcon").style.display = "block";
                });
                Bot.startWaiting();
                setTimeout(() => {
                    Bot.stopWaiting();
                    Bot.reply(`${["Hi", "Hello", "Welcome"][parseInt(Math.random() * 3)]}! How may I help you today?`)
                }, 2000)
                frame
                    .getElementById("chat-area")
                    .addEventListener("scrollend", AI.keepAlive);
                document.addEventListener("scrollend", AI.keepAlive);
                Bot.customiseColor({ watermark: false, heading: 'blue', boxBoder: 'violet', userBox: 'violet', link: 'green' })
                Bot.iframe.style.zIndex = 10000;
                if (frameNotOpened) Bot.openFrame();
            },
            targetElement,
            false,
        );
        Bot.landscapeHeight = 70;
        Bot.resizeIframe()
        console.log("Logged in to chat bot");
    };
}
