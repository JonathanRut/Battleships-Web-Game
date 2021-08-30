
const config = {
    type: Phaser.AUTO,
    parent: 'phaser-game',
    backgroundColor: 0xffffff,
    width: 960,
    height: 540,
    scene: [StartScreen,Tester]
}


const game = new Phaser.Game(config);