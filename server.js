var http = require('http');
var path = require('path');
var url =require('url');
var debug = require('debug')('Server');
var config = require('./config')

var createHTML = require('./createHTML');

//create our initial index html on server depending on photos folder estructure 
//on done serve it 
createHTML(config.photosPath, function(){
	//static file Server
	var staticServer = require('node-static')
		, staticFiles = new staticServer.Server('./public');

	// server
	var server = http.createServer(function(req, res){
		staticFiles.serve(req, res, function (err, data) {
		    if (err) {
	            debug("> Error serving " + req.url + " - " + err.message);
	            res.writeHead(err.status, err.headers);	            
	            res.end();
	        } else {
	            debug("> " + req.url + " - " + data.message);            
	        }
		 })	
	}).listen(config.PORT);

	//run ws server
	var WSServer = require('./wsserver.js')();
})


