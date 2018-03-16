let Airspace = require('./airspace.js')
let fs = require('fs')

class Generators {
  constructor() {

  }

  static getPlanetName() {
    let syllables = {
      cv: `
        ca ce ci cu cha chi cze czu da de du ja je ji jo ju
        ka ke ki ko ku le li lo lu ma me mo pi qa qe qi qo qu sa se si so su
        ta te tu va ve vi vo vu xa xe xi xo xu ya yu za ze zi zo zu
        kha khi khe vhe vho phe pho phi phu`
        .split(/\s/)
        .map(x => x.trim())
        .filter(x => x != ''),
      v: `a e o i u ow ov`
        .split(/\s/)
        .map(x => x.trim())
        .filter(x => x != ''),
      cvc: `
        ca ce ci cu cha chi cze czu da de du ja je ji jo ju
        ka ke ki ko ku le li lo lu ma me mo pi qa qe qi qo qu sa se si so su
        ta te tu va ve vi vo vu xa xe xi xo xu ya yu za ze zi zo zu
        kha khi khe vhe vho phe pho phi phu`.split(/\s/)
        .map(x => x.trim())
        .filter(x => x != '')
        .map(x => `c h j k l m n p q r s t v w x y z kh vh zh sh tch ch cz cs xs`.split(/\s/).map(y => x + y))
        .reduce((p, c) => p.concat(...c)),
      p: `omni sol iso tera hepta septa octa deca dodeca neo new 6502- 1072- 8808- ZX- C- X- Z- M- P-`
        .split(/\s/)
        .map(x => x.trim())
        .filter(x => x != ''),
      s: `I II III IV V VI VII VIII IX X XI XII Class-M Class-P Class-Z Prime Delta Sigma Alpha Beta Gamma`
        .split(/\s/)
        .map(x => x.trim())
        .filter(x => x != ''),
    }

    let phrases = [
      'cvc',
      'cv#cv',
      'cv#cvc',
      'cvc#cv',
      'cvc#v',
      'cv#v',
      'v#cv',
      'v#cvc',
      'v#cv#v',
      'v#cvc#v',
      'p#cvc',
      'p#cv#cv',
      'p#cv#cvc',
      'p#cvc#cv',
      'p#cvc#v',
      'p#cv#v',
      'cvc# #s',
      'cv#cv# #s',
      'cv#cvc# #s',
      'cvc#cv# #s',
      'cvc#v# #s',
      'cv#v# #s',
      'v#cv# #s',
      'v#cvc# #s',
      'v#cv#v# #s',
      'v#cvc#v# #s',
    ]

    let pick = array => array[Math.floor(Math.random() * array.length)]

    let phrase = pick(phrases)
    let parts = phrase.split('#')
    let name = ''
    for (let part of parts) {
      if (syllables[part]) {
        name += pick(syllables[part])
      } else {
        name += part
      }
    }

    return name.split(/\s/).map(x => x[0].toUpperCase() + x.slice(1)).join(' ')
      .split(/-/).map(x => x[0].toUpperCase() + x.slice(1)).join('-')
  }

  static getPlanetID() {
    let waypoints = fs.readFileSync(__dirname + '/waypoints.txt', 'UTF8')
    let array = waypoints.split(',')
    return array[Math.floor(Math.random() * array.length)]
  }

  static getPlaneID() {
    let alphabet = 'abcdefghijklmnopqrstuvwxyz'
    let pick = s => s[Math.floor(Math.random() * s.length)]

    let id = ''
    id += pick(alphabet)
    id += pick(alphabet)
    id += Math.floor(Math.random() * 10)
    id += Math.floor(Math.random() * 10)
    id += Math.floor(Math.random() * 10)

    return id.toUpperCase()
  }

  static getElementName() {
    let elements = [
      'element1', 'element2', 'element3', 'element4', 'element5',
      'element6', 'element7', 'element8', 'element9', 'element10'
    ]

    return elements[Math.floor(Math.random() * elements.length)]
  }

  static getCargo() {
    let name = this.getElementName()

    let cargo = {
      id: name,
      name: name,
      basePrice: 700,
      priceChange: (age) => {
        return 700 - age
      },
      paths: {
        minimum: 1,
        maximum: 5,
      }
    }

    return cargo
  }

