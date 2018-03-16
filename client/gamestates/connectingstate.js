class ConnectingState {
  constructor(game, pilotName) {
    this.game = game
    this.socket = game.socket
    console.log('--- CONNECTING STATE ---')
    this.socket.send(JSON.stringify({
      type: 'connected',
      data: {
        pilotName: pilotName
      },
      comment: 'ready to join lobby, gimme lobby info'
    }))
  }

  update(delta) {

  }

  draw(ctx) {

  }

  handle(message, event) {
    switch (message.type) {
      case 'assign id':
        this.game.localID = message.data.id
        break
      case 'lobby info':
        this.joinLobby(message.data)  
        break
      default:
        console.log('------------ERROR-------------')
        console.log('got unknown message type: ' + message.type)
        console.log(message.data)
        console.log('------------------------------')
        break
    }
  }

  joinLobby(data) {
    this.game.gameState = new (this.game.states['LobbyState'])(this.game, data)
  }
}