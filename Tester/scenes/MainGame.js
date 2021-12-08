class MainGame extends Phaser.Scene
{
    constructor(){
        super({key:"MainGame"});
        
    }

    preload(){
        this.load.image('shipPart','sprites/shipPart.png');
        this.load.image('guessPin', 'sprites/guessPin.png');
        this.load.image('shipHit', 'sprites/shipHit.png');
    }

    create(grid){
        const playerBoard = new Board({x:80,y:70},{width:grid.width,height:grid.height},Cell,this);
        const guessBoard = new Board({x:510,y:70},{width:grid.width,height:grid.height},InteractiveCell,this);
    }
}