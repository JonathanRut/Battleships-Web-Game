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
io.on("connection", function(socket)
{
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
        console.log("A user disconnected: " + socket.id)
        if(username)
        {
            io.emit('chat message', username.toUpperCase() + " LEFT")
            username = ''
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

    socket.on('game message', function(message)
    {
        io.to(OpponentID).emit('game message', username + ": " + message);
    })


    socket.on('getName', function()
    {
        io.to(socket.id).emit('setName', username === "Player 2" ? "Player 1":username)
    })

    socket.on('game insert', function(gameValues,playerValues,token,opponentName)
    {
        db.query('INSERT INTO games SET ?', gameValues, (error, results) => 
        {
            if(error)
            {
                console.log(error)
            }
            else
            {
                playerValues.GameID = results.insertId
            }
            let username
            try
            {
                username = jwt.verify(token,process.env.MY_SECRET).username
                updatePlayerRecords(username,playerValues)
            }
            catch
            {
                username = 'Player 2'
            }
            if(opponentName !== 'Player 2')
            {
                updatePlayerRecords(opponentName,
                    {
                        PlayerID: 0,
                        GameID: playerValues.GameID,
                        NumShipsHit: gameValues.TotalHits - playerValues.NumShipsHit,
                        NumShipsSunk: gameValues.TotalSinks - playerValues.NumShipsSunk,
                        NumGuesses: gameValues.TotalGuesses - playerValues.NumGuesses,
                        Winner: playerValues.Winner,
                        Opponent: username
                    })
            }
        })
    })

    socket.on('game finished',function()
    {
        OpponentID = '';
    })
});

function updatePlayerRecords(username,values)
{
    db.query('SELECT PlayerID, GamesPlayed, GamesWon, TotalHits, TotalSinks, TotalGuesses, LeaderboardPlacement FROM players WHERE username = ?', [username], (error,results)=>
            {
                if(error)
                {
                    console.log(error)
                }
                else
                {
                    const {PlayerID, GamesPlayed, GamesWon, TotalHits, TotalSinks, TotalGuesses, LeaderboardPlacement} = results[0]
                    if(values.Winner === username)
                    {
                        db.query('SELECT LeaderboardPlacement FROM players WHERE GamesWon = ?', [GamesWon + 1], (error,results)=>
                        {
                            if(error)
                            {
                                console.log(error)
                            }
                            
                            if(results.length === 0)
                            {
                                db.query('SELECT username FROM players WHERE LeaderboardPlacement = ?',[LeaderboardPlacement],(error,results)=>
                                {
                                    if(results.length > 1)
                                    {
                                        db.query('UPDATE players SET LeaderboardPlacement = LeaderboardPlacement + 1 WHERE GamesWon < ?', [GamesWon + 1], (error,results)=>
                                        {
                                            if(error)
                                            {
                                                console.log(error)
                                            }
                                            else
                                            {
                                                db.query('UPDATE players SET LeaderboardPlacement = ? WHERE PlayerID = ?',[LeaderboardPlacement,PlayerID],(error,results)=>
                                                {
                                                    if(error)
                                                    {
                                                        console.log(error)
                                                    }
                                                })
                                            }
                                        })
                                    }
                                })
                            }
                            else
                            {   db.query('SELECT username FROM players WHERE LeaderboardPlacement = ?',[LeaderboardPlacement],(error,result)=>
                                {
                                    if(error)
                                    {
                                        console.log(error)
                                    }
                                    if(result.length === 1)
                                    {
                                        db.query('UPDATE players SET LeaderboardPlacement = LeaderboardPlacement - 1 WHERE LeaderboardPlacement > ?',[LeaderboardPlacement],(error,results)=>
                                        {
                                            if(error)
                                            {
                                                console.log(error)
                                            }
                                        })
                                    }
                                    db.query('UPDATE players SET LeaderboardPlacement = ? WHERE PlayerID = ?',[results[0].LeaderboardPlacement,PlayerID], (error,results)=>
                                    {
                                        if(error)
                                        {
                                            console.log(error)
                                        }
                                    })
                                })
                            }
                        })
                    }
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