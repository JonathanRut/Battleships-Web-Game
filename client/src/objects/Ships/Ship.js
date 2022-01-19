export default class Ship
{    
    constructor(length, origin, properties, board)
    {
        this.length = length;
        this.origin = origin;
        this.name = properties.name;
        this.board = board;
        this.rotation = properties.rotation;
    }
}

