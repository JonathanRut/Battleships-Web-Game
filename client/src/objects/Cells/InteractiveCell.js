import Cell from "./Cells";

export default class InteractiveCell extends Cell
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