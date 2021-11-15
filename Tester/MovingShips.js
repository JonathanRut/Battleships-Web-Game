class MovingShips
{
    shipParts = []   
    rotation = "ver"

    constructor(length, origin, rotation, scene)
    {
        this.scene = scene;
        this.rotation = rotation;

        let top = this.NewPart(origin,2);
        const plusButton = scene.add.sprite(origin.x - 10, origin.y,'plus').setOrigin(0,0);
        const minusButton = scene.add.sprite(origin.x - 10, origin.y + 10,'minus').setOrigin(0,0);
        
        plusButton.setInteractive();
        minusButton.setInteractive();

        plusButton.on('pointerup',()=>{this.AddLength()},this);
        minusButton.on('pointerup',()=>{this.RemoveLength()},this);
        
        this.shipParts.push(plusButton,minusButton,top);

        this.UpdateShipCells(0xa0a0a0,0xd0d0d0);
        while(this.shipParts.length < length + 2)
        {
            this.AddLength();
        }
    }

    NewPart(origin, index)
    {
        const part = this.scene.add.sprite(origin.x,origin.y,'shipPart').setOrigin(0,0);

        part.setInteractive();
        this.scene.input.setDraggable(part,true);

        part.ship = this;
        part.index = index;

        part.on('pointerup',()=>{this.Rotate()},this)

        return part;
    }

    AddLength()
    {
        const lastship = this.shipParts.length - 1;
        const newX = this.shipParts[lastship].x + (this.rotation === "ver" ? 0:30);
        const newY = this.shipParts[lastship].y + (this.rotation === "ver" ? 30:0);
        if(this.shipParts.length === 12 || (newX - this.scene.gridx - 4)/30 > 9 || (newY - this.scene.gridy - 4)/30 > 9)
        {
            return false;
        }
        if(this.scene.grid[(newY - this.scene.gridy - 4)/30][(newX - this.scene.gridx - 4)/30].borders.length > 1)
        {
            return false;
        }
        const newPart = this.NewPart({x:newX,y:newY},this.shipParts.length);
        this.shipParts.push(newPart);
        this.UpdateShipCells(0xa0a0a0,0xd0d0d0);
        return true;
    }

    RemoveLength()
    {
        if(this.shipParts.length > 3)
        {
            this.UpdateShipCells(0xffffff,0xffffff);;
            const deletedShip = this.shipParts.pop();
            deletedShip.destroy();
            this.scene.ships.forEach(ship => {
                ship.UpdateShipCells(0xa0a0a0,0xd0d0d0);
            });
        }
    }

    Rotate()
    {
        if(this.justDragged){
            this.justDragged = false;
        }
        else
        {
            const shipLength = this.shipParts.length - 3;
            while(this.shipParts.length > 3)
            {
                this.RemoveLength();
            }
            this.rotation = this.rotation === "ver" ? "hor":"ver";

            for(let i = 0; i < shipLength; i++)
            {
               if(!this.AddLength())
               {
                    this.Rotate();
                    this.AddLength();
               }
            }
            this.scene.ships.forEach(ship => {
                ship.UpdateShipCells(0xa0a0a0,0xd0d0d0);
            });
        }
    }

    Drag(dragCoords, index)
    {
        let distances = [];
        const temp = this.shipParts;
        for(let i = 0; i < this.shipParts.length; i++)
        {
            let xdistance = this.shipParts[i].x - this.shipParts[index].x;
            let ydistance = this.shipParts[i].y - this.shipParts[index].y;
            distances.push({x:xdistance,y:ydistance});
        }
        this.UpdateShipCells(0xffffff,0xffffff);

        for(let i = 2; i < this.shipParts.length; i++)
        {
            let newXGridPos = ((dragCoords.x + distances[i].x) - this.scene.gridx - 4)/30;
            let newYGridPos = ((dragCoords.y + distances[i].y) - this.scene.gridy - 4)/30;
            if(newXGridPos < 0 || newXGridPos > 9 || newYGridPos < 0 || newYGridPos > 9)
            {
                return;
            }
            try
            {
                if(this.scene.grid[newYGridPos][newXGridPos].borders.length > 0 || this.scene.grid[newYGridPos][newXGridPos].ships.length > 0)
                {
                    return;
                }
            }catch{continue;}
            
        }

        for(let i = 0; i < this.shipParts.length; i++)
        {
            this.shipParts[i].x = dragCoords.x + distances[i].x;
            this.shipParts[i].y = dragCoords.y + distances[i].y;
        }
    }

    UpdateShipCells(shipColour,borderColour)
    {
        const originGridPosX = ((this.shipParts[2].x - this.scene.gridx - 4)/30);
        const originGridPosY = ((this.shipParts[2].y - this.scene.gridy - 4)/30);
        for(let i = -1; i < this.shipParts.length - 1; i++)
        {
            for(let j = -1; j < 2; j++)
            {
                try
                {
                    const rectangle =  this.scene.grid[originGridPosY + (this.rotation === "ver" ? i:j)][originGridPosX +  (this.rotation === "ver" ? j:i)];
                    rectangle.setFillStyle(borderColour);
                    if (borderColour === 0xffffff)
                    {
                        const index = rectangle.borders.indexOf(this)
                        rectangle.borders.splice(index,1);
                    }
                    else if (rectangle.borders.indexOf(this) === -1)
                    {
                        rectangle.borders.push(this);
                    }
                }
                catch{continue;}
            }
        }
        for(let i = 0; i < this.shipParts.length - 2; i++)
        {
            try
            {
                const rectangle =  this.scene.grid[originGridPosY + (this.rotation === "ver" ? i:0)][originGridPosX +  (this.rotation === "ver" ? 0:i)];
                rectangle.setFillStyle(shipColour);
                if (shipColour === 0xffffff)
                {
                    const index = rectangle.ships.indexOf(this)
                    rectangle.ships.splice(index,1);
                }
                else if (rectangle.ships.indexOf(this) === -1)
                {
                    rectangle.ships.push(this);
                }
                const index = rectangle.borders.indexOf(this);
                rectangle.borders.splice(index,1);                
            }
            catch{continue;}
        }
        for(let i = 0; i < 10; i++)
        {
            let line = i + "|";
            for(let j = 0; j < 10; j++)
            {
                if(this.scene.grid[i][j].borders.length > 0)
                {
                    line += "X|"
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
}