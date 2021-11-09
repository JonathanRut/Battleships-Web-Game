
class Tester extends Phaser.Scene{
    constructor(){
        super({key:'Tester'})
    }

    preload(){
        this.load.image('plus', 'sprites/plus.png');
        this.load.image('minus', 'sprites/minus.png');
        this.load.image('shipPart','sprites/shipPart.png');
        /*
        this.load.image('battleship-ver','sprites/Battleship-ver.png');
        this.load.image('battleship-hor','sprites/Battleship-hor.png');
        this.load.image('carrier-hor','sprites/Carrier-hor.png');
        this.load.image('carrier-ver','sprites/Carrier-ver.png')
        */
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
                rectangle.status = 'empty'
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

        let battleship = new MovingShips(4,0,this);

        this.input.on('drag',function(pointer,target,dragX,dragY){
            if(target.x !== dragX - dragX % 30 || target.y !== dragY - dragY % 30){
                target.ship.justDragged = true;
                target.ship.Drag({x:dragX - dragX % 30,y:dragY - dragY % 30},target.index);
            }
        },this);
        
    }



    leaveSquare(target){
        for(let i = 0; i < Math.round(target.height/27 + 2); i++){
            for(let j = 0; j < Math.round(target.width/27 + 2); j++){
                try{
                    const rectange = this.grid[((target.y - this.gridy - 4)/30) + i - 1][((target.x - this.gridx - 4)/30) + j - 1];
                    rectange.setFillStyle(0xffffff);
                    rectange.status = 'empty'
                }
                catch{
                    continue;
                }
            }
        }
    }



    enterSquare(target){
        for(let i = 0; i < Math.round(target.height/27) + 2; i++){
            for(let j = 0; j < Math.round(target.width/27) + 2; j++){
                try{
                    let rectangle = this.grid[((target.y - this.gridy - 4)/30) + i - 1][((target.x - this.gridx - 4)/30) + j - 1];
                    rectangle.setFillStyle(0xd0d0d0);
                    rectangle.status = 'ship-border';
                }
                catch{
                    continue;
                }
            }
        }
        for(let i = 0; i < Math.round(target.height/27); i++){
            for(let j = 0; j < Math.round(target.width/27); j++){
                try{
                    let rectangle = this.grid[((target.y - this.gridy - 4)/30) + i][((target.x - this.gridx - 4)/30) + j]
                    rectangle.setFillStyle(0xa0a0a0);
                    rectangle.status = 'ship'
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
            this.leaveSquare(target);
            if(target.texture.key === verKey){
                target.setTexture(horKey);
            }
            else{
                target.setTexture(verKey);
            }
            let temp = target.input.hitArea.height;
            target.input.hitArea.height = target.input.hitArea.width;
            target.input.hitArea.width = temp;
            this.enterSquare(target);
        }
    }
}