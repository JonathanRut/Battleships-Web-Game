
class Tester extends Phaser.Scene{
    constructor(){
        super({key:'Tester'})
    }

    preload(){
        this.load.image('battleship-ver','sprites/Battleship-ver.png');
        this.load.image('battleship-hor','sprites/Battleship-hor.png');
        this.load.image('carrier-hor','sprites/Carrier-hor.png');
        this.load.image('carrier-ver','sprites/Carrier-ver.png')
    }

    create(){
        //plotting the grid
        this.gridx = 116;
        this.gridy = 56;
        this.grid = [];


        for(let i = 0; i<10;i++){
            this.grid.push([]);
            for(let j = 0; j < 10; j++){
                const rectangle = this.add.rectangle(this.gridx+j*30,this.gridy+i*30,30,30,0xffffff).setOrigin(0,0);
                rectangle.setStrokeStyle(2,0x000000);
                this.grid[i].push(rectangle);
            }
        }


        for(let i = 0; i<10; i++){
            this.add.text(this.gridx+1,i*30+this.gridy+15,String(i+1), {fontFamily:'Arial' ,fontSize:'12px', fill:'#000000'});
        }
        const letters = ['a','b','c','d','e','f','g','h','i','j']
        for(let i = 0; i<10; i++){
            this.add.text(i*30+this.gridx+22,this.gridy-1,letters[i], {fontFamily:'Arial' ,fontSize:'12px', fill:'#000000'});
        }

        this.battleship = this.add.sprite(90,60,'battleship-ver');
        this.battleship.setOrigin(0,0);
        this.carrier = this.add.sprite(60,60,'carrier-ver');
        this.carrier.setOrigin(0,0);

        //battleship.angle += 90;
        //let temp = battleship.height;
        //battleship.height = battleship.width;
        //battleship.width = temp;

        //Only vertical ships??

        
        this.battleship.setInteractive();
        this.input.setDraggable(this.battleship, true);
        this.carrier.setInteractive();
        this.input.setDraggable(this.carrier, true);


        this.input.on('drag',function(pointer,target,dragX,dragY){
            if(target.x !== dragX - dragX % 30 || target.y !== dragY - dragY % 30){
                this.updateOverlayColour(target,0xffffff);
                target.x = dragX - dragX % 30;
                target.y = dragY - dragY % 30;
                this.updateOverlayColour(target,0xd0d0d0);
                target.justDragged = true;
            }
        },this);

        // this.battleship.flipShip = function(){
        //     if(this.battleship.justDragged){
        //         this.battleship.justDragged = false;
        //     }
        //     else{
        //         //Need to change hit area manually

        //         this.updateOverlayColour(this.battleship,0xffffff);
        //         if(this.battleship.texture.key === 'battleship-ver'){
        //             this.battleship.setTexture('battleship-hor');
        //         }
        //         else{
        //             this.battleship.setTexture('battleship-ver');
        //         }
        //         let temp = this.battleship.input.hitArea.height;
        //         this.battleship.input.hitArea.height = this.battleship.input.hitArea.width;
        //         this.battleship.input.hitArea.width = temp;
        //         this.updateOverlayColour(this.battleship,0xd0d0d0);
        //     }
        // }

        this.battleship.on('pointerup',function(){this.flipShip(this.battleship,'battleship-hor','battleship-ver')},this);
        this.carrier.on('pointerup',function(){this.flipShip(this.carrier,'carrier-hor','carrier-ver')},this);        
    }

    updateOverlayColour(target,colour){
        for(let i = 0; i < Math.round(target.height/27); i++){
            for(let j = 0; j < Math.round(target.width/27); j++){
                try{
                    this.grid[((target.y - this.gridy - 4)/30) + i][((target.x - this.gridx - 4)/30) + j].setFillStyle(colour);
                }
                catch{
                    continue;
                }
            }
        }
    }

    flipShip = function(target,horKey,verKey){
        if(target.justDragged){
            target.justDragged = false;
        }
        else{
            //Need to change hit area manually

            this.updateOverlayColour(target,0xffffff);
            if(target.texture.key === verKey){
                target.setTexture(horKey);
            }
            else{
                target.setTexture(verKey);
            }
            let temp = target.input.hitArea.height;
            target.input.hitArea.height = target.input.hitArea.width;
            target.input.hitArea.width = temp;
            this.updateOverlayColour(target,0xd0d0d0);
        }
    }
}