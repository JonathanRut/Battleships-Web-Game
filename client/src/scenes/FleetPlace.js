import Board from '../objects/Boards'
import MovingShips from '../objects/Ships/MovingShips'
import PlacementCell from '../objects/Cells/PlacementCell'
import phaserButton from '../assets/phaserButton'

export default class FleetPlace extends Phaser.Scene{
    constructor(){
        super({key:'FleetPlace'})
    }

    preload(){
        this.load.image('plus', 'src/assets/sprites/plus.png');
        this.load.image('minus', 'src/assets/sprites/minus.png');
        this.load.html('createShip', 'src/assets/shipCreate.html'); 
        this.load.image('shipPart','src/assets/sprites/shipPart.png');
        this.load.image('cross','src/assets/sprites/cross.png');
        this.load.html('boardEdit', 'src/assets/boardEdit.html');
    }

    create(){
        this.board = new Board({x:116,y:56},{width:10,height:10},PlacementCell,this);
        this.CreateFleet(this.board);

        const letters = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z']
        this.shipForm = this.add.dom(this.board.origin.x + this.board.width * 30 + 10, this.board.origin.y).createFromCache('createShip').setOrigin(0,0);
        this.shipForm.getChildByName("length").setAttribute("max",this.board.width >= this.board.height ? this.board.width:this.board.height);
        this.shipForm.getChildByName("row").setAttribute("max",this.board.height);
        this.shipForm.getChildByName("column").setAttribute("pattern","[a-"+letters[this.board.width-1]+"A-"+letters[this.board.width-1].toUpperCase()+"]{1}");
        document.getElementById("form").addEventListener("submit",(event)=>{
            event.preventDefault();
            const name = this.shipForm.getChildByName("name").value;
            const fixedLength = !this.shipForm.getChildByName("variableLength").checked;
            const length = parseInt(this.shipForm.getChildByName("length").value);
            const x = this.board.origin.x + 30 * letters.indexOf(this.shipForm.getChildByName("column").value) + 4;
            const y = this.board.origin.y + 30 * (parseInt(this.shipForm.getChildByName("row").value) - 1) + 4 || 0;
            const rotation = this.shipForm.getChildByName("rotation").checked ? "ver":"hor"
            const newShip = new MovingShips(length,{x:x,y:y},{rotation:rotation, name:name, random:false, fixedLength: fixedLength}, this.board);
            this.board.ships.push(newShip);        
        });

        this.boardEdit = this.add.dom(this.board.origin.x + this.board.width * 30 + 200, this.board.origin.y + 30).createFromCache('boardEdit').setOrigin(0,0)
        

        let container = this.add.rectangle(300,this.board.origin.y + 30 * this.board.height + 24,200,30,0xffffff).setStrokeStyle(2,0x000000);
        let text = this.add.text(container.x,container.y,"Randomise", {fontFamily:'Arial' ,fontSize:'18px', fill:'#000000'}).setOrigin(0.5,0.5);
        this.randomiseButton = new phaserButton(container,text, function(){
            this.container.setFillStyle(0xffffff);
            const length = this.scene.board.ships.length;
            for(let i = 0; i < length; i++)
            {
                this.scene.board.ships[0].destroy();
            }
            this.scene.CreateFleet(this.scene.board);
        },this);


        container = this.add.rectangle(this.board.origin.x + this.board.width * 30 + 85, this.board.origin.y + 30 * this.board.height - 30,100,30,0xffffff).setStrokeStyle(2,0x000000);
        text = this.add.text(container.x, container.y,"Start", {fontFamily:'Arial' ,fontSize:'18px', fill:'#000000'}).setOrigin(0.5,0.5)
        this.startButton = new phaserButton(container,text,function(){
            this.scene.scene.stop('FleetPlace');
            this.scene.scene.start('MainGame', {playerBoard:this.scene.board,opponentBoard: this.scene.CreateRandomBoard()});
        },this)


        // This piece of code runs when a draggable object is dragged
        this.input.on('drag',function(pointer,target,dragX,dragY){
            // If the cell you are trying to drag to a new cell then the dragging code is run
            if(target.x !== dragX - dragX % 30 || target.y !== dragY - dragY % 30){
                // First the ship is marked as being dragged
                target.ship.justDragged = true;
                // Next the the ships drag procedure is run
                target.ship.Drag({x:dragX - dragX % 30,y:dragY - dragY % 30},target.index);
                // Each ship on the grid is updated
                this.board.ships.forEach(ship => {
                    ship.UpdateShipCells(false);
                });
            }
        },this);

    }

    CreateFleet(board){
        //Making objects for each ship and adding them to an array
        const battleship = new MovingShips(4,{x:150,y:180},{rotation:"hor", name:"Battleship", random:true, fixedLength: false}, board);
        board.ships.push(battleship);
        const carrier = new MovingShips(5,{x:120,y:60},{rotation:"hor", name:"Carrier", random:true, fixedLength: false}, board);
        board.ships.push(carrier);
        const cruiser = new MovingShips(3,{x:210,y:60},{rotation:"ver", name:"Cruiser", random:true, fixedLength:false}, board);
        board.ships.push(cruiser);
        const submarine = new MovingShips(3,{x:240,y:120},{rotation:"ver", name:"Submarine", random:true, fixedLength:false}, board);
        board.ships.push(submarine);
        const destroyer = new MovingShips(2,{x:360,y:60},{rotation:"ver", name:"Destroyer", random:true, fixedLength:false}, board);
        board.ships.push(destroyer);
        // do
        // {
        //     const destroyer = new MovingShips(Math.floor(Math.random() * 10) + 1,{x:360,y:60},{rotation:"ver", name:"Ship", random:true, fixedLength:false}, board);
        //     board.ships.push(destroyer);
        //     console.log(`@${this.board.ships.length}`)
        // }while(this.board.ships.length < 26)
    }

    CreateRandomBoard(){
        const tempBoard = new Board({x:0,y:0}, {width:this.board.width,height:this.board.height}, PlacementCell,this);
        let tempShip
        this.board.ships.forEach(ship => {
            tempShip = new MovingShips(ship.length,{x:360,y:60},{rotation:"ver", name:"Destroyer", random:true, fixedLength:false}, tempBoard);
            tempBoard.ships.push(tempShip);
        });
        return tempBoard;
    }
}