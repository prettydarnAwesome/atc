let socket = undefined
let gameState = undefined

let ctx = undefined

let game = {
  socket: undefined,
  gameState: undefined,
  input: undefined,
  localID: undefined,
  width: 0,
  height: 0,
  states: {
    'ConnectingState': ConnectingState,
    'InGameState': InGameState,
    'LobbyState': LobbyState,
    'StartState': StartState
  },
  connect: function (pilotName) {
    //this.socket = new WebSocket("ws://localhost:3000")
    this.socket = new WebSocket("ws://94.173.115.55:3000")
    this.socket.onerror = (error) => console.log(error)
    this.socket.onmessage = handleMessage
    this.socket.onopen = () => { ready(pilotName) }
  }
}

document.addEventListener("DOMContentLoaded", function (event) {
  game.gameState = new (game.states['StartState'])(game)

  let canvas = document.getElementById('display')
  ctx = canvas.getContext('2d')

  document.getElementsByTagName('html')[0].addEventListener('contextmenu', function (e) {
    e.preventDefault()
    return false
  }, false)

  game.width = canvas.width
  game.height = canvas.height

  game.input = new Pinput();
  window.addEventListener('mousemove', (evt) => {
    var rect = canvas.getBoundingClientRect()
    game.input.mouseX = Math.max(0, Math.min(canvas.width, evt.clientX - rect.left))
    game.input.mouseY = Math.max(0, Math.min(canvas.width, evt.clientY - rect.top))
  })

  loop()
})

function ready(pilotName) {
  game.gameState = new (game.states['ConnectingState'])(game, pilotName)
}

function handleMessage(event) {
  let data = JSON.parse(event.data)
  // only log non-update messages otherwise console get spammed
  if(data.type != 'update') console.log(data)
  game.gameState.handle(data, event)
}

function loop() {
  game.input.update()
  game.gameState.update(1000 / 60)
  game.gameState.draw(ctx)

  requestAnimationFrame(loop);
}