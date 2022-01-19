import Player from "./Players";

export default class BasicComputer extends Player
{
    constructor(ownBoard,guessingBoard)
    {
        super(ownBoard,guessingBoard);
    }
    
    startTurn()
    {
        let target = {};
        do
        {
            target = this.generateTarget();
        }while(this.guessingBoard.grid[target.y][target.x].shown === true);
        this.guessingBoard.grid[target.y][target.x].showCell();
    }

    generateTarget()
    {
        return {x:Math.floor(this.guessingBoard.width * Math.random()),y:Math.floor(this.guessingBoard.height * Math.random())}
    }
}