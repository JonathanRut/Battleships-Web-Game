class Player
{
    constructor(ownBoard, guessingBoard)
    {
        this.ownBoard = ownBoard;
        this.guessingBoard = guessingBoard;
    }

    startTurn()
    {
        let lost = true;
        this.ownBoard.ships.forEach(ship => 
        {
            if(ship.floating)
            {
                lost = false;
            }
        });
        if(lost)
        {
            return true;
        }
        this.guessingBoard.grid.forEach(row => 
        {
            row.forEach(cell => 
            {
                cell.shown ? null:cell.visualCell.setInteractive();
            });
        });
    }
}

class BasicComputer extends Player
{
    constructor(ownBoard,guessingBoard)
    {
        super(ownBoard,guessingBoard);
    }
    
}