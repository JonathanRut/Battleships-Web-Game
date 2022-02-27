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
        this.cells = cells;
        this.columnsText = [];
        this.rowsText = [];
        this.hits = 0;
        this.guesses = 0;
        this.sinks = 0;

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
            let rowText = this.scene.add.text(this.origin.x+1,i*30+this.origin.y+15,String(i+1), {fontFamily:'Arial' ,fontSize:'12px', fill:'#000000'});
            this.rowsText.push(rowText);
        }
        this.letters = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z'];
        for(let i = 0; i<this.width; i++){
            let columnText = this.scene.add.text(i*30+this.origin.x+22,this.origin.y-1,this.letters[i], {fontFamily:'Arial' ,fontSize:'12px', fill:'#000000'});
            this.columnsText.push(columnText);

        }    
    }

    AddColumn()
    {
        for(let i = 0; i < this.height; i++)
        {
            this.grid[i].push(new this.cells({x:this.origin.x + 30 * this.width ,y:this.origin.y + 30 * i},this))
        }
        this.ships.forEach(ship => 
            {
                ship.UpdateShipCells(false);
            });
        this.width += 1;
        const columnText = this.scene.add.text((this.width-1)*30+this.origin.x+22,this.origin.y-1,this.letters[this.width - 1], {fontFamily:'Arial' ,fontSize:'12px', fill:'#000000'});
        this.columnsText.push(columnText)
    }
    
    AddRow()
    {
        this.grid.push([]);
        for(let i = 0; i < this.width; i++)
        {
            this.grid[this.height].push(new this.cells({x:this.origin.x + 30 * i ,y:this.origin.y + 30 * this.height},this));
        }
        this.ships.forEach(ship => 
            {
                ship.UpdateShipCells(false);
            });
        this.height += 1;
        const rowText = this.scene.add.text(this.origin.x+1,(this.height - 1)*30+this.origin.y+15,String(this.height), {fontFamily:'Arial' ,fontSize:'12px', fill:'#000000'});
        this.rowsText.push(rowText);
    }

    DeleteColumn()
    {
        if(this.CheckColumn())
        {
            return false
        }
        for(let i = 0; i < this.height; i++)
        {
            this.grid[i][this.width - 1].destroy();
            this.grid[i].pop();
        }
        this.columnsText[this.columnsText.length - 1].destroy();
        this.columnsText.pop();
        this.width -= 1;
        return true;
    }

    DeleteRow()
    {
        if(this.CheckRow())
        {
            return false
        }
        for(let i = 0; i < this.width; i++)
        {
            this.grid[this.height - 1][i].destroy();
        }
        this.grid.pop();
        this.rowsText[this.rowsText.length - 1].destroy();
        this.rowsText.pop();
        this.height -= 1
        return true;
    }

    CheckColumn()
    {
        let blocked = false;
        if(this.width === 1)
        {
            return true;
        }
        for(let i = 0; i < this.height; i++)
        {
            if(this.grid[i][this.width - 1].ships.length > 0)
            {
                blocked = true;
            }
        }
        return blocked;
    }

    CheckRow()
    {
        if(this.height === 1)
        {
            return true;
        }
        let blocked = false;
        for(let i = 0; i < this.width; i++)
        {
            if(this.grid[this.height - 1][i].ships.length > 0)
            {
                blocked = true;
            }
        }
        return blocked;
    }
}
