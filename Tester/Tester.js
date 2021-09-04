
class Tester extends Phaser.Scene{
    constructor(){
        super({key:'Tester'})
    }

    preload(){
        this.load.image('battleship','sprites/Battleship.png');
    }

    create(){
        //plotting the grid
        const gridx = 116;
        const gridy = 56;
        let grid = [];
        for(let i = 0; i<10;i++){
            grid.push([]);
            for(let j = 0; j < 10; j++){
                const rectangle = this.add.rectangle(gridx+j*30,gridy+i*30,30,30,0xffffff).setOrigin(0,0);
                rectangle.setStrokeStyle(2,0x000000);
                //creating the functionality of the squares
                rectangle.setInteractive();
                //rectangle.on('pointerover',function(){
                //    rectangle.setFillStyle(0xd0d0d0);
                //});
                //rectangle.on('pointerout',function()
                //{
                //    rectangle.setFillStyle(0xffffff);
                //});
                grid[i].push(rectangle);
            }
        }


        for(let i = 0; i<10; i++){
            this.add.text(gridx+1,i*30+gridy+15,String(i+1), {fontFamily:'Arial' ,fontSize:'12px', fill:'#000000'});
        }
        const letters = ['a','b','c','d','e','f','g','h','i','j']
        for(let i = 0; i<10; i++){
            this.add.text(i*30+gridx+22,gridy-1,letters[i], {fontFamily:'Arial' ,fontSize:'12px', fill:'#000000'});
        }

        const battleship = this.add.sprite(90,60,'battleship');
        battleship.setOrigin(0,0);

        battleship.setInteractive();
        this.input.setDraggable(battleship);

        this.input.on('drag',function(pointer,target,dragX,dragY){
            if(target.x !== dragX - dragX % 30 || target.y !== dragY - dragY % 30){
                for(let i = 0; i < target.height/27-(target.height%27)/27; i++){
                    try{
                        grid[((target.y - gridy - 4)/30) + i][(target.x - gridx - 4)/30].setFillStyle(0xffffff);
                    }
                    catch{
                        continue;
                    }
                }
                target.x = dragX - dragX % 30;
                target.y = dragY - dragY % 30;
                for(let i = 0; i < target.height/27-(target.height%27)/27; i++){
                    try{
                        grid[((target.y - gridy - 4)/30) + i][(target.x - gridx - 4)/30].setFillStyle(0xd0d0d0);
                    }
                    catch{
                        continue;
                    }
                }
            }
        });
        
    }
}