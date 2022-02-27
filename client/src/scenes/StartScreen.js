import phaserButton from "../assets/phaserButton";
import io from 'socket.io-client'

export default class StartScreen extends Phaser.Scene{
    constructor(){
        super({key:'StartScreen'});
    }

    preload()
    {
        this.load.html('chatBox', 'src/assets/chatBox.html'); 
    }

    create(){
        this.add.text(this.game.config.width/2,this.game.config.height/2-130,"Battleships", {fontFamily:'Arial' ,fontSize:'70px', fill:'#000000'}).setOrigin(0.5,0.5);
        
        let container = this.add.rectangle(this.game.config.width/2,this.game.config.height/2,300,80,0xffffff).setStrokeStyle(2,0x000000);
        let text = this.add.text(container.x,container.y,"Singleplayer", {fontFamily:'Arial' ,fontSize:'45px', fill:'#000000'}).setOrigin(0.5,0.5);
        this.singlePlayerButton = new phaserButton(container,text,function(){
            this.scene.scene.stop('StartScreen');
            socket.emit('left chat');
            socket.disconnect();
            this.scene.scene.start('SingleFleetPlace');
        },this);

        container = this.add.rectangle(this.game.config.width/2,this.game.config.height/2 + 90,300,80,0xffffff).setStrokeStyle(2,0x000000);
        text = this.add.text(container.x,container.y,"Multiplayer", {fontFamily:'Arial' ,fontSize:'45px', fill:'#000000'}).setOrigin(0.5,0.5);
        this.multiPlayerButton = new phaserButton(container,text,function(){
            this.scene.scene.stop('StartScreen');
            socket.emit('left chat');
            socket.disconnect();
            this.scene.scene.start('MultiFleetPlace');
        },this);



        this.add.dom(0,0).createFromCache("chatBox").setOrigin(0,0);
        const socket = io('http://localhost:5000');
        const messages = document.getElementById('messages');
        const form = document.getElementById('form');
        const input = document.getElementById('input');
        let username;


        form.addEventListener('submit', function(e)
        {
            e.preventDefault();
            if (username == null)
            {
                if(input.value)
                {
                    username = input.value;
                    document.getElementById('username').remove();
                    socket.emit('username', username);
                    input.value = '';
                    socket.on('chat message', function(message)
                    {
                        var newMessage = document.createElement('li');
                        newMessage.textContent = message
                        messages.appendChild(newMessage);
                        messages.scrollTo(0,messages.scrollHeight);
                    })                   
                }
            }
            else if(input.value)
            {
                socket.emit('global message', input.value);
                input.value = '';
            }
        });
    }
}