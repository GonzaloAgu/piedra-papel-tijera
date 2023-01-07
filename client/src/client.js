// escribe texto en el chat
const writeEvent = text => {

    // chequeo si hay texto realmente
    if (!text) return;

    // <ul> element
    const parent = document.querySelector('#events')

    // <li> element
    const el = document.createElement('li')
    el.innerHTML = text

    parent.appendChild(el)
    scrollUpdate()
};


// actualizar scroll del chat
let chat = document.querySelector("#events");
const scrollUpdate = () => {
    chat.scrollTop = chat.scrollHeight;
}

// escribe los puntajes en el scoreboard
const writeScoreboard = (scores) => {
    let p0;
    let p1;

    // en caso de ser el segundo jugador, se invierte la selección del contador de puntos
    if (secondPlayer) {
        p0 = document.querySelector('#p1');
        p1 = document.querySelector('#p0');
    }
    else {
        p0 = document.querySelector('#p0');
        p1 = document.querySelector('#p1');
    }

    p0.innerHTML = scores[0];
    p1.innerHTML = scores[1];
}

// envia mensaje al chat
const onFormSubmitted = (e) => {
    e.preventDefault()

    const input = document.querySelector('#chat');
    const text = input.value;
    input.value = '';

    sock.emit('message', text)
}

// event listeners para los botones
const addButtonListeners = () => {
    ['rock', 'paper', 'scissors'].forEach((id) => {

        const button = document.getElementById(id)

        // emisión de socket con el elemento elegido para cada botón
        button.addEventListener('click', () => {
            sock.emit('turn', id)
        })
    })
}

// cambia la imagen de manos
const changeHandImage = (player, element) => {
    const img = document.getElementById(`img${player}`);
    img.src = `./assets/img/${element}.png`;
}

// desactiva temporalmente los botones para jugar
const disableButtons = t => {
    const button = document.getElementsByClassName('element-button');
    console.log(button)

    Array.from(button).forEach(b => {
        b.style.backgroundColor = 'gray';
        b.style.color = 'lightgray'
        b.style.cursor = 'not-allowed'
    })
    setTimeout( () => {
        Array.from(button).forEach(b => {
            b.style.backgroundColor = '#00bcd4';
            b.style.color = 'white'
            b.style.cursor = 'pointer'
        })
    }, t )
}

const sock = io();

// impresion de mensajes en chat y resultados en scoreboard ante eventos desde el server
sock.on('message', text => writeEvent(text))
sock.on('scores', scores => writeScoreboard(scores))

// si es el segundo jugador, el sv lo informa (para escribir correctamente el puntaje)
let secondPlayer = false;
sock.on('second-player', () => {
    secondPlayer = true;
    console.log('Sos el segundo jugador.')
})

sock.on('change-hand', (player, element) => changeHandImage(player, element))
sock.on('disable-buttons', (t) => disableButtons(t))

// mensaje de bienvenida
writeEvent('Bienvenido al piedra, papel o tijera!')
addButtonListeners()

// event listener para el submit del chat
document
    .querySelector("#chat-form")
    .addEventListener('submit', onFormSubmitted)

// event listener para unirse a una partida
document
    .querySelector('#join')
    .addEventListener('click', () => {
        sock.emit('join', sock.id)
    })

