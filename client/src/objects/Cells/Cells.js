export default class Cell
{
    constructor(origin,board)
    {   
        // The cell is given its properties
        this.shown = false;
        this.origin = origin;
        this.board = board;
        // A visual element for the cell is added to the scene
        const rectangle = this.board.scene.add.rectangle(origin.x,origin.y,30,30,0xffffff).setOrigin(0,0);
        rectangle.setStrokeStyle(2,0x000000);
        this.borders = [];
        this.ships = [];
        this.visualCell = rectangle;        
    }

    showCell(notBorder = true)
    {   
        if(this.ships.length > 0)
        {
            // If the cell is a ship the ship is hit and the cell created a sprite to mark this hit
            this.ships[0].Hit();
            this.board.scene.add.sprite(this.origin.x + 4, this.origin.y + 4, 'shipHit').setOrigin(0,0);
            this.board.hitShip = true;
            //The hit is stored in the board
            this.board.hits += 1;
        }
        else
        {
            // If the cell is not a ship a guess pin is added to the board
            this.board.scene.add.sprite(this.origin.x + 4, this.origin.y + 4, 'guessPin').setOrigin(0,0);
            this.board.hitShip = false;
            this.board.justHit = true;
        }
        // This if statement is true when you are not revealing the borders around a ship
        if(notBorder)
        {
            this.board.guesses += 1
        }
        // The cell is marked as shown and is made no longer interactive
        this.shown = true;
        this.visualCell.disableInteractive();
    }

    destroy()
    {
        // The visual element of the cell is destroyed
        this.visualCell.destroy();
    }
}

