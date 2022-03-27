import Player from "./Players";

export default class BasicComputer extends Player
{
    constructor(ownBoard,guessingBoard,name)
    {
        super(ownBoard,guessingBoard,name);
    }
    
    startTurn()
    {
        let target = {};
        // On start turn the computer keeps guessing at a cell until it gets one which isn't shown
        do
        {
            target = this.generateTarget();
        }while(this.guessingBoard.grid[target.y][target.x].shown === true);
        // The cell on the board is shown
        this.guessingBoard.grid[target.y][target.x].showCell();
    }

    generateTarget()
    {
        // A random cell on the board is returned
        return {x:Math.floor(this.guessingBoard.width * Math.random()),y:Math.floor(this.guessingBoard.height * Math.random())}
    }
}