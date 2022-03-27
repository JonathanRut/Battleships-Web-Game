import Cell from "./Cells";

export default class PlacementCell extends Cell
{
    constructor(origin,board)
    {
        super(origin,board);
    }
    
    showCell()
    {
        // When the cell is shown the shade of the cell is changed instead of adding a sprite
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