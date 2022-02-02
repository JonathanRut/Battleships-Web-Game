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
    }

    submitMessage(e)
    {
        e.preventDefault();
        const messages = document.getElementById('messages');
        const input = document.getElementById('input');
        var newMessage = document.createElement('li');
        newMessage.textContent = "Player 1: " + input.value;
        messages.appendChild(newMessage);
        messages.scrollTo(0,messages.scrollHeight);
        this.socket.emit('game message', input.value);
        input.value = "";
    }
}