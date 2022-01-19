const { transports } = require("engine.io");

const server = require("express")();
const http = require("http").createServer(server);
const io = require("socket.io")(http,{cors:
    {
        origin: "*",
        methods: ["GET", "POST"],
    }});

io.on("connection", function(socket)
{
    console.log("A user connected: " + socket.id);

    socket.on("disconnect", function()
    {
        console.log("A user disconnectd: " + socket.id)
    });
});

http.listen(3000, function()
{
    console.log("The server has started")
})