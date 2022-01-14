
const config = {
    type: Phaser.AUTO,
    parent: 'phaser-game',
    backgroundColor: 0xffffff,
    width: 1780,
    height: 960,
    // width: 1200,
    // height: 1000,
    dom: {
        createContainer: true
    },
    scene: [StartScreen, FleetPlace, MainGame]
}


const game = new Phaser.Game(config);