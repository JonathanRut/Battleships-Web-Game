import Phaser from 'phaser';
import FleetPlace from './scenes/FleetPlace.js';
import MainGame from './scenes/MainGame.js';
import StartScreen from './scenes/StartScreen.js';

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
    scene: [StartScreen,FleetPlace,MainGame]
}

const game = new Phaser.Game(config);
console.log(StartScreen)
