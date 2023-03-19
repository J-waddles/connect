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
  prompt = 
  `
Here is the context for the message:
An online direct message:
From a man to a ${gender} I ${acquaintance}.
I need a conversation opener including single interest: ${interests}.
Here are the requirements:
IF ${persona} = rizz, rizz meaning one's ability to attract a romantic interest, 
It can be defined as an ability to charm or flirt with a potential partner, 
with pick-up lines and general chat. I then want it to sound like a jock with low IQ. 
Make the output come across in a way they might find humorous.
IF ${persona} = interested, I want it to come across as the popular kid who knows how to charm the females. 
Make the output feel like natural romantic charm conversation that flows over text.
IF they select an emoji I want it to come across as either. but put a relatable emoji.

Constraint: Do not include pretext or context in message.

Thus, i am expecting responses to come across as such, 
examples
persona: rizz 
interests: Beach, running and gym.
Beach: If a beach could talk, I'd be jealous of the attention it gets from you!
Running: I'd take you in a run but don't know if you could keep up ;)
Gym: mind if you squeeze me into your workout routine ;)

persona: interested
interests: running, partying
running: Need someone to keep up your pace? Give me a call.
drinking: You say drinking problem, I think it's a valid solutions ;)

Person: ${persona}
Interests: ${interests}
  `
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