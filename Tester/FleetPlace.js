
class FleetPlace extends Phaser.Scene{
    constructor(){
        super({key:'FleetPlace'})
    }

    preload(){
        this.load.image('plus', 'sprites/plus.png');
        this.load.image('minus', 'sprites/minus.png');
        this.load.html('createShip', 'assets/shipCreate.html'); 
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

        let shipCreate = this.add.dom(this.gridx + this.width * 30 + 10, this.gridy).createFromCache('createShip').setOrigin(0,0);
        shipCreate.getChildByName("length").setAttribute("max",this.width >= this.height ? this.width:this.height);
        shipCreate.getChildByName("row").setAttribute("max",this.height);
        shipCreate.getChildByName("column").setAttribute("pattern","[a-"+letters[this.width-1]+"A-"+letters[this.width-1].toUpperCase()+"]{1}");
        document.getElementById("form").addEventListener("submit",(event)=>{
            event.preventDefault();
            const name = shipCreate.getChildByName("name").value;
            const fixedLength = !shipCreate.getChildByName("variableLength").checked;
            const length = parseInt(shipCreate.getChildByName("length").value);
            const x = this.gridx + 30 * letters.indexOf(shipCreate.getChildByName("column").value) + 4;
            const y = this.gridy + 30 * (parseInt(shipCreate.getChildByName("row").value) - 1) + 4 || 0;
            const rotation = shipCreate.getChildByName("rotation").checked ? "ver":"hor"
            const newShip = new MovingShips(length,{x:x,y:y},{rotation:rotation, name:name, random:false, fixedLength: fixedLength}, this);
            this.ships.push(newShip);        
        });

        // shipCreate.addListener('click');
        // shipCreate.on('click',(event)=>{
        //     if(event.target.name === "createButton")
        //     {
        //         const name = shipCreate.getChildByName("name").value;
        //         const fixedLength = shipCreate.getChildByName("fixedLength").checked;
        //         const length = parseInt(shipCreate.getChildByName("length").value);
        //         const newShip = new MovingShips(length,{x:150,y:180},{rotation:"hor", name:name, random:true, fixedLength: fixedLength}, this);
        //         this.ships.push(newShip);
        //     }
        // });



        this.randomise = this.add.rectangle(300,this.gridy + 30 * this.height + 24,200,30,0xffffff);
        this.randomise.setStrokeStyle(2,0x000000);
        this.add.text(250,this.gridy + 30 * this.height + 14,"Randomise", {fontFamily:'Arial' ,fontSize:'18px', fill:'#000000'});
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


        this.start = this.add.rectangle(this.gridx + this.width * 30 + 35, this.gridy + 30 * this.height - 30,100,30,0xffffff).setOrigin(0,0);
        this.start.setStrokeStyle(2,0x000000);
        this.start.setInteractive();
        this.add.text(this.start.x + 30, this.start.y + 5,"Start", {fontFamily:'Arial' ,fontSize:'18px', fill:'#000000'}).setOrigin(0,0)
        this.start.on('pointerup', function(){
            this.scene.stop('FleetPlace');
            this.scene.start('');
        },this);
        this.start.on('pointerdown', () => {
            this.start.setFillStyle(0xb0b0b0);
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
        //Making objects for each ship and adding them to an array
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
        // while(this.ships.length < 25)
        // {
        //     length = Math.floor(5 * Math.random()) + 1;
        //     const battleship = new MovingShips(length,{x:150,y:180},{rotation:"hor", name:"Battleship", random:true, fixedLength: true}, this);
        //     this.ships.push(battleship);
        // }
    }
}