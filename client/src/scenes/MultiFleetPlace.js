import FleetPlace from "./FleetPlace";
import Multiplayer from '../objects/Players/Multiplayer'
import io from "socket.io-client";
import MultiplayerCell from '../objects/Cells/MultiplayerCell';
import Player from "../objects/Players/Players";
import Board from '../objects/Boards/Boards'
import MovingShips from '../objects/Ships/MovingShips'
import PlacementCell from '../objects/Cells/PlacementCell'

export default class MultiFleetPlace extends FleetPlace
{
    constructor()
    {
        super('MultiFleetPlace')
    }

    create()
    {
        super.create()
    }

    onStart()
    {
        const scene = this.scene

        this.scene.add.text(this.container.x, this.container.y + 60, "Searching for a Player", {fontFamily:'Arial' ,fontSize:'18px', fill:'#000000'}).setOrigin(0.5,0.5);
        this.scene.scene.pause();
        this.socket = io("http://localhost:5000");
        this.socket.emit("Searching", document.cookie.split('=')[1]);
        this.socket.on("connect", function()
        {
            console.log("Connected");
        });

        this.socket.on('Opponent', (Opponent, justHit)=>
        {
            console.log("Your opponent is " + Opponent.id);
            scene.scene.stop('FleetPlace');
            const opponentName = Opponent.name
            scene.board.ships.forEach(ship => 
            {
                this.socket.emit('Ship', {length:ship.length, origin:ship.origin, rotation:ship.rotation, name:ship.name}, Opponent.id);
            })
            
            const OpponentBoard = new Board({x:116,y:56},{width:scene.board.width,height:scene.board.height},PlacementCell,scene)

            this.socket.on('Ship', (shipProperties) => 
            {
                let ship = new MovingShips(shipProperties.length,shipProperties.origin,{rotation:shipProperties.rotation, name:shipProperties.name, random:false, fixedLength:true}, OpponentBoard);
                OpponentBoard.ships.push(ship);
                if(OpponentBoard.ships.length === scene.board.ships.length)
                {
                    scene.scene.start('MultiplayerGame', {playerBoard:scene.board, opponentBoard: OpponentBoard, player1:Player, player2:Multiplayer, socket:this.socket, OpponentID:Opponent.id, justHit:justHit, p2Cell:MultiplayerCell, sceneKey: 'MultiFleetPlace', opponentName:opponentName});
                }
            })
        });
    }
}