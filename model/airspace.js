class Airspace {
  constructor() {
    this.width = 1000
    this.height = 1000

    this.nodes = [
      /*{
        id: 'MNS5',
        name: 'Mensae V',
        position: {
          x: 300,
          y: 800,
        },
        possibleCargoes: {
          has: [
            'heptogen',
          ],
          wants: [
            'isotropicnylil'
          ]
        },
        cargo: {
          has: [
            { id: 'heptogen', amount: 667.3 }
          ],
          wants: [
            { id: 'isotropicnylil', scale: 1.1 }
          ]
        }
      }*/
    ]
    this.edges = [
      /*{
        id: 1,
        from: 'MNS5',
        to: 'SOLA',
        enabled: true,
      }*/
    ]

    this.companies = []
    this.planes = []

    this.landingRadius = 10
    this.crashRadius = 10

    this.cargoes = [
      /*{
        id: 'heptogen',
        name: 'Heptogen',
        basePrice: 700,
        priceChange: (age) => {
          return 700 - age
        },
        paths: {
          minimum: 1,
          maximum: 5,
        }
      }*/
    ]

    this.weatherevents = [
      /*{
        id: 0,
        type: 'bosonsignals'
      }*/
    ]
  }
}

module.exports = Airspace
