class AngleDisplay {
  constructor(game, settings) {
    this.settings = settings || {}
    this.settings.x = settings.x || 0
    this.settings.y = settings.y || 0
    this.settings.width = settings.width || 110
    this.settings.height = settings.width || 110
  }
 
  draw(ctx, airspace, plane) {
    let me = airspace.planes.find(x => x.id == plane)
    let x = Math.cos(me.direction) * this.settings.width / 2
    let y = Math.sin(me.direction) * this.settings.height / 2
    ctx.strokeStyle = 'white'
    ctx.lineWidth = 1
    ctx.strokeRect(this.settings.x + 0.5, this.settings.y + 0.5, this.settings.width, this.settings.height)
    ctx.fillStyle = 'red'
    ctx.beginPath()
    ctx.arc(this.settings.x + (this.settings.width / 2) + x * 0.8,
      this.settings.y + this.settings.height / 2 + y * 0.8,
      5, 0, 2 * Math.PI)
    ctx.fill()
  }
}