const server = "https://api.vinaiak.com";
const captchaKey = "6LfgWgAqAAAAAAUnB69cbKEuxMVJJxDzs9lSP65v";

let AI, Bot;
fetch("https://chatbot.vinaiak.com/chatbot/frontend/inject.js").then(
    (response) => {
        response.text().then((data) => {
            let Bot1, AI1;
            data = data + ";Bot1 = Bot;AI1 = AI";
            eval(data);
            AI = AI1;
            Bot = Bot1;
        });
    },
);
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
        let customCss = getLoginFormCss(
            `
  #heading {
	  background-color: #fead61;
	}`);
        new Bot(
            3,
            null,
            "Ask me your doubt",
            "Student Mentor",
            "./resources/icon.gif",
            null,
            (frame) => {
                Bot.iframe.style.bottom = "5dvh";
                frame.getElementById("close").addEventListener("click", () => {
                    document.getElementById("bot-loginIcon").style.display = "block";
                });
                Bot.startWaiting();
                Bot.customiseCss(customCss);
                frame
                    .getElementById("chat-area")
                    .addEventListener("scrollend", AI.keepAlive);
                document.addEventListener("scrollend", AI.keepAlive);
                Bot.iframe.style.zIndex = 10000;
                if (frameNotOpened) Bot.openFrame();

                Bot.stopWaiting()
                Bot.makeTutor()
                let ct = 0
                Bot.createBox("Welcome back champ! how may I help you?", 'bot')
                frame.getElementById("send").addEventListener('click', (event) => {
                    event.preventDefault()
                    const query = Bot.iframe.contentDocument.getElementById("text-input").value;
                    let image =
                        Bot.iframe.contentDocument.getElementById("image-input")
                    Bot.createBox(
                        (image.files[0] ? `<img src=${URL.createObjectURL(image.files[0])}><br>` : "") + query,
                        "user", true
                    );
                    image.value = ''
                    frame.getElementById("text-input").value = ''
                    Bot.iframe.contentDocument.querySelector("#image-input-icon img").src =
                        "https://chatbot.vinaiak.com/chatbot/frontend/resources/image.svg";

                    switch (ct) {
                        case 0:
                            Bot.startWaiting()
                            setTimeout(() => {
                                Bot.stopWaiting()
                                Bot.createBox(`As we learned
Superposition of Electric field -
The resultant electric field at any point is equal to the vector sum of all the electric fields.
![figure](https://cdn.entrance360.com/media/uploads/2018/06/09/3280-11.PNG)
Let k = 1/4π€°  

The electric field intensity (**E**) at **O** due to **A** is $|**E1**| = k(q/r^2)$ [directed towards midpoint of **BC**]----(1)  

And electric field intensity (**E**) at **O** due to **B** is $|**E2**| = k(q/r^2)$ [directed towards midpoint of **AC**]----(2)  

The electric field intensity (**E**) at **O** due to **C** is $|**E3**| = k(q/r^2)$ [directed towards midpoint of **AB**]----(3)  

From (1),(2),(3) we get the **net electric intensity** at **O** due to **A,B,C** combined is given by ,  

**E** = **E1** + **E2** + **E3**  

Note that electric field intensity **E1,E2,E3** are **vector quantities** and they **form a triad with angle between them = $120^\circ$**, and since **they are equal in magnitude they cancel out each other**  

Thus ,**net electric intensity**  

**E** = **0**`, 'bot')
                            }, 5000)
                            break
                    }
                    ct++
                })
            },
            targetElement,
            false,
        );
        Bot.landscapeHeight = 70;
        Bot.landscapeWidth = 40;
        Bot.resizeIframe()
        console.log("Logged in to chat bot");
    };
}
//ABC is an equilateral triangle. Charges +q are placed at each corner. The electric intensity at O will be
