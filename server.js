const { transports } = require("engine.io");

const server = require("express")();
const http = require("http").createServer(server);
const io = require("socket.io")(http,{cors:
    {
        origin: "*",
        methods: ["GET", "POST"],
    }});


let players = []
io.on("connection", function(socket)
{

    console.log("A user connected: " + socket.id);
    players.push(socket.id);
    let OpponentID;

    if(players.length === 2)
    {
        OpponentID = players[players.length - 2 ];
        socket.emit('Opponent', players[players.length - 2 ], false);
        io.to(players[players.length - 2 ]).emit('Opponent', players[players.length - 1], true);
        players.splice(players.indexOf(socket.id),1);
        players.splice(players.indexOf(players[players.length - 2 ]))
    }

    socket.on("disconnect", function()
    {
        console.log("A user disconnectd: " + socket.id)
        players.splice(players.indexOf(socket.id),1);
        io.to(OpponentID).emit('Disconnect');
    });

    socket.on('Ship', (shipProperties, SocketID) => 
    {
        io.to(SocketID).emit('Ship', shipProperties);
        OpponentID = SocketID;
    })

    socket.on('Guess', (coords, SocketID)=>
    {
        io.to(SocketID).emit('Guess',coords)
    })
});



http.listen(5000, function()
{
    console.log("The server has started")
})