import Cell from "./Cells";

export default class InteractiveCell extends Cell
{
    constructor(origin,board)
    {
        super(origin,board);
        // The cell is made interactive
        this.visualCell.setInteractive();

        // When you hover over the cell it turns grey
        this.visualCell.on('pointerover',function(){
            this.setFillStyle(0xd0d0d0);
        });

        this.visualCell.on('pointerout',function()
        {
            this.setFillStyle(0xffffff);
        });
        
        // When the cell is clicked on the cell is shown
        this.visualCell.on('pointerdown',function()
        {
            this.showCell();
        },this);
    }
}