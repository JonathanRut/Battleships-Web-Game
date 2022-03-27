const mysql = require('mysql');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken')
const cookieParser = require('cookie-parser')
const server = require("express")();
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

// The database is connected to
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
    // When a user connects to the socket server a message is outputted and the listeners are set
    console.log("A user connected: " + socket.id);
    let OpponentID;
    let username;

    socket.on("Searching", function(token)
    {
        // If a user is searching then an attempt is made to give then a name from the token given to the server
        try
        {
            // If successful the user get a unique name
            username = jwt.verify(token,process.env.MY_SECRET).username
        }
        catch
        {
            // If unsuccessful the user is given the name of Player 2
            username = "Player 2"
        }

        // The opponent id is temporally set to Searching
        OpponentID = 'Searching'

        // The users id and username is stored in the array of other players searching
        players.push({id:socket.id, name:username});
    
        if(players.length === 2)
        {
            // If there are 2 players searching the opponent id is set
            OpponentID = players[players.length - 2 ].id;
            
            // The opponent ids and if they go first is sent to the players
            socket.emit('Opponent', players[players.length - 2 ], false);
            io.to(players[players.length - 2 ].id).emit('Opponent', players[players.length - 1], true);
            
            // The player records are removed from the array
            players.splice(players.indexOf(players[players.length - 1]),1);
            players.splice(players.indexOf(players[players.length - 2 ]))
        }
    });


    socket.on("disconnect", function()
    {
        console.log("A user disconnected: " + socket.id)
        if(OpponentID)
        {
            // If the user disconnects while searching or in a game they are removed from the players array and a message is sent to there opponent saying they disconnected
            players.splice(players.indexOf(socket.id),1);
            io.to(OpponentID).emit('Disconnect');
        }
        else if(username)
        {
            // If the user is in the front page chat box a message is sent saying they have left
            io.emit('chat message', username.toUpperCase() + " LEFT")
            username = ''
        }
    });

    socket.on('Ship', (shipProperties, SocketID) => 
    {
        // When receiving a ship from the players the properties are then sent to the opponent and the opponent id is stored
        io.to(SocketID).emit('Ship', shipProperties);
        OpponentID = SocketID;
    })

    socket.on('Guess', (coords, SocketID)=>
    {
        // When a guess is made the coordinates are forwarded to the opponent
        io.to(SocketID).emit('Guess',coords)
    })

    socket.on('global message', function(message)
    {
        // If a global message is sent the message is emitted to all connected sockets
        io.emit('chat message', username + ": " + message)
    })

    socket.on('username', function(newUsername)
    {
        // When the user enters their username on the front page chatbox a message saying they joined is emitted to all connected sockets
        username = newUsername;
        io.emit('chat message', username.toUpperCase() + " JOINED")
    })

    socket.on('game message', function(message)
    {
        // When a message is sent in a game chatbox the message is then sent to the opponent
        io.to(OpponentID).emit('game message', username + ": " + message);
    })


    socket.on('getName', function()
    {
        // When the user makes a request for their name their name is returned to them
        io.to(socket.id).emit('setName', username === "Player 2" ? "Player 1":username)
    })

    socket.on('game insert', function(gameValues,playerValues,token,opponentName)
    {
        // This sql statement inserts the the game into the database
        db.query('INSERT INTO games SET ?', gameValues, (error, results) => 
        {
            if(error)
            {
                console.log(error)
            }
            else
            {
                // The GameID is set for the playerValues
                playerValues.GameID = results.insertId
            }

            // A attempt is made to see if the user is logged in or not
            let username
            try
            {
                username = jwt.verify(token,process.env.MY_SECRET).username
                // If logged in their record is update in the database
                updatePlayerRecords(username,playerValues)
            }
            catch
            {
                username = 'Player 2'
            }

            if(opponentName !== 'Player 2')
            {
                // If the opponent is logged in then their record is updated in the database
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
        // When the game has finished the opponent id and username are reset
        OpponentID = '';
        username = '';
    })
});

// This function updates player records
function updatePlayerRecords(username,values)
{
    // The current record for the user is found
    db.query('SELECT PlayerID, GamesPlayed, GamesWon, TotalHits, TotalSinks, TotalGuesses, LeaderboardPlacement FROM players WHERE username = ?', [username], (error,results)=>
            {
                if(error)
                {
                    console.log(error)
                }
                else
                {
                    // The values for this record are stored
                    const {PlayerID, GamesPlayed, GamesWon, TotalHits, TotalSinks, TotalGuesses, LeaderboardPlacement} = results[0]

                    // If the opponent has won a series of select statement are used to update their leaderboard placement
                    if(values.Winner === username)
                    {

                        // This select statement finds if there is already a group for the users wins
                        db.query('SELECT LeaderboardPlacement FROM players WHERE GamesWon = ?', [GamesWon + 1], (error,results)=>
                        {
                            if(error)
                            {
                                console.log(error)
                            }
                            
                            if(results.length === 0)
                            {
                                // If there is no group for the users wins the current leaderboard placement is found
                                db.query('SELECT username FROM players WHERE LeaderboardPlacement = ?',[LeaderboardPlacement],(error,results)=>
                                {
                                    if(results.length > 1)
                                    {
                                        // If the user is in a group then all the records bellow them are incremented by 1
                                        db.query('UPDATE players SET LeaderboardPlacement = LeaderboardPlacement + 1 WHERE GamesWon < ?', [GamesWon + 1], (error,results)=>
                                        {
                                            if(error)
                                            {
                                                console.log(error)
                                            }
                                            else
                                            {
                                                // Finally the user is given a their new LeaderboardPlacement
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
                            {   
                                // If there is a group the position the user is leaving on the leaderboard is found
                                db.query('SELECT username FROM players WHERE LeaderboardPlacement = ?',[LeaderboardPlacement],(error,result)=>
                                {
                                    if(error)
                                    {
                                        console.log(error)
                                    }
                                    if(result.length === 1)
                                    {
                                        // If the user is the only one with that placement the records bellow them are decremented by 1 to fill the gap from the user moving placement
                                        db.query('UPDATE players SET LeaderboardPlacement = LeaderboardPlacement - 1 WHERE LeaderboardPlacement > ?',[LeaderboardPlacement],(error,results)=>
                                        {
                                            if(error)
                                            {
                                                console.log(error)
                                            }
                                        })
                                    }
                                    // Finally the user LeaderboardPlacement is updated in their record
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

                    // This sql statement updates the users player record
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
                    // A relation ship between the player and the game is added to the gamesplayedbyplayers table
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

// The socket io server is set to listen on port 5000
http.listen(5000, function()
{
    console.log("The server has started")
})

// These set up the express server to be able to grab information from forms
server.use(express.json())
server.use(express.urlencoded({extended:true}))

// The view engine is set to handlebars
server.set('view engine', 'hbs')

// Cookie parser is used to read the users cookies
server.use(cookieParser())

// The location of routers and static files are set
server.use('/', require('./routes/pages.js'))
server.use('/auth', require('./routes/auth.js'))
server.use(express.static(__dirname + "/client/dist"))
server.use(express.static(__dirname + "/client"))
server.use(express.static(__dirname + "/accountviews"))

// The express server is set to listen on port 3000
server.listen(3000)