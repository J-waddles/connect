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

function curateMessage(MessageType, connectionType, interests, connection) {
 
  prompt = 
  `
  You are a networking and connection guru, who always knows the best way to start a genuine conversation.
  When I give you infomation about a type of person I want to connect to; with different ways of connecting, 
  you adjust your prompts accordingly to ensure it is a conversation starter that is about the other person i want to connect with.
  The conversation you be focussed on the other person and should show some sort of genuine appreciation towards that persons work or interests. 
  You have to generate a start message for talking ${MessageType} regarding ${connectionType}. This should relate to their interests or work of: ${interests}. 
  I have a connection to them through: ${connection}. 
  `
}

const handleSubmit = async (e) => {
    e.preventDefault()
    isRunning = true;
    const data = new FormData(form)

    // user's chatstripe

    const messageType = document.querySelector("#type-of-message").value;
    const connectionType = document.querySelector("#type-of-connection").value;
    const interests = document.querySelector("#interests").value;
    const connection = document.querySelector("#connection-to").value;

    curateMessage(messageType, connectionType, interests, connection)

    // change interests here
    chatContainer.innerHTML += chatStripe(false,  
        `Tips for conversation:
        1. The conversation is about them.
        2. Show genuine appreciation.
        3. Compliment them authentically.
        4. It's not about YOU, focus on them.
        5. If its meant to be the conversation will naturally flow to you.`)
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

    // change
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