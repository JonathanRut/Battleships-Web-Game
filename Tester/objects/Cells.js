class Cell
{
    shown = false;

    constructor(origin,board)
    {
        this.origin = origin;
        this.board = board;
        const rectangle = this.board.scene.add.rectangle(origin.x,origin.y,30,30,0xffffff).setOrigin(0,0);
        rectangle.setStrokeStyle(2,0x000000);
        this.borders = [];
        this.ships = [];
        this.visualCell = rectangle;        
    }

    showCell()
    {
        if(this.ships.length > 0)
        {
            this.ships[0].Hit();
            this.board.scene.add.sprite(this.origin.x + 4, this.origin.y + 4, 'shipHit').setOrigin(0,0);
            this.board.hitShip = true;
        }
        else
        {
            this.board.scene.add.sprite(this.origin.x + 4, this.origin.y + 4, 'guessPin').setOrigin(0,0);
            this.board.hitShip = false;
            this.board.justHit = true;
        }
        this.shown = true;
        this.visualCell.disableInteractive();
    }
}

class PlacementCell extends Cell
{
    constructor(origin,board)
    {
        super(origin,board);
    }
    
    showCell()
    {
        if(this.ships.length > 0)
        {
            this.visualCell.setFillStyle(0xa0a0a0);
        }
        else if(this.borders.length > 0)
        {
            this.visualCell.setFillStyle(0xd0d0d0);
        }
        else
        {
            this.visualCell.setFillStyle(0xffffff);
        }
    }
}

class InteractiveCell extends Cell
{
    constructor(origin,board)
    {
        super(origin,board);
        this.visualCell.setInteractive();
        this.visualCell.on('pointerover',function(){
            this.setFillStyle(0xd0d0d0);
        });

        this.visualCell.on('pointerout',function()
        {
            this.setFillStyle(0xffffff);
        });
        

        this.visualCell.on('pointerdown',function()
        {
            this.showCell();
        },this);
    }
}