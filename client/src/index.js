import Phaser from 'phaser';
import SingleFleetPlace from './scenes/SingleFleetPlace.js';
import StartScreen from './scenes/StartScreen.js';
import MultiFleetPlace from './scenes/MultiFleetPlace.js';
import MainGame from './scenes/MainGame.js';
import MultiplayerGame from './scenes/MultiplayerGame.js'

const config = {
    type: Phaser.AUTO,
    parent: 'phaser-game',
    backgroundColor: 0xffffff,
    width: 1160,
    height: 540,
    dom: {
        createContainer: true
    },
    scene: [StartScreen,SingleFleetPlace,MultiFleetPlace,MainGame,MultiplayerGame]
}

const game = new Phaser.Game(config);
