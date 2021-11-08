
class StartScreen extends Phaser.Scene{
    constructor(){
        super({key:'StartScreen'})
    }

    create(){
        this.add.text(game.config.width/2-177,game.config.height/2-177,"Battleships", {fontFamily:'Arial' ,fontSize:'70px', fill:'#000000'});
        const rectangle = this.add.rectangle(game.config.width/2,game.config.height/2,200,50,0x0000ff);
        rectangle.setStrokeStyle(2,0x000000);
        this.add.text(game.config.width/2-60,game.config.height/2-25,"Test Placement", {fontFamily:'Arial' ,fontSize:'45px', fill:'#000000'});
        rectangle.setInteractive();
        rectangle.on('pointerdown', function(){
            this.scene.stop('StartScreen');
            this.scene.start('Tester');
        },this);

    }
}