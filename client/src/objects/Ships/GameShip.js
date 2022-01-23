import Ship from "./Ship";
import InteractiveCell from "../Cells/InteractiveCell";
import MultiplayerCell from "../Cells/MultiplayerCell";

export default class GameShip extends Ship
{
    constructor(length,origin,properties,board)
    {
        super(length,origin,properties,board);
        this.shipCells = [];
        this.borderCells = [];
        this.hits = 0;
        this.floating = true;
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
        if(!(cell instanceof InteractiveCell || cell instanceof MultiplayerCell))
        {
            cell.visualCell.setFillStyle(0xd0d0d0);
        }
    }

    AddShipCell(cell)
    {
        this.shipCells.push(cell);
        
        if(!(cell instanceof InteractiveCell || cell instanceof MultiplayerCell))
        {
            this.board.scene.add.sprite(cell.origin.x + 4, cell.origin.y + 4 ,'shipPart').setOrigin(0,0);
            cell.visualCell.setFillStyle(0xa0a0a0);
        }
    }
}