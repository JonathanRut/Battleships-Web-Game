const { compareSync } = require('bcryptjs');
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
    try
    {
        const token = req.cookies.token
        const user = jwt.verify(token,process.env.MY_SECRET)
        loggedIn = true;
    }
    catch
    {
        res.clearCookie('token')
        loggedIn = false
    }
    res.render(__dirname.substring(0,__dirname.indexOf("routes")) + '/client/dist/index.hbs',{loggedIn:loggedIn})
})

router.get('/login', (req, res) =>
{
    try
    {
        const token = req.cookies.token
        const user = jwt.verify(token,process.env.MY_SECRET)
        res.redirect('/')
    }
    catch
    {
        res.clearCookie('token')
        res.render( __dirname.substring(0,__dirname.indexOf("routes")) + "accountviews/login.hbs")
    }
})

router.get('/signup', (req, res) =>
{
    try
    {
        const token = req.cookies.token
        const user = jwt.verify(token,process.env.MY_SECRET)
        res.redirect('/')
    }
    catch(error)
    {
        res.clearCookie('token')
        res.render(__dirname.substring(0,__dirname.indexOf("routes")) + "accountviews/signup.hbs");
    }
})

router.get('/signout',(req,res)=>
{
    res.clearCookie('token')
    res.redirect('/')
})

router.get('/account',(req,res)=>
{
    try
    {
        const token = req.cookies.token
        const user = jwt.verify(token,process.env.MY_SECRET)
        db.query('SELECT username, GamesPlayed, GamesWon, LeaderboardPlacement, TotalHits, TotalSinks, TotalGuesses, DateJoined FROM players WHERE username = ?', [user.username], async(error,result) =>
        {
            if(error)
            {
                console.log(error)
            }
            const values = result[0]
            values.Accuracy = Math.floor((result[0].TotalHits / result[0].TotalGuesses) * 100)
            values.WinRate = Math.floor((result[0].GamesWon / result[0].GamesPlayed) * 100)
            values.games = []
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
                            record.p2Hits = record.TotalHits - record.NumShipsHit
                            record.p2Sinks = record.TotalSinks - record.NumShipsSunk
                            record.p2Guesses = record.TotalGuesses - record.NumGuesses
                            record.p1Accuracy = Math.floor((record.NumShipsHit/record.NumGuesses) * 100)
                            record.p2Accuracy = Math.floor((record.p2Hits/record.p2Guesses) * 100)
                            record.DurationOfGameSec = record.DurationOfGame % 60
                            record.DurationOfGame = Math.floor(record.DurationOfGame / 60)
                        })
                    values.games = results
                    res.render(__dirname.substring(0,__dirname.indexOf("routes")) + "accountviews/account.hbs", values);
                }
            })
        })

    }
    catch(error)
    {
        res.clearCookie('token')
        res.redirect('/')
    }
})

module.exports = router;