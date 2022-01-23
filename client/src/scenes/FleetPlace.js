import Board from '../objects/Boards/Boards'
import MovingShips from '../objects/Ships/MovingShips'
import PlacementCell from '../objects/Cells/PlacementCell'
import phaserButton from '../assets/phaserButton'
import Player from "../objects/Players/Players";
import BasicComputer from '../objects/Players/BasicComputer';
import MediumComputer from '../objects/Players/MediumComputer';
import Multiplayer from '../objects/Players/Multiplayer'
import io from "socket.io-client";

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
        this.load.html('playerSelection', 'src/assets/playerSelection.html')
    }

    create(Game){
        this.customGame = Game.customGame;
        this.board = new Board({x:116,y:56},{width:10,height:10},PlacementCell,this);
        this.CreateFleet(this.board);


        const letters = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z']

        if(Game.customGame)
        {
            this.shipForm = this.add.dom(this.board.origin.x + this.board.width * 30 + 10, this.board.origin.y).createFromCache('createShip').setOrigin(0,0);
            this.shipForm.getChildByName("length").setAttribute("max",this.board.width >= this.board.height ? this.board.width:this.board.height);
            this.shipForm.getChildByName("row").setAttribute("max",this.board.height);
            this.shipForm.getChildByName("column").setAttribute("pattern","[a-"+letters[this.board.width-1]+"A-"+letters[this.board.width-1].toUpperCase()+"]{1}");
            document.getElementById("form").addEventListener("submit",(event)=>{
                event.preventDefault();
                const name = this.shipForm.getChildByName("name").value;
                const length = parseInt(this.shipForm.getChildByName("length").value);
                const x = this.board.origin.x + 30 * letters.indexOf(this.shipForm.getChildByName("column").value) + 4;
                const y = this.board.origin.y + 30 * (parseInt(this.shipForm.getChildByName("row").value) - 1) + 4 || 0;
                const rotation = this.shipForm.getChildByName("rotation").checked ? "ver":"hor"
                const newShip = new MovingShips(length,{x:x,y:y},{rotation:rotation, name:name, random:false, fixedLength: false}, this.board);
                this.board.ships.push(newShip);        
            });

            this.boardEdit = this.add.dom(10, this.board.origin.y).createFromCache('boardEdit').setOrigin(0,0)
            const boardColumns = document.getElementById('boardColumns');
            boardColumns.oninput = ()=>
            {
                const newWidth = parseInt(boardColumns.value);
                if(newWidth > this.board.width)
                {
                    this.board.AddColumn();
                    this.startButton.container.x += 30;
                    this.startButton.text.x += 30;
                    this.shipForm.x += 30;
                    this.game.scale.resize(this.game.scale.width + 60,this.game.scale.height);
                    this.playerSelection.x += 30;
                }
                if(newWidth < this.board.width)
                {
                if(!this.board.DeleteColumn())
                {
                    boardColumns.value = this.board.width.toString();
                }
                else
                {
                        this.startButton.container.x -= 30;
                        this.startButton.text.x -= 30;
                        this.shipForm.x -= 30;
                        this.game.config.width -= 60;
                        this.game.scale.resize(this.game.scale.width - 60,this.game.scale.height);
                        this.playerSelection.x -= 30;
                }
                }
            }

            const boardRows = document.getElementById('boardRows');
            boardRows.oninput = () => 
            {
                const newHeight = parseInt(boardRows.value);
                if(newHeight > this.board.height)
                {
                    this.board.AddRow();
                    this.randomiseButton.container.y += 30;
                    this.randomiseButton.text.y += 30;
                    this.game.scale.resize(this.game.scale.width,this.game.scale.height + 30);
                }
                if(newHeight < this.board.height)
                {
                if(!this.board.DeleteRow())
                {
                    boardRows.value = this.board.height.toString();
                }
                else
                {
                        this.randomiseButton.container.y -= 30;
                        this.randomiseButton.text.y -= 30;
                        this.game.scale.resize(this.game.scale.width,this.game.scale.height - 30);
                }
                }            
            }

            this.playerSelection = this.add.dom(this.board.origin.x + this.board.width * 30 + 200, this.board.origin.y + 30).createFromCache('playerSelection').setOrigin(0,0)
        }


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


        if(Game.multiplayer)
        {
            this.onStart = function()
            {
                const scene = this.scene

                this.scene.add.text(this.container.x, this.container.y + 60, "Searching for a Player", {fontFamily:'Arial' ,fontSize:'18px', fill:'#000000'}).setOrigin(0.5,0.5)
                this.socket = io("http://localhost:3000");
                this.socket.on("connect", function()
                {
                    console.log("Connected");
                    let array = []
                    for(let i = 0; i<54; i++)
                    {
                        array.push({x:0,y:9})
                    }
                    this.emit('Board', array);
                });
        
                this.socket.on('Opponent', (OpponentID, justHit)=>
                {
                    console.log("Your opponent is " + OpponentID);
                    scene.scene.stop('FleetPlace');
                    scene.board.ships.forEach(ship => 
                    {
                        this.socket.emit('Ship', {length:ship.length, origin:ship.origin, rotation:ship.rotation, name:ship.name}, OpponentID);
                    })
                    
                    const OpponentBoard = new Board({x:116,y:56},{width:scene.board.width,height:scene.board.height},PlacementCell,scene)

                    this.socket.on('Ship', (shipProperties) => 
                    {
                        let ship = new MovingShips(shipProperties.length,shipProperties.origin,{rotation:shipProperties.rotation, name:shipProperties.name, random:false, fixedLength:true}, OpponentBoard);
                        OpponentBoard.ships.push(ship);
                        if(OpponentBoard.ships.length === scene.board.ships.length)
                        {
                            scene.scene.start('MainGame', {playerBoard:scene.board,opponentBoard: OpponentBoard, player1:Player, player2:Multiplayer, socket:this.socket, OpponentID:OpponentID, multiplayer:Game.multiplayer, justHit:justHit});
                        }
                    })
                });

            }
        }
        else
        {
            this.onStart = function()
            {
                let player1 = this.scene.getPlayer('Player1')
                let player2 = this.scene.getPlayer('Player2')
                this.scene.scene.stop('FleetPlace');
                this.scene.scene.start('MainGame', {playerBoard:this.scene.board,opponentBoard: this.scene.CreateRandomBoard(), player1:player1, player2:player2});
            }
        }



        container = this.add.rectangle(this.board.origin.x + this.board.width * 30 + 85, this.board.origin.y + 30 * this.board.height - 30,100,30,0xffffff).setStrokeStyle(2,0x000000);
        text = this.add.text(container.x, container.y,"Start", {fontFamily:'Arial' ,fontSize:'18px', fill:'#000000'}).setOrigin(0.5,0.5)
        this.startButton = new phaserButton(container,text,this.onStart,this)


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
        const battleship = new MovingShips(4,{x:150,y:180},{rotation:"hor", name:"Battleship", random:true, fixedLength: !this.customGame}, board);
        board.ships.push(battleship);
        const carrier = new MovingShips(5,{x:120,y:60},{rotation:"hor", name:"Carrier", random:true, fixedLength: !this.customGame}, board);
        board.ships.push(carrier);
        const cruiser = new MovingShips(3,{x:210,y:60},{rotation:"ver", name:"Cruiser", random:true, fixedLength:!this.customGame}, board);
        board.ships.push(cruiser);
        const submarine = new MovingShips(3,{x:240,y:120},{rotation:"ver", name:"Submarine", random:true, fixedLength:!this.customGame}, board);
        board.ships.push(submarine);
        const destroyer = new MovingShips(2,{x:360,y:60},{rotation:"ver", name:"Destroyer", random:true, fixedLength:!this.customGame}, board);
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

    getPlayer(id)
    {
        let player = document.getElementById(id).value
        if(player === "Player")
        {
            return Player
        }
        else if(player === "BasicComputer")
        {
            return BasicComputer
        }
        else if(player === "MediumComputer")
        {
            return MediumComputer
        }
    }
}