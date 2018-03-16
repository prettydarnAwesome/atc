class StartState {
  constructor(game) {
    this.game = game
    this.socket = game.socket
    //TODO: roll my own input because this one leaves dangling events when you destroy() it
    this.name = ''

    console.log('--- START STATE ---')
  }

  update(delta) {
    ctx.font = '16px monospace'
    ctx.fillStyle = 'white'
    for (let letter of 'abcdefghijklmnopqrstuvwxyz'.split('')) {
      if (this.name.length < 5 && game.input.isPressed(letter)) {
        this.name += letter
      }
    }
    if (game.input.isPressed('backspace')) {
      this.name = this.name.slice(0, -1)
    }

    if (game.input.isPressed('enter')) {
      this.submit()
    }
  }

  draw(ctx) {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
    ctx.fillText('enter name: ' + this.name, 10, 50)
  }

  handle(message, event) {
    switch (message.type) {
      default:
        console.log('------------ERROR-------------')
        console.log('got unknown message type: ' + message.type)
        console.log(message.data)
        console.log('------------------------------')
        break
    }
  }

  submit() {
    if (this.name.length > 0) {
      this.game.connect(this.name)
    }
  }
}