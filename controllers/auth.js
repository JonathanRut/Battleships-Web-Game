const mysql = require('mysql')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')

const db = mysql.createConnection({
    host:process.env.DATABASE_HOST,
    user:process.env.DATABASE_USER,
    password:process.env.DATABASE_PASSWORD,
    database:process.env.DATABASE
})

// A database connection is made
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
    // Submitted username and password are stored
    const {username, password} = req.body


    // A select statement gets the password for the username submitted
    db.query('SELECT password FROM players WHERE username = ?', [username], async(error,result) => 
    {
        if(error)
        {
            console.log(error)
        }
        else if(result.length === 0)
        {
            // If there is not record with that username login page is rendered with a message telling user they have entered wrong username or password
            return res.render(__dirname.substring(0,__dirname.indexOf("controllers")) + "accountviews/login.hbs", {message:"Wrong username or password"})
        }

        // The password from select statement is stored 
        const dbpassword = result[0].password;

        // Then the submitted password and the password from database are compared
        bcrypt.compare(password,dbpassword,(err,success)=>
        {
            if(err)
            {
                console.log(err)
            }
            if(success)
            {
                // If they match then a json web token is made for the user with the username as a property and an expiry of 1hr
                const token = jwt.sign({username:username}, process.env.MY_SECRET, {expiresIn:"1hr"})
                res.cookie('token', token, 
                {
                    httpOnly:false
                })
                // The user is redirected to front page
                return res.redirect('/')
            }
            else
            {
                // If passwords do not match the login page is rendered telling the user they have entered the wrong username of password
                return res.render(__dirname.substring(0,__dirname.indexOf("controllers")) + "accountviews/login.hbs", {message:"Wrong username or password"})
            }
        })
    })
}

exports.signup = (req,res)=>
{
    // The username, password and confirmPassword submitted are stored
    const {username, password, confirmPassowrd} = req.body
    // A select statement is used to determine if there is an account already with that username
    db.query('SELECT username FROM players WHERE username = ?',[username],async (error, results)=>
    {
        if(error)
        {
            console.log(error);
        }
        else if(results.length > 0 )
        {
            // If there is and account with this name a signup page is rendered with a messages telling the user that the name is already in use
            return res.render(__dirname.substring(0,__dirname.indexOf("controllers")) + "accountviews/signup.hbs", {message:"That username is already in use"})
        }
        else if(password !== confirmPassowrd)
        {
            // If the passwords submitted don't match then the signup page is rendered with a message saying the passwords don't match
            return res.render(__dirname.substring(0,__dirname.indexOf("controllers")) + "accountviews/signup.hbs", {message:"Passwords don't match"})
        }

        // The password is hashed and this hashed password is stored
        let hashedpassword = await bcrypt.hash(password, 8)

        // The current date is found and stored
        const today = new Date();
        const date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();

        // A select statement is used to find what position the new user will be on the leaderboard
        let LeaderboardPlacement
        db.query('SELECT LeaderboardPlacement FROM players WHERE GamesWon = 0',(error,results)=>
        {
            if(error)
            {
                console.log(error)
            }
            else if(results.length === 0)
            {
                // If there is not a group for 0 wins then this select statement will find what position the new user will be
                db.query('SELECT MAX(LeaderboardPlacement) AS Bottom FROM players',(error,results)=>
                {
                    if(error)
                    {
                        console.log(error)
                    }
                    else
                    {
                        // This ternary statement is for the case that this is the first record in the database
                        LeaderboardPlacement = results[0].Bottom === null ? 1:results[0].Bottom + 1
                        // The player information is inserted with relevant values
                        insertPlayer({PlayerID:0, Username:username, Password:hashedpassword, GamesPlayed:0, GamesWon:0, LeaderboardPlacement:LeaderboardPlacement, TotalHits:0, TotalSinks:0, TotalGuesses:0, DateJoined:date})
                    }
                })
            }
            else
            {
                // If there is group for 0 wins that LeaderboardPlacement is used
                LeaderboardPlacement = results[0].LeaderboardPlacement
                // The player record is then inserted
                insertPlayer({PlayerID:0, Username:username, Password:hashedpassword, GamesPlayed:0, GamesWon:0, LeaderboardPlacement:LeaderboardPlacement, TotalHits:0, TotalSinks:0, TotalGuesses:0, DateJoined:date})
            }
        })

        function insertPlayer(values)
        {
            // This inserts the players record into the database
            db.query('INSERT INTO players SET ?',values, (error, results)=>
            {
                if(error)
                {
                    console.log(error)
                }
                else
                {
                    // A json web token is made to identify the user with an expiry of 1hr
                    const token = jwt.sign({username:username}, process.env.MY_SECRET, {expiresIn:"1hr"})
                    res.cookie('token', token, 
                    {
                        httpOnly:false
                    })
                    // Finally the user is redirected to the front page
                    return res.redirect('/')
                }
            })
        }
        
    });
}

