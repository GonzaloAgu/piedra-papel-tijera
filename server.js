const http = require('http')
const express = require('express')
const socketio = require('socket.io')

const RpsGame = require('./rps-game')


const app = express();
const server = http.createServer(app);
const io = socketio(server);

let waitingPlayer = null;
let plyrID;

// La logica de cuando un jugador se conecta

let playing = false;
io.on('connection', (sock) => {
    sock.on('join', (id) => {
        if (id === plyrID || playing) return;
        if (waitingPlayer) {
            new RpsGame(waitingPlayer, sock);
            playing = true;
            waitingPlayer = null;
        } else {
            waitingPlayer = sock;
            plyrID = id;
            waitingPlayer.emit('message', 'Waiting for an opponent')
        }
    
        console.log('Someone connected')
    
    })
    
    sock.on('message', text => {
        io.emit('message', text)
    })

    sock.on('disconnect', function(){
        console.log('Someone disconnected')
        if(playing) io.emit('message', 'El otro jugador ha abandonado');
        playing = false;
        plyrID = '';
    });
})


// Middleware

const clientPath = `${__dirname}/./client`;
app.use(express.static(clientPath));



server.on('error', (err) => {
    console.error('Server error: ', err)
})

server.listen(process.env.PORT || 8080, () => {
    console.log('RPS started')
})