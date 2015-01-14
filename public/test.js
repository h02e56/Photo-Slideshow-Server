var webSocket = require('./');
var domready = require('domready');

domready(function () {
	var ws = null;
	
	document.addEventListener('click', eventHandler, false);

	function eventHandler(e){
		var target = e.target
			,library = target.getAttribute('data-link') || null

		e.preventDefault();
		if(library) {	
			if(ws) return ws.restart(library)	
			else ws = webSocket(library).init();
		}
	}
})