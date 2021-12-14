class MovingShips extends Ship
{
    shipParts = []   
    rotation = "ver"

    constructor(length, origin, properties, board)
    {
        // The ships scene rotation and name properties are initialised
        super(length, origin, properties, board);

        // If the ship is being placed randomly then random coordinates are found
        if(properties.random)
        {
            let randomY
            let randomX
            do
            {
                randomX = Math.floor(this.board.width * Math.random());
                randomY = Math.floor(this.board.height * Math.random());
                origin.x = this.board.origin.x + 4 + 30 * randomX;
                origin.y = this.board.origin.y + 4 + 30 * randomY;
                this.rotation = (Math.floor(Math.random() * 10) % 2) === 0 ? "ver":"hor";
            }while(this.board.grid[randomY][randomX].borders.length > 0 || this.board.grid[randomY][randomX].ships.length > 0)
        }

        // The top of the ship and the plus and minus buttons are created
        const top = this.NewPart(origin,2);
        const plusButton = board.scene.add.sprite(origin.x - 10, origin.y,'plus').setOrigin(0,0);
        const minusButton = board.scene.add.sprite(origin.x - 10, origin.y + 10,'minus').setOrigin(0,0);
        
        // If the ship is a fixed length the plus and minus buttons are hidden
        if (properties.fixedLength)
        {
            plusButton.setVisible(false);
            minusButton.setVisible(false);
        }
        // If the ships length can be changed the plus and minus buttons are set to interactive and given there functions
        else
        {
            plusButton.setInteractive();
            minusButton.setInteractive();
    
            plusButton.on('pointerup',()=>{this.AddLength()},this);
            minusButton.on('pointerup',()=>{this.RemoveLength()},this);
        }

        // The plus and minus button and top are pushed onto the shipParts stack
        this.shipParts.push(plusButton,minusButton,top);
        while(this.shipParts.length < length + 2)
        {
            this.board.ships.forEach(ship => {
                ship.UpdateShipCells(false);
            }); 
            this.UpdateShipCells(false);
            if(!this.AddLength() || this.board.grid[(top.y - 4 - this.board.origin.y)/30][(top.x - 4 - this.board.origin.x)/30].borders.length > 0 || this.board.grid[(top.y - 4 - this.board.origin.y)/30][(top.x - 4 - this.board.origin.x)/30].ships.length > 1)
            {
                this.UpdateShipCells(true);
                top.x = this.board.origin.x + 4 + 30 * Math.floor(10 * Math.random());
                top.y = this.board.origin.y + 4 + 30 * Math.floor(10 * Math.random());
                plusButton.x = top.x - 10;
                plusButton.y = top.y;
                minusButton.x = top.x - 10;
                minusButton.y = top.y + 10;                    
                
                this.rotation = (Math.floor(Math.random() * 10) % 2) === 0 ? "ver":"hor";
                while(this.shipParts.length > 3)
                {
                    this.RemoveLength();
                } 
            }
        }
        this.UpdateShipCells(false);
    }

    NewPart(origin, index)
    {
        // A new part of the ship is created at set coordinates
        const part = this.board.scene.add.sprite(origin.x,origin.y,'shipPart').setOrigin(0,0);
        // The part is made interactive and draggable
        part.setInteractive();
        this.board.scene.input.setDraggable(part,true);
        // A reference for the ship and its index are added as properties to the part
        // These are required for dragging the ship
        part.ship = this;
        part.index = index;

        // If the part is clicked on the ships Rotation procedure is run
        part.on('pointerup',()=>{this.Rotate()},this)

        // The part is finally returned
        return part;
    }

    AddLength()
    {
        // The index of the last ship is found and the new X and Y coords are calculated
        const lastship = this.shipParts.length - 1;
        const newX = this.shipParts[lastship].x + (this.rotation === "ver" ? 0:30);
        const newY = this.shipParts[lastship].y + (this.rotation === "ver" ? 30:0);
        // This if statement checks to see if you are trying to add a ship outside the grid  
        if((newX - this.board.origin.x - 4)/30 > this.board.width - 1 || (newY - this.board.origin.y - 4)/30 > this.board.height - 1 || (newY - this.board.origin.y - 4)/30 < 0 || (newX - this.board.origin.x - 4)/30 < 0)
        {
            return false;
        }
        // This if statement checks to see if you are trying to add length into another ships border
        if(this.board.grid[(newY - this.board.origin.y - 4)/30][(newX - this.board.origin.x - 4)/30].borders.length > 1)
        {
            return false;
        }
        // A new part of the ship is created and saved into the array with the other parts
        const newPart = this.NewPart({x:newX,y:newY},this.shipParts.length);
        this.shipParts.push(newPart);
        // The cells which the ship is on are updated
        this.UpdateShipCells(false);
        return true;
    }

    RemoveLength()
    {
        // This checks if you are trying to remove a ship of 1 cell
        if(this.shipParts.length > 3)
        {
            // This sets the current cells of the ship to empty
            this.UpdateShipCells(true);
            // The part you are removing is removed from the array and destroyed
            const deletedShip = this.shipParts.pop();
            deletedShip.destroy();
            // Every ship on the board is updated to count for overlaps
            this.board.ships.forEach(ship => {
                ship.UpdateShipCells(false);
            });
        }
    }

    Rotate()
    {
        // If the ship has just been dragged the ship doesn't rotate
        if(this.justDragged){
            this.justDragged = false;
        }
        else
        {
            // The starting length of the ship parts is saved
            const shipLength = this.shipParts.length;
            // The ship is reduced to 1 cell by removing all of it's parts
            while(this.shipParts.length > 3)
            {
                this.RemoveLength();
            }
            // The variable holding the rotation is switched
            this.rotation = this.rotation === "ver" ? "hor":"ver";
            // The length of the ship is added again in this for loop
            while(this.shipParts.length < shipLength)
            {
                // If it fails to add length the rotation is undone by calling Rotate and adding the failed length
               if(!this.AddLength())
               {
                    this.Rotate();
                    this.AddLength();
               }
            }
            // Finally every ship on the board is updated to avoid collisions
            this.board.ships.forEach(ship => {
                ship.UpdateShipCells(false);
            });
        }
    }

    Drag(dragCoords, index)
    {
        // The distance between the part being dragged and all the other parts is calcuated and store in an array
        let distances = [];
        for(let i = 0; i < this.shipParts.length; i++)
        {
            let xdistance = this.shipParts[i].x - this.shipParts[index].x;
            let ydistance = this.shipParts[i].y - this.shipParts[index].y;
            distances.push({x:xdistance,y:ydistance});
        }
        // The current cells which the ship is in get marked as empty
        this.UpdateShipCells(true);

        // The for loop here checks to see if the ship is trying to be dragged somewhere illegal
        for(let i = 2; i < this.shipParts.length; i++)
        {
            // The new position is calculated
            let newXGridPos = ((dragCoords.x + distances[i].x) - this.board.origin.x - 4)/30;
            let newYGridPos = ((dragCoords.y + distances[i].y) - this.board.origin.y - 4)/30;
            // This if statement checks to see if the ship is being dragged out of the grid
            if(newXGridPos < 0 || newXGridPos > this.board.width - 1 || newYGridPos < 0 || newYGridPos > this.board.height - 1)
            {
                return;
            }
            // This if statement checks to see if you are trying to drag a ship onto another ship
            if(this.board.grid[newYGridPos][newXGridPos].borders.length > 0 || this.board.grid[newYGridPos][newXGridPos].ships.length > 0)
            {
                return;
            }
        }
        // Finally the ship is moved on the grid
        for(let i = 0; i < this.shipParts.length; i++)
        {
            this.shipParts[i].x = dragCoords.x + distances[i].x;
            this.shipParts[i].y = dragCoords.y + distances[i].y;
        }
    }

    UpdateShipCells(leaving)
    {
        // First the grid position of the top part is found and saved
        const originGridPosX = ((this.shipParts[2].x - this.board.origin.x - 4)/30);
        const originGridPosY = ((this.shipParts[2].y - this.board.origin.y - 4)/30);
        // This nested for loop places the border for the ship
        for(let i = -1; i < this.shipParts.length - 1; i++)
        {
            for(let j = -1; j < 2; j++)
            {
                // A try and catch statement is used to catch errors to trying to access a cell outside the grid
                let cell;
                try
                {
                    // The cell of the border is found
                    cell =  this.board.grid[originGridPosY + (this.rotation === "ver" ? i:j)][originGridPosX +  (this.rotation === "ver" ? j:i)];
                    // If you are trying to set the border to empty the ship is removed from the array containing the ships that border the cell
                    if (leaving)
                    {
                        const index = cell.borders.indexOf(this)
                        cell.borders.splice(index,1);
                    }
                    // If the the ship isn't in the array containing the ship that border the cell it is added
                    else if (cell.borders.indexOf(this) === -1)
                    {
                        cell.borders.push(this);
                    }
                    
                }
                catch{continue;}
                cell.showCell();
            }
        }
        // This for loop updates the cells containing the ship 
        for(let i = 0; i < this.shipParts.length - 2; i++)
        {
            // The try and catch tries to access the cells which the ship is in and catches if it fails
            let cell;
            try
            {
                // A cell that the ship is found and stored in a constant
                cell =  this.board.grid[originGridPosY + (this.rotation === "ver" ? i:0)][originGridPosX +  (this.rotation === "ver" ? 0:i)];
                // If the cell is trying to be set to empty the ship is removed from array containing the cells ships
                if (leaving)
                {
                    const index = cell.ships.indexOf(this)
                    cell.ships.splice(index,1);
                }
                // Otherwise the ship is added to the cell's ship array
                else if (cell.ships.indexOf(this) === -1)
                {
                    cell.ships.push(this);
                }
                // Finally the ship is removed from the cells border array as the cell contains a ship not a border
                const index = cell.borders.indexOf(this);
                cell.borders.splice(index,1); 
                            
            }
            catch{continue;}
            cell.showCell();  
        }
        // for(let i = 0; i < this.board.height; i++)
        // {
        //     let line = i + "|";
        //     for(let j = 0; j < this.board.width; j++)
        //     {
        //         if(this.board.grid[i][j].borders.length > 0)
        //         {
        //             //line += this.board.grid[i][j].borders.length   + "|";
        //             line +=  "X|"
        //             // line += " |"
        //         }
        //         else if(this.board.grid[i][j].ships.length > 0)
        //         {
        //             line += "O|"
        //         }
        //         else{line += " |"}
        //     }
        //     console.log(line)
        // }
        // console.log("end");
    }

    destroy()
    {
        this.UpdateShipCells(true);
        this.shipParts.forEach(part => part.destroy());
    }
}