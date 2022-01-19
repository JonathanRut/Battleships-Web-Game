import Board from "../objects/Boards";
import Player from "../objects/Players/Players";
import BasicComputer from '../objects/Players/BasicComputer';
import MediumComputer from '../objects/Players/MediumComputer';
import InteractiveCell from '../objects/Cells/InteractiveCell';
import Cell from "../objects/Cells/Cells";
import GameShip from "../objects/Ships/GameShip";
import phaserButton from "../assets/phaserButton";

export default class MainGame extends Phaser.Scene
{
    constructor(){
        super({key:"MainGame"});
    }

    preload(){
        this.load.image('shipPart','src/assets/sprites/shipPart.png');
        this.load.image('guessPin', 'src/assets/sprites/guessPin.png');
        this.load.image('shipHit', "src/assets/sprites/shipHit.png");
    }

    create(boards){
        let playerBoard = new Board({x:80,y:70},{width:boards.playerBoard.width,height:boards.playerBoard.height},Cell,this);
        let guessBoard = new Board({x:210 + boards.playerBoard.width * 30 ,y:70},{width:boards.playerBoard.width,height:boards.playerBoard.height},InteractiveCell,this);

        this.add.text(playerBoard.origin.x + 150 ,playerBoard.origin.y - 30, "Player 1 Board", {fontFamily:'Arial' ,fontSize:'24px', fill:'#000000'});
        this.add.text(guessBoard.origin.x + 150 ,guessBoard.origin.y - 30, "Player 2 Board", {fontFamily:'Arial' ,fontSize:'24px', fill:'#000000'});

        this.turn = this.add.text(playerBoard.width * 30 + 60, playerBoard.height * 30 + 120, "Player 1's turn", {fontFamily:'Arial' ,fontSize:'24px', fill:'#000000'});

        this.ConvertOldBoards(boards.playerBoard,playerBoard);
        this.ConvertOldBoards(boards.opponentBoard,guessBoard);

        this.player1 = new MediumComputer(playerBoard,guessBoard);
        this.player2 = new MediumComputer(guessBoard,playerBoard);

        // for(let i = 0; i < guessBoard.height; i++)
        // {
        //     let line = i + "|";
        //     for(let j = 0; j < guessBoard.width; j++)
        //     {
        //         if(guessBoard.grid[i][j].borders.length > 0)
        //         {
        //             //line += playerBoard.grid[i][j].borders.length   + "|";
        //             // line +=  "X|"
        //             line += " |"
        //         }
        //         else if(guessBoard.grid[i][j].ships.length > 0)
        //         {
        //             line += "O|"
        //         }
        //         else{line += " |"}
        //     }
        //     console.log(line)
        // }
        // console.log("end");

        this.player2.ownBoard.justHit = Math.random() < 0.5 ? true:false;
        this.player1.ownBoard.justHit = !this.player2.ownBoard.justHit

        let container = this.add.rectangle(200,this.player1.ownBoard.height * 30 + 120,280,60,0xffffff).setStrokeStyle(2,0x000000);
        let text = this.add.text(container.x,container.y,"Play Again?", {fontFamily:'Arial' ,fontSize:'48px', fill:'#000000'}).setOrigin(0.5,0.5);
        this.playAgain = new phaserButton(container, text, function()
        {
            this.scene.scene.restart();
            const FleetPlace = this.scene.scene.get('FleetPlace');
            FleetPlace.scene.restart();
            this.scene.scene.stop('MainGame');
            this.scene.scene.start('FleetPlace');
        },this)
        this.playAgain.hide();
    }

    update()
    {
        if(this.player1.ownBoard.justHit || this.player1.guessingBoard.hitShip)
        {
            // Player 1 turn
            this.turn.text = "Player 1's turn"
            this.player2.endTurn();
            this.sleep(100);
            this.player1.startTurn();
            this.player1.ownBoard.justHit = false;
        }
        else if (this.player2.ownBoard.justHit || this.player2.guessingBoard.hitShip)
        {
            // Player 2 turn
            this.turn.text = "Player 2's turn"
            this.player1.endTurn();
            this.sleep(100);
            this.player2.startTurn();
            this.player2.ownBoard.justHit = false;
        }
        //Check for winner
        if(this.player1.checkWin())
        {
            this.player1.endTurn();
            this.player2.endTurn();
            this.player1.startTurn = ()=>{};
            this.player2.startTurn = ()=>{};
            this.add.text(this.player1.ownBoard.width * 30 + 400, this.player1.ownBoard.height * 30 + 120, "Player 1 Wins!", {fontFamily:'Arial' ,fontSize:'48px', fill:'#000000'}).setOrigin(0.5,0.5);
            console.log("Player 1 wins")
            this.playAgain.show();
            this.player1.checkWin = ()=>{};
        }
        else if (this.player2.checkWin())
        {
            this.player1.endTurn();
            this.player2.endTurn();
            this.player1.startTurn = ()=>{};
            this.player2.startTurn = ()=>{};
            this.add.text(this.player1.ownBoard.width * 30 + 400, this.player1.ownBoard.height * 30 + 120, "Player 2 Wins!", {fontFamily:'Arial' ,fontSize:'48px', fill:'#000000'}).setOrigin(0.5,0.5);
            console.log("Player 2 wins")
            this.playAgain.show();
            this.player2.checkWin = ()=>{};
        }
    }

    ConvertOldBoards(oldBoard,newBoard)
    {
        newBoard.ships = Array(oldBoard.ships.length);
        for(let i = 0; i < newBoard.ships.length; i++)
        {
            const oldShip = oldBoard.ships[i]
            newBoard.ships[i] = new GameShip(oldShip.length, oldShip.origin, {name:oldShip.name, rotation:oldShip.rotation}, newBoard);
        }

        for(let i = 0; i < oldBoard.height; i++)
        {
            for(let j = 0; j < oldBoard.width; j++)
            {
                if(oldBoard.grid[i][j].ships.length > 0)
                {
                    const ship = oldBoard.grid[i][j].ships[0];
                    const index = oldBoard.ships.indexOf(ship);
                    const cell = newBoard.grid[i][j];
                    cell.ships.push(newBoard.ships[index]);
                    newBoard.ships[index].AddShipCell(cell);
                }
                else if (oldBoard.grid[i][j].borders.length > 0)
                {
                    oldBoard.grid[i][j].borders.forEach(ship => 
                    {
                        const index = oldBoard.ships.indexOf(ship);
                        const cell = newBoard.grid[i][j];
                        cell.borders.push(newBoard.ships[index]);
                        newBoard.ships[index].AddBorderCell(cell);
                    });
                }
            }
        }
        return newBoard;
    }

    sleep(time)
    {
        const start = Date.now();
        let progress = 0;
        do
        {
            progress =  Date.now() - start;
        }while(progress < time)
    }
}