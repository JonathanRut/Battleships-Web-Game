
class Tester extends Phaser.Scene{
    constructor(){
        super({key:'Tester'})
    }

    create(){
        //plotting the grid
        const gridx = 90;
        const gridy = 60;
        for(let i = 0; i<10;i++){
            for(let j = 0; j < 10; j++){
                const rectangle = this.add.rectangle(gridx+i*30,gridy+j*30,30,30,0xffffff);
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
                    this.add.circle(rectangle.x,rectangle.y,10,0xff0000).setStrokeStyle(1,0x000000);
                },this);
            }
        }
        for(let i = 0; i<10; i++){
            this.add.text(gridx-40/3,i*30+gridy,String(i+1), {fontFamily:'Arial' ,fontSize:'12px', fill:'#000000'});
        }
        const letters = ['a','b','c','d','e','f','g','h','i','j']
        for(let i = 0; i<10; i++){
            this.add.text(i*30+gridx+5,gridy-16,letters[i], {fontFamily:'Arial' ,fontSize:'12px', fill:'#000000'});
        }

        const battleship = this.add.circle(400,300,10,0xff0000).setStrokeStyle(1,0x000000);
        battleship.setInteractive();
        battleship.on('drag',function(pointer, dragX, dragY) {
          this.x = dragX;
          this.y = dragY;
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