class MainGame extends Phaser.Scene
{
    constructor(){
        super({key:"MainGame"});
        
    }

    preload(){
        this.load.image('shipPart','sprites/shipPart.png');
        this.load.image('guessPin', 'sprites/guessPin.png');
    }

    create(boards){
        let playerBoard = new Board({x:80,y:70},{width:boards.playerBoard.width,height:boards.playerBoard.height},Cell,this);
        let guessBoard = new Board({x:510,y:70},{width:boards.playerBoard.width,height:boards.playerBoard.height},InteractiveCell,this);

        this.ConvertOldBoards(boards.playerBoard,playerBoard);
        this.ConvertOldBoards(boards.opponentBoard,guessBoard);

        this.player1 = new Player(playerBoard,guessBoard);
        this.player2 = new BasicComputer(guessBoard,playerBoard);

        for(let i = 0; i < guessBoard.height; i++)
        {
            let line = i + "|";
            for(let j = 0; j < guessBoard.width; j++)
            {
                if(guessBoard.grid[i][j].borders.length > 0)
                {
                    //line += playerBoard.grid[i][j].borders.length   + "|";
                    line +=  "X|"
                    // line += " |"
                }
                else if(guessBoard.grid[i][j].ships.length > 0)
                {
                    line += "O|"
                }
                else{line += " |"}
            }
            console.log(line)
        }
        console.log("end");
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
}