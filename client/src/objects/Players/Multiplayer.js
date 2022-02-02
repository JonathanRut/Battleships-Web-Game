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
        if(!this.guessingBoard.hitShip)
        {
            this.socket.on('Guess', (coords)=>
            {
                self.guessingBoard.grid[coords.y][coords.x].showCell();
            })
        }
    } 
    
    endTurn()
    {
        this.socket.removeAllListeners('Guess');
    }
}