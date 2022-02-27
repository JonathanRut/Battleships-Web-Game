import MainGame from "../scenes/MainGame"

export default class MultiplayerGame extends MainGame
{
    constructor()
    {
        super("MultiplayerGame");
    }

    create(settings)
    {
        super.create(settings);
        this.player2.socket = settings.socket;
        this.form.socket = settings.socket
        this.socket = settings.socket;
        this.OpponentID = settings.OpponentID
        this.form.scene = this
        this.trueP1 = settings.justHit;

        const player1 = this.player1
        const player1Text = this.player1Text
        const turnText = this.turn


        this.player2.name = settings.opponentName
        this.player2Text.text =  this.player2.name + "'s Board"

        settings.socket.emit('getName')
        settings.socket.on('setName',function(gamename)
        {
            player1.name = gamename
            player1Text.text = gamename + "'s Board"
            console.log(gamename)
            turnText.text = settings.justHit ? gamename + "'s turn":settings.opponentName + "'s turn"
            player1.ownBoard.ships.forEach(ship =>
                {
                    ship.owner = player1.name
                })
        })

        this.player1.ownBoard.justHit = settings.justHit;
        this.player2.ownBoard.justHit = !settings.justHit;
        settings.socket.on('Disconnect', ()=>{
            this.player2.ownBoard.grid.forEach(row => 
                {
                    row.forEach(cell => 
                        {
                            if(cell.ships.length > 0)
                            {
                                cell.showCell();
                            }
                        })
                })
        })
        this.player2.ownBoard.grid.forEach(row => 
            {
                row.forEach(cell => 
                    {
                        cell.socket = settings.socket;
                        cell.OpponentID = settings.OpponentID;
                    })
            })
        this.player2.socket.on('game message', function(message)
        {
            const messages = document.getElementById('messages');
            var newMessage = document.createElement('li');
            newMessage.textContent = message;
            messages.appendChild(newMessage);
            messages.scrollTo(0,messages.scrollHeight);
        })
        this.player2.ownBoard.ships.forEach(ship =>
            {
                ship.owner = this.player2.name
            })
    }

    submitMessage(e)
    {
        e.preventDefault();
        const messages = document.getElementById('messages');
        const input = document.getElementById('input');
        var newMessage = document.createElement('li');
        newMessage.textContent = this.scene.player1.name + ": " + input.value;
        messages.appendChild(newMessage);
        messages.scrollTo(0,messages.scrollHeight);
        this.socket.emit('game message', input.value);
        input.value = "";
        console.log(this.socket.hasListeners('gameID'))
    }

    checkWin(player,opponent)
    {
        if(player.checkWin())
        {   
            player.endTurn();
            opponent.endTurn();
            player.startTurn = ()=>{};
            opponent.startTurn = ()=>{};
            player.checkWin = ()=>{};
            this.socket.removeAllListeners('Disconnect');

            this.add.text(player.ownBoard.width * 30 + 400, player.ownBoard.height * 30 + 120, player.name + " Wins!", {fontFamily:'Arial' ,fontSize:'48px', fill:'#000000'}).setOrigin(0.5,0.5);
            const messages = document.getElementById('messages');
            var newMessage = document.createElement('li');
            newMessage.textContent = player.name + " Wins!";
            messages.appendChild(newMessage);
            messages.scrollTo(0,messages.scrollHeight);   
                
            this.playAgain.show();

            player.ownBoard.grid.forEach((row)=>
            {
                row.forEach((cell)=>
                {
                    if(cell.ships.length > 0 && !cell.shown)
                    {
                        this.add.sprite(cell.origin.x + 4, cell.origin.y + 4 ,'shipPart').setOrigin(0,0);
                    }
                });
            });
            console.log(this.socket)
            if(this.trueP1)
            {
                console.log('Game record inserted')
                this.socket.emit('game insert', {
                    GameID: 0,
                    TotalHits: this.player1.ownBoard.hits + this.player2.ownBoard.hits,
                    TotalSinks: this.player1.ownBoard.sinks + this.player2.ownBoard.sinks,
                    TotalGuesses: this.player1.ownBoard.guesses + this.player2.ownBoard.guesses,
                    DurationOfGame: (Date.now() - this.startTime)/1000
                }, this.OpponentID)
            }
            const socket = this.socket
            const player1 = this.player1
            const player2 = this.player2
            this.socket.on('gameID', function(gameID)
            {
                console.log('Player record update')
                socket.emit('player update', document.cookie.split('=')[1], {
                    PlayerID: 0,
                    GameID: gameID,
                    NumShipsHit: player1.guessingBoard.hits,
                    NumShipsSunk: player1.guessingBoard.sinks,
                    NumGuesses: player1.guessingBoard.guesses,
                    Winner: player.name,
                    Opponent: player2.name
                })
            })
        }
    }
}