class Button {
  constructor(game, settings) {
    this.game = game
    this.settings = settings || {}

    this.settings.x = this.settings.x || 0
    this.settings.y = this.settings.y || 0
    this.settings.width = this.settings.width || 100
    this.settings.height = this.settings.height || 50
    this.settings.text = this.settings.text || ''
    this.settings.strokeStyle = this.settings.strokeStyle || 'white'
    this.settings.fillStyle = this.settings.fillStyle || 'black'
    this.settings.hoverStyle = this.settings.hoverStyle || '#111'
    this.settings.activeStyle = this.settings.activeStyle || '#444'
    this.settings.lineWidth = this.settings.lineWidth == undefined ? this.settings.lineWidth : 1
    this.settings.textColor = this.settings.textColor || 'white'

    this.settings.clicked = this.settings.clicked == undefined ? () => { } : this.settings.clicked
    this.settings.mouseover = this.settings.mouseover == undefined ? () => { } : this.settings.mouseover
    this.settings.mouseoff = this.settings.mouseoff == undefined ? () => { } : this.settings.mouseoff
  }

  update(delta) {
    //console.log(game.input.mouseX, game.input.mouseY)
    if (this.game.input.isPressed('MOUSELEFT')
      && this.game.input.mouseX > this.settings.x
      && this.game.input.mouseX < this.settings.x + this.settings.width
      && this.game.input.mouseY > this.settings.y
      && this.game.input.mouseY < this.settings.y + this.settings.height
    ) {
      this.settings.clicked(game, this)
    }
  }

  draw(ctx) {
    ctx.font = '16px monospace'
    ctx.lineWidth = this.settings.lineWidth
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'

    if (this.game.input.mouseX > this.settings.x
      && this.game.input.mouseX < this.settings.x + this.settings.width
      && this.game.input.mouseY > this.settings.y
      && this.game.input.mouseY < this.settings.y + this.settings.height
    ) {
      if (this.game.input.isDown('MOUSELEFT')) {
        ctx.fillStyle = this.settings.activeStyle
      } else {
        ctx.fillStyle = this.settings.hoverStyle
      }
    } else {
      ctx.fillStyle = this.settings.fillStyle
    }


    ctx.strokeStyle = this.settings.strokeStyle
    ctx.fillRect(
      this.settings.x + 0.5,
      this.settings.y + 0.5,
      this.settings.width,
      this.settings.height
    )
    ctx.strokeRect(
      this.settings.x + 0.5,
      this.settings.y + 0.5,
      this.settings.width,
      this.settings.height
    )
    ctx.fillStyle = this.settings.textColor
    ctx.fillText(
      this.settings.text.toUpperCase(),
      this.settings.x + this.settings.width / 2,
      this.settings.y + this.settings.height / 2,
    )
    ctx.textAlign = 'start'
    ctx.textBaseline = 'alphabetic'
  }
}