'use strict'
var Utils = require('./utils.js');
var utils = Utils.call(this);
var config = require('../config.js')

var wrapper = document.getElementById('wrapper')
var domImg = document.querySelector('#wrapper img')

var remote = 'ws://localhost:' + config.WSPORT;
var intervalTime = config.intervalTime; 

module.exports = function(library){

	var proto = {

		init: function(){

			var s = this._socket = new WebSocket(remote);
			s.onmessage = function(e) {
		 		// if (e.data == 'ok') {//start asking photos
	 			if(!this.intervalId){
	 				this.intervalId = window.setInterval(function(){
						s.send(JSON.stringify({
							action:'next'
						}))
					}, intervalTime);	
	 			} 
		  		createImage(e.data)
			}

			s.onopen = function(e) {
		 		s.send(JSON.stringify({
		 			action:'load',
		 			library: library
		 		}))
			}

			s.onclose = function(){
				console.log('closed socket')
			}
			return this;
		},
		restart : function (library){
			//window.clearInterval(this.intervalId)
			this._send({
	 			action:'load',
	 			library: library
	 		})
		},
		_send: function (msg){
			this._socket.send(JSON.stringify(msg))
		}
	}

	function createImage (blob) {
		// body...
		var urlCreator = window.URL || window.webkitURL
			,imageUrl = urlCreator.createObjectURL(blob)
	        ,img = document.createElement("img");
	    
	    renderImage(imageUrl)
	}

	function renderImage(imgUrl){ 
		utils.toggleClass(domImg, 'hide');
		domImg.src = imgUrl;
		utils.removeClass(domImg, 'hide');
	}

	var socket = Object.create(proto, {
		interval: { writable:true, configurable:true, value: library }
	})
	return socket;
}
