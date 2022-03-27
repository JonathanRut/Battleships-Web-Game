import Board from '../objects/Boards/Boards'
import MovingShips from '../objects/Ships/MovingShips'
import PlacementCell from '../objects/Cells/PlacementCell'
import phaserButton from '../assets/phaserButton'

export default class FleetPlace extends Phaser.Scene{
    constructor(key = 'FleetPlace'){
        super({key:key})
    }

    preload(){
        this.load.image('plus', 'src/assets/sprites/plus.png');
        this.load.image('minus', 'src/assets/sprites/minus.png');
        this.load.image('shipPart','src/assets/sprites/shipPart.png');
        this.load.image('cross','src/assets/sprites/cross.png');
    }

    create(){
        // The board is created and stored then a fleet is added to the board
        this.board = new Board({x:116,y:56},{width:10,height:10},PlacementCell,this);
        this.CreateFleet(this.board);

        // A randomise button is created
        let container = this.add.rectangle(300,this.board.origin.y + 30 * this.board.height + 24,200,30,0xffffff).setStrokeStyle(2,0x000000);
        let text = this.add.text(container.x,container.y,"Randomise", {fontFamily:'Arial' ,fontSize:'18px', fill:'#000000'}).setOrigin(0.5,0.5);
        this.randomiseButton = new phaserButton(container,text, function(){
            // When the button is pressed the colour changes and the ships on the board are destroyed
            this.container.setFillStyle(0xffffff);
            const length = this.scene.board.ships.length;
            for(let i = 0; i < length; i++)
            {
                this.scene.board.ships[0].destroy();
            }
            // After the board is empty and new random fleet is added to the board
            this.scene.CreateFleet(this.scene.board);
        },this);

        // A start button is created
        container = this.add.rectangle(this.board.origin.x + this.board.width * 30 + 85, this.board.origin.y + 30 * this.board.height - 30,100,30,0xffffff).setStrokeStyle(2,0x000000);
        text = this.add.text(container.x, container.y,"Start", {fontFamily:'Arial' ,fontSize:'18px', fill:'#000000'}).setOrigin(0.5,0.5)
        this.startButton = new phaserButton(container,text,this.onStart,this)


        // This piece of code runs when a draggable object is dragged
        this.input.on('drag',function(pointer,target,dragX,dragY){
            // If the cell you are trying to drag to a new cell then the dragging code is run
            if(target.x !== dragX - dragX % 30 || target.y !== dragY - dragY % 30){
                // Next the the ships drag procedure is run and each ship on the grid is updated
                target.ship.Drag({x:dragX - dragX % 30,y:dragY - dragY % 30},target.index);
                this.board.ships.forEach(ship => {
                    ship.UpdateShipCells(false);
                });
            }
        },this);

    }

    CreateFleet(board){
        //Making objects for each ship and adding them to an array
        const battleship = new MovingShips(4,{x:150,y:180},{rotation:"hor", name:"Battleship", random:true, fixedLength: true}, board);
        board.ships.push(battleship);
        const carrier = new MovingShips(5,{x:120,y:60},{rotation:"hor", name:"Carrier", random:true, fixedLength: true}, board);
        board.ships.push(carrier);
        const cruiser = new MovingShips(3,{x:210,y:60},{rotation:"ver", name:"Cruiser", random:true, fixedLength:true}, board);
        board.ships.push(cruiser);
        const submarine = new MovingShips(3,{x:240,y:120},{rotation:"ver", name:"Submarine", random:true, fixedLength:true}, board);
        board.ships.push(submarine);
        const destroyer = new MovingShips(2,{x:360,y:60},{rotation:"ver", name:"Destroyer", random:true, fixedLength:true}, board);
        board.ships.push(destroyer);
    }

    onStart()
    {
        this.scene.scene.stop('FleetPlace');
        this.scene.scene.start('MainGame');
    }
}