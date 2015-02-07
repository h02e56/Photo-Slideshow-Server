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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3Vzci9sb2NhbC9saWIvbm9kZV9tb2R1bGVzL3dhdGNoaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJjb25maWcuanMiLCJub2RlX21vZHVsZXMvdXRpbHMvaW5kZXguanMiLCJwdWJsaWMvYXBwLmpzIiwicHVibGljL3dlYlNvY2tldE1hbmFnZXIuanMiLCIuLi8uLi8uLi8uLi8uLi91c3IvbG9jYWwvbGliL25vZGVfbW9kdWxlcy93YXRjaGlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvcHJvY2Vzcy9icm93c2VyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOztBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDN0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIm1vZHVsZS5leHBvcnRzID0ge1xuXHRQT1JUOiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgPT09ICdwcm9kdWN0aW9uJyA/IDgwIDogMzAwMCksXG5cdFdTUE9SVDogKHByb2Nlc3MuZW52Lk5PREVfRU5WID09PSAncHJvZHVjdGlvbicgPyA4MCA6IDgwODApLFxuXHRwaG90b3NQYXRoOiAnLi9maWxlcy8nLC8vc2hvdWQgY2hhbmdlIHRvIHlvdXIgcGF0aFxuXHRpbnRlcnZhbFRpbWU6IDcwMDAsXG5cdGJhY2tncm91bmQ6IHRydWVcbn0iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCl7XG5cblx0cmV0dXJuIHtcblx0XHRleHRlbmQ6IGZ1bmN0aW9uKCBkZWZhdWx0cywgb3B0aW9ucyApIHtcblx0ICAgICAgICB2YXIgZXh0ZW5kZWQgPSB7fTtcblx0ICAgICAgICB2YXIgcHJvcDtcblx0ICAgICAgICBmb3IgKHByb3AgaW4gZGVmYXVsdHMpIHtcblx0ICAgICAgICAgICAgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChkZWZhdWx0cywgcHJvcCkpIHtcblx0ICAgICAgICAgICAgICAgIGV4dGVuZGVkW3Byb3BdID0gZGVmYXVsdHNbcHJvcF07XG5cdCAgICAgICAgICAgIH1cblx0ICAgICAgICB9XG5cdCAgICAgICAgZm9yIChwcm9wIGluIG9wdGlvbnMpIHtcblx0ICAgICAgICAgICAgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvcHRpb25zLCBwcm9wKSkge1xuXHQgICAgICAgICAgICAgICAgZXh0ZW5kZWRbcHJvcF0gPSBvcHRpb25zW3Byb3BdO1xuXHQgICAgICAgICAgICB9XG5cdCAgICAgICAgfVxuXHQgICAgICAgIHJldHVybiBleHRlbmRlZDtcblx0ICAgIH0sXG5cblx0ICAgIHN1cHBvcnRzX2hpc3RvcnlfYXBpIDogZnVuY3Rpb24gKCkge1xuIFx0IFx0XHRyZXR1cm4gISEod2luZG93Lmhpc3RvcnkgJiYgaGlzdG9yeS5wdXNoU3RhdGUpO1xuXHRcdH0sXG5cdFx0XG5cdCAgICBoYXNDbGFzczogZnVuY3Rpb24gKGVsZW0sIGNsYXNzTmFtZSkge1xuXHQgICAgICAgIHJldHVybiBuZXcgUmVnRXhwKCcgJyArIGNsYXNzTmFtZSArICcgJykudGVzdCgnICcgKyBlbGVtLmNsYXNzTmFtZSArICcgJyk7XG5cdCAgICB9LFxuXG5cdCAgICBhZGRDbGFzczogZnVuY3Rpb24gKGVsZW0sIGNsYXNzTmFtZSkge1xuXHQgICAgICAgIGlmICghdGhpcy5oYXNDbGFzcyhlbGVtLCBjbGFzc05hbWUpKSB7XG5cdCAgICAgICAgICAgIGVsZW0uY2xhc3NOYW1lICs9ICcgJyArIGNsYXNzTmFtZTtcblx0ICAgICAgICB9XG5cdCAgICB9LFxuXG5cdCAgICByZW1vdmVDbGFzcyA6IGZ1bmN0aW9uIChlbGVtLCBjbGFzc05hbWUpIHtcblx0ICAgICAgICB2YXIgbmV3Q2xhc3MgPSAnICcgKyBlbGVtLmNsYXNzTmFtZS5yZXBsYWNlKCAvW1xcdFxcclxcbl0vZywgJyAnKSArICcgJztcblxuXHQgICAgICAgIGlmICh0aGlzLmhhc0NsYXNzKGVsZW0sIGNsYXNzTmFtZSkpIHtcblx0ICAgICAgICAgICAgd2hpbGUgKG5ld0NsYXNzLmluZGV4T2YoJyAnICsgY2xhc3NOYW1lICsgJyAnKSA+PSAwICkge1xuXHQgICAgICAgICAgICAgICAgbmV3Q2xhc3MgPSBuZXdDbGFzcy5yZXBsYWNlKCcgJyArIGNsYXNzTmFtZSArICcgJywgJyAnKTtcblx0ICAgICAgICAgICAgfVxuXHQgICAgICAgICAgICBlbGVtLmNsYXNzTmFtZSA9IG5ld0NsYXNzLnJlcGxhY2UoL15cXHMrfFxccyskL2csICcnKTtcblx0ICAgICAgICB9XG5cdCAgICB9LFxuXG5cdCAgICB0b2dnbGVDbGFzczogZnVuY3Rpb24oZWxlbSwgY2xhc3NOYW1lKXtcblx0ICAgICAgICBpZih0aGlzLmhhc0NsYXNzKGVsZW0sIGNsYXNzTmFtZSkpe1xuXHQgICAgICAgICAgICB0aGlzLnJlbW92ZUNsYXNzKGVsZW0sIGNsYXNzTmFtZSk7XG5cdCAgICAgICAgICAgIHJldHVybjtcblx0ICAgICAgICB9XG5cdCAgICAgICAgdGhpcy5hZGRDbGFzcyhlbGVtLCBjbGFzc05hbWUpXG5cdCAgICB9LFxuXG5cdCAgICB0b2dnbGVDaGVja2JveDogZnVuY3Rpb24oZWxlbSl7XG5cblx0ICAgIFx0dmFyIGNoZWNrID0gZWxlbS5nZXRBdHRyaWJ1dGUoJ2NoZWNrZWQnKVxuXHQgICAgXHRcdCwgbmV3U3RhdGUgPSAoY2hlY2sgPT09ICd0cnVlJykgPyAnZmFsc2UnIDogJ3RydWUnO1xuXHQgICAgXHQobmV3U3RhdGUgPT09ICd0cnVlJykgPyBlbGVtLnNldEF0dHJpYnV0ZSgnY2hlY2tlZCcsIG5ld1N0YXRlKSA6IGVsZW0ucmVtb3ZlQXR0cmlidXRlKCdjaGVja2VkJyk7XG5cdCAgICB9LFxuXG5cdCAgICB0b0FycmF5OiBmdW5jdGlvbihhcmd1bWVudHMpe1xuXHQgICAgXHRyZXR1cm4gIEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cyk7XG5cdCAgICB9LFxuXG5cdCAgICAvKlxuXHQgICAgc3VwcG9ydHMgaGlzdG9yeSBBUEk/XG5cdCAgICAgKi9cblx0ICAgIGNoZWNrTG9jYWxTdG9yYWdlOiBmdW5jdGlvbigpIHtcblx0ICAgICAgICBpZignbG9jYWxTdG9yYWdlJyBpbiB3aW5kb3cgJiYgd2luZG93Wydsb2NhbFN0b3JhZ2UnXSAhPT0gbnVsbCkge1xuXHRcdCAgICAgICAgcmV0dXJuIHRydWVcblx0ICAgICAgICB9ICAgICAgICBcblx0ICBcdFx0dGhpcy53YXJuKCdDYW5ub3Qgc3RvcmUgdXNlciBwcmVmZXJlbmNlcyBhcyB5b3VyIGJyb3dzZXIgZG8gbm90IHN1cHBvcnQgbG9jYWwgc3RvcmFnZScpO1xuXHQgIFx0XHRyZXR1cm4gZmFsc2U7XHRcbiAgICBcdH0sXG5cblx0ICBcdGNsZWFyU3RvcmFnZTogZnVuY3Rpb24oKXtcblx0ICBcdFx0aWYoIXRoaXMuY2hlY2tMb2NhbFN0b3JhZ2UpIHJldHVyblxuXHQgICAgICAgIGZvciAodmFyIHByb3AgaW4gc2Vzc2lvblN0b3JhZ2Upe1xuXHQgICAgICAgICAgICBkZWxldGUgc2Vzc2lvblN0b3JhZ2VbcHJvcF07XG5cdCAgICAgICAgfVxuXHQgICAgfSxcblxuXHQgICAgbXVzdEJlU3RvcmVkOiBmdW5jdGlvbiAoaXRlbSl7XG5cdCAgICAgICAgaWYoaXRlbS50eXBlID09PSAndGV4dCcgfHwgaXRlbS50eXBlID09PSAnZW1haWwnfHwgaXRlbS50eXBlID09PSAnc2VsZWN0LW9uZScgKXtcblx0ICAgICAgICAgICAgcmV0dXJuIHRydWU7XG5cdCAgICAgICAgfVxuXHQgICAgICAgIHJldHVybiBmYWxzZTtcblx0ICAgIH0sXG5cblx0ICAgIHN0b3JlOiBmdW5jdGlvbiAoa2V5LCB2YWx1ZSl7XG5cdCAgICAgICAgaWYoIXRoaXMuY2hlY2tMb2NhbFN0b3JhZ2UpIHJldHVyblxuXHQgICAgICAgIHNlc3Npb25TdG9yYWdlLnNldEl0ZW0oa2V5LCB2YWx1ZSk7ICAgIFxuXHQgICAgfSxcblxuXHQgICAgLypcblx0ICAgIHN1cHBvcnRzIGhpc3RvcnkgQVBJP1xuXHQgICAgICovXG5cdCAgICBzdXBwb3J0c19oaXN0b3J5X2FwaTogZnVuY3Rpb24oKSB7XG5cdFx0ICBpZiAoIXdpbmRvdy5oaXN0b3J5ICYmICFoaXN0b3J5LnB1c2hTdGF0ZSl7XG5cdFx0ICBcdHRoaXMud2FybignWW91ciBicm93c2VyIG5vdCBzdXBwb3J0IEhpc3RvcnkgQVBJJyk7XG5cdFx0ICBcdHJldHVybiBmYWxzZTtcblx0XHQgIH1cblx0XHQgIHJldHVybiB0cnVlO1xuXHRcdH0sXG5cblx0XHQvKipcblx0XHQgKiBlcnJvciBoYW5kbGluZ1xuXHRcdCAqL1xuXHRcdFxuXHRcdGZhaWw6IGZ1bmN0aW9uKHRoaW5nKSB7XG5cdFx0IFx0dGhyb3cgbmV3IEVycm9yKHRoaW5nKTtcblx0XHR9LFxuXG5cdFx0d2FybjogZnVuY3Rpb24odGhpbmcpIHtcblx0XHQgXHRjb25zb2xlLmxvZyhbXCJXQVJOSU5HOlwiLCB0aGluZ10uam9pbignICcpKTtcblx0XHR9LFxuXG5cdFx0bm90ZTogZnVuY3Rpb24odGhpbmcpIHtcblx0XHQgXHRjb25zb2xlLmxvZyhbXCJOT1RFOlwiLCB0aGluZ10uam9pbignICcpKTtcblx0XHR9XG5cdH1cbn1cblxuXG4iLCJ2YXIgVXRpbHMgPSByZXF1aXJlKCd1dGlscycpO1xudmFyIHV0aWxzID0gVXRpbHMuY2FsbCh0aGlzKTtcblxudmFyIHdlYlNvY2tldE1hbmFnZXIgPSByZXF1aXJlKCcuL3dlYlNvY2tldE1hbmFnZXIuanMnKSgpXG52YXIgdGltZU91dEJvdHRvbU1lbnUgPSBudWxsO1xuXG5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGV2ZW50SGFuZGxlciwgZmFsc2UpO1xuXG52YXIgYWN0aW9ucyA9IHtcblx0J29wZW5NZW51JzogZnVuY3Rpb24odGFyZ2V0KXtcbiAgICAgICAgdmFyIGZvb3RlciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2Zvb3RlcicpO1xuXG4gICAgICAgIGlmKHRpbWVPdXRCb3R0b21NZW51KXtcbiAgICAgICAgICAgICB3aW5kb3cuY2xlYXJUaW1lb3V0KHRpbWVPdXRCb3R0b21NZW51KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHV0aWxzLmFkZENsYXNzKHRhcmdldCwgJ2FjdGl2ZScpIDtcbiAgICAgICAgdXRpbHMudG9nZ2xlQ2xhc3MoZm9vdGVyLCBcImZvb3RlclNjYWxlXCIpO1xuXG4gICAgICAgIHRpbWVPdXRCb3R0b21NZW51ID0gd2luZG93LnNldFRpbWVvdXQoYWN0aW9uc1snY2xvc2VNZW51J10uYmluZCh0YXJnZXQpLCA1MDAwKTtcblx0fSxcblx0J2Nsb3NlTWVudSc6IGZ1bmN0aW9uKCl7XG5cdFx0dmFyIG1lbnUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdmb290ZXInKTtcblxuICAgICAgICBpZiAodXRpbHMuaGFzQ2xhc3MobWVudSwgJ2Zvb3RlclNjYWxlJykpIHtcbiAgICAgICAgICAgIGFjdGlvbnNbJ29wZW5NZW51J10odGhpcyk7XG4gICAgICAgICAgICB1dGlscy5yZW1vdmVDbGFzcyhkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLmpzLWZvb3Rlck1lbnVcIiksICdhY3RpdmUnKTtcbiAgICAgICAgfVxuXHR9XG59XG5cbmZ1bmN0aW9uIGV2ZW50SGFuZGxlcihlKXtcblx0dmFyIHRhcmdldCA9IGUudGFyZ2V0XG5cdFx0LCBpZCA9IHRhcmdldC5pZCB8fCBudWxsXG5cdFx0LCBsaWJyYXJ5ID0gdGFyZ2V0LmdldEF0dHJpYnV0ZSgnZGF0YS1saW5rJykgfHwgbnVsbFxuXHRcblx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcblx0aWYobGlicmFyeSkge1x0XG5cdFx0IHdlYlNvY2tldE1hbmFnZXIucmVzdGFydChsaWJyYXJ5KTtcblx0fWVsc2UgaWYoYWN0aW9uc1tpZF0pe1xuXHRcdGFjdGlvbnNbaWRdKGUudGFyZ2V0KVxuXHR9XG59XG5cbiIsIid1c2Ugc3RyaWN0J1xudmFyIFV0aWxzID0gcmVxdWlyZSgnLi91dGlscy5qcycpO1xudmFyIHV0aWxzID0gVXRpbHMuY2FsbCh0aGlzKTtcbnZhciBjb25maWcgPSByZXF1aXJlKCcuLi9jb25maWcuanMnKVxuXG52YXIgd3JhcHBlciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd3cmFwcGVyJylcbnZhciBkb21JbWcgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjd3JhcHBlciBpbWcnKVxuXG52YXIgcmVtb3RlID0gJ3dzOi8vbG9jYWxob3N0OicgKyBjb25maWcuV1NQT1JUO1xudmFyIGludGVydmFsVGltZSA9IGNvbmZpZy5pbnRlcnZhbFRpbWU7IFxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCl7XG5cblx0dmFyIHByb3RvID0ge1xuXG5cdFx0aW5pdDogZnVuY3Rpb24oKXtcblxuXHRcdFx0dmFyIHMgPSB0aGlzLl9zb2NrZXQgPSBuZXcgV2ViU29ja2V0KHJlbW90ZSk7XG5cdFx0XHRzLm9ubWVzc2FnZSA9IGZ1bmN0aW9uKGUpIHtcblx0XHQgXHRcdC8vIGlmIChlLmRhdGEgPT0gJ29rJykgey8vc3RhcnQgYXNraW5nIHBob3Rvc1xuXHQgXHRcdFx0aWYoIXRoaXMuaW50ZXJ2YWxJZCl7XG5cdCBcdFx0XHRcdHRoaXMuaW50ZXJ2YWxJZCA9IHdpbmRvdy5zZXRJbnRlcnZhbChmdW5jdGlvbigpe1xuXHRcdFx0XHRcdFx0cy5zZW5kKEpTT04uc3RyaW5naWZ5KHtcblx0XHRcdFx0XHRcdFx0YWN0aW9uOiduZXh0J1xuXHRcdFx0XHRcdFx0fSkpXG5cdFx0XHRcdFx0fSwgaW50ZXJ2YWxUaW1lKTtcdFxuXHQgXHRcdFx0fSBcblx0XHQgIFx0XHRjcmVhdGVJbWFnZShlLmRhdGEpXG5cdFx0XHR9XG5cblx0XHRcdHMub25vcGVuID0gZnVuY3Rpb24oZSkge1xuXHRcdCBcdFx0cy5zZW5kKEpTT04uc3RyaW5naWZ5KHtcblx0XHQgXHRcdFx0YWN0aW9uOidsb2FkJyxcblx0XHQgXHRcdFx0bGlicmFyeTogbGlicmFyeVxuXHRcdCBcdFx0fSkpXG5cdFx0XHR9XG5cblx0XHRcdHMub25jbG9zZSA9IGZ1bmN0aW9uKCl7XG5cdFx0XHRcdGNvbnNvbGUubG9nKCdjbG9zZWQgc29ja2V0Jylcblx0XHRcdH1cblx0XHRcdHJldHVybiB0aGlzO1xuXHRcdH0sXG5cdFx0cmVzdGFydCA6IGZ1bmN0aW9uIChsaWJyYXJ5KXtcblx0XHRcdC8vd2luZG93LmNsZWFySW50ZXJ2YWwodGhpcy5pbnRlcnZhbElkKVxuXHRcdFx0dGhpcy5fc2VuZCh7XG5cdCBcdFx0XHRhY3Rpb246J2xvYWQnLFxuXHQgXHRcdFx0bGlicmFyeTogbGlicmFyeVxuXHQgXHRcdH0pXG5cdFx0fSxcblx0XHRfc2VuZDogZnVuY3Rpb24gKG1zZyl7XG5cdFx0XHR0aGlzLl9zb2NrZXQuc2VuZChKU09OLnN0cmluZ2lmeShtc2cpKVxuXHRcdH1cblx0fVxuXG5cdGZ1bmN0aW9uIGNyZWF0ZUltYWdlIChibG9iKSB7XG5cdFx0Ly8gYm9keS4uLlxuXHRcdHZhciB1cmxDcmVhdG9yID0gd2luZG93LlVSTCB8fCB3aW5kb3cud2Via2l0VVJMXG5cdFx0XHQsaW1hZ2VVcmwgPSB1cmxDcmVhdG9yLmNyZWF0ZU9iamVjdFVSTChibG9iKVxuXHQgICAgICAgICxpbWcgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiaW1nXCIpO1xuXHQgICAgXG5cdCAgICByZW5kZXJJbWFnZShpbWFnZVVybClcblx0fVxuXG5cdGZ1bmN0aW9uIHJlbmRlckltYWdlKGltZ1VybCl7IFxuXHRcdHV0aWxzLnRvZ2dsZUNsYXNzKGRvbUltZywgJ2hpZGUnKTtcblx0XHRkb21JbWcuc3JjID0gaW1nVXJsO1xuXHRcdHV0aWxzLnJlbW92ZUNsYXNzKGRvbUltZywgJ2hpZGUnKTtcblx0fVxuXG5cdHZhciBzb2NrZXQgPSBPYmplY3QuY3JlYXRlKHByb3RvKVxuXHRcblx0cmV0dXJuIHNvY2tldC5pbml0KCk7XG59XG4iLCIvLyBzaGltIGZvciB1c2luZyBwcm9jZXNzIGluIGJyb3dzZXJcblxudmFyIHByb2Nlc3MgPSBtb2R1bGUuZXhwb3J0cyA9IHt9O1xudmFyIHF1ZXVlID0gW107XG52YXIgZHJhaW5pbmcgPSBmYWxzZTtcblxuZnVuY3Rpb24gZHJhaW5RdWV1ZSgpIHtcbiAgICBpZiAoZHJhaW5pbmcpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBkcmFpbmluZyA9IHRydWU7XG4gICAgdmFyIGN1cnJlbnRRdWV1ZTtcbiAgICB2YXIgbGVuID0gcXVldWUubGVuZ3RoO1xuICAgIHdoaWxlKGxlbikge1xuICAgICAgICBjdXJyZW50UXVldWUgPSBxdWV1ZTtcbiAgICAgICAgcXVldWUgPSBbXTtcbiAgICAgICAgdmFyIGkgPSAtMTtcbiAgICAgICAgd2hpbGUgKCsraSA8IGxlbikge1xuICAgICAgICAgICAgY3VycmVudFF1ZXVlW2ldKCk7XG4gICAgICAgIH1cbiAgICAgICAgbGVuID0gcXVldWUubGVuZ3RoO1xuICAgIH1cbiAgICBkcmFpbmluZyA9IGZhbHNlO1xufVxucHJvY2Vzcy5uZXh0VGljayA9IGZ1bmN0aW9uIChmdW4pIHtcbiAgICBxdWV1ZS5wdXNoKGZ1bik7XG4gICAgaWYgKCFkcmFpbmluZykge1xuICAgICAgICBzZXRUaW1lb3V0KGRyYWluUXVldWUsIDApO1xuICAgIH1cbn07XG5cbnByb2Nlc3MudGl0bGUgPSAnYnJvd3Nlcic7XG5wcm9jZXNzLmJyb3dzZXIgPSB0cnVlO1xucHJvY2Vzcy5lbnYgPSB7fTtcbnByb2Nlc3MuYXJndiA9IFtdO1xucHJvY2Vzcy52ZXJzaW9uID0gJyc7IC8vIGVtcHR5IHN0cmluZyB0byBhdm9pZCByZWdleHAgaXNzdWVzXG5cbmZ1bmN0aW9uIG5vb3AoKSB7fVxuXG5wcm9jZXNzLm9uID0gbm9vcDtcbnByb2Nlc3MuYWRkTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5vbmNlID0gbm9vcDtcbnByb2Nlc3Mub2ZmID0gbm9vcDtcbnByb2Nlc3MucmVtb3ZlTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5yZW1vdmVBbGxMaXN0ZW5lcnMgPSBub29wO1xucHJvY2Vzcy5lbWl0ID0gbm9vcDtcblxucHJvY2Vzcy5iaW5kaW5nID0gZnVuY3Rpb24gKG5hbWUpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuYmluZGluZyBpcyBub3Qgc3VwcG9ydGVkJyk7XG59O1xuXG4vLyBUT0RPKHNodHlsbWFuKVxucHJvY2Vzcy5jd2QgPSBmdW5jdGlvbiAoKSB7IHJldHVybiAnLycgfTtcbnByb2Nlc3MuY2hkaXIgPSBmdW5jdGlvbiAoZGlyKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmNoZGlyIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn07XG5wcm9jZXNzLnVtYXNrID0gZnVuY3Rpb24oKSB7IHJldHVybiAwOyB9O1xuIl19
