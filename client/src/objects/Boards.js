export default class Board
{
    
    constructor(origin, dimensions, cells, scene)
    {
        this.ships = []
        this.justHit = false;
        this.hitShip = false;
        this.width = dimensions.width;
        this.height = dimensions.height;
        this.origin = origin;
        this.scene = scene;
        this.grid = [];

        for(let i = 0; i<this.height;i++){
            // Making 2D array of the cells
            this.grid.push([]);
            for(let j = 0; j < this.width; j++){
                let cell = new cells({x:this.origin.x+j*30,y:this.origin.y+i*30},this);
                this.grid[i].push(cell);
            }
        }
        // Adding the letters and numbers to cells
        for(let i = 0; i<this.height; i++){
            this.scene.add.text(this.origin.x+1,i*30+this.origin.y+15,String(i+1), {fontFamily:'Arial' ,fontSize:'12px', fill:'#000000'});
        }
        const letters = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z'];
        for(let i = 0; i<this.width; i++){
            this.scene.add.text(i*30+this.origin.x+22,this.origin.y-1,letters[i], {fontFamily:'Arial' ,fontSize:'12px', fill:'#000000'});
        }    
    }
}
