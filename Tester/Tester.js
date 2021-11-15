
class Tester extends Phaser.Scene{
    constructor(){
        super({key:'Tester'})
    }

    preload(){
        this.load.image('plus', 'sprites/plus.png');
        this.load.image('minus', 'sprites/minus.png');
        this.load.image('shipPart','sprites/shipPart.png');
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
                rectangle.borders = [];
                rectangle.ships = [];
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

        this.ships = [];
        
        const battleship = new MovingShips(4,{x:120,y:60},"ver",this);
        const carrier = new MovingShips(5,{x:180,y:60},"ver",this);
        // const cruiser = new MovingShips(3,{x:240,y:60},"ver",this);
        // const submarine = new MovingShips(3,{x:300,y:60},"ver",this);
        // const destroyer = new MovingShips(2,{x:360,y:60},"ver",this);

        this.ships.push(battleship,carrier);

        this.input.on('drag',function(pointer,target,dragX,dragY){
            if(target.x !== dragX - dragX % 30 || target.y !== dragY - dragY % 30){
                target.ship.justDragged = true;
                target.ship.Drag({x:dragX - dragX % 30,y:dragY - dragY % 30},target.index);
                this.ships.forEach(ship => {
                    ship.UpdateShipCells(0xa0a0a0,0xd0d0d0);
                });
            }
        },this);
        
    }
}