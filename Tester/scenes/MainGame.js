class MainGame extends Phaser.Scene
{
    constructor(){
        super({key:"MainGame"});
        
    }

    preload(){
        this.load.image('shipPart','sprites/shipPart.png');
        this.load.image('guessPin', 'sprites/guessPin.png');
        this.load.image('shipHit', "sprites/shipHit.png");
    }

    create(boards){
        let playerBoard = new Board({x:80,y:70},{width:boards.playerBoard.width,height:boards.playerBoard.height},Cell,this);
        let guessBoard = new Board({x:510,y:70},{width:boards.playerBoard.width,height:boards.playerBoard.height},InteractiveCell,this);

        this.ConvertOldBoards(boards.playerBoard,playerBoard);
        this.ConvertOldBoards(boards.opponentBoard,guessBoard);

        this.player1 = new Player(playerBoard,guessBoard);
        this.player2 = new BasicComputer(guessBoard,playerBoard);

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
    }

    update()
    {
        if(this.player1.ownBoard.justHit || this.player1.guessingBoard.hitShip)
        {
            // Player 1 turn
            this.player2.endTurn();
            this.player1.startTurn();
            this.player1.ownBoard.justHit = false;
        }
        else if (this.player2.ownBoard.justHit || this.player2.guessingBoard.hitShip)
        {
            // Player 2 turn
            this.player1.endTurn();
            this.sleep(500);
            this.player2.startTurn();
            this.player2.ownBoard.justHit = false;
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
            console.log(progress)
            progress =  Date.now() - start;
        }while(progress < time)
    }
}