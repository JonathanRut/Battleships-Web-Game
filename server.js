const mysql = require('mysql');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken')
const cookieParser = require('cookie-parser')
const server = require("express")();
const path = require('path');
const { dirname } = require('path');
const express = require('express');
const http = require("http").createServer(server);
const io = require("socket.io")(http,{cors:
    {
        origin: "*",
        methods: ["GET", "POST"],
    }});

dotenv.config({ path:'./.env'})

const db = mysql.createConnection({
    host:process.env.DATABASE_HOST,
    user:process.env.DATABASE_USER,
    password:process.env.DATABASE_PASSWORD,
    database:process.env.DATABASE
})

db.connect((error)=>
    {
        if(error)
        {
            console.log(error)
        }
        else
        {
            console.log("MYSQL connected")
        }
    })




let players = []
let playerNum = 0;
let totalNum = 0;
io.on("connection", function(socket)
{
    playerNum += 1;
    totalNum += 1;
    console.log("A user connected: " + socket.id);
    let OpponentID;
    let username;

    socket.on("Searching", function(token)
    {
        let gamename
        try
        {
            gamename = jwt.verify(token,process.env.MY_SECRET).username
        }
        catch
        {
            gamename = "Player 2"
        }
        username = gamename
        OpponentID = 'Searching'

        players.push({id:socket.id, name:username});
    
        if(players.length === 2)
        {
            OpponentID = players[players.length - 2 ].id;
            socket.emit('Opponent', players[players.length - 2 ], false);
            io.to(players[players.length - 2 ].id).emit('Opponent', players[players.length - 1], true);
            players.splice(players.indexOf(players[players.length - 1]),1);
            players.splice(players.indexOf(players[players.length - 2 ]))
        }
    });


    socket.on("disconnect", function()
    {
        playerNum -= 1;
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
        io.to(OpponentID).emit('game message', username + ": " + message);
    })


    socket.on('getName', function()
    {
        io.to(socket.id).emit('setName', username === "Player 2" ? "Player 1":username)
    })

    socket.on('game insert', function(values,SocketID)
    {
        db.query('INSERT INTO games SET ?', values, (error, results) => 
        {
            if(error)
            {
                console.log(error)
            }
            else
            {
                io.to([socket.id,SocketID]).emit('gameID', results.insertId)
            }
        })
    })

    socket.on('player update', function(token, values)
    {
        try
        {
            const username = jwt.verify(token,process.env.MY_SECRET).username
            db.query('SELECT PlayerID, GamesPlayed, GamesWon, TotalHits, TotalSinks, TotalGuesses FROM players WHERE username = ?', [username], (error,results)=>
            {
                if(error)
                {
                    console.log(error)
                }
                else
                {
                    const {PlayerID, GamesPlayed, GamesWon, TotalHits, TotalSinks, TotalGuesses} = results[0]
                    db.query('UPDATE players SET ? WHERE PlayerID = ?',[{
                        GamesPlayed:GamesPlayed + 1, 
                        GamesWon: GamesWon + (values.Winner === username ? 1:0),
                        TotalHits: TotalHits + values.NumShipsHit,
                        TotalSinks: TotalSinks + values.NumShipsSunk,
                        TotalGuesses: TotalGuesses + values.NumGuesses
                    },PlayerID],(error,results)=>
                    {
                        if(error)
                        {
                            console.log(error)
                        }
                    })
                    values.PlayerID = PlayerID
                    db.query('INSERT INTO gamesplayedbyplayers SET ?', values, function(error,results)
                    {
                        if(error)
                        {
                            console.log(error)
                        }
                    })
                }
            })
        }
        catch
        {
            return
        }
    })
});




http.listen(5000, function()
{
    console.log("The server has started")
})

server.use(express.json())
server.use(express.urlencoded({extended:true}))
server.set('view engine', 'hbs')
server.use(cookieParser())

server.use('/', require('./routes/pages.js'))
server.use('/auth', require('./routes/auth.js'))
server.use(express.static(__dirname + "/client/dist"))
server.use(express.static(__dirname + "/client"))
server.use(express.static(__dirname + "/accountviews"))




server.listen(3000)