  static getAirspace(nodeGraph) {
    if (nodeGraph == undefined) nodeGraph = this.getNodeGraph()
    let airspace = new Airspace()

    let idNameMap = []
    for (let point of nodeGraph.points) {
      let id = point.id
      let name = this.getPlanetID()
      while (idNameMap.some(x => x.name == name)) name = this.getPlanetID()

      idNameMap.push({
        id: id,
        name: name
      })

      let node = {
        id: name,
        name: this.getPlanetName(),
        position: {
          x: point.x,
          y: point.y
        },
        possibleCargoes: {
          has: [],
          wants: [],
        },
        cargo: {
          has: [],
          wants: [],
        }
      }

      airspace.nodes.push(node)
    }

    let i = 0
    for (let edge of nodeGraph.edges) {
      let from = idNameMap.find(x => x.id == edge.from).name
      let to = idNameMap.find(x => x.id == edge.to).name
      let newEdge = {
        id: i,
        from: from,
        to: to,
        enabled: true
      }

      airspace.edges.push(newEdge)

      i++
    }

    for (let i = 0; i < 4; i++) {
      let cargo = this.getCargo()
      while (airspace.cargoes.some(x => x.id == cargo.id)) cargo = this.getCargo()
      airspace.cargoes.push(cargo)
    }

    return airspace
  }

  static getNodeGraph(settings) {
    let gen = new NodeGraphGenerator(settings)
    return gen.generate()
  }
}

class NodeGraphGenerator {
  constructor(settings) {
    settings = settings == undefined ? {} : settings
    this.settings = {
      numberOfNodes: settings.numberOfNodes == undefined ? 30 : settings.numberOfNodes,
      maxJumpsFromOrigin: settings.maxJumpsFromOrigin == undefined ? 3 : settings.maxJumpsFromOrigin,
      minDistance: settings.minDistance == undefined ? 50 : settings.minDistance,
      maxDistance: settings.maxDistance == undefined ? 80 : settings.maxDistance,
      interconnectedness: settings.interconnectedness == undefined ? 0.8 : settings.interconnectedness,
    }
  }

  generate() {
    let points = this.generateNodes()
    let edges = this.generateEdges(points)
    let n = 1
    while (points.some(x => x.island == -1)) {
      this.assignIslands(points.filter(x => x.island == -1), edges, n)
      n++
    }

    this.connectIslands(points, edges)

    let numHotspots = 4
    this.distributeHotspots(points, edges, numHotspots)

    this.center(points)

    for (let point of points) {
      point.x = Math.round(point.x)
      point.y = Math.round(point.y)
    }

    return {
      points: points,
      edges: edges,
    }
  }

  pick(array) {
    return array[Math.floor(Math.random() * array.length)]
  }

  distance(a, b) {
    return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2)
  }

  generateNodes() {
    let points = []
    points.push({
      x: 500,
      y: 500,
      island: -1,
      original: -1,
      id: 0,
      isHotspot: false,
    })

    let maxJumps = this.settings.maxJumpsFromOrigin
    let nodeCount = this.settings.numberOfNodes

    for (let i = 0; i < nodeCount; i++) {
      let point = this.getRandomPoint(this.pick(points))

      while (
        this.distance(point, points[0]) > this.settings.maxDistance * maxJumps ||
        points.some(x => this.distance(x, point) < this.settings.minDistance)
      ) {
        point = this.getRandomPoint(this.pick(points))
      }

      points.push(point)
    }
    for (let i = 0; i < points.length; i++) {
      points[i].id = i
    }

    return points
  }

  getRandomPoint(from) {
    let angle = Math.random() * Math.PI * 2
    //let distance = minDistance + Math.random() * (maxDistance - minDistance);
    let dist = (this.settings.maxDistance + this.settings.minDistance) / 2

    let dx = dist * Math.sin(angle)
    let dy = dist * Math.cos(angle)

    let newPoint = {
      x: from.x + dx,
      y: from.y + dy,
      island: -1,
      original: -1,
      id: 0,
      isHotspot: false
    }

    return newPoint
  }

  generateEdges(points) {
    let edges = []

    for (let i = 0; i < points.length - 1; i++) {
      for (let j = i + 1; j < points.length; j++) {
        let from = points[i]
        let to = points[j]
        let dist = this.distance(from, to)

        if (dist >= this.settings.minDistance && dist <= this.settings.maxDistance) {
          if (Math.random() <= this.settings.interconnectedness) {
            edges.push({
              from: from.id,
              to: to.id,
            })
          }
        }
      }
    }

    return edges
  }

  assignIslands(points, edges, islandNum) {
    let queue = [points[0].id]
    let visited = [points[0].id]
    while (queue.length > 0) {
      let pointID = queue.shift()
      let point = points.find(x => x.id == pointID)
      point.island = islandNum
      point.original = islandNum

      let connected = []
      connected.push(...edges.filter(x => x.from == pointID).map(x => x.to))
      connected.push(...edges.filter(x => x.to == pointID).map(x => x.from))
      for (let id of connected) {
        if (!visited.includes(id)) {
          visited.push(id)
          queue.push(id)
        }
      }
    }
  }

  tryConnectNode(point, points, edges) {
    let connected = []
    connected.push(...edges.filter(x => x.from == point.id).map(x => x.to))
    connected.push(...edges.filter(x => x.to == point.id).map(x => x.from))

    for (let other of points) {
      if (other.id == point.id) continue

      let dist = this.distance(other, point)
      if (dist <= this.settings.maxDistance && dist >= this.settings.minDistance) {
        if (point.island != other.island) {
          // change all current island id to other island
          let thisIsland = point.island
          for (let p of points) {
            if (p.island == thisIsland) p.island = other.island
          }

          // create edge
          edges.push({
            from: point.id,
            to: other.id,
          })

          return
        }
      }
    }
  }

  connectIslands(points, edges) {
    for (let point of points) {
      this.tryConnectNode(point, points, edges, this.settings.minDistance, this.settings.maxDistance)
    }
  }

  center(points) {
    let totalX = 0
    let totalY = 0
    for (let point of points) {
      totalX += point.x - 500
      totalY += point.y - 500
    }

    let avgX = totalX / points.length
    let avgY = totalY / points.length

    for (let point of points) {
      point.x -= avgX
      point.y -= avgY
    }
  }

  distributeHotspots(points, edges, count) {
    let distances = this.graphDistances(points, edges, 0)
    let maximumDistance = Math.max(...distances.map(y => y.distance))
    let max = distances.find(x => x.distance == maximumDistance)
    let first = points.find(x => x.id == max.id)
    first.isHotspot = true

    let distanceV = 5

    let n = 0
    while (points.filter(x => x.isHotspot).length < count) {
      n++
      if (n > 100) {
        console.log('failed while trying to get ' + count + ' hotspots')
        return
      }
      let point = this.pick(points.filter(x => !x.isHotspot))
      let hotspots = points.filter(x => x.isHotspot)
      let distances = hotspots.map(x => this.graphDistanceFrom(points, edges, point.id, x.id))
      let minDistance = Math.min(...distances)
      let n2 = 0
      while (minDistance < distanceV) {
        n2++
        if (n2 > 1000) {
          distanceV--
          n2 = 0
          break
          if (distanceV == 3) return
        }
        point = this.pick(points.filter(x => !x.isHotspot))
        distances = hotspots.map(x => this.graphDistanceFrom(points, edges, point.id, x.id))
        minDistance = Math.min(...distances)
      }

      point.isHotspot = true
    }
  }

  graphDistances(points, edges, a) {
    let queue = [{
      id: a,
      distance: 0,
    }]
    let visited = [a]
    let nodes = [{
      id: a,
      distance: 0,
    }]

    while (queue.length > 0) {
      let current = queue.shift()
      let point = points.find(x => current.id == x.id)

      let connected = []
      connected.push(...edges.filter(x => x.from == point.id).map(x => x.to))
      connected.push(...edges.filter(x => x.to == point.id).map(x => x.from))

      for (let id of connected) {
        if (!visited.includes(id)) {
          let a = {
            id: id,
            distance: current.distance + 1
          }
          queue.push(a)
          nodes.push(a)
          visited.push(id)
        }
      }
    }

    return nodes
  }

  graphDistanceFrom(points, edges, a, b) {
    let queue = [{
      id: a,
      distance: 0,
    }]
    let visited = [a]
    let nodes = [{
      id: a,
      distance: 0,
    }]

    while (queue.length > 0) {
      let current = queue.shift()
      let point = points.find(x => current.id == x.id)

      let connected = []
      connected.push(...edges.filter(x => x.from == point.id).map(x => x.to))
      connected.push(...edges.filter(x => x.to == point.id).map(x => x.from))

      for (let id of connected) {
        if (!visited.includes(id)) {
          if (id == b) return current.distance + 1
          let a = {
            id: id,
            distance: current.distance + 1
          }
          queue.push(a)
          nodes.push(a)
          visited.push(id)
        }
      }
    }
  }
}

module.exports = Generators