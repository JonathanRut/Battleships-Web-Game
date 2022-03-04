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


        // Two buttons are made for single player and multiplayer when they are pressed the start their own scenes
        let container = this.add.rectangle(this.game.config.width/2,this.game.config.height/2,300,80,0xffffff).setStrokeStyle(2,0x000000);
        let text = this.add.text(container.x,container.y,"Singleplayer", {fontFamily:'Arial' ,fontSize:'45px', fill:'#000000'}).setOrigin(0.5,0.5);
        this.singlePlayerButton = new phaserButton(container,text,function(){
            this.scene.scene.stop('StartScreen');
            socket.disconnect();
            this.scene.scene.start('SingleFleetPlace');
        },this);

        container = this.add.rectangle(this.game.config.width/2,this.game.config.height/2 + 90,300,80,0xffffff).setStrokeStyle(2,0x000000);
        text = this.add.text(container.x,container.y,"Multiplayer", {fontFamily:'Arial' ,fontSize:'45px', fill:'#000000'}).setOrigin(0.5,0.5);
        this.multiPlayerButton = new phaserButton(container,text,function(){
            this.scene.scene.stop('StartScreen');
            socket.disconnect();
            this.scene.scene.start('MultiFleetPlace');
        },this);


        // A chat box html element is created from cache then the elements from the form are stored in constants
        this.add.dom(0,0).createFromCache("chatBox").setOrigin(0,0);
        const messages = document.getElementById('messages');
        const form = document.getElementById('form');
        const input = document.getElementById('input');
        let username;

        // The user is conected to the external server
        const socket = io('http://localhost:5000');

        form.addEventListener('submit', function(e)
        {
            e.preventDefault();
            // An if statement tells if the user has set the username yet
            if (username == null && input.value)
            {
                // The username entered is stored in a variable and the list item asking to enter the username is removed
                username = input.value;
                document.getElementById('username').remove();

                // The username is then send to the external server and the text box is reset to empty
                socket.emit('username', username);
                input.value = '';

                // A listener is then created on the socket for when a chat message is received
                socket.on('chat message', function(message)
                {
                    // When a chat message is received the message is added to the list of other messages
                    var newMessage = document.createElement('li');
                    newMessage.textContent = message
                    messages.appendChild(newMessage);
                    messages.scrollTo(0,messages.scrollHeight);
                })                   
            }
            else if(input.value)
            {
                // If the user has already set their name the message in the box is sent to the server and the box is reset
                socket.emit('global message', input.value);
                input.value = '';
            }
        });
    }
}