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
}

class BasicComputer extends Player
{
    constructor(ownBoard,guessingBoard)
    {
        super(ownBoard,guessingBoard);
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

        let targetx = 0;
        let targety = 0;
        do
        {
            targetx = Math.floor(this.guessingBoard.width * Math.random());
            targety = Math.floor(this.guessingBoard.height * Math.random());
        }while(this.guessingBoard.grid[targety][targetx].shown === true);
        this.guessingBoard.grid[targety][targetx].showCell();
    }

}