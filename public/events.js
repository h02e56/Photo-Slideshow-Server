var Utils = require('utils');
var utils = Utils.call(this);
var domReady = require('domready')

var webSocketManager = require('./');

module.exports = function(){ 
	domReady(function () {
		var ws = null;
		var timeOutBottomMenu = null;

		document.addEventListener('click', eventHandler, false);

		var actions = {
			'openMenu': function(target){
		        var footer = document.querySelector('footer');

		        if(timeOutBottomMenu){
		             window.clearTimeout(timeOutBottomMenu);
		        }

		        utils.addClass(target, 'active') ;
		        utils.toggleClass(footer, "footerScale");

		        timeOutBottomMenu = window.setTimeout(actions['closeMenu'].bind(target), 5000);
			},
			'closeMenu': function(){
				var menu = document.querySelector('footer');

		        if (utils.hasClass(menu, 'footerScale')) {
		            actions['openMenu'](this);
		            utils.removeClass(document.querySelector(".js-footerMenu"), 'active');
		        }
			}
		}

		function eventHandler(e){
			var target = e.target
				, id = target.id || null
				, library = target.getAttribute('data-link') || null
			
			e.preventDefault();
			if(library) {	
				if(ws) return ws.restart(library)	
				else ws = webSocketManager(library).init();
			}else if(actions[id]){
				actions[id](e.target)
			}
		}
	})
}
