(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"/Users/josep/Documents/work/pere/config.js":[function(require,module,exports){
(function (process){
module.exports = {
	PORT: (process.env.NODE_ENV === 'production' ? 80 : 3000),
	WSPORT: (process.env.NODE_ENV === 'production' ? 80 : 8080),
	photosPath: './files/',//shoud change to your path
	intervalTime: 7000,
	background: true
}
}).call(this,require('_process'))

},{"_process":"/usr/local/lib/node_modules/watchify/node_modules/browserify/node_modules/process/browser.js"}],"/Users/josep/Documents/work/pere/node_modules/utils/index.js":[function(require,module,exports){
module.exports = function(){

	return {
		extend: function( defaults, options ) {
	        var extended = {};
	        var prop;
	        for (prop in defaults) {
	            if (Object.prototype.hasOwnProperty.call(defaults, prop)) {
	                extended[prop] = defaults[prop];
	            }
	        }
	        for (prop in options) {
	            if (Object.prototype.hasOwnProperty.call(options, prop)) {
	                extended[prop] = options[prop];
	            }
	        }
	        return extended;
	    },

	    supports_history_api : function () {
 	 		return !!(window.history && history.pushState);
		},
		
	    hasClass: function (elem, className) {
	        return new RegExp(' ' + className + ' ').test(' ' + elem.className + ' ');
	    },

	    addClass: function (elem, className) {
	        if (!this.hasClass(elem, className)) {
	            elem.className += ' ' + className;
	        }
	    },

	    removeClass : function (elem, className) {
	        var newClass = ' ' + elem.className.replace( /[\t\r\n]/g, ' ') + ' ';

	        if (this.hasClass(elem, className)) {
	            while (newClass.indexOf(' ' + className + ' ') >= 0 ) {
	                newClass = newClass.replace(' ' + className + ' ', ' ');
	            }
	            elem.className = newClass.replace(/^\s+|\s+$/g, '');
	        }
	    },

	    toggleClass: function(elem, className){
	        if(this.hasClass(elem, className)){
	            this.removeClass(elem, className);
	            return;
	        }
	        this.addClass(elem, className)
	    },

	    toggleCheckbox: function(elem){

	    	var check = elem.getAttribute('checked')
	    		, newState = (check === 'true') ? 'false' : 'true';
	    	(newState === 'true') ? elem.setAttribute('checked', newState) : elem.removeAttribute('checked');
	    },

	    toArray: function(arguments){
	    	return  Array.prototype.slice.call(arguments);
	    },

	    /*
	    supports history API?
	     */
	    checkLocalStorage: function() {
	        if('localStorage' in window && window['localStorage'] !== null) {
		        return true
	        }        
	  		this.warn('Cannot store user preferences as your browser do not support local storage');
	  		return false;	
    	},

	  	clearStorage: function(){
	  		if(!this.checkLocalStorage) return
	        for (var prop in sessionStorage){
	            delete sessionStorage[prop];
	        }
	    },

	    mustBeStored: function (item){
	        if(item.type === 'text' || item.type === 'email'|| item.type === 'select-one' ){
	            return true;
	        }
	        return false;
	    },

	    store: function (key, value){
	        if(!this.checkLocalStorage) return
	        sessionStorage.setItem(key, value);    
	    },

	    /*
	    supports history API?
	     */
	    supports_history_api: function() {
		  if (!window.history && !history.pushState){
		  	this.warn('Your browser not support History API');
		  	return false;
		  }
		  return true;
		},

		/**
		 * error handling
		 */
		
		fail: function(thing) {
		 	throw new Error(thing);
		},

		warn: function(thing) {
		 	console.log(["WARNING:", thing].join(' '));
		},

		note: function(thing) {
		 	console.log(["NOTE:", thing].join(' '));
		}
	}
}



},{}],"/Users/josep/Documents/work/pere/public/app.js":[function(require,module,exports){
var Utils = require('utils');
var utils = Utils.call(this);

var webSocketManager = require('./webSocketManager.js')()
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
		 webSocketManager.restart(library);
	}else if(actions[id]){
		actions[id](e.target)
	}
}


},{"./webSocketManager.js":"/Users/josep/Documents/work/pere/public/webSocketManager.js","utils":"/Users/josep/Documents/work/pere/node_modules/utils/index.js"}],"/Users/josep/Documents/work/pere/public/utils.js":[function(require,module,exports){
arguments[4]["/Users/josep/Documents/work/pere/node_modules/utils/index.js"][0].apply(exports,arguments)
},{}],"/Users/josep/Documents/work/pere/public/webSocketManager.js":[function(require,module,exports){
'use strict'
var Utils = require('./utils.js');
var utils = Utils.call(this);
var config = require('../config.js')

var wrapper = document.getElementById('wrapper')
var domImg = document.querySelector('#wrapper img')

var remote = 'ws://localhost:' + config.WSPORT;
var intervalTime = config.intervalTime; 

module.exports = function(){

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

	var socket = Object.create(proto)
	
	return socket.init();
}

},{"../config.js":"/Users/josep/Documents/work/pere/config.js","./utils.js":"/Users/josep/Documents/work/pere/public/utils.js"}],"/usr/local/lib/node_modules/watchify/node_modules/browserify/node_modules/process/browser.js":[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};
var queue = [];
var draining = false;

function drainQueue() {
    if (draining) {
        return;
    }
    draining = true;
    var currentQueue;
    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        var i = -1;
        while (++i < len) {
            currentQueue[i]();
        }
        len = queue.length;
    }
    draining = false;
}
process.nextTick = function (fun) {
    queue.push(fun);
    if (!draining) {
        setTimeout(drainQueue, 0);
    }
};

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}]},{},["/Users/josep/Documents/work/pere/public/app.js"])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3Vzci9sb2NhbC9saWIvbm9kZV9tb2R1bGVzL3dhdGNoaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJjb25maWcuanMiLCJub2RlX21vZHVsZXMvdXRpbHMvaW5kZXguanMiLCJwdWJsaWMvYXBwLmpzIiwicHVibGljL3V0aWxzLmpzIiwicHVibGljL3dlYlNvY2tldE1hbmFnZXIuanMiLCIuLi8uLi8uLi8uLi8uLi91c3IvbG9jYWwvbGliL25vZGVfbW9kdWxlcy93YXRjaGlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvcHJvY2Vzcy9icm93c2VyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOztBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdDQTs7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJtb2R1bGUuZXhwb3J0cyA9IHtcblx0UE9SVDogKHByb2Nlc3MuZW52Lk5PREVfRU5WID09PSAncHJvZHVjdGlvbicgPyA4MCA6IDMwMDApLFxuXHRXU1BPUlQ6IChwcm9jZXNzLmVudi5OT0RFX0VOViA9PT0gJ3Byb2R1Y3Rpb24nID8gODAgOiA4MDgwKSxcblx0cGhvdG9zUGF0aDogJy4vZmlsZXMvJywvL3Nob3VkIGNoYW5nZSB0byB5b3VyIHBhdGhcblx0aW50ZXJ2YWxUaW1lOiA3MDAwLFxuXHRiYWNrZ3JvdW5kOiB0cnVlXG59IiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbigpe1xuXG5cdHJldHVybiB7XG5cdFx0ZXh0ZW5kOiBmdW5jdGlvbiggZGVmYXVsdHMsIG9wdGlvbnMgKSB7XG5cdCAgICAgICAgdmFyIGV4dGVuZGVkID0ge307XG5cdCAgICAgICAgdmFyIHByb3A7XG5cdCAgICAgICAgZm9yIChwcm9wIGluIGRlZmF1bHRzKSB7XG5cdCAgICAgICAgICAgIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoZGVmYXVsdHMsIHByb3ApKSB7XG5cdCAgICAgICAgICAgICAgICBleHRlbmRlZFtwcm9wXSA9IGRlZmF1bHRzW3Byb3BdO1xuXHQgICAgICAgICAgICB9XG5cdCAgICAgICAgfVxuXHQgICAgICAgIGZvciAocHJvcCBpbiBvcHRpb25zKSB7XG5cdCAgICAgICAgICAgIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob3B0aW9ucywgcHJvcCkpIHtcblx0ICAgICAgICAgICAgICAgIGV4dGVuZGVkW3Byb3BdID0gb3B0aW9uc1twcm9wXTtcblx0ICAgICAgICAgICAgfVxuXHQgICAgICAgIH1cblx0ICAgICAgICByZXR1cm4gZXh0ZW5kZWQ7XG5cdCAgICB9LFxuXG5cdCAgICBzdXBwb3J0c19oaXN0b3J5X2FwaSA6IGZ1bmN0aW9uICgpIHtcbiBcdCBcdFx0cmV0dXJuICEhKHdpbmRvdy5oaXN0b3J5ICYmIGhpc3RvcnkucHVzaFN0YXRlKTtcblx0XHR9LFxuXHRcdFxuXHQgICAgaGFzQ2xhc3M6IGZ1bmN0aW9uIChlbGVtLCBjbGFzc05hbWUpIHtcblx0ICAgICAgICByZXR1cm4gbmV3IFJlZ0V4cCgnICcgKyBjbGFzc05hbWUgKyAnICcpLnRlc3QoJyAnICsgZWxlbS5jbGFzc05hbWUgKyAnICcpO1xuXHQgICAgfSxcblxuXHQgICAgYWRkQ2xhc3M6IGZ1bmN0aW9uIChlbGVtLCBjbGFzc05hbWUpIHtcblx0ICAgICAgICBpZiAoIXRoaXMuaGFzQ2xhc3MoZWxlbSwgY2xhc3NOYW1lKSkge1xuXHQgICAgICAgICAgICBlbGVtLmNsYXNzTmFtZSArPSAnICcgKyBjbGFzc05hbWU7XG5cdCAgICAgICAgfVxuXHQgICAgfSxcblxuXHQgICAgcmVtb3ZlQ2xhc3MgOiBmdW5jdGlvbiAoZWxlbSwgY2xhc3NOYW1lKSB7XG5cdCAgICAgICAgdmFyIG5ld0NsYXNzID0gJyAnICsgZWxlbS5jbGFzc05hbWUucmVwbGFjZSggL1tcXHRcXHJcXG5dL2csICcgJykgKyAnICc7XG5cblx0ICAgICAgICBpZiAodGhpcy5oYXNDbGFzcyhlbGVtLCBjbGFzc05hbWUpKSB7XG5cdCAgICAgICAgICAgIHdoaWxlIChuZXdDbGFzcy5pbmRleE9mKCcgJyArIGNsYXNzTmFtZSArICcgJykgPj0gMCApIHtcblx0ICAgICAgICAgICAgICAgIG5ld0NsYXNzID0gbmV3Q2xhc3MucmVwbGFjZSgnICcgKyBjbGFzc05hbWUgKyAnICcsICcgJyk7XG5cdCAgICAgICAgICAgIH1cblx0ICAgICAgICAgICAgZWxlbS5jbGFzc05hbWUgPSBuZXdDbGFzcy5yZXBsYWNlKC9eXFxzK3xcXHMrJC9nLCAnJyk7XG5cdCAgICAgICAgfVxuXHQgICAgfSxcblxuXHQgICAgdG9nZ2xlQ2xhc3M6IGZ1bmN0aW9uKGVsZW0sIGNsYXNzTmFtZSl7XG5cdCAgICAgICAgaWYodGhpcy5oYXNDbGFzcyhlbGVtLCBjbGFzc05hbWUpKXtcblx0ICAgICAgICAgICAgdGhpcy5yZW1vdmVDbGFzcyhlbGVtLCBjbGFzc05hbWUpO1xuXHQgICAgICAgICAgICByZXR1cm47XG5cdCAgICAgICAgfVxuXHQgICAgICAgIHRoaXMuYWRkQ2xhc3MoZWxlbSwgY2xhc3NOYW1lKVxuXHQgICAgfSxcblxuXHQgICAgdG9nZ2xlQ2hlY2tib3g6IGZ1bmN0aW9uKGVsZW0pe1xuXG5cdCAgICBcdHZhciBjaGVjayA9IGVsZW0uZ2V0QXR0cmlidXRlKCdjaGVja2VkJylcblx0ICAgIFx0XHQsIG5ld1N0YXRlID0gKGNoZWNrID09PSAndHJ1ZScpID8gJ2ZhbHNlJyA6ICd0cnVlJztcblx0ICAgIFx0KG5ld1N0YXRlID09PSAndHJ1ZScpID8gZWxlbS5zZXRBdHRyaWJ1dGUoJ2NoZWNrZWQnLCBuZXdTdGF0ZSkgOiBlbGVtLnJlbW92ZUF0dHJpYnV0ZSgnY2hlY2tlZCcpO1xuXHQgICAgfSxcblxuXHQgICAgdG9BcnJheTogZnVuY3Rpb24oYXJndW1lbnRzKXtcblx0ICAgIFx0cmV0dXJuICBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMpO1xuXHQgICAgfSxcblxuXHQgICAgLypcblx0ICAgIHN1cHBvcnRzIGhpc3RvcnkgQVBJP1xuXHQgICAgICovXG5cdCAgICBjaGVja0xvY2FsU3RvcmFnZTogZnVuY3Rpb24oKSB7XG5cdCAgICAgICAgaWYoJ2xvY2FsU3RvcmFnZScgaW4gd2luZG93ICYmIHdpbmRvd1snbG9jYWxTdG9yYWdlJ10gIT09IG51bGwpIHtcblx0XHQgICAgICAgIHJldHVybiB0cnVlXG5cdCAgICAgICAgfSAgICAgICAgXG5cdCAgXHRcdHRoaXMud2FybignQ2Fubm90IHN0b3JlIHVzZXIgcHJlZmVyZW5jZXMgYXMgeW91ciBicm93c2VyIGRvIG5vdCBzdXBwb3J0IGxvY2FsIHN0b3JhZ2UnKTtcblx0ICBcdFx0cmV0dXJuIGZhbHNlO1x0XG4gICAgXHR9LFxuXG5cdCAgXHRjbGVhclN0b3JhZ2U6IGZ1bmN0aW9uKCl7XG5cdCAgXHRcdGlmKCF0aGlzLmNoZWNrTG9jYWxTdG9yYWdlKSByZXR1cm5cblx0ICAgICAgICBmb3IgKHZhciBwcm9wIGluIHNlc3Npb25TdG9yYWdlKXtcblx0ICAgICAgICAgICAgZGVsZXRlIHNlc3Npb25TdG9yYWdlW3Byb3BdO1xuXHQgICAgICAgIH1cblx0ICAgIH0sXG5cblx0ICAgIG11c3RCZVN0b3JlZDogZnVuY3Rpb24gKGl0ZW0pe1xuXHQgICAgICAgIGlmKGl0ZW0udHlwZSA9PT0gJ3RleHQnIHx8IGl0ZW0udHlwZSA9PT0gJ2VtYWlsJ3x8IGl0ZW0udHlwZSA9PT0gJ3NlbGVjdC1vbmUnICl7XG5cdCAgICAgICAgICAgIHJldHVybiB0cnVlO1xuXHQgICAgICAgIH1cblx0ICAgICAgICByZXR1cm4gZmFsc2U7XG5cdCAgICB9LFxuXG5cdCAgICBzdG9yZTogZnVuY3Rpb24gKGtleSwgdmFsdWUpe1xuXHQgICAgICAgIGlmKCF0aGlzLmNoZWNrTG9jYWxTdG9yYWdlKSByZXR1cm5cblx0ICAgICAgICBzZXNzaW9uU3RvcmFnZS5zZXRJdGVtKGtleSwgdmFsdWUpOyAgICBcblx0ICAgIH0sXG5cblx0ICAgIC8qXG5cdCAgICBzdXBwb3J0cyBoaXN0b3J5IEFQST9cblx0ICAgICAqL1xuXHQgICAgc3VwcG9ydHNfaGlzdG9yeV9hcGk6IGZ1bmN0aW9uKCkge1xuXHRcdCAgaWYgKCF3aW5kb3cuaGlzdG9yeSAmJiAhaGlzdG9yeS5wdXNoU3RhdGUpe1xuXHRcdCAgXHR0aGlzLndhcm4oJ1lvdXIgYnJvd3NlciBub3Qgc3VwcG9ydCBIaXN0b3J5IEFQSScpO1xuXHRcdCAgXHRyZXR1cm4gZmFsc2U7XG5cdFx0ICB9XG5cdFx0ICByZXR1cm4gdHJ1ZTtcblx0XHR9LFxuXG5cdFx0LyoqXG5cdFx0ICogZXJyb3IgaGFuZGxpbmdcblx0XHQgKi9cblx0XHRcblx0XHRmYWlsOiBmdW5jdGlvbih0aGluZykge1xuXHRcdCBcdHRocm93IG5ldyBFcnJvcih0aGluZyk7XG5cdFx0fSxcblxuXHRcdHdhcm46IGZ1bmN0aW9uKHRoaW5nKSB7XG5cdFx0IFx0Y29uc29sZS5sb2coW1wiV0FSTklORzpcIiwgdGhpbmddLmpvaW4oJyAnKSk7XG5cdFx0fSxcblxuXHRcdG5vdGU6IGZ1bmN0aW9uKHRoaW5nKSB7XG5cdFx0IFx0Y29uc29sZS5sb2coW1wiTk9URTpcIiwgdGhpbmddLmpvaW4oJyAnKSk7XG5cdFx0fVxuXHR9XG59XG5cblxuIiwidmFyIFV0aWxzID0gcmVxdWlyZSgndXRpbHMnKTtcbnZhciB1dGlscyA9IFV0aWxzLmNhbGwodGhpcyk7XG5cbnZhciB3ZWJTb2NrZXRNYW5hZ2VyID0gcmVxdWlyZSgnLi93ZWJTb2NrZXRNYW5hZ2VyLmpzJykoKVxudmFyIHRpbWVPdXRCb3R0b21NZW51ID0gbnVsbDtcblxuZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBldmVudEhhbmRsZXIsIGZhbHNlKTtcblxudmFyIGFjdGlvbnMgPSB7XG5cdCdvcGVuTWVudSc6IGZ1bmN0aW9uKHRhcmdldCl7XG4gICAgICAgIHZhciBmb290ZXIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdmb290ZXInKTtcblxuICAgICAgICBpZih0aW1lT3V0Qm90dG9tTWVudSl7XG4gICAgICAgICAgICAgd2luZG93LmNsZWFyVGltZW91dCh0aW1lT3V0Qm90dG9tTWVudSk7XG4gICAgICAgIH1cblxuICAgICAgICB1dGlscy5hZGRDbGFzcyh0YXJnZXQsICdhY3RpdmUnKSA7XG4gICAgICAgIHV0aWxzLnRvZ2dsZUNsYXNzKGZvb3RlciwgXCJmb290ZXJTY2FsZVwiKTtcblxuICAgICAgICB0aW1lT3V0Qm90dG9tTWVudSA9IHdpbmRvdy5zZXRUaW1lb3V0KGFjdGlvbnNbJ2Nsb3NlTWVudSddLmJpbmQodGFyZ2V0KSwgNTAwMCk7XG5cdH0sXG5cdCdjbG9zZU1lbnUnOiBmdW5jdGlvbigpe1xuXHRcdHZhciBtZW51ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignZm9vdGVyJyk7XG5cbiAgICAgICAgaWYgKHV0aWxzLmhhc0NsYXNzKG1lbnUsICdmb290ZXJTY2FsZScpKSB7XG4gICAgICAgICAgICBhY3Rpb25zWydvcGVuTWVudSddKHRoaXMpO1xuICAgICAgICAgICAgdXRpbHMucmVtb3ZlQ2xhc3MoZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5qcy1mb290ZXJNZW51XCIpLCAnYWN0aXZlJyk7XG4gICAgICAgIH1cblx0fVxufVxuXG5mdW5jdGlvbiBldmVudEhhbmRsZXIoZSl7XG5cdHZhciB0YXJnZXQgPSBlLnRhcmdldFxuXHRcdCwgaWQgPSB0YXJnZXQuaWQgfHwgbnVsbFxuXHRcdCwgbGlicmFyeSA9IHRhcmdldC5nZXRBdHRyaWJ1dGUoJ2RhdGEtbGluaycpIHx8IG51bGxcblx0XG5cdGUucHJldmVudERlZmF1bHQoKTtcblx0XG5cdGlmKGxpYnJhcnkpIHtcdFxuXHRcdCB3ZWJTb2NrZXRNYW5hZ2VyLnJlc3RhcnQobGlicmFyeSk7XG5cdH1lbHNlIGlmKGFjdGlvbnNbaWRdKXtcblx0XHRhY3Rpb25zW2lkXShlLnRhcmdldClcblx0fVxufVxuXG4iLCJhcmd1bWVudHNbNF1bXCIvVXNlcnMvam9zZXAvRG9jdW1lbnRzL3dvcmsvcGVyZS9ub2RlX21vZHVsZXMvdXRpbHMvaW5kZXguanNcIl1bMF0uYXBwbHkoZXhwb3J0cyxhcmd1bWVudHMpIiwiJ3VzZSBzdHJpY3QnXG52YXIgVXRpbHMgPSByZXF1aXJlKCcuL3V0aWxzLmpzJyk7XG52YXIgdXRpbHMgPSBVdGlscy5jYWxsKHRoaXMpO1xudmFyIGNvbmZpZyA9IHJlcXVpcmUoJy4uL2NvbmZpZy5qcycpXG5cbnZhciB3cmFwcGVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3dyYXBwZXInKVxudmFyIGRvbUltZyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyN3cmFwcGVyIGltZycpXG5cbnZhciByZW1vdGUgPSAnd3M6Ly9sb2NhbGhvc3Q6JyArIGNvbmZpZy5XU1BPUlQ7XG52YXIgaW50ZXJ2YWxUaW1lID0gY29uZmlnLmludGVydmFsVGltZTsgXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oKXtcblxuXHR2YXIgcHJvdG8gPSB7XG5cblx0XHRpbml0OiBmdW5jdGlvbigpe1xuXG5cdFx0XHR2YXIgcyA9IHRoaXMuX3NvY2tldCA9IG5ldyBXZWJTb2NrZXQocmVtb3RlKTtcblx0XHRcdHMub25tZXNzYWdlID0gZnVuY3Rpb24oZSkge1xuXHRcdCBcdFx0Ly8gaWYgKGUuZGF0YSA9PSAnb2snKSB7Ly9zdGFydCBhc2tpbmcgcGhvdG9zXG5cdCBcdFx0XHRpZighdGhpcy5pbnRlcnZhbElkKXtcblx0IFx0XHRcdFx0dGhpcy5pbnRlcnZhbElkID0gd2luZG93LnNldEludGVydmFsKGZ1bmN0aW9uKCl7XG5cdFx0XHRcdFx0XHRzLnNlbmQoSlNPTi5zdHJpbmdpZnkoe1xuXHRcdFx0XHRcdFx0XHRhY3Rpb246J25leHQnXG5cdFx0XHRcdFx0XHR9KSlcblx0XHRcdFx0XHR9LCBpbnRlcnZhbFRpbWUpO1x0XG5cdCBcdFx0XHR9IFxuXHRcdCAgXHRcdGNyZWF0ZUltYWdlKGUuZGF0YSlcblx0XHRcdH1cblxuXHRcdFx0cy5vbm9wZW4gPSBmdW5jdGlvbihlKSB7XG5cdFx0IFx0XHRzLnNlbmQoSlNPTi5zdHJpbmdpZnkoe1xuXHRcdCBcdFx0XHRhY3Rpb246J2xvYWQnLFxuXHRcdCBcdFx0XHRsaWJyYXJ5OiBsaWJyYXJ5XG5cdFx0IFx0XHR9KSlcblx0XHRcdH1cblxuXHRcdFx0cy5vbmNsb3NlID0gZnVuY3Rpb24oKXtcblx0XHRcdFx0Y29uc29sZS5sb2coJ2Nsb3NlZCBzb2NrZXQnKVxuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIHRoaXM7XG5cdFx0fSxcblx0XHRyZXN0YXJ0IDogZnVuY3Rpb24gKGxpYnJhcnkpe1xuXHRcdFx0Ly93aW5kb3cuY2xlYXJJbnRlcnZhbCh0aGlzLmludGVydmFsSWQpXG5cdFx0XHR0aGlzLl9zZW5kKHtcblx0IFx0XHRcdGFjdGlvbjonbG9hZCcsXG5cdCBcdFx0XHRsaWJyYXJ5OiBsaWJyYXJ5XG5cdCBcdFx0fSlcblx0XHR9LFxuXHRcdF9zZW5kOiBmdW5jdGlvbiAobXNnKXtcblx0XHRcdHRoaXMuX3NvY2tldC5zZW5kKEpTT04uc3RyaW5naWZ5KG1zZykpXG5cdFx0fVxuXHR9XG5cblx0ZnVuY3Rpb24gY3JlYXRlSW1hZ2UgKGJsb2IpIHtcblx0XHQvLyBib2R5Li4uXG5cdFx0dmFyIHVybENyZWF0b3IgPSB3aW5kb3cuVVJMIHx8IHdpbmRvdy53ZWJraXRVUkxcblx0XHRcdCxpbWFnZVVybCA9IHVybENyZWF0b3IuY3JlYXRlT2JqZWN0VVJMKGJsb2IpXG5cdCAgICAgICAgLGltZyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJpbWdcIik7XG5cdCAgICBcblx0ICAgIHJlbmRlckltYWdlKGltYWdlVXJsKVxuXHR9XG5cblx0ZnVuY3Rpb24gcmVuZGVySW1hZ2UoaW1nVXJsKXsgXG5cdFx0dXRpbHMudG9nZ2xlQ2xhc3MoZG9tSW1nLCAnaGlkZScpO1xuXHRcdGRvbUltZy5zcmMgPSBpbWdVcmw7XG5cdFx0dXRpbHMucmVtb3ZlQ2xhc3MoZG9tSW1nLCAnaGlkZScpO1xuXHR9XG5cblx0dmFyIHNvY2tldCA9IE9iamVjdC5jcmVhdGUocHJvdG8pXG5cdFxuXHRyZXR1cm4gc29ja2V0LmluaXQoKTtcbn1cbiIsIi8vIHNoaW0gZm9yIHVzaW5nIHByb2Nlc3MgaW4gYnJvd3NlclxuXG52YXIgcHJvY2VzcyA9IG1vZHVsZS5leHBvcnRzID0ge307XG52YXIgcXVldWUgPSBbXTtcbnZhciBkcmFpbmluZyA9IGZhbHNlO1xuXG5mdW5jdGlvbiBkcmFpblF1ZXVlKCkge1xuICAgIGlmIChkcmFpbmluZykge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGRyYWluaW5nID0gdHJ1ZTtcbiAgICB2YXIgY3VycmVudFF1ZXVlO1xuICAgIHZhciBsZW4gPSBxdWV1ZS5sZW5ndGg7XG4gICAgd2hpbGUobGVuKSB7XG4gICAgICAgIGN1cnJlbnRRdWV1ZSA9IHF1ZXVlO1xuICAgICAgICBxdWV1ZSA9IFtdO1xuICAgICAgICB2YXIgaSA9IC0xO1xuICAgICAgICB3aGlsZSAoKytpIDwgbGVuKSB7XG4gICAgICAgICAgICBjdXJyZW50UXVldWVbaV0oKTtcbiAgICAgICAgfVxuICAgICAgICBsZW4gPSBxdWV1ZS5sZW5ndGg7XG4gICAgfVxuICAgIGRyYWluaW5nID0gZmFsc2U7XG59XG5wcm9jZXNzLm5leHRUaWNrID0gZnVuY3Rpb24gKGZ1bikge1xuICAgIHF1ZXVlLnB1c2goZnVuKTtcbiAgICBpZiAoIWRyYWluaW5nKSB7XG4gICAgICAgIHNldFRpbWVvdXQoZHJhaW5RdWV1ZSwgMCk7XG4gICAgfVxufTtcblxucHJvY2Vzcy50aXRsZSA9ICdicm93c2VyJztcbnByb2Nlc3MuYnJvd3NlciA9IHRydWU7XG5wcm9jZXNzLmVudiA9IHt9O1xucHJvY2Vzcy5hcmd2ID0gW107XG5wcm9jZXNzLnZlcnNpb24gPSAnJzsgLy8gZW1wdHkgc3RyaW5nIHRvIGF2b2lkIHJlZ2V4cCBpc3N1ZXNcblxuZnVuY3Rpb24gbm9vcCgpIHt9XG5cbnByb2Nlc3Mub24gPSBub29wO1xucHJvY2Vzcy5hZGRMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLm9uY2UgPSBub29wO1xucHJvY2Vzcy5vZmYgPSBub29wO1xucHJvY2Vzcy5yZW1vdmVMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLnJlbW92ZUFsbExpc3RlbmVycyA9IG5vb3A7XG5wcm9jZXNzLmVtaXQgPSBub29wO1xuXG5wcm9jZXNzLmJpbmRpbmcgPSBmdW5jdGlvbiAobmFtZSkge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5iaW5kaW5nIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn07XG5cbi8vIFRPRE8oc2h0eWxtYW4pXG5wcm9jZXNzLmN3ZCA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuICcvJyB9O1xucHJvY2Vzcy5jaGRpciA9IGZ1bmN0aW9uIChkaXIpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuY2hkaXIgaXMgbm90IHN1cHBvcnRlZCcpO1xufTtcbnByb2Nlc3MudW1hc2sgPSBmdW5jdGlvbigpIHsgcmV0dXJuIDA7IH07XG4iXX0=
