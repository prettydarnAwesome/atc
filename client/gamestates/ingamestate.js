class InGameState {
  constructor(game, data) {
    console.log('--- INGAME STATE ---')
    this.game = game
    this.airspace = data.airspace
    this.players = data.players
    this.players.find(x => x.id == this.game.localID).isLocalPlayer = true

    console.log('-> players')
    console.log(this.players)
    console.log('-> airspace')
    console.log(this.airspace)

    this.selectedPlane = this.airspace.planes.find(x => x.owner == this.game.localID).id

    this.airspaceDisplay = new AirspaceDisplay(game, {
      x: 400,
      y: 10,
      width: 1920 - (400 + 10),
      height: 1080 - 20
    })

    this.planeInfoDisplay = new PlaneInfoDisplay(game, {
      x: 10,
      y: 10,
      width: 400,
      height: 1080 - 20
    }) 

    this.planeInfoDisplay.plane = this.selectedPlane
  }

  update(delta) {
    this.airspaceDisplay.update(delta, this.airspace)
    this.planeInfoDisplay.update(delta, this.airspace)
  }

  draw(ctx) {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
    this.airspaceDisplay.draw(ctx, this.airspace, this.players)
    this.planeInfoDisplay.draw(ctx, this.airspace, this.players)
  }

  handle(message) {
    switch (message.type) {
      case 'update': this.updateAirspace(message.data); break
      default:
        console.log('------------ERROR-------------')
        console.log('got unknown message type: ' + message.type)
        console.log(message.data)
        console.log('------------------------------')
        break
    }
  }

  updateAirspace(data) {
    let timestamp = data.timestamp
    let airspace = data.airspace

    this.airspace = airspace
  }
}