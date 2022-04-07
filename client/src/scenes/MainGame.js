import Board from "../objects/Boards/Boards";
import InteractiveCell from '../objects/Cells/InteractiveCell';
import Cell from "../objects/Cells/Cells";
import GameShip from "../objects/Ships/GameShip";
import phaserButton from "../assets/phaserButton";
import Players from "../objects/Players/Players"

export default class MainGame extends Phaser.Scene
{
    constructor(key = "MainGame"){
        super({key:key});
    }

    preload(){
        this.load.image('shipPart','src/assets/sprites/shipPart.png');
        this.load.image('guessPin', 'src/assets/sprites/guessPin.png');
        this.load.image('shipHit', "src/assets/sprites/shipHit.png");
        this.load.html('chatBox', 'src/assets/chatbox.html')
    }

    create(settings){
        // Boards are made for both player 1 and 2
        // The cells of the board are set using the parameters passed in
        let playerBoard = new Board({x:80,y:70},{width:settings.playerBoard.width,height:settings.playerBoard.height},settings.player2 === Players ? InteractiveCell:Cell,this);
        let guessBoard = new Board({x:210 + settings.playerBoard.width * 30 ,y:70},{width:settings.playerBoard.width,height:settings.playerBoard.height}, settings.p2Cell,this);

        // Text is added to identify the boards
        this.player1Text = this.add.text(playerBoard.origin.x + 150 ,playerBoard.origin.y - 30, "Player 1 Board", {fontFamily:'Arial' ,fontSize:'24px', fill:'#000000'});
        this.player2Text = this.add.text(guessBoard.origin.x + 150 ,guessBoard.origin.y - 30, "Player 2 Board", {fontFamily:'Arial' ,fontSize:'24px', fill:'#000000'});

        // Text for whose turn it is
        this.turn = this.add.text(playerBoard.width * 30 + 60, playerBoard.height * 30 + 120, "Player 1's turn", {fontFamily:'Arial' ,fontSize:'24px', fill:'#000000'});

        // The boards from the placement scene are converted so they work in the main game
        this.ConvertOldBoards(settings.playerBoard,playerBoard,"Player 1");
        this.ConvertOldBoards(settings.opponentBoard,guessBoard, "Player 2");

        // 2 players are made using classes passed in as parameters
        this.player1 = new settings.player1(playerBoard,guessBoard, "Player 1");
        this.player2 = new settings.player2(guessBoard,playerBoard, "Player 2");
        
        // This decide who goes first
        this.player2.ownBoard.justHit = Math.random() < 0.5 ? true:false;
        this.player1.ownBoard.justHit = !this.player2.ownBoard.justHit
        
        // A button is made for playing again and is then hidden
        let container = this.add.rectangle(200,this.player1.ownBoard.height * 30 + 120,280,60,0xffffff).setStrokeStyle(2,0x000000);
        let text = this.add.text(container.x,container.y,"Play Again?", {fontFamily:'Arial' ,fontSize:'48px', fill:'#000000'}).setOrigin(0.5,0.5);
        this.playAgain = new phaserButton(container, text, function()
        {
            this.scene.scene.restart();
            const FleetPlace = this.scene.scene.get(settings.sceneKey);
            FleetPlace.scene.restart();
            this.scene.game.scale.resize(1160,540);
            this.scene.scene.stop('MainGame');
            this.scene.scene.start(settings.sceneKey);
        },this)
        this.playAgain.hide();

        // A chat box is added to the scene
        this.add.dom(guessBoard.origin.x + 30 * guessBoard.width + 70,0).createFromCache("chatBox").setOrigin(0,0);
        this.form = document.getElementById('form')
        document.getElementById('username').remove();

        // The username for the chat box is set depending on who is a human player
        if(settings.player1 === Players && settings.player2 === Players)
        {
            this.submitMessage = (e)=>{e.preventDefault()}
        }else if(settings.player1 === Players)
        {
            form.username = "Player 1"
        }else if(settings.player2 === Players)
        {
            form.username = "Player 2"
        }

        // A listener for submission is added to the form and the start time of the game is stored
        this.form.addEventListener('submit',this.submitMessage);
        this.startTime = Date.now();
    }

    update()
    {
        // These conditions check for if the players board has been hit or if they just hit a ship
        if(this.player1.ownBoard.justHit || this.player1.guessingBoard.hitShip)
        {
            // Player 1 turn
            this.turn.text = this.player1.name + "'s turn"
            this.player2.endTurn();
            this.sleep(100);
            this.player1.startTurn();
            this.player1.ownBoard.justHit = false;
        }
        else if (this.player2.ownBoard.justHit || this.player2.guessingBoard.hitShip)
        {
            // Player 2 turn
            this.turn.text = this.player2.name + "'s turn"
            this.player1.endTurn();
            this.sleep(100);
            this.player2.startTurn();
            this.player2.ownBoard.justHit = false;
        }
        //Check for winner
        this.checkWin(this.player1, this.player2);
        this.checkWin(this.player2, this.player1)
    }

    ConvertOldBoards(oldBoard,newBoard,owner)
    {
        // A ship array is added to the new board the same length as the old board
        newBoard.ships = Array(oldBoard.ships.length);
        for(let i = 0; i < newBoard.ships.length; i++)
        {
            const oldShip = oldBoard.ships[i]
            // Each old ship on the old board is accessed and a game ship is made from it
            newBoard.ships[i] = new GameShip(oldShip.length, oldShip.origin, {name:oldShip.name, rotation:oldShip.rotation}, owner, newBoard);
        }

        // The cells on the old board are iterated through
        for(let i = 0; i < oldBoard.height; i++)
        {
            for(let j = 0; j < oldBoard.width; j++)
            {
                // If statements find if the cell borders a ship or contains a ship
                if(oldBoard.grid[i][j].ships.length > 0)
                {
                    // If it contains a ship the position of the ship in the old ship array is found
                    const ship = oldBoard.grid[i][j].ships[0];
                    const index = oldBoard.ships.indexOf(ship);
                    const cell = newBoard.grid[i][j];
                    // The new cell gets a reference to the new ship and the new ship get a reference to the cell
                    cell.ships.push(newBoard.ships[index]);
                    newBoard.ships[index].AddShipCell(cell);
                }
                else if (oldBoard.grid[i][j].borders.length > 0)
                {
                    // If it borders a ship the array of borders is iterated through
                    oldBoard.grid[i][j].borders.forEach(ship => 
                    {
                        // For each ship it borders the index is the old ship array is found
                        const index = oldBoard.ships.indexOf(ship);
                        const cell = newBoard.grid[i][j];
                        // The new cell gets a reference to the new ship and the ship gets a reference to the cell
                        cell.borders.push(newBoard.ships[index]);
                        newBoard.ships[index].AddBorderCell(cell);
                    });
                }
            }
        }
        return newBoard;
    }

    // This method allows a time delay between moves
    sleep(time)
    {
        const start = Date.now();
        let progress = 0;
        do
        {
            progress =  Date.now() - start;
        }while(progress < time)
    }

    // This method is run when the user submits a message to the chat box
    submitMessage(e)
    {
        e.preventDefault();
        // The message submitted is added to the list of other messages
        const messages = document.getElementById('messages');
        const input = document.getElementById('input');
        if(input.value)
        {
            let newMessage = document.createElement('li');
            newMessage.textContent = this.username + ": " + input.value;
            messages.appendChild(newMessage);
            messages.scrollTo(0,messages.scrollHeight);
            input.value = "";
        }
    }

    // This function checks if a player has won
    checkWin(player,opponent)
    {
        if(player.checkWin())
        {
            // If the player has won all turned are ended
            player.endTurn();
            opponent.endTurn();
            // Functions for starting turns and the player function for checking for win is removed
            player.startTurn = ()=>{};
            opponent.startTurn = ()=>{};
            player.checkWin = ()=>{};

            // Text is added to both the scene and the chat box saying the player has won
            this.add.text(player.ownBoard.width * 30 + 400, player.ownBoard.height * 30 + 120, player.name + " Wins!", {fontFamily:'Arial' ,fontSize:'48px', fill:'#000000'}).setOrigin(0.5,0.5);
            const messages = document.getElementById('messages');
            var newMessage = document.createElement('li');
            newMessage.textContent = player.name + " Wins!";
            messages.appendChild(newMessage);
            messages.scrollTo(0,messages.scrollHeight);       

            // The play again button is shown
            this.playAgain.show();

            // The ships which didn't get hit are revealed to the opponent
            player.ownBoard.grid.forEach((row)=>
            {
                row.forEach((cell)=>
                {
                    if(cell.ships.length > 0 && !cell.shown)
                    {
                        this.add.sprite(cell.origin.x + 4, cell.origin.y + 4 ,'shipPart').setOrigin(0,0);
                    }
                });
            });
        }
    }
}