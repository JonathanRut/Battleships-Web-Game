import Cell from '../Cells/Cells'

export default class MultiplayerCell extends Cell
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
            const OpponentID = this.OpponentID
            self = this;
            this.socket.emit('Guess',{x:(self.origin.x - self.board.origin.x)/30, y:(self.origin.y - self.board.origin.y)/30},OpponentID)
            this.showCell();
        },this);
    }
}