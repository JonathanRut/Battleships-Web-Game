class MovingShips
{
    shipParts = []   
    rotation = "ver"

    constructor(length, origin, properties, scene)
    {
        // The ships scene rotation and name properties are initialised
        this.scene = scene;
        this.rotation = properties.rotation;
        this.name = properties.name;

        // If the ship is being placed randomly then random coordinates are found
        if(properties.random)
        {
            let randomY
            let randomX
            do
            {
                randomX = Math.floor(10 * Math.random());
                randomY = Math.floor(10 * Math.random());
                origin.x = this.scene.gridx + 4 + 30 * randomX;
                origin.y = this.scene.gridy + 4 + 30 * randomY;
                this.rotation = (Math.floor(Math.random() * 10) % 2) === 0 ? "ver":"hor";
            }while(this.scene.grid[randomY][randomX].borders.length > 0 || this.scene.grid[randomY][randomX].ships.length > 0)
        }

        // The top of the ship and the plus and minus buttons are created
        const top = this.NewPart(origin,2);
        const plusButton = scene.add.sprite(origin.x - 10, origin.y,'plus').setOrigin(0,0);
        const minusButton = scene.add.sprite(origin.x - 10, origin.y + 10,'minus').setOrigin(0,0);
        
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
            this.scene.ships.forEach(ship => {
                ship.UpdateShipCells(0xa0a0a0,0xd0d0d0);
            }); 
            this.UpdateShipCells(0xa0a0a0,0xd0d0d0);
            if(!this.AddLength() || this.scene.grid[(top.y - 4 - this.scene.gridy)/30][(top.x - 4 - this.scene.gridx)/30].borders.length > 0 || this.scene.grid[(top.y - 4 - this.scene.gridy)/30][(top.x - 4 - this.scene.gridx)/30].ships.length > 1)
            {
                this.UpdateShipCells(0xffffff,0xffffff);
                top.x = this.scene.gridx + 4 + 30 * Math.floor(10 * Math.random());
                top.y = this.scene.gridy + 4 + 30 * Math.floor(10 * Math.random());
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
        this.UpdateShipCells(0xa0a0a0,0xd0d0d0);
    }

    NewPart(origin, index)
    {
        // A new part of the ship is created at set coordinates
        const part = this.scene.add.sprite(origin.x,origin.y,'shipPart').setOrigin(0,0);
        // The part is made interactive and draggable
        part.setInteractive();
        this.scene.input.setDraggable(part,true);
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
        if((newX - this.scene.gridx - 4)/30 > this.scene.width - 1 || (newY - this.scene.gridy - 4)/30 > this.scene.height - 1)
        {
            return false;
        }
        // This if statement checks to see if you are trying to add length into another ships border
        if(this.scene.grid[(newY - this.scene.gridy - 4)/30][(newX - this.scene.gridx - 4)/30].borders.length > 1)
        {
            return false;
        }
        // A new part of the ship is created and saved into the array with the other parts
        const newPart = this.NewPart({x:newX,y:newY},this.shipParts.length);
        this.shipParts.push(newPart);
        // The cells which the ship is on are updated
        this.UpdateShipCells(0xa0a0a0,0xd0d0d0);
        return true;
    }

    RemoveLength()
    {
        // This checks if you are trying to remove a ship of 1 cell
        if(this.shipParts.length > 3)
        {
            // This sets the current cells of the ship to empty
            this.UpdateShipCells(0xffffff,0xffffff);
            // The part you are removing is removed from the array and destroyed
            const deletedShip = this.shipParts.pop();
            deletedShip.destroy();
            // Every ship on the board is updated to count for overlaps
            this.scene.ships.forEach(ship => {
                ship.UpdateShipCells(0xa0a0a0,0xd0d0d0);
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
            this.scene.ships.forEach(ship => {
                ship.UpdateShipCells(0xa0a0a0,0xd0d0d0);
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
        this.UpdateShipCells(0xffffff,0xffffff);

        // The for loop here checks to see if the ship is trying to be dragged somewhere illegal
        for(let i = 2; i < this.shipParts.length; i++)
        {
            // The new position is calculated
            let newXGridPos = ((dragCoords.x + distances[i].x) - this.scene.gridx - 4)/30;
            let newYGridPos = ((dragCoords.y + distances[i].y) - this.scene.gridy - 4)/30;
            // This if statement checks to see if the ship is being dragged out of the grid
            if(newXGridPos < 0 || newXGridPos > this.scene.width - 1 || newYGridPos < 0 || newYGridPos > this.scene.height - 1)
            {
                return;
            }
            // This if statement checks to see if you are trying to drag a ship onto another ship
            if(this.scene.grid[newYGridPos][newXGridPos].borders.length > 0 || this.scene.grid[newYGridPos][newXGridPos].ships.length > 0)
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

    UpdateShipCells(shipColour,borderColour)
    {
        // First the grid position of the top part is found and saved
        const originGridPosX = ((this.shipParts[2].x - this.scene.gridx - 4)/30);
        const originGridPosY = ((this.shipParts[2].y - this.scene.gridy - 4)/30);
        // This nested for loop places the border for the ship
        for(let i = -1; i < this.shipParts.length - 1; i++)
        {
            for(let j = -1; j < 2; j++)
            {
                // A try and catch statement is used to catch errors to trying to access a cell outside the grid
                try
                {
                    // The cell of the border is found and colour is set
                    const rectangle =  this.scene.grid[originGridPosY + (this.rotation === "ver" ? i:j)][originGridPosX +  (this.rotation === "ver" ? j:i)];
                    rectangle.setFillStyle(borderColour);
                    // If you are trying to set the border to empty the ship is removed from the array containing the ships that border the cell
                    if (borderColour === 0xffffff)
                    {
                        const index = rectangle.borders.indexOf(this)
                        rectangle.borders.splice(index,1);
                    }
                    // If the the ship isn't in the array containing the ship that border the cell it is added
                    else if (rectangle.borders.indexOf(this) === -1)
                    {
                        rectangle.borders.push(this);
                    }
                }
                catch{continue;}
            }
        }
        // This for loop updates the cells containing the ship 
        for(let i = 0; i < this.shipParts.length - 2; i++)
        {
            // The try and catch tries to access the cells which the ship is in and catches if it fails
            try
            {
                // A cell that the ship is found and stored in a constant
                const rectangle =  this.scene.grid[originGridPosY + (this.rotation === "ver" ? i:0)][originGridPosX +  (this.rotation === "ver" ? 0:i)];
                // The shade of the cell is updated
                rectangle.setFillStyle(shipColour);
                // If the cell is trying to be set to empty the ship is removed from array containing the cells ships
                if (shipColour === 0xffffff)
                {
                    const index = rectangle.ships.indexOf(this)
                    rectangle.ships.splice(index,1);
                }
                // Otherwise the ship is added to the cell's ship array
                else if (rectangle.ships.indexOf(this) === -1)
                {
                    rectangle.ships.push(this);
                }
                // Finally the ship is removed from the cells border array as the cell contains a ship not a border
                const index = rectangle.borders.indexOf(this);
                rectangle.borders.splice(index,1);                
            }
            catch{continue;}
        }
        for(let i = 0; i < this.scene.height; i++)
        {
            let line = i + "|";
            for(let j = 0; j < this.scene.width; j++)
            {
                if(this.scene.grid[i][j].borders.length > 0)
                {
                    line += this.scene.grid[i][j].borders.length + "|";
                }
                else if(this.scene.grid[i][j].ships.length > 0)
                {
                    line += "O|"
                }
                else{line += " |"}
            }
            console.log(line)
        }
        console.log("end");
    }

    destroy()
    {
        this.UpdateShipCells(0xffffff,0xffffff);
        this.shipParts.forEach(part => part.destroy());
    }
}