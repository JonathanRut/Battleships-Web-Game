class Ship
{    
    constructor(length, origin, properties, board)
    {
        this.length = length;
        this.origin = origin;
        this.name = properties.name;
        this.board = board;
        this.rotation = properties.rotation;
    }
}

class GameShip extends Ship
{
    shipCells = [];
    borderCells = [];
    hits = 0;
    floating = true;

    constructor(length,origin,properties,board)
    {
        super(length,origin,properties,board);
    }
    
    Hit()
    {
        this.hits += 1;
        if(this.hits === this.length)
        {
            this.borderCells.forEach(cell =>
            {
                cell.showCell();
            });
            this.floating = false;
            console.log(`You sunk my ${this.name}`)
            this.board.justHit = false;
        }
    }

    AddBorderCell(cell)
    {
        this.borderCells.push(cell);
        if(!(cell instanceof InteractiveCell))
        {
            cell.visualCell.setFillStyle(0xd0d0d0);
        }
    }

    AddShipCell(cell)
    {
        this.shipCells.push(cell);
        
        if(!(cell instanceof InteractiveCell))
        {
            this.board.scene.add.sprite(cell.origin.x + 4, cell.origin.y + 4 ,'shipPart').setOrigin(0,0);
            cell.visualCell.setFillStyle(0xa0a0a0);
        }
    }
}