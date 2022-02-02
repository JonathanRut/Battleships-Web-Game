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
    let OpponentID;
    let username;

    socket.on("Searching", function()
    {
        players.push(socket.id);
    
        if(players.length === 2)
        {
            OpponentID = players[players.length - 2 ];
            socket.emit('Opponent', players[players.length - 2 ], false);
            io.to(players[players.length - 2 ]).emit('Opponent', players[players.length - 1], true);
            players.splice(players.indexOf(socket.id),1);
            players.splice(players.indexOf(players[players.length - 2 ]))
        }
    });


    socket.on("disconnect", function()
    {
        console.log("A user disconnectd: " + socket.id)
        if(username)
        {
            io.emit('chat message', username.toUpperCase() + " LEFT")
        }
        if(OpponentID)
        {
            players.splice(players.indexOf(socket.id),1);
            io.to(OpponentID).emit('Disconnect');
        }
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

    socket.on('global message', function(message)
    {
        io.emit('chat message', username + ": " + message)
    })

    socket.on('username', function(newUsername)
    {
        username = newUsername;
        io.emit('chat message', username.toUpperCase() + " JOINED")
    })

    socket.on('left chat', function()
    {
        if(username)
        {
            io.emit('chat message', username.toUpperCase() + " LEFT")
        }
    })

    socket.on('game message', function(message)
    {
        io.to(OpponentID).emit('game message', "Player 2: " + message);
    })
});



http.listen(5000, function()
{
    console.log("The server has started")
})