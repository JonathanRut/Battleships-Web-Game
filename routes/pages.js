const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken')
const mysql = require('mysql')

const db = mysql.createConnection({
    host:process.env.DATABASE_HOST,
    user:process.env.DATABASE_USER,
    password:process.env.DATABASE_PASSWORD,
    database:process.env.DATABASE
})

// A connection is made to the database
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


router.get('/',(req,res)=>
{
    let loggedIn
    // A try and catch statement detects if the user is logged in or not
    try
    {
        // If gets the cookie from the user tries to verify it if successful then loggedIn is set to true
        const token = req.cookies.token
        const user = jwt.verify(token,process.env.MY_SECRET)
        loggedIn = true;
    }
    catch
    {
        // If cookie is invalid or not present the cookie is removed and loggedIn is set to false
        res.clearCookie('token')
        loggedIn = false
    }

    // The index webpage is rendered and with the parameter of loggedIn
    res.render(__dirname.substring(0,__dirname.indexOf("routes")) + '/client/dist/index.hbs',{loggedIn:loggedIn})
})

router.get('/login', (req, res) =>
{
    // A try and catch statement detects if the user is logged in or not
    try
    {
        // If the user is logged in then they are redirected to the front page
        const token = req.cookies.token
        const user = jwt.verify(token,process.env.MY_SECRET)
        res.redirect('/')
    }
    catch
    {
        // If the user is not logged in or their login has expired the login page is rendered
        res.clearCookie('token')
        res.render( __dirname.substring(0,__dirname.indexOf("routes")) + "accountviews/login.hbs")
    }
})

router.get('/signup', (req, res) =>
{
    // A try and catch statement detects if the user is logged in
    try
    {
        // If already logged in the user is directed the the front page
        const token = req.cookies.token
        const user = jwt.verify(token,process.env.MY_SECRET)
        res.redirect('/')
    }
    catch(error)
    {
        // If not logged in or their login has expired the sign up page is rendered
        res.clearCookie('token')
        res.render(__dirname.substring(0,__dirname.indexOf("routes")) + "accountviews/signup.hbs");
    }
})

router.get('/signout',(req,res)=>
{
    // When get request made to /signout the cookie for logged in is deleted and the user is redirected to the front page
    res.clearCookie('token')
    res.redirect('/')
})

router.get('/account',(req,res)=>
{
    // The try and catch statement detects if the user is logged in of not
    try
    {
        const token = req.cookies.token
        const user = jwt.verify(token,process.env.MY_SECRET)
        // If they logged in a select statement is run on the database getting user data
        db.query('SELECT username, GamesPlayed, GamesWon, LeaderboardPlacement, TotalHits, TotalSinks, TotalGuesses, DateJoined FROM players WHERE username = ?', [user.username], async(error,result) =>
        {
            if(error)
            {
                console.log(error)
            }
            // Values from select statement are stored
            const values = result[0]
            // Accuracy and win rate of user are calculated
            values.Accuracy = Math.floor((result[0].TotalHits / result[0].TotalGuesses) * 100)
            values.WinRate = Math.floor((result[0].GamesWon / result[0].GamesPlayed) * 100)
            values.games = []
            values.leaderboard = []
            // A select statement gets the previous 15 games played by the player with different stats about the games
            db.query('SELECT games.GameID, username, NumShipsHit, NumShipsSunk, NumGuesses, Winner, Opponent, games.TotalSinks, games.TotalGuesses, games.TotalHits, games.DurationOfGame FROM games, gamesplayedbyplayers, players WHERE players.Username = ? AND players.PlayerID = gamesplayedbyplayers.PlayerID AND games.GameID = gamesplayedbyplayers.GameID ORDER BY GameID DESC LIMIT 15 ', [user.username], (error,results)=>
            {
                if(error)
                {
                    console.log(error);
                }
                else
                {
                    results.forEach(record => 
                        {
                            // For each game player 2 stats are calculated
                            record.p2Hits = record.TotalHits - record.NumShipsHit
                            record.p2Sinks = record.TotalSinks - record.NumShipsSunk
                            record.p2Guesses = record.TotalGuesses - record.NumGuesses

                            // Accuracy for each player is calculated
                            record.p1Accuracy = Math.floor((record.NumShipsHit/record.NumGuesses) * 100)
                            record.p2Accuracy = Math.floor((record.p2Hits/record.p2Guesses) * 100)
                            
                            // Duration of the game is calculated
                            record.DurationOfGameSec = record.DurationOfGame % 60
                            record.DurationOfGame = Math.floor(record.DurationOfGame / 60)
                        })
                    values.games = results
                    // A select statement for the leaderboard is made getting the players in the top 10 ranks
                    db.query('SELECT username, GamesWon, LeaderboardPlacement FROM players WHERE LeaderboardPlacement < 11 ORDER BY LeaderboardPlacement ASC',(error,results)=>
                    {
                        if(error)
                        {
                            console.log(error)
                        }
                        else
                        {
                            // The players are stored and finally the account page is rendered with the values retrieved from select statement
                            values.leaderboard = results
                            res.render(__dirname.substring(0,__dirname.indexOf("routes")) + "accountviews/account.hbs", values);
                        }
                    })
                }
            })
        })

    }
    catch(error)
    {
        // If not logged in or the user login has expired then the cookie for login is removed and the user is redirected to front page
        res.clearCookie('token')
        res.redirect('/')
    }
})

module.exports = router;