const DELAY_BETWEEN_TURNS = 3000;

class RpsGame {
  constructor(p1, p2) {
    this._players = [p1, p2];
    this._turns = [null, null];
    setTimeout(() => {
        this._sendToPlayers(`Guarda que arranca!`);
        this._playerDesignation();
    } , 200);
    

    this._players.forEach((player, idx) => {
      player.on("turn", (turn) => {
        this._onTurn(idx, turn);
      });
    });
    this._scores = [0, 0];
    this._updateScoreboard(this._players[0], this._players[1])
  }

  _sendToPlayer(playerIndex, msg) {
    this._players[playerIndex].emit("message", msg);
  }

  _sendToPlayers(msg) {
    this._players.forEach((player) => {
      player.emit("message", msg);
    });
  }
  _playerDesignation(){
    this._players.forEach( (p, idx) =>{
        this._sendToPlayer(idx, `Sos el jugador ${idx + 1}`)
    })
    this._players[1].emit('second-player', true)
    
  }
  _onTurn(playerIndex, turn) {
    this._turns[playerIndex] = turn;
    this._sendToPlayer(playerIndex, `Elegiste ${turn.toUpperCase()}.`);
    this._checkGameOver();
    this._players[playerIndex].emit('change-hand', 0, turn);
  }

  _disableButtons() {
    this._players.forEach(p => {
      p.emit('disable-buttons', DELAY_BETWEEN_TURNS)
    })
  }
  _checkGameOver() {
    const turns = this._turns;
    if (turns[0] && turns[1]) {
      this._sendToPlayers(`FIN DEL TURNO!`);
      this._sendToPlayers(`Jugador 1: ${turns[0]}`);
      this._sendToPlayers(`Jugador 2: ${turns[1]}`);
      // cambio de imagenes al rival
      this._players[0].emit('change-hand', 1, this._turns[1]);
      this._players[1].emit('change-hand', 1, this._turns[0]);

      this._getGameResults();
      this._turns = [null, null];
      this._disableButtons();
      setTimeout(() => {
        this._players.forEach( p => {
          p.emit('change-hand', 0, 'idle');
          p.emit('change-hand', 1, 'idle');
        })
      }, DELAY_BETWEEN_TURNS)
    }
  }

  _getGameResults() {
    const p0 = this._decodeTurn(this._turns[0]);
    const p1 = this._decodeTurn(this._turns[1]);

    const distance = (p1 - p0 + 3) % 3;

    switch (distance) {
      case 0:
        this._sendToPlayers("Draw!");
        break;
      case 1:
        this._sendWinMessage(this._players[0], this._players[1]);
        this._scores[0]++;
        break;
      case 2:
        this._sendWinMessage(this._players[1], this._players[0]);
        this._scores[1]++;
        break;
     default:
        throw new Error('No se pudo determinar la distancia')
    }
    this._updateScoreboard(this._players[0], this._players[1])
  }
  _decodeTurn(turn) {
    switch (turn) {
      case "rock":
        return 0;
      case "scissors":
        return 1;
      case "paper":
        return 2;
      default:
        throw new Error("Could not decode turn ", turn);
    }
  }
  _sendWinMessage(winner, loser) {
    winner.emit("message", "GANASTE!");
    loser.emit("message", "PERDISTE.");
  }
  _updateScoreboard(p0, p1){
    p0.emit('scores', this._scores)
    p1.emit('scores', this._scores)
  }
}

module.exports = RpsGame;
