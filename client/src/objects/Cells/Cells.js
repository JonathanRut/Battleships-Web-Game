export default class Cell
{
    constructor(origin,board)
    {
        this.shown = false;
        this.origin = origin;
        this.board = board;
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
            this.ships[0].Hit();
            this.board.scene.add.sprite(this.origin.x + 4, this.origin.y + 4, 'shipHit').setOrigin(0,0);
            this.board.hitShip = true;
            this.board.hits += 1;
        }
        else
        {
            this.board.scene.add.sprite(this.origin.x + 4, this.origin.y + 4, 'guessPin').setOrigin(0,0);
            this.board.hitShip = false;
            this.board.justHit = true;
        }
        if(notBorder)
        {
            this.board.guesses += 1
        }
        this.shown = true;
        this.visualCell.disableInteractive();
    }

    destroy()
    {
        this.visualCell.destroy();
    }
}

