class MovingShips
{
    shipParts = []   
    rotation = "ver"

    constructor(length, origin, scene)
    {
        this.scene = scene;
        let top = this.NewPart({x:90,y:60},2);
        const plusButton = scene.add.sprite(80,60,'plus').setOrigin(0,0);
        const minusButton = scene.add.sprite(80,70,'minus').setOrigin(0,0);
        
        plusButton.setInteractive();
        minusButton.setInteractive();

        plusButton.on('pointerup',()=>{this.AddLength()},this);
        minusButton.on('pointerup',()=>{this.RemoveLength()},this);
        
        this.shipParts.push(plusButton,minusButton,top);
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
        if(this.shipParts.length === 12)
        {
            return;
        }
        const lastship = this.shipParts.length - 1;
        const newX = this.shipParts[lastship].x + (this.rotation === "ver" ? 0:30);
        const newY = this.shipParts[lastship].y + (this.rotation === "ver" ? 30:0);
        const newPart = this.NewPart({x:newX,y:newY},this.shipParts.length);
        this.shipParts.push(newPart);
        this.UpdateGridShade(0xa0a0a0,0xd0d0d0,this.shipParts.length - 1);
    }

    RemoveLength()
    {
        if(this.shipParts.length > 3)
        {
            this.UpdateGridShade(0xffffff,0xffffff,this.shipParts.length - 1);
            const deletedShip = this.shipParts.pop();
            for(let i = 2; i < this.shipParts.length; i++)
            {
                this.UpdateGridShade(0xa0a0a0,0xd0d0d0,i);
            }
            deletedShip.destroy();
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
            this.rotation = this.rotation === "ver" ? "hor":"ver"

            for(let i = 0; i < shipLength; i++)
            {
                this.AddLength();
            }
        }
    }

    Drag(dragCoords, index)
    {
        let distances = [];
        for(let i = 0; i < this.shipParts.length; i++)
        {
            let xdistance = this.shipParts[i].x - this.shipParts[index].x;
            let ydistance = this.shipParts[i].y - this.shipParts[index].y;
            distances.push({x:xdistance,y:ydistance});
            i > 1 ? this.UpdateGridShade(0xffffff,0xffffff,i) : null;
        }
        for(let i = 0; i < this.shipParts.length; i++)
        {
            this.shipParts[i].x = dragCoords.x + distances[i].x;
            this.shipParts[i].y = dragCoords.y + distances[i].y;
            i > 1 ? this.UpdateGridShade(0xa0a0a0,0xd0d0d0,i) : null;
        }
    }

    UpdateGridShade(shipColour,borderColour,index)
    {
        const gridx = ((this.shipParts[index].x - this.scene.gridx - 4)/30)
        const gridy = ((this.shipParts[index].y - this.scene.gridy - 4)/30)
        if(index === 2)
        {
            for(let i = -1; i < 2; i++)
            {
                for(let j = -1; j < 2; j++)
                {
                    try
                    {
                        const rectangle =  this.scene.grid[gridy + i][gridx + j]
                        rectangle.setFillStyle(borderColour);
                        rectangle.status = 'border';
                    }
                    catch{continue;}
                }
            }
        }
        else if(index === this.shipParts.length-1)
        {
            for(let i = 0; i < 2; i++)
            {
                for(let j = 0; j < 3; j++)
                {
                    try
                    {
                        const rectangle =  this.scene.grid[gridy + (this.rotation === "ver" ? i  : j - 1)][gridx + (this.rotation === "ver" ?  j - 1 : i)]
                        rectangle.setFillStyle(borderColour);
                        rectangle.status = 'border';
                    }
                    catch{continue;}
                }
            }
        }
        else
        {
            for(let i = 0; i < 3; i++)
            {
                try
                {
                    const rectangle =  this.scene.grid[gridy + (this.rotation === "ver" ?  null : i - 1)][gridx + (this.rotation === "ver" ?  i - 1 : null)]
                    rectangle.setFillStyle(borderColour);
                    rectangle.status = 'border';
                }
                catch{continue;}
            }
        }
        try
        {
            const rectangle =  this.scene.grid[gridy][gridx]
            rectangle.setFillStyle(shipColour);
            rectangle.status = 'ship';
        }
        catch{}
    }
}