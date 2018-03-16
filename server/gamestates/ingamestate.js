class InGameState {
  constructor(game, airspace) {
    this.game = game
    this.airspace = airspace
    console.log('--- INGAME ---')
    this.updateTimer = 0
    this.timestamp = 0
  }

  update(delta) {
    this.updateTimer += delta
    this.timestamp += delta

    for (let plane of this.airspace.planes) {
      let dx = plane.speed * Math.cos(plane.direction)
      let dy = plane.speed * Math.sin(plane.direction)

      plane.position.x += dx * delta
      plane.position.y += dy * delta

      if (plane.position.x < 0) plane.position.x += this.airspace.width
      if (plane.position.x >= this.airspace.width) plane.position.x -= this.airspace.width
      if (plane.position.y < 0) plane.position.y += this.airspace.height
      if (plane.position.y >= this.airspace.height) plane.position.y -= this.airspace.height
    }

    if (this.updateTimer >= 1 / 30) {
      this.broadcastUpdate()
      this.updateTimer -= 1 / 30
    }
  }

  handle(message, player, game) {
    switch (message.type) {
      case 'player control':
        this.playerControl(message.data, player, game)
        break
      case 'disconnected':
        this.disconnected(message.data, player, game)
        break
      default:
        console.log('unknown message type: ' + message.type)
        console.log('data: ' + message.data)
        break
    }
  }

  disconnected(data, player, game) {
    // server.js will remove player from game object, we just need to get rid of planes
    this.airspace.planes = this.airspace.planes.filter(x => x.owner != player.id)
    this.airspace.companies = this.airspace.companies.filter(x => x.owner != player.id)

    if (this.game.players.length == 0) {
      // reset
      game.reset()
    }
  }

  playerControl(data, player, game) {
    switch (data.command) {
      case 'turn':
      console.log(this.airspace.planes)  
        let p = this.airspace.planes.find(x => x.owner == player.id)
        p.direction += data.angle
        if (p.direction < 0) p.direction += Math.PI * 2
        if (p.direction > Math.PI * 2) p.direction -= Math.PI * 2
        break
      default:
        console.log('!!! recieved unknown control command from player ' + player.name + ' --> ' + data.command)
        break
    }

  }

  broadcastUpdate() {
    let update = {
      timestamp: this.timestamp,
      airspace: this.airspace,
    }

    this.game.server.broadcast(JSON.stringify({
      type: 'update',
      data: update
    }))
  }
}

module.exports = InGameState