export default class Player
{
    constructor(ownBoard, guessingBoard, name)
    {
        this.ownBoard = ownBoard;
        this.guessingBoard = guessingBoard;
        this.name = name;
    }

    startTurn()
    {
        this.guessingBoard.grid.forEach(row => 
        {
            row.forEach(cell => 
            {
                cell.shown ? null:cell.visualCell.setInteractive();
            });
        });
    }

    endTurn()
    {
        this.guessingBoard.grid.forEach(row => 
            {
                row.forEach(cell => 
                {
                    cell.shown ? null:cell.visualCell.disableInteractive();
                });
            });
    }

    checkWin()
    {
        let won = true;
        this.guessingBoard.ships.forEach(ship => 
        {
            if(ship.floating)
            {
                won = false;
            }
        });
        if(won)
        {
            return true;
        }
        return false;
    }
}



