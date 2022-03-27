import Player from '../Players/Players'


export default class Multiplayer extends Player
{
    constructor(ownBoard, guessingBoard)
    {
        super(ownBoard, guessingBoard);
    }

    startTurn()
    {
        const self = this;
        // On start turn if the previous guess was not a hit then a listener is added to the socket for a guess
        if(!this.guessingBoard.hitShip)
        {
            this.socket.on('Guess', (coords)=>
            {
                // When the socket receives a guess from the server it reveals the cell
                self.guessingBoard.grid[coords.y][coords.x].showCell();
            })
        }
    } 
    
    endTurn()
    {
        // On end turn the listeners for a guess is removed
        this.socket.removeAllListeners('Guess');
    }
}