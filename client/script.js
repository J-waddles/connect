import bot from './assets/wAIv.svg'
import user from './assets/user.svg'

const form = document.querySelector('form')
const chatContainer = document.querySelector('#chat_container')

let loadInterval
let isRunning = false


function loader(element) {
    element.textContent = 'Curating the perfect message'

    loadInterval = setInterval(() => {
        // Update the text content of the loading indicator
        element.textContent += '.';

        // If the loading indicator has reached three dots, reset it
        if (element.textContent === 'Curating the perfect message....') {
            element.textContent = 'Curating the perfect message';
        }
    }, 300);
}

function typeText(element, text) {
    let index = 0

    let interval = setInterval(() => {
        if (index < text.length) {
            element.innerHTML += text.charAt(index)
            index++
        } else {
            clearInterval(interval)
        }
    }, 20)
}

// generate unique ID for each message div of bot
// necessary for typing text effect for that specific reply
// without unique ID, typing text will work on every element
function generateUniqueId() {
    const timestamp = Date.now();
    const randomNumber = Math.random();
    const hexadecimalString = randomNumber.toString(16);

    return `id-${timestamp}-${hexadecimalString}`;
}

function chatStripe(isAi, value, uniqueId) {
    return (
        `
        <div class="wrapper ${isAi && 'ai'}">
            <div class="chat">
                <div class="profile">
                    <img 
                      src=${isAi ? bot : user} 
                      alt="${isAi ? 'bot' : 'user'}" 
                    />
                </div>
                <div class="message" id=${uniqueId}>${value}</div>
            </div>
        </div>
    `
    )
}

function curateMessage(gender, acquaintance, interests, persona) {
  // prompt = `An online direct message:
  //   For a: ${gender} I ${acquaintance}.
  //   I want a single question about a single interest: ${interests}
  //   I want each question to come across as ${persona}
  //   Give a 3 different lines for each interest, 
  //   make them sound human for people who ${persona}, let the tone come across little playful, 
  //   As an open-ended text starter for a conversation.
  //   natural flowing question. 
  //   I want to come across interested about the persons life`
  
  prompt = 
  `
  I am wanting the responses to come across with 'rizz' which means one's ability to attract a romantic interest, It can be defined as an ability to charm or flirt with a potential partner, with pick-up lines and general chat.
  Thus, i am expecting responses to come across as such.

  Here is the context for the message:
  An online direct message:
  To a ${gender} I ${acquaintance}.
  I need a conversation opener with a single interest including: ${interests}.
  Here are the requirements:
  Give 3 different openers for each interest. Make sure each is different in format but keep them short (7-14 words).
  Each to come across with lots of rizz, ${persona}.
  Make the output come across in a way they might find humorous.
  Make iutput about them.
  Make the output feel like natural romantic charm conversation that flows over text.
  No call to action. 
  Written like a jock with low IQ.
  `
//   `An online direct message:
//   For a: ${gender} ${acquaintance}.
//   I want a single question about a single interest: ${interests}
//   Give 3 different lines for each interest;
//   different interogative questions,
//   one would you rather question,
//   I want each question to come across as playfully interested
//   make them sound human for people that havent met before, 
//   as an open-ended text starter for a natural flowing conversation.`
}

const handleSubmit = async (e) => {
    e.preventDefault()
    isRunning = true;
    const data = new FormData(form)

    // user's chatstripe

    const gender = document.querySelector("#gender-select").value;
    const acquaintance = document.querySelector("#acquaintance").value;
    const interests = document.querySelector("#interests").value;
    const persona = document.querySelector("#persona").value;

    curateMessage(gender, acquaintance, interests, persona)

    // `Can you please provide some direct message examples I could use, here is the context:
    // For a ${gender} I ${style}, can you base each around a single interest, 
    // Interests: ${interests}. In the theme of: ${message}. Give a couple different lines, make them sound ${message} as an open ended text starter for a conversation online`;
    chatContainer.innerHTML += chatStripe(false,  `For these interests: ${interests}.`)
    // to clear the textarea input 
    //form.reset()

    // bot's chatstripe
    const uniqueId = generateUniqueId()
    chatContainer.innerHTML += chatStripe(true, " ", uniqueId)

    // to focus scroll to the bottom 
    chatContainer.scrollTop = chatContainer.scrollHeight

    // specific message div 
    const messageDiv = document.getElementById(uniqueId)


    // messageDiv.innerHTML = "..."
    loader(messageDiv)

    form.querySelector('input').blur();

    const response = await fetch('https://waiv.onrender.com', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        
        body: JSON.stringify({
            prompt: prompt
        })
    })

    clearInterval(loadInterval)
    messageDiv.innerHTML = " "

    if (response.ok) {
        const data = await response.json();
        const parsedData = data.bot.trim() // trims any trailing spaces/'\n' 

        typeText(messageDiv, parsedData)
    } else {
        const err = await response.text()

        messageDiv.innerHTML = "Something went wrong"
        alert(err)
    }
    isRunning = false;
}



form.addEventListener('submit', handleSubmit)
form.addEventListener('keyup', (e) => {
    if (e.keyCode === 13 && !isRunning) {
        handleSubmit(e)
        closeForm()
    }
})  