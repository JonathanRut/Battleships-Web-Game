import phaserButton from "../assets/phaserButton";
import io from "socket.io-client";

export default class StartScreen extends Phaser.Scene{
    constructor(){
        super({key:'StartScreen'});
    }

    create(){
        this.add.text(this.game.config.width/2,this.game.config.height/2-130,"Battleships", {fontFamily:'Arial' ,fontSize:'70px', fill:'#000000'}).setOrigin(0.5,0.5);
        
        const container = this.add.rectangle(this.game.config.width/2,this.game.config.height/2,300,80,0xffffff).setStrokeStyle(2,0x000000);
        const text = this.add.text(container.x,container.y,"Single Player", {fontFamily:'Arial' ,fontSize:'45px', fill:'#000000'}).setOrigin(0.5,0.5);
        this.singlePlayerButton = new phaserButton(container,text,function(){
            this.scene.scene.stop('StartScreen');
            this.scene.scene.start('FleetPlace');
        },this);

        // this.scene.stop('StartScreen');
        // this.scene.start('Tester');

        this.socket = io("http://localhost:3000");
        this.socket.on("connect", function()
        {
            console.log("Connected");
        });
    }
}