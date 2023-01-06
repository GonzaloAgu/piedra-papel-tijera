const http = require('http')
const express = require('express')
const socketio = require('socket.io')

const RpsGame = require('./rps-game')


const app = express();
const server = http.createServer(app);
const io = socketio(server);

let waitingPlayer = null;
let plyrID;


// sin jugadores activos
let playing = false;

// cuando un jugador se conecta
io.on('connection', (sock) => {
    sock.on('join', (id) => {

    //  si el mismo jugador intenta conectarse dos veces, se retorna
        if (id === plyrID || playing) return;
    //  Si ya hay un jugador esperando, se une a el y comienza una nueva partida
        if (waitingPlayer) {
            new RpsGame(waitingPlayer, sock);
            playing = true;
            waitingPlayer = null;
        }
    //  si no, se pone en espera
        else {
            waitingPlayer = sock;
            plyrID = id;
            waitingPlayer.emit('message', 'Esperando a un oponente...')
        }
    
        console.log('Someone connected')
    
    })
    
//  al recibirse un mensaje de chat, se reenvia a todos los usuarios
    sock.on('message', text => {
        io.emit('message', text)
    })

//  desconexión de un jugador
    sock.on('disconnect', function(){
        console.log('Someone disconnected.');
    //  se avisa al resto
        if(playing) io.emit('message', 'El otro jugador ha abandonado');
    //  se setea como que no se está jugando y se nulifica la ID del jugador
        playing = false;
        plyrID = null;
    });
})


// Middleware

const clientPath = `${__dirname}/./client`;
app.use(express.static(clientPath));


// Error handling
server.on('error', (err) => {
    console.error('Server error: ', err)
})

server.listen(process.env.PORT || 8080, () => {
    console.log('RPS started')
})