import Ship from "./Ship";
import InteractiveCell from "../Cells/InteractiveCell";
import MultiplayerCell from "../Cells/MultiplayerCell";

export default class GameShip extends Ship
{
    constructor(length,origin,properties,owner,board)
    {
        // Properties of the ships are set
        super(length,origin,properties,board);
        this.shipCells = [];
        this.borderCells = [];
        this.hits = 0;
        this.floating = true;
        this.owner = owner;
    }
    
    Hit()
    {
        // When the ship gets hit its hit counter is incremented by 1
        this.hits += 1;
        if(this.hits === this.length)
        {
            // If the ship is sunk then the border cells of the ship are revealed
            this.borderCells.forEach(cell =>
            {
                cell.showCell(false);
            });
            // The ships is marked as sunk
            this.floating = false;

            // A message is put in the chat box saying the ship is sunk
            const messages = document.getElementById('messages');
            var newMessage = document.createElement('li');
            newMessage.textContent = `${this.owner}: You sunk my ${this.name}`;
            messages.appendChild(newMessage);
            messages.scrollTo(0,messages.scrollHeight);          
            this.board.justHit = false;
            // The sink counter is incremented by 1
            this.board.sinks += 1
        }
    }

    AddBorderCell(cell)
    {
        // The border cell is added to the array of other border cells
        this.borderCells.push(cell);
        if(!(cell instanceof InteractiveCell || cell instanceof MultiplayerCell))
        {
            // If it the users own board the cell is marked as a border
            cell.visualCell.setFillStyle(0xd0d0d0);
        }
    }

    AddShipCell(cell)
    {
        // The ship cell is pushed onto the array of other ship cells
        this.shipCells.push(cell);
        if(!(cell instanceof InteractiveCell || cell instanceof MultiplayerCell))
        {
            // If it is the users own board a sprite is added to mark the cell as a ship
            this.board.scene.add.sprite(cell.origin.x + 4, cell.origin.y + 4 ,'shipPart').setOrigin(0,0);
            cell.visualCell.setFillStyle(0xa0a0a0);
        }
    }
}