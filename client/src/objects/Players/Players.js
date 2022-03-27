export default class Player
{
    constructor(ownBoard, guessingBoard, name)
    {
        // The player has an own board, guessing board and a name
        this.ownBoard = ownBoard;
        this.guessingBoard = guessingBoard;
        this.name = name;
    }

    startTurn()
    {
        // When the players turn started the cells in their guessing board are made interactive
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
        // When the players turn ends the guessing boards cells are made no longer interactive
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
        // On check win the ships on the players guessing board are checked for if the have all sunk
        let won = true;
        this.guessingBoard.ships.forEach(ship => 
        {
            if(ship.floating)
            {
                // If as ship is still floating the player has not won
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



