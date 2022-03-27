import BasicComputer from "./BasicComputer";

export default class MediumComputer extends BasicComputer
{
    constructor(ownBoard,guessingBoard,name)
    {
        super(ownBoard,guessingBoard,name);
        // A medium computer has extra properties these mark if the computer is destroying a ship or found the direction 
        this.destroyingShip = false;
        this.foundDirection = false;    
    }

    generateTarget()
    {
        // A check is made for if the computer is destroying a ship or has just hit a ship
        if(this.destroyingShip || this.guessingBoard.hitShip)
        {
            if(!this.destroyingShip)
            {
                // If the this is a new ship the starting cell is stored destroyingShip is marked as true and foundDirection is marked as false
                this.startingCell = this.previousTarget;
                this.destroyingShip = true;
                this.foundDirection = false;
            }
            // Possible directions are stored in an array
            const directions = [{x:1,y:0},{x:-1,y:0},{x:0,y:1},{x:0,y:-1}]

            // A check is made for if the ship has sunk
            let hasSunk
            try
            {
                hasSunk = !this.guessingBoard.grid[this.previousTarget.y][this.previousTarget.x].ships[0].floating
            }catch{hasSunk = false}
            if(hasSunk)
            {
                // If the ship has sunk the properties marking if the computer should keep guessing are marked as false
                this.destroyingShip = false;
                this.guessingBoard.hitShip = false;

                // A random cell is guessed and stored 
                this.previousTarget = super.generateTarget();
                return this.previousTarget;
            }
            else if(!this.foundDirection)
            {
                // If the direction of the ship is not found a random valid direction is picked and the target cell is made from this direction
                do{
                    this.direction = directions[Math.floor(Math.random() * directions.length)];
                    this.previousTarget = {x:this.startingCell.x + this.direction.x,y:this.startingCell.y + this.direction.y};
                }while(this.previousTarget.x === -1 || this.previousTarget.x === this.guessingBoard.width || this.previousTarget.y === -1 || this.previousTarget.y === this.guessingBoard.height)
                
                // A check is made for if the direction was correct
                if(this.guessingBoard.grid[this.previousTarget.y][this.previousTarget.x].ships.length > 0)
                {
                    this.foundDirection = true;
                }
                return this.previousTarget;
            }
            else
            {
                // If the computer is destroying the ship and knows the direction this code is ran
                if(this.guessingBoard.hitShip)
                {
                    // The guess is continues in the direction found
                    this.previousTarget = {x:this.previousTarget.x + this.direction.x, y:this.previousTarget.y + this.direction.y};
                    // This if statement checks if the next target is outside the board or if the cell has been already guessed
                    if(this.previousTarget.x === -1 || this.previousTarget.x === this.guessingBoard.width || this.previousTarget.y === -1 || this.previousTarget.y === this.guessingBoard.height || this.guessingBoard.grid[this.previousTarget.y][this.previousTarget.x].shown)
                    {
                        // If true then direction is reversed and the target cell is calculated with this new direction
                        this.direction = {x:-this.direction.x,y:-this.direction.y};
                        this.previousTarget = {x:this.startingCell.x + this.direction.x, y:this.startingCell.y + this.direction.y};
                    }
                    return this.previousTarget
                }
                else
                {
                    // If the last guess was a miss then the rest of the ship should be in the opposite direction 
                    // This cod reverses the direction uses it to make next target and then stores the new direction and target
                    this.direction = {x:-this.direction.x,y:-this.direction.y};
                    this.previousTarget = {x:this.startingCell.x + this.direction.x, y:this.startingCell.y + this.direction.y};
                    return this.previousTarget;
                }
            }

        }
        else
        {
            // If the computer didn't hit a ship or isn't destroying one a random ship cell is guessed
            this.previousTarget = super.generateTarget();
            return this.previousTarget;
        }
    }
}