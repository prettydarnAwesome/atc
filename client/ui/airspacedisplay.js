class AirspaceDisplay {
  constructor(game, settings) {
    this.settings = settings || {}
    this.settings.x = settings.x || 0
    this.settings.y = settings.y || 0
    this.settings.width = settings.width || 100
    this.settings.height = settings.height || 100
    this.camera = {
      x: 500,
      y: 500,
      zoom: 10,
    }
    this.dragging = false
    this.lastMouse = { x: 0, y: 0 }
  }

  airspaceToDrawPosition(x, y, airspace) {
    return {
      x: (this.settings.x + this.settings.width / 2) + ((x - airspace.width / 2) * this.camera.zoom) + (this.camera.zoom * (this.camera.x - airspace.width / 2)),
      y: (this.settings.y + this.settings.height / 2) + ((y - airspace.height / 2) * this.camera.zoom) + (this.camera.zoom * (this.camera.y - airspace.height / 2)),
    }
  }

  isPointInDisplay(x, y, buffer) {
    if (buffer == undefined) buffer = 0
    if (x < this.settings.x - buffer) return false
    if (y < this.settings.y - buffer) return false
    if (x > this.settings.x + this.settings.width + buffer) return false
    if (y > this.settings.y + this.settings.height + buffer) return false
    return true
  }

  draw(ctx, airspace, players) {
    ctx.lineWidth = 1
    ctx.fillStyle = 'black'
    ctx.fillRect(this.settings.x, this.settings.y, this.settings.width, this.settings.height)
    ctx.strokeStyle = 'white'
    ctx.strokeRect(this.settings.x + 0.5, this.settings.y + 0.5, this.settings.width, this.settings.height)

    ctx.save()

    ctx.beginPath();
    ctx.rect(this.settings.x, this.settings.y, this.settings.width, this.settings.height)
    ctx.clip()

    //draw grid
    ctx.lineWidth = 1
    ctx.strokeStyle = '#111111'
    for (let i = 0; i <= airspace.width; i += 50) {
      let from = this.airspaceToDrawPosition(0, i, airspace)
      let to = this.airspaceToDrawPosition(airspace.width, i, airspace)
      if (from.y < this.settings.y || from.y > this.settings.y + this.settings.height) continue

      ctx.beginPath()
      ctx.moveTo(from.x + 0.5, from.y + 0.5)
      ctx.lineTo(to.x + 0.5, to.y + 0.5)
      ctx.stroke()
    }
    for (let i = 0; i <= airspace.height; i += 50) {
      let from = this.airspaceToDrawPosition(i, 0, airspace)
      let to = this.airspaceToDrawPosition(i, airspace.height, airspace)
      if (from.x < this.settings.x || from.x > this.settings.x + this.settings.width) continue
      ctx.beginPath()
      ctx.moveTo(from.x + 0.5, from.y + 0.5)
      ctx.lineTo(to.x + 0.5, to.y + 0.5)
      ctx.stroke()
    }

    for (let edge of airspace.edges) {
      let from = airspace.nodes.find(x => x.id == edge.from)
      let to = airspace.nodes.find(x => x.id == edge.to)
      let fromPos = this.airspaceToDrawPosition(from.position.x, from.position.y, airspace)
      let toPos = this.airspaceToDrawPosition(to.position.x, to.position.y, airspace)

      // don't draw edge if both points are out of bounds
      if (!(this.isPointInDisplay(fromPos.x, fromPos.y, 200)
        || this.isPointInDisplay(toPos.x, toPos.y, 200))) continue

      ctx.strokeStyle = 'white'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(fromPos.x, fromPos.y)
      ctx.lineTo(toPos.x, toPos.y)
      ctx.stroke()
    }

    for (let node of airspace.nodes) {
      let pos = this.airspaceToDrawPosition(node.position.x, node.position.y, airspace)
      if (!this.isPointInDisplay(pos.x, pos.y)) continue

      ctx.fillStyle = 'white'
      ctx.beginPath()
      ctx.arc(pos.x, pos.y, 5, 0, 2 * Math.PI)
      ctx.fill()
    }

    for (let plane of airspace.planes) {
      let pos = this.airspaceToDrawPosition(plane.position.x, plane.position.y, airspace)
      ctx.fillStyle = 'red'
      ctx.beginPath()
      ctx.arc(pos.x, pos.y, 5, 0, 2 * Math.PI)
      ctx.fill()
      ctx.fillStyle = 'white'
      ctx.fillText(players.find(x => x.id == plane.owner).name, pos.x, pos.y - 10)
    }

    ctx.restore()
  }

  update(delta, airspace) {
    this.dragging = game.input.isDown('MOUSERIGHT') && this.isPointInDisplay(game.input.mouseX, game.input.mouseY)
    let dMouse = {
      x: game.input.mouseX - this.lastMouse.x,
      y: game.input.mouseY - this.lastMouse.y
    }

    if(this.dragging) {
      this.camera.x += dMouse.x / this.camera.zoom
      this.camera.y += dMouse.y / this.camera.zoom
    } else {

    }

    this.camera.x = Math.max(0, Math.min(this.camera.x, airspace.width))
    this.camera.y = Math.max(0, Math.min(this.camera.y, airspace.height))
    this.lastMouse = { x: game.input.mouseX, y: game.input.mouseY }
  }
}