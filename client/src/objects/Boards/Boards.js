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
        const letters = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z'];
        for(let i = 0; i<this.width; i++){
            let columnText = this.scene.add.text(i*30+this.origin.x+22,this.origin.y-1,letters[i], {fontFamily:'Arial' ,fontSize:'12px', fill:'#000000'});
            this.columnsText.push(columnText);

        }    
    }

    AddColumn()
    {
        for(let i = 0; i < this.height; i++)
        {
            // New cells are added to the board at the end of rows
            this.grid[i].push(new this.cells({x:this.origin.x + 30 * this.width ,y:this.origin.y + 30 * i},this))
        }
        // Every ship on the board is update for the new cells
        this.ships.forEach(ship => 
            {
                ship.UpdateShipCells(false);
            });
        const letters = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z'];
        // The width is incremented by 1 and a letter for the column is added
        this.width += 1;
        const columnText = this.scene.add.text((this.width-1)*30+this.origin.x+22,this.origin.y-1,letters[this.width - 1], {fontFamily:'Arial' ,fontSize:'12px', fill:'#000000'});
        this.columnsText.push(columnText)
    }
    
    AddRow()
    {
        this.grid.push([]);
        for(let i = 0; i < this.width; i++)
        {
            // A row of cells is added to the bottom of the board
            this.grid[this.height].push(new this.cells({x:this.origin.x + 30 * i ,y:this.origin.y + 30 * this.height},this));
        }
        // Every ship on the board is updated for the new cells
        this.ships.forEach(ship => 
            {
                ship.UpdateShipCells(false);
            });
        // Height is incremented by 1 and a number for the row is added
        this.height += 1;
        const rowText = this.scene.add.text(this.origin.x+1,(this.height - 1)*30+this.origin.y+15,String(this.height), {fontFamily:'Arial' ,fontSize:'12px', fill:'#000000'});
        this.rowsText.push(rowText);
    }

    DeleteColumn()
    {
        // A check is made to if a column can be deleted
        if(this.CheckColumn())
        {
            return false
        }
        // If it can every cell in the last column is destroyed
        for(let i = 0; i < this.height; i++)
        {
            this.grid[i][this.width - 1].destroy();
            this.grid[i].pop();
        }
        // The text marking the last column is removed and width is decremented by 1
        this.columnsText[this.columnsText.length - 1].destroy();
        this.columnsText.pop();
        this.width -= 1;
        return true;
    }

    DeleteRow()
    {
        // A check is made to if the row can be deleted
        if(this.CheckRow())
        {
            return false
        }
        // If it can every cell in the last row is deleted
        for(let i = 0; i < this.width; i++)
        {
            this.grid[this.height - 1][i].destroy();
        }
        this.grid.pop();
        // The text marking the last row is removed and height is decremented by 1
        this.rowsText[this.rowsText.length - 1].destroy();
        this.rowsText.pop();
        this.height -= 1
        return true;
    }

    CheckColumn()
    {
        let blocked = false;
        // If there is only 1 column true is returned signalling that the column cannot be deleted
        if(this.width === 1)
        {
            return true;
        }
        for(let i = 0; i < this.height; i++)
        {
            // Every row in the column to be deleted is checked for if it contains a ship
            if(this.grid[i][this.width - 1].ships.length > 0)
            {
                // If it contains a ship the column cannot be deleted this is marked by turning blocked to true
                blocked = true;
            }
        }
        return blocked;
    }

    CheckRow()
    {
        // If there is only 1 row the row cannot be deleted
        if(this.height === 1)
        {
            return true;
        }
        let blocked = false;
        for(let i = 0; i < this.width; i++)
        {
            // Every row in the row to be deleted is checked for a ship
            if(this.grid[this.height - 1][i].ships.length > 0)
            {
                // If it contains a ship it cannot be deleted this is marked by turning blocked to true
                blocked = true;
            }
        }
        return blocked;
    }
}
