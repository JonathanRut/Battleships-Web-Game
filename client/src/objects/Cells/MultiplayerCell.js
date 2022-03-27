import Cell from '../Cells/Cells'

export default class MultiplayerCell extends Cell
{
    constructor(origin,board)
    {
        super(origin,board);

        // pointer over and pointer out listeners work the same as interactive cell
        this.visualCell.setInteractive();
        this.visualCell.on('pointerover',function(){
            this.setFillStyle(0xd0d0d0);
        });

        this.visualCell.on('pointerout',function()
        {
            this.setFillStyle(0xffffff);
        });
        
        // pointer down listener is different from interactive cell
        this.visualCell.on('pointerdown',function()
        {
            // When the cell is clicked on the server is sent to position of the cell which get forwarded to the opponent
            const OpponentID = this.OpponentID
            self = this;
            this.socket.emit('Guess',{x:(self.origin.x - self.board.origin.x)/30, y:(self.origin.y - self.board.origin.y)/30},OpponentID)
            // The cell is then shown on the board
            this.showCell();
        },this);
    }
}