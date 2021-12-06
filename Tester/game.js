
const config = {
    type: Phaser.AUTO,
    parent: 'phaser-game',
    backgroundColor: 0xffffff,
    width: 960,
    height: 540,
    // width: 1200,
    // height: 1000,
    dom: {
        createContainer: true
    },
    scene: [StartScreen, FleetPlace]
}


const game = new Phaser.Game(config);