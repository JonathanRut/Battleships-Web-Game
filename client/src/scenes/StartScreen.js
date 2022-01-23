import phaserButton from "../assets/phaserButton";

export default class StartScreen extends Phaser.Scene{
    constructor(){
        super({key:'StartScreen'});
    }

    create(){
        this.add.text(this.game.config.width/2,this.game.config.height/2-130,"Battleships", {fontFamily:'Arial' ,fontSize:'70px', fill:'#000000'}).setOrigin(0.5,0.5);
        
        let container = this.add.rectangle(this.game.config.width/2,this.game.config.height/2,300,80,0xffffff).setStrokeStyle(2,0x000000);
        let text = this.add.text(container.x,container.y,"Singleplayer", {fontFamily:'Arial' ,fontSize:'45px', fill:'#000000'}).setOrigin(0.5,0.5);
        this.singlePlayerButton = new phaserButton(container,text,function(){
            this.scene.scene.stop('StartScreen');
            this.scene.scene.start('FleetPlace',{customGame:true,multiplayer:false});
        },this);

        container = this.add.rectangle(this.game.config.width/2,this.game.config.height/2 + 90,300,80,0xffffff).setStrokeStyle(2,0x000000);
        text = this.add.text(container.x,container.y,"Multiplayer", {fontFamily:'Arial' ,fontSize:'45px', fill:'#000000'}).setOrigin(0.5,0.5);
        this.multiPlayerButton = new phaserButton(container,text,function(){
            this.scene.scene.stop('StartScreen');
            this.scene.scene.start('FleetPlace',{customGame:false,multiplayer:true});
        },this);


        // this.scene.stop('StartScreen');
        // this.scene.start('Tester');

    }
}