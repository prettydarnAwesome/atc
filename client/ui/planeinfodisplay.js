class PlaneInfoDisplay {
  constructor(game, settings) {
    this.game = game

    this.settings = settings || {}
    this.settings.x = settings.x || 0
    this.settings.y = settings.y || 0
    this.settings.width = settings.width || 100
    this.settings.height = settings.height || 100

    this.angleDisplay = new AngleDisplay(game, {
      x: this.settings.x + 140,
      y: this.settings.y + 10,
      width: 110,
      height: 110
    })

    this.turnLeftButton = new Button(game, {
      x: this.settings.x + 10,
      y: this.settings.y + 10,
      width: 120,
      height: 50,
      text: 'left',
      clicked: (game, button) => {
        this.turn(-(Math.PI * 2 / 360) * (360 / 16))
      }
    })

    this.turnRightButton = new Button(game, {
      x: this.settings.x + 10,
      y: this.settings.y + 10 + 50 + 10,
      width: 120,
      height: 50,
      text: 'right',
      clicked: (game, button) => {
        this.turn((Math.PI * 2 / 360) * (360 / 16))
      }
    })

    this.plane = undefined
  }

  turn(degrees) {
    this.game.socket.send(JSON.stringify({
      type: 'player control',
      data: {
        command: 'turn',
        angle: degrees,
        plane: this.plane
      }
    }))
  }

  update(delta, airspace) {
    this.turnLeftButton.update(delta)
    this.turnRightButton.update(delta)
  }

  draw(ctx, airspace, players) {
    ctx.lineWidth = 1
    ctx.fillStyle = 'black'
    ctx.fillRect(this.settings.x, this.settings.y, this.settings.width, this.settings.height)
    ctx.strokeStyle = 'white'
    ctx.strokeRect(this.settings.x + 0.5, this.settings.y + 0.5, this.settings.width, this.settings.height)

    this.turnLeftButton.draw(ctx)
    this.turnRightButton.draw(ctx)
    this.angleDisplay.draw(ctx, airspace, this.plane)
  }
}