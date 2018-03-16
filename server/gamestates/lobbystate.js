let Generators = require('../../model/generators.js')

class LobbyState {
  constructor(game) {
    this.game = game
    console.log('--- LOBBY ---')
    this.playerIds = []

    this.nodeGraph = Generators.getNodeGraph()
  }

  update(delta) {
  }

  handle(message, player) {
    switch (message.type) {
      case 'connected': this.playerJoining(message.data, player, this.game); break
      case 'disconnected': this.playerDisconnected(message.data.id); break
      case 'request start game': this.startGame(message.data, player, this.game); break 
      case 'regenerate node graph': this.regenerateNodeGraph(message.data, player, this.game); break 
      default:
        console.log('unknown message type: ' + message.type)
        console.log('data: ' + message.data)
        break;
    }
  }

  playerJoining(data, player) {
    if (this.game.players.some(x => x.name == data.pilotName)) {
      if (data.pilotName.length == 5) data.pilotName = data.pilotName.slice(0, -1)
      data.pilotName += Math.floor(Math.random() * 10)
    }
    this.game.players.find(x => x.id == player.id).name = data.pilotName
    this.playerIds.push({
      id: player.id,
      isLobbyLeader: this.game.players.length == 1
    })

    player.socket.send(JSON.stringify({
      type: 'assign id',
      data: {
        id: player.id
      }
    }))

    this.broadcastLobbyInfo()
    //console.log(this.players.length + ' players connected')
  }

  playerDisconnected(id) {
    this.playerIds = this.playerIds.filter(x => x.id != id)
    if (!this.playerIds.some(x => x.isLobbyLeader) && this.playerIds.length > 0) {
      this.playerIds[0].isLobbyLeader = true
    }
    //console.log('removed player ' + id)
    //console.log(this.players.length + ' players connected')
    this.broadcastLobbyInfo()
  }

  regenerateNodeGraph(data, player, game) {
    if (this.playerIds.find(x => x.id == player.id).isLobbyLeader) {
      this.nodeGraph = Generators.getNodeGraph()
    }

    this.broadcastLobbyInfo()
  }

  broadcastLobbyInfo() {
    this.game.server.broadcast(JSON.stringify({
      type: 'lobby info',
      data: {
        players: this.game.players.map(player => {
          return {
            id: player.id,
            name: player.name,
            isLobbyLeader: this.playerIds.find(x => x.id == player.id).isLobbyLeader
          }
        }),
        nodeGraph: this.nodeGraph
      },
      comment: 'heres the lobby info'
    }))
  }

  startGame(data, player) {
    let isLobbyLeader = this.playerIds.find(x => x.id == player.id).isLobbyLeader
    if (!isLobbyLeader) return
    
    let airspace = Generators.getAirspace(this.nodeGraph)
    console.log(airspace)

    for (let player of this.game.players) {
      let id = player.id
      let name = player.name

      let plane = {
        position: {
          x: 500,
          y: 500,
        },
        speed: 5,
        direction: Math.floor(Math.random()*8)/8 * Math.PI * 2,
        owner: id,
        id: Generators.getPlaneID(),
      }

      airspace.planes.push(plane)
    }

    this.game.gameState = new (this.game.states['InGameState'])(this.game, airspace)

    this.game.server.broadcast(JSON.stringify({
      type: 'start game',
      data: {
        airspace: airspace,
        players: this.game.players.map(player => {
          return {
            id: player.id,
            name: player.name,
          }
        }),
      }
    }))
  }
}

module.exports = LobbyState