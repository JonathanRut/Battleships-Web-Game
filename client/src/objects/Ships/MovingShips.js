import Ship from "./Ship";

export default class MovingShips extends Ship
{
    constructor(length, origin, properties, board)
    {
        // The ships scene rotation and name properties are initialised
        super(length, origin, properties, board);
        this.shipParts = [];
        this.length = 1;

        properties.random = this.checkValidCell({x:(origin.x - 4 - this.board.origin.x)/30,y:(origin.y - 4 - this.board.origin.y)/30}) ? true:properties.random;

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
            }while(this.checkValidCell({x:randomX,y:randomY}))
        }

        // The top of the ship and the plus and minus buttons are created
        const top = this.NewPart(origin,3);
        const plusButton = board.scene.add.sprite(origin.x - 10, origin.y,'plus').setOrigin(0,0).setDepth(1);
        const minusButton = board.scene.add.sprite(origin.x - 10, origin.y + 10,'minus').setOrigin(0,0).setDepth(1);
        const deleteButton = board.scene.add.sprite(origin.x - 10, origin.y + 20, 'cross').setOrigin(0,0).setDepth(1);
        
        // If the ship is a fixed length the plus and minus buttons are hidden
        if (properties.fixedLength)
        {
            plusButton.setVisible(false);
            minusButton.setVisible(false);
            deleteButton.setVisible(false);
        }
        // If the ships length can be changed the plus and minus buttons are set to interactive and given there functions
        else
        {
            plusButton.setInteractive();
            minusButton.setInteractive();
            deleteButton.setInteractive();
    
            plusButton.on('pointerup',()=>{this.AddLength()},this);
            minusButton.on('pointerup',()=>{this.RemoveLength()},this);
            deleteButton.on('pointerup',()=>{this.destroy()},this)
        }

        let startTime = Date.now();
        let progress = 0;
        // The plus and minus button and top are pushed onto the shipParts stack
        this.shipParts.push(plusButton,minusButton,deleteButton,top);
        while(this.shipParts.length < length + 3)
        {
            this.board.ships.forEach(ship => {
                ship.UpdateShipCells(false);
            }); 
            this.UpdateShipCells(false);
            if(!this.AddLength())
            {
                this.UpdateShipCells(true);
                do
                {
                    top.x = this.board.origin.x + 4 + 30 * Math.floor(this.board.width * Math.random());
                    top.y = this.board.origin.y + 4 + 30 * Math.floor(this.board.height * Math.random());
                    origin.x = top.x;
                    origin.y = top.y;
                }while(this.checkValidCell({x:(top.x - 4 - this.board.origin.x)/30, y:(top.y - 4 - this.board.origin.y)/30}))
               
                plusButton.x = top.x - 10;
                plusButton.y = top.y;
                minusButton.x = top.x - 10;
                minusButton.y = top.y + 10;   
                deleteButton.x = top.x - 10;
                deleteButton.y = top.y + 20;                    
                
                this.rotation = (Math.floor(Math.random() * 10) % 2) === 0 ? "ver":"hor";
                while(this.shipParts.length > 4)
                {
                    this.RemoveLength();
                } 
                progress = Date.now() - startTime;
                if(progress > 500)
                {
                    length = length > 1 ? length - 1:1;
                    progress = 0;
                }
            }
        }
        this.UpdateShipCells(false);
    }

    NewPart(origin, index)
    {
        // A new part of the ship is created at set coordinates
        const part = this.board.scene.add.sprite(origin.x,origin.y,'shipPart').setOrigin(0,0).setDepth(1);
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
        this.length += 1;
        return true;
    }

    RemoveLength()
    {
        // This checks if you are trying to remove a ship of 1 cell
        if(this.shipParts.length > 4)
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
            this.length -= 1;
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
            while(this.shipParts.length > 4)
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
        for(let i = 3; i < this.shipParts.length; i++)
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
        this.origin.x = this.shipParts[3].x;
        this.origin.y = this.shipParts[3].y;
    }

    UpdateShipCells(leaving)
    {
        // First the grid position of the top part is found and saved
        const originGridPosX = ((this.shipParts[3].x - this.board.origin.x - 4)/30);
        const originGridPosY = ((this.shipParts[3].y - this.board.origin.y - 4)/30);
        // This nested for loop places the border for the ship
        for(let i = -1; i < this.shipParts.length - 2; i++)
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
        for(let i = 0; i < this.shipParts.length - 3; i++)
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
        const index = this.board.ships.indexOf(this);
        this.board.ships.splice(index,1);
    }

    checkValidCell(coords)
    {
        try
        {
            const cell = this.board.grid[coords.y][coords.x];
            return cell.borders.length > 0 || cell.ships.length > 0
        }
        catch
        {
            return true;
        }
    }
}