
const express = require('express');
const app = express();
const http = require('http').Server(app);

var osc = require('node-osc');
const io = require('socket.io')(http);
var connect = require('connect');
var serveStatic = require('serve-static');
var oscServer, oscClient;
const port = process.env.PORT || 3000;


var isConnected = false;

io.sockets.on('connection', function (socket) {
	console.log('connection');
	socket.on("config", function (obj) {
		isConnected = true;
    	oscServer = new osc.Server(obj.server.port, obj.server.host);
	    oscClient = new osc.Client(obj.client.host, obj.client.port);
	    oscClient.send('/status', socket.sessionId + ' connected');
		oscServer.on('message', function(msg, rinfo) {
			socket.emit("message", msg);
		});
		socket.emit("connected", 1);
	});
 	socket.on("message", function (obj) {
		oscClient.send.apply(oscClient, obj);
  	});
	socket.on('disconnect', function(){
		if (isConnected) {
			oscServer.kill();
			oscClient.kill();
		}
  	});
});

connect().use(serveStatic(__dirname)).listen(port, function(){
    console.log('Server running on...' + port);
});
