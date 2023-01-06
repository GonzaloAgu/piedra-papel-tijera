const writeEvent = text => {
    // <ul> element
    const parent = document.querySelector('#events')

    // <li> element
    const el = document.createElement('li')
    el.innerHTML = text

    parent.appendChild(el)  
};

const writeScoreboard = (scores) => {
    const p0 = document.querySelector('#p0');
    const p1 = document.querySelector('#p1');
    
    p0.innerHTML = scores[0];
    p1.innerHTML = scores[1];
}


const onFormSubmitted = (e) => {
    e.preventDefault()

    const input = document.querySelector('#chat');
    const text = input.value;
    input.value = '';

    sock.emit('message', text)
}

const addButtonListeners = () => {
    ['rock', 'paper', 'scissors'].forEach( (id) => {
        const button = document.getElementById(id)
        button.addEventListener('click', () => {
            sock.emit('turn', id)
        })
    })
}

const sock = io();
sock.on('message', text => writeEvent(text))
sock.on('scores', scores => writeScoreboard(scores))

writeEvent('Welcome to RPS')
addButtonListeners()

document
.querySelector("#chat-form")
.addEventListener('submit', onFormSubmitted)


document
.querySelector('#join')
.addEventListener('click', () => {
    sock.emit('join', sock.id)
})

