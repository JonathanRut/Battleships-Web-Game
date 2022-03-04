const mysql = require('mysql')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')

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

exports.login = (req,res)=>
{
    const {username, password} = req.body

    db.query('SELECT password FROM players WHERE username = ?', [username], async(error,result) => 
    {
        if(error)
        {
            console.log(error)
        }
        else if(result.length === 0)
        {
            return res.render(__dirname.substring(0,__dirname.indexOf("controllers")) + "accountviews/login.hbs", {message:"Wrong username or password"})
        }
        const dbpassword = result[0].password;
        bcrypt.compare(password,dbpassword,(err,success)=>
        {
            if(err)
            {
                console.log(err)
            }
            if(success)
            {
                const token = jwt.sign({username:username}, process.env.MY_SECRET, {expiresIn:"1hr"})
                res.cookie('token', token, 
                {
                    httpOnly:false
                })

                return res.redirect('/')
            }
            else
            {
                return res.render(__dirname.substring(0,__dirname.indexOf("controllers")) + "accountviews/login.hbs", {message:"Wrong username or password"})
            }
        })
    })
}

exports.signup = (req,res)=>
{
    const {username, password, confirmPassowrd} = req.body
    db.query('SELECT username FROM players WHERE username = ?',[username],async (error, results)=>
    {
        if(error)
        {
            console.log(error);
        }
        else if(results.length > 0 )
        {
            return res.render(__dirname.substring(0,__dirname.indexOf("controllers")) + "accountviews/signup.hbs", {message:"That username is already in use"})
        }
        else if(password !== confirmPassowrd)
        {
            return res.render(__dirname.substring(0,__dirname.indexOf("controllers")) + "accountviews/signup.hbs", {message:"Passwords don't match"})
        }
        let hashedpassword = await bcrypt.hash(password, 8)

        const today = new Date();
        const date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
        let LeaderboardPlacement
        db.query('SELECT LeaderboardPlacement FROM players WHERE GamesWon = 0',(error,results)=>
        {
            if(error)
            {
                console.log(error)
            }
            else if(results.length === 0)
            {
                db.query('SELECT MAX(LeaderboardPlacement) AS Bottom FROM players',(error,results)=>
                {
                    if(error)
                    {
                        console.log(error)
                    }
                    else
                    {
                        LeaderboardPlacement = results[0].Bottom === null ? 1:results[0].Bottom + 1
                        insertPlayer({PlayerID:0, Username:username, Password:hashedpassword, GamesPlayed:0, GamesWon:0, LeaderboardPlacement:LeaderboardPlacement, TotalHits:0, TotalSinks:0, TotalGuesses:0, DateJoined:date})
                    }
                })
            }
            else
            {
                LeaderboardPlacement = results[0].LeaderboardPlacement
                insertPlayer({PlayerID:0, Username:username, Password:hashedpassword, GamesPlayed:0, GamesWon:0, LeaderboardPlacement:LeaderboardPlacement, TotalHits:0, TotalSinks:0, TotalGuesses:0, DateJoined:date})
            }
        })

        function insertPlayer(values)
        {
            db.query('INSERT INTO players SET ?',values, (error, results)=>
            {
                if(error)
                {
                    console.log(error)
                }
                else
                {
                    const token = jwt.sign({username:username}, process.env.MY_SECRET, {expiresIn:"1hr"})
                    res.cookie('token', token, 
                    {
                        httpOnly:false
                    })
                    return res.redirect('/')
                }
            })
        }
        
    });
}

