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
        // A form is created from html stored in cache for creating ships
        this.shipForm = this.add.dom(this.board.origin.x + this.board.width * 30 + 10, this.board.origin.y).createFromCache('createShip').setOrigin(0,0);

        // Validation is added to input elements in the form
        this.shipForm.getChildByName("length").setAttribute("max",this.board.width >= this.board.height ? this.board.width:this.board.height);
        this.shipForm.getChildByName("row").setAttribute("max",this.board.height);
        this.shipForm.getChildByName("column").setAttribute("pattern","[a-"+letters[this.board.width-1]+"A-"+letters[this.board.width-1].toUpperCase()+"]{1}");
        document.getElementById("form").addEventListener("submit",(e)=>{
            e.preventDefault();
            // When the form is submitted the input values are taken and stored
            const name = this.shipForm.getChildByName("name").value === "" ?  "Ship":this.shipForm.getChildByName("name").value;
            const length = parseInt(this.shipForm.getChildByName("length").value);
            const x = this.board.origin.x + 30 * letters.indexOf(this.shipForm.getChildByName("column").value) + 4;
            const y = this.board.origin.y + 30 * (parseInt(this.shipForm.getChildByName("row").value) - 1) + 4 || 0;
            const rotation = this.shipForm.getChildByName("rotation").checked ? "ver":"hor"
            // A new ship is made and added to the board
            const newShip = new MovingShips(length,{x:x,y:y},{rotation:rotation, name:name, random:false, fixedLength: false}, this.board);
            this.board.ships.push(newShip);        
        });

        // Numeric input boxes are made from cache and added to the scene allowing for variable board size
        this.boardEdit = this.add.dom(10, this.board.origin.y).createFromCache('boardEdit').setOrigin(0,0)

        // The columns input box is stored
        const boardColumns = document.getElementById('boardColumns');
        boardColumns.oninput = ()=>
        {
            //When the number in the columns box changes the values is stored
            const newWidth = parseInt(boardColumns.value);
            if(newWidth > this.board.width)
            {
                // If the user is trying to increase the width of the board the other elements in the scene are moved and the canvas size is increased
                this.board.AddColumn();
                this.startButton.container.x += 30;
                this.startButton.text.x += 30;
                this.shipForm.x += 30;
                this.game.scale.resize(this.game.scale.width + 60,this.game.scale.height);
                this.playerSelection.x += 30;
            }
            if(newWidth < this.board.width)
            {
                // If the user is trying to delete a column an attempt is made
                if(!this.board.DeleteColumn())
                {
                    // If it fails due to a ship being in the way or the board being too small the value in boardColumns box is reverted
                    boardColumns.value = this.board.width.toString();
                }
                else
                {
                    // If it succeeds in removing a column the other elements in the scene are moved and canvas size is increased
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
            // The height the user is trying to change to is stored in a constant
            const newHeight = parseInt(boardRows.value);
            if(newHeight > this.board.height)
            {
                // If the user is trying to increase the height of the board the other elements in the scene are moved and the canvas size is increased
                this.board.AddRow();
                this.randomiseButton.container.y += 30;
                this.randomiseButton.text.y += 30;
                this.game.scale.resize(this.game.scale.width,this.game.scale.height + 30);
            }
            if(newHeight < this.board.height)
            {
                 // If the user is trying to delete a row an attempt is made
                if(!this.board.DeleteRow())
                {
                    // If it fails due to a ship being in the way or the board being too small the value in boardRows box is reverted
                    boardRows.value = this.board.height.toString();
                }
                else
                {
                    // If it succeeds in removing a row the other elements in the scene are moved and canvas size is increased
                    this.randomiseButton.container.y -= 30;
                    this.randomiseButton.text.y -= 30;
                    this.game.scale.resize(this.game.scale.width,this.game.scale.height - 30);
                }
            }            
        }

        // 2 drop down selection boxes are added to the scene to pick player 1 and 2
        this.playerSelection = this.add.dom(this.board.origin.x + this.board.width * 30 + 200, this.board.origin.y + 30).createFromCache('playerSelection').setOrigin(0,0)
    }

    onStart()
    {
        // When the user presses start the players they selected are gotten
        let player1 = this.scene.GetPlayerID('Player1')
        let player2 = this.scene.GetPlayerID('Player2')
        // The current scene is stopped
        this.scene.scene.stop('FleetPlace');
        // The Main Game is started and the settings that the user selected are passed to the next scene
        this.scene.scene.start('MainGame', {playerBoard:this.scene.board,opponentBoard: this.scene.CreateRandomBoard(), player1:player1, player2:player2, p2Cell:player1 === Player ? InteractiveCell:Cell, sceneKey: 'SingleFleetPlace'});
    }

    CreateRandomBoard(){
        // A temp board is created with the same height and width of the main boards scene
        const tempBoard = new Board({x:0,y:0}, {width:this.board.width,height:this.board.height}, PlacementCell,this);
        let tempShip
        // The main board is iterated through and the temp board is populated with ships the same length as the ones on the main board
        this.board.ships.forEach(ship => {
            tempShip = new MovingShips(ship.length,{x:360,y:60},{rotation:"ver", name:"Ship", random:true, fixedLength:false}, tempBoard);
            tempBoard.ships.push(tempShip);
        });
        // Finally the temp board is returned
        return tempBoard;
    }

    GetPlayerID(id)
    {
        // The player selected is found the the class for that player is returned
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
    }
}