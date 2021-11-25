
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
        // Plotting the grid
        this.gridx = 116;
        this.gridy = 56;
        this.width = 10;
        this.height = 10;
        this.grid = [];

        for(let i = 0; i<this.height;i++){
            // Making 2D array of the cells
            this.grid.push([]);
            for(let j = 0; j < this.width; j++){
                const rectangle = this.add.rectangle(this.gridx+j*30,this.gridy+i*30,30,30,0xffffff).setOrigin(0,0);
                rectangle.setStrokeStyle(2,0x000000);
                rectangle.borders = [];
                rectangle.ships = [];
                this.grid[i].push(rectangle);
            }
        }

        // Adding the letters and numbers to cells
        for(let i = 0; i<this.height; i++){
            this.add.text(this.gridx+1,i*30+this.gridy+15,String(i+1), {fontFamily:'Arial' ,fontSize:'12px', fill:'#000000'});
        }
        const letters = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z']
        for(let i = 0; i<this.width; i++){
            this.add.text(i*30+this.gridx+22,this.gridy-1,letters[i], {fontFamily:'Arial' ,fontSize:'12px', fill:'#000000'});
        }

        this.ships = [];
        this.CreateFleet();
        

        this.randomise = this.add.rectangle(300,380,200,30,0xffffff);
        this.randomise.setStrokeStyle(2,0x000000);
        this.add.text(250,370,"Randomise", {fontFamily:'Arial' ,fontSize:'18px', fill:'#000000'});
        this.randomise.setInteractive();
        this.randomise.on('pointerup', function(){
            this.randomise.setFillStyle(0xffffff);
            this.ships.forEach(ship => {
                ship.destroy();
                ship = {};
            });
            this.ships = []
            this.CreateFleet();
        },this);
        this.randomise.on('pointerdown', () => {
            this.randomise.setFillStyle(0xb0b0b0);
        });


        // This piece of code runs when a draggable object is dragged
        this.input.on('drag',function(pointer,target,dragX,dragY){
            // If the cell you are trying to drag to a new cell then the dragging code is run
            if(target.x !== dragX - dragX % 30 || target.y !== dragY - dragY % 30){
                // First the ship is marked as being dragged
                target.ship.justDragged = true;
                // Next the the ships drag procedure is run
                target.ship.Drag({x:dragX - dragX % 30,y:dragY - dragY % 30},target.index);
                // Each ship on the grid is updated
                this.ships.forEach(ship => {
                    ship.UpdateShipCells(0xa0a0a0,0xd0d0d0);
                });
            }
        },this);

    }

    CreateFleet(){
        // Making objects for each ship and adding them to an array
        const battleship = new MovingShips(4,{x:150,y:180},{rotation:"hor", name:"Battleship", random:true, fixedLength: false}, this);
        this.ships.push(battleship);
        const carrier = new MovingShips(5,{x:120,y:60},{rotation:"hor", name:"Carrier", random:true, fixedLength: false}, this);
        this.ships.push(carrier);
        const cruiser = new MovingShips(3,{x:210,y:60},{rotation:"ver", name:"Cruiser", random:true, fixedLength:true},this);
        this.ships.push(cruiser);
        const submarine = new MovingShips(3,{x:240,y:120},{rotation:"ver", name:"Submarine", random:true, fixedLength:true}, this);
        this.ships.push(submarine);
        const destroyer = new MovingShips(2,{x:360,y:60},{rotation:"ver", name:"Destroyer", random:true, fixedLength:true}, this);
        this.ships.push(destroyer);
    }
}