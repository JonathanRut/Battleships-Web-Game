import BasicComputer from "./BasicComputer";

export default class MediumComputer extends BasicComputer
{
    constructor(ownBoard,guessingBoard,name)
    {
        super(ownBoard,guessingBoard,name);
        this.destroyingShip = false;
        this.foundDirection = false;    
    }

    generateTarget()
    {
        if(this.destroyingShip || this.guessingBoard.hitShip)
        {
            if(!this.destroyingShip)
            {
                this.startingCell = this.previousTarget;
                this.destroyingShip = true;
                this.foundDirection = false;
            }
            const directions = [{x:1,y:0},{x:-1,y:0},{x:0,y:1},{x:0,y:-1}]
            let hasSunk
            try
            {
                hasSunk = !this.guessingBoard.grid[this.previousTarget.y][this.previousTarget.x].ships[0].floating
            }catch{hasSunk = false}
            if(hasSunk)
            {
                this.destroyingShip = false;
                this.guessingBoard.hitShip = false;
                this.previousTarget = super.generateTarget();
                return this.previousTarget;
            }
            
            else if(!this.foundDirection)
            {
                do{
                    this.direction = directions[Math.floor(Math.random() * directions.length)];
                    this.previousTarget = {x:this.startingCell.x + this.direction.x,y:this.startingCell.y + this.direction.y};
                }while(this.previousTarget.x === -1 || this.previousTarget.x === this.guessingBoard.width || this.previousTarget.y === -1 || this.previousTarget.y === this.guessingBoard.height)
                
                if(this.guessingBoard.grid[this.previousTarget.y][this.previousTarget.x].ships.length > 0)
                {
                    this.foundDirection = true;
                }
                return this.previousTarget;
            }
            else
            {
                
                if(this.guessingBoard.hitShip)
                {
                    this.previousTarget = {x:this.previousTarget.x + this.direction.x, y:this.previousTarget.y + this.direction.y};
                    if(this.previousTarget.x === -1 || this.previousTarget.x === this.guessingBoard.width || this.previousTarget.y === -1 || this.previousTarget.y === this.guessingBoard.height || this.guessingBoard.grid[this.previousTarget.y][this.previousTarget.x].shown)
                    {
                        this.direction = {x:-this.direction.x,y:-this.direction.y};
                        this.previousTarget = {x:this.startingCell.x + this.direction.x, y:this.startingCell.y + this.direction.y};
                    }
                    return this.previousTarget
                }
                else
                {
                    this.direction = {x:-this.direction.x,y:-this.direction.y};
                    this.previousTarget = {x:this.startingCell.x + this.direction.x, y:this.startingCell.y + this.direction.y};
                    return this.previousTarget;
                }
            }

        }
        else
        {
            this.previousTarget = super.generateTarget();
            return this.previousTarget;
        }
    }
}