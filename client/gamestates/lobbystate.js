class LobbyState {
  constructor(game, data) {
    this.game = game
    this.socket = game.socket
    this.lobbyInfo = data

    this.isLobbyLeader = false

    this.drawnNodeGraph = {
      points: [],
      edges: [],
    }

    this.graphPreview = {
      x: game.width - (game.height - 20) - 10,
      y: 10,
      size: game.height - 20,
      draw: function (ctx, nodeGraph) {
        ctx.fillStyle = 'black'
        ctx.fillRect(this.x, this.y, this.size, this.size)
        ctx.strokeStyle = 'white'
        ctx.strokeRect(this.x + 0.5, this.y + 0.5, this.size, this.size)

        for (let edge of nodeGraph.edges) {
          let from = nodeGraph.points.find(x => x.id == edge.from)
          let to = nodeGraph.points.find(x => x.id == edge.to)
          ctx.strokeStyle = 'white'
          ctx.lineWidth = 1
          ctx.beginPath()
          ctx.moveTo(from.x, from.y)
          ctx.lineTo(to.x, to.y)
          ctx.stroke()
        }

        for (let node of nodeGraph.points) {
          ctx.fillStyle = node.isHotspot ? 'red' : 'white'
          ctx.beginPath()
          ctx.arc(node.x, node.y, 5, 0, 2 * Math.PI)
          ctx.fill()
        }
      }
    }

    this.startGameButton = new Button(game, {
      x: this.graphPreview.x - (120 + 10),
      y: 10,
      width: 120,
      height: 50,
      text: 'start game',
      clicked: function (game, button) {
        game.socket.send(JSON.stringify({
          type: 'request start game',
          data: {}
        }))
      }
    })

    this.regenerateGraphButton = new Button(game, {
      x: this.graphPreview.x - (120 + 10),
      y: this.startGameButton.settings.y + this.startGameButton.settings.height + 10,
      width: 120,
      height: 50,
      text: 'new map',
      clicked: function (game, button) {
        game.socket.send(JSON.stringify({
          type: 'regenerate node graph',
          data: {}
        }))
      }
    })

    this.updateDrawnNodeGraph(data.nodeGraph)
    console.log('--- LOBBY STATE ---')
  }

  update(delta) {
    let lobbyLeader = this.lobbyInfo.players.find(x => x.isLobbyLeader).id
    this.isLobbyLeader = lobbyLeader == this.game.localID

    if (this.isLobbyLeader) {
      this.startGameButton.update(delta)
      this.regenerateGraphButton.update(delta)
    }
  }

  draw(ctx) {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
    this.graphPreview.draw(ctx, this.drawnNodeGraph)
    ctx.font = '16px monospace'
    ctx.fillStyle = 'red'
    ctx.fillText('red -> most trade activity', this.graphPreview.x, this.graphPreview.y + this.graphPreview.size + 20)

    ctx.fillStyle = 'white'
    ctx.fillText('LOBBY', 100, 100)
    for (let i = 0; i < this.lobbyInfo.players.length; i++) {
      let player = this.lobbyInfo.players[i]
      ctx.fillStyle = player.id == this.game.localID ? 'green' : 'white'
      ctx.fillText((player.isLobbyLeader ? '* ' : '  ') + player.id + ' : ' + player.name, 100, 150 + (i * 20))
    }

    if (this.isLobbyLeader) {
      // player is lobby leader, show them controls
      this.startGameButton.draw(ctx)
      this.regenerateGraphButton.draw(ctx)
    } else {
      ctx.fillStyle = 'white'
      ctx.fillText('only lobby leader can start the game', 200, 600)
    }
  }

  handle(message, event) {
    switch (message.type) {
      case 'lobby info':
        this.lobbyInfo = message.data
        this.updateDrawnNodeGraph(message.data.nodeGraph)
        break
      case 'start game':
        this.game.gameState = new (this.game.states['InGameState'])(this.game, message.data)
        break
      default:
        console.log('------------ERROR-------------')
        console.log('got unknown message type: ' + message.type)
        console.log(JSON.stringify(message.data))
        console.log('------------------------------')
        break
    }
  }

  updateDrawnNodeGraph(nodeGraph) {
    let resize = (points) => {
      let maxDistanceX = 0
      let maxDistanceY = 0

      for (let point of points) {
        let dx = Math.abs(point.x - 500)
        let dy = Math.abs(point.y - 500)

        if (dx > maxDistanceX) maxDistanceX = dx
        if (dy > maxDistanceY) maxDistanceY = dy
      }

      for (let point of points) {
        point.x -= 500
        point.y -= 500

        point.x *= (500 / maxDistanceX)
        point.y *= (500 / maxDistanceY)

        point.x += 500
        point.y += 500
      }
    }

    let nodePosition = (node) => {
      let x = node.x - 500
      let y = node.y - 500
      x *= this.graphPreview.size / 1000
      y *= this.graphPreview.size / 1000

      x *= 0.9
      y *= 0.9

      let newPoint = {
        x: this.graphPreview.x + x + (this.graphPreview.size / 2),
        y: this.graphPreview.y + y + (this.graphPreview.size / 2),
      }
      return newPoint
    }

    this.drawnNodeGraph.points = nodeGraph.points.slice()
    this.drawnNodeGraph.edges = nodeGraph.edges.slice()

    resize(this.drawnNodeGraph.points)
    for (let point of this.drawnNodeGraph.points) {
      let newPosition = nodePosition(point)
      point.x = newPosition.x,
        point.y = newPosition.y
    }
  }
}