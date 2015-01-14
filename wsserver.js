var fs = require('fs');
var debug = require('debug')('websocketServer');

var config = require('./config')
var getImagesFromDisk = require ('./getImages')

module.exports = function(){
	var WebSocketServer = require('ws').Server
	   , wss = new WebSocketServer({ port: config.WSPORT });

	wss.on('connection', function(ws) {
		var cue = [];

		debug('conected with client successfully');
	
	    ws.on('error', function (e) {
	    	debug('error: ', e.message)
	    })

	    ws.on('close', function(){
	    	console.log('closed')
	    })

	    ws.on('message', function (data) {
	    	var parsed = JSON.parse(data)
	    	
	    	if(parsed.action === 'load'){
	    		cue = [];//clear cue , we are loading a new one
	    		getImagesFromDisk(parsed.library, cue,  function(er){
	    			if(er) debug('error', er)
	    			else ws.send(getSomeImage(cue), {binary: true});
	    		})
	    	}else ws.send(getSomeImage(cue), {binary: true}) ;
	    })	
	})	
}

function getSomeImage(cue){
	var randomnumber = Math.floor(Math.random()* cue.length + 1)
	return fs.readFileSync(cue[randomnumber])
}