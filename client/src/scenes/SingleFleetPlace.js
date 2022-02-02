import FleetPlace from "./FleetPlace";
import Board from '../objects/Boards/Boards'
import Player from "../objects/Players/Players";
import BasicComputer from '../objects/Players/BasicComputer';
import MediumComputer from '../objects/Players/MediumComputer';
import InteractiveCell from '../objects/Cells/InteractiveCell';
import Cell from '../objects/Cells/Cells';
import PlacementCell from '../objects/Cells/PlacementCell'
import MovingShips from '../objects/Ships/MovingShips'



export default class SingleFleetPlace extends FleetPlace
{
    constructor()
    {
        super('SingleFleetPlace')
    }

    preload()
    {
        super.preload();
        this.load.html('boardEdit', 'src/assets/boardEdit.html');
        this.load.html('playerSelection', 'src/assets/playerSelection.html');
        this.load.html('createShip', 'src/assets/shipCreate.html'); 
    }

    create()
    {
        super.create();
        const letters = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z']
        this.shipForm = this.add.dom(this.board.origin.x + this.board.width * 30 + 10, this.board.origin.y).createFromCache('createShip').setOrigin(0,0);
        this.shipForm.getChildByName("length").setAttribute("max",this.board.width >= this.board.height ? this.board.width:this.board.height);
        this.shipForm.getChildByName("row").setAttribute("max",this.board.height);
        this.shipForm.getChildByName("column").setAttribute("pattern","[a-"+letters[this.board.width-1]+"A-"+letters[this.board.width-1].toUpperCase()+"]{1}");
        document.getElementById("form").addEventListener("submit",(event)=>{
            event.preventDefault();
            const name = this.shipForm.getChildByName("name").value === "" ?  "Ship":this.shipForm.getChildByName("name").value;
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

    onStart()
    {
        let player1 = this.scene.getPlayer('Player1')
        let player2 = this.scene.getPlayer('Player2')
        this.scene.scene.stop('FleetPlace');
        this.scene.scene.start('MainGame', {playerBoard:this.scene.board,opponentBoard: this.scene.CreateRandomBoard(), player1:player1, player2:player2, p2Cell:player1 === Player ? InteractiveCell:Cell, sceneKey: 'SingleFleetPlace'});
    }

    CreateRandomBoard(){
        const tempBoard = new Board({x:0,y:0}, {width:this.board.width,height:this.board.height}, PlacementCell,this);
        let tempShip
        this.board.ships.forEach(ship => {
            tempShip = new MovingShips(ship.length,{x:360,y:60},{rotation:"ver", name:"Ship", random:true, fixedLength:false}, tempBoard);
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