
class Tester extends Phaser.Scene{
    constructor(){
        super({key:'Tester'})
    }

    preload(){
        this.load.image('battleship','sprites/Battleship.png');
    }

    create(){
        //plotting the grid
        const gridx = 86;
        const gridy = 56;
        for(let i = 0; i<10;i++){
            for(let j = 0; j < 10; j++){
                const rectangle = this.add.rectangle(gridx+i*30,gridy+j*30,30,30,0xffffff).setOrigin(0,0);
                rectangle.setStrokeStyle(2,0x000000);
                //creating the functionality of the squares
                rectangle.setInteractive();
                rectangle.on('pointerover',function(){
                    rectangle.setFillStyle(0xd0d0d0);
                });
                rectangle.on('pointerout',function()
                {
                    rectangle.setFillStyle(0xffffff);
                });
                rectangle.on('pointerdown',function()
                {
                    this.add.circle(rectangle.x+10,rectangle.y+10,10,0xff0000).setStrokeStyle(1,0x000000).setOrigin(0,0);
                },this);
            }
        }
        for(let i = 0; i<10; i++){
            this.add.text(gridx+1,i*30+gridy+15,String(i+1), {fontFamily:'Arial' ,fontSize:'12px', fill:'#000000'});
        }
        const letters = ['a','b','c','d','e','f','g','h','i','j']
        for(let i = 0; i<10; i++){
            this.add.text(i*30+gridx+22,gridy-1,letters[i], {fontFamily:'Arial' ,fontSize:'12px', fill:'#000000'});
        }


        //for(let i = 0; i < 4; i++){
        //    this.add.circle(400,270 - i * 30,10,0xff0000).setStrokeStyle(1,0x000000);
        //}
        
        const battleship = this.add.sprite(90,60,'battleship');
        battleship.setOrigin(0,0);
        battleship.setInteractive();
        this.input.setDraggable(battleship);
        this.input.on('drag',function(pointer,target,dragX,dragY){
            target.x = dragX - dragX % 30;
            target.y = dragY - dragY % 30;
        });
    }

    startDrag(pointer,target){
        target.off('pointerdown',this.startDrag,this);
        target.on('pointermove',this.doDrag(pointer,target),this);
        target.on('pointerup',this.stopDrag(target),this);
    }

    doDrag(pointer,dragX,dragY){
        this.x = dragX;
        this.y = dragY;
    }

    stopDrag(target){
        target.on('pointerdown',this.startDrag,this);
        target.off('pointermove',this.doDrag,this);
        target.off('pointerup',this.stopDrag,this);
    }
}