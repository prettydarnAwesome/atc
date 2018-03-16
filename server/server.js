let WebSocket = require('ws')
let gameloop = require('node-gameloop');

let server = new WebSocket.Server({ port: 3000 })

let game = {
  server: server,
  gameState: undefined,
  states: {
    'LobbyState': require('./gamestates/lobbystate.js'),
    'InGameState': require('./gamestates/ingamestate.js'),
  },
  players: [],
  reset: function () {
    this.gameState = new (this.states['LobbyState'])(this)
  }
}

server.broadcast = function broadcast(data) {
  server.clients.forEach(client => { if (client.readyState === WebSocket.OPEN) client.send(data) })
}

server.on('connection', function connection(ws) {
  let id = 0
  while (game.players.some(x => x.id == id)) id++

  let player = {
    id: id,
    socket: ws,
    name: ''
  }

  game.players.push(player)

  ws.on('close', () => {
    game.players = game.players.filter(x => x.id != id)

    game.gameState.handle({
      type: 'disconnected',
      data: {
        id: id,
      }
    }, ws, game)
  })

  ws.on('message', function incoming(message) {
    handle(message, player)
  })
})


// init gamestate
game.reset()

// start gameloop
let frameCount = 0
const id = gameloop.setGameLoop(function (delta) {
  game.gameState.update(delta)
}, 1000 / 30)

// handle incoming messages
function handle(message, socket) {
  message = JSON.parse(message)
  console.log(message.type + ' -> ' + message.comment)
  console.log('   ', message.data)
  game.gameState.handle(message, socket, game)
}