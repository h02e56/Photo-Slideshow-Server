(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"/Users/josep/Documents/work/pere/node_modules/domready/ready.js":[function(require,module,exports){
/*!
  * domready (c) Dustin Diaz 2014 - License MIT
  */
!function (name, definition) {

  if (typeof module != 'undefined') module.exports = definition()
  else if (typeof define == 'function' && typeof define.amd == 'object') define(definition)
  else this[name] = definition()

}('domready', function () {

  var fns = [], listener
    , doc = document
    , hack = doc.documentElement.doScroll
    , domContentLoaded = 'DOMContentLoaded'
    , loaded = (hack ? /^loaded|^c/ : /^loaded|^i|^c/).test(doc.readyState)


  if (!loaded)
  doc.addEventListener(domContentLoaded, listener = function () {
    doc.removeEventListener(domContentLoaded, listener)
    loaded = 1
    while (listener = fns.shift()) listener()
  })

  return function (fn) {
    loaded ? fn() : fns.push(fn)
  }

});

},{}],"/Users/josep/Documents/work/pere/node_modules/utils/index.js":[function(require,module,exports){


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



},{}],"/Users/josep/Documents/work/pere/public/index.js":[function(require,module,exports){
'use strict'
var Utils = require('utils');
var utils = Utils.call(this)

var wrapper = document.getElementById('wrapper')
var domImg = document.querySelector('#wrapper img')

var remote = 'ws://localhost:8080';
var intervalTime = 7000; 

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
		interval: { writable:true, configurable:true, value: library },
	})
	return socket;

}

},{"utils":"/Users/josep/Documents/work/pere/node_modules/utils/index.js"}],"/Users/josep/Documents/work/pere/public/test.js":[function(require,module,exports){
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
},{"./":"/Users/josep/Documents/work/pere/public/index.js","domready":"/Users/josep/Documents/work/pere/node_modules/domready/ready.js"}]},{},["/Users/josep/Documents/work/pere/public/test.js"])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9qb3NlcC9sb2NhbC9saWIvbm9kZV9tb2R1bGVzL3dhdGNoaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvam9zZXAvRG9jdW1lbnRzL3dvcmsvcGVyZS9ub2RlX21vZHVsZXMvZG9tcmVhZHkvcmVhZHkuanMiLCIvVXNlcnMvam9zZXAvRG9jdW1lbnRzL3dvcmsvcGVyZS9ub2RlX21vZHVsZXMvdXRpbHMvaW5kZXguanMiLCIvVXNlcnMvam9zZXAvRG9jdW1lbnRzL3dvcmsvcGVyZS9wdWJsaWMvaW5kZXguanMiLCIvVXNlcnMvam9zZXAvRG9jdW1lbnRzL3dvcmsvcGVyZS9wdWJsaWMvdGVzdC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8qIVxuICAqIGRvbXJlYWR5IChjKSBEdXN0aW4gRGlheiAyMDE0IC0gTGljZW5zZSBNSVRcbiAgKi9cbiFmdW5jdGlvbiAobmFtZSwgZGVmaW5pdGlvbikge1xuXG4gIGlmICh0eXBlb2YgbW9kdWxlICE9ICd1bmRlZmluZWQnKSBtb2R1bGUuZXhwb3J0cyA9IGRlZmluaXRpb24oKVxuICBlbHNlIGlmICh0eXBlb2YgZGVmaW5lID09ICdmdW5jdGlvbicgJiYgdHlwZW9mIGRlZmluZS5hbWQgPT0gJ29iamVjdCcpIGRlZmluZShkZWZpbml0aW9uKVxuICBlbHNlIHRoaXNbbmFtZV0gPSBkZWZpbml0aW9uKClcblxufSgnZG9tcmVhZHknLCBmdW5jdGlvbiAoKSB7XG5cbiAgdmFyIGZucyA9IFtdLCBsaXN0ZW5lclxuICAgICwgZG9jID0gZG9jdW1lbnRcbiAgICAsIGhhY2sgPSBkb2MuZG9jdW1lbnRFbGVtZW50LmRvU2Nyb2xsXG4gICAgLCBkb21Db250ZW50TG9hZGVkID0gJ0RPTUNvbnRlbnRMb2FkZWQnXG4gICAgLCBsb2FkZWQgPSAoaGFjayA/IC9ebG9hZGVkfF5jLyA6IC9ebG9hZGVkfF5pfF5jLykudGVzdChkb2MucmVhZHlTdGF0ZSlcblxuXG4gIGlmICghbG9hZGVkKVxuICBkb2MuYWRkRXZlbnRMaXN0ZW5lcihkb21Db250ZW50TG9hZGVkLCBsaXN0ZW5lciA9IGZ1bmN0aW9uICgpIHtcbiAgICBkb2MucmVtb3ZlRXZlbnRMaXN0ZW5lcihkb21Db250ZW50TG9hZGVkLCBsaXN0ZW5lcilcbiAgICBsb2FkZWQgPSAxXG4gICAgd2hpbGUgKGxpc3RlbmVyID0gZm5zLnNoaWZ0KCkpIGxpc3RlbmVyKClcbiAgfSlcblxuICByZXR1cm4gZnVuY3Rpb24gKGZuKSB7XG4gICAgbG9hZGVkID8gZm4oKSA6IGZucy5wdXNoKGZuKVxuICB9XG5cbn0pO1xuIiwiXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oKXtcblxuXHRyZXR1cm4ge1xuXHRcdGV4dGVuZDogZnVuY3Rpb24oIGRlZmF1bHRzLCBvcHRpb25zICkge1xuXHQgICAgICAgIHZhciBleHRlbmRlZCA9IHt9O1xuXHQgICAgICAgIHZhciBwcm9wO1xuXHQgICAgICAgIGZvciAocHJvcCBpbiBkZWZhdWx0cykge1xuXHQgICAgICAgICAgICBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKGRlZmF1bHRzLCBwcm9wKSkge1xuXHQgICAgICAgICAgICAgICAgZXh0ZW5kZWRbcHJvcF0gPSBkZWZhdWx0c1twcm9wXTtcblx0ICAgICAgICAgICAgfVxuXHQgICAgICAgIH1cblx0ICAgICAgICBmb3IgKHByb3AgaW4gb3B0aW9ucykge1xuXHQgICAgICAgICAgICBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9wdGlvbnMsIHByb3ApKSB7XG5cdCAgICAgICAgICAgICAgICBleHRlbmRlZFtwcm9wXSA9IG9wdGlvbnNbcHJvcF07XG5cdCAgICAgICAgICAgIH1cblx0ICAgICAgICB9XG5cdCAgICAgICAgcmV0dXJuIGV4dGVuZGVkO1xuXHQgICAgfSxcblxuXHQgICAgc3VwcG9ydHNfaGlzdG9yeV9hcGkgOiBmdW5jdGlvbiAoKSB7XG4gXHQgXHRcdHJldHVybiAhISh3aW5kb3cuaGlzdG9yeSAmJiBoaXN0b3J5LnB1c2hTdGF0ZSk7XG5cdFx0fSxcblx0XHRcblx0ICAgIGhhc0NsYXNzOiBmdW5jdGlvbiAoZWxlbSwgY2xhc3NOYW1lKSB7XG5cdCAgICAgICAgcmV0dXJuIG5ldyBSZWdFeHAoJyAnICsgY2xhc3NOYW1lICsgJyAnKS50ZXN0KCcgJyArIGVsZW0uY2xhc3NOYW1lICsgJyAnKTtcblx0ICAgIH0sXG5cblx0ICAgIGFkZENsYXNzOiBmdW5jdGlvbiAoZWxlbSwgY2xhc3NOYW1lKSB7XG5cdCAgICAgICAgaWYgKCF0aGlzLmhhc0NsYXNzKGVsZW0sIGNsYXNzTmFtZSkpIHtcblx0ICAgICAgICAgICAgZWxlbS5jbGFzc05hbWUgKz0gJyAnICsgY2xhc3NOYW1lO1xuXHQgICAgICAgIH1cblx0ICAgIH0sXG5cblx0ICAgIHJlbW92ZUNsYXNzIDogZnVuY3Rpb24gKGVsZW0sIGNsYXNzTmFtZSkge1xuXHQgICAgICAgIHZhciBuZXdDbGFzcyA9ICcgJyArIGVsZW0uY2xhc3NOYW1lLnJlcGxhY2UoIC9bXFx0XFxyXFxuXS9nLCAnICcpICsgJyAnO1xuXG5cdCAgICAgICAgaWYgKHRoaXMuaGFzQ2xhc3MoZWxlbSwgY2xhc3NOYW1lKSkge1xuXHQgICAgICAgICAgICB3aGlsZSAobmV3Q2xhc3MuaW5kZXhPZignICcgKyBjbGFzc05hbWUgKyAnICcpID49IDAgKSB7XG5cdCAgICAgICAgICAgICAgICBuZXdDbGFzcyA9IG5ld0NsYXNzLnJlcGxhY2UoJyAnICsgY2xhc3NOYW1lICsgJyAnLCAnICcpO1xuXHQgICAgICAgICAgICB9XG5cdCAgICAgICAgICAgIGVsZW0uY2xhc3NOYW1lID0gbmV3Q2xhc3MucmVwbGFjZSgvXlxccyt8XFxzKyQvZywgJycpO1xuXHQgICAgICAgIH1cblx0ICAgIH0sXG5cblx0ICAgIHRvZ2dsZUNsYXNzOiBmdW5jdGlvbihlbGVtLCBjbGFzc05hbWUpe1xuXHQgICAgICAgIGlmKHRoaXMuaGFzQ2xhc3MoZWxlbSwgY2xhc3NOYW1lKSl7XG5cdCAgICAgICAgICAgIHRoaXMucmVtb3ZlQ2xhc3MoZWxlbSwgY2xhc3NOYW1lKTtcblx0ICAgICAgICAgICAgcmV0dXJuO1xuXHQgICAgICAgIH1cblx0ICAgICAgICB0aGlzLmFkZENsYXNzKGVsZW0sIGNsYXNzTmFtZSlcblx0ICAgIH0sXG5cblx0ICAgIHRvZ2dsZUNoZWNrYm94OiBmdW5jdGlvbihlbGVtKXtcblxuXHQgICAgXHR2YXIgY2hlY2sgPSBlbGVtLmdldEF0dHJpYnV0ZSgnY2hlY2tlZCcpXG5cdCAgICBcdFx0LCBuZXdTdGF0ZSA9IChjaGVjayA9PT0gJ3RydWUnKSA/ICdmYWxzZScgOiAndHJ1ZSc7XG5cdCAgICBcdChuZXdTdGF0ZSA9PT0gJ3RydWUnKSA/IGVsZW0uc2V0QXR0cmlidXRlKCdjaGVja2VkJywgbmV3U3RhdGUpIDogZWxlbS5yZW1vdmVBdHRyaWJ1dGUoJ2NoZWNrZWQnKTtcblx0ICAgIH0sXG5cblx0ICAgIHRvQXJyYXk6IGZ1bmN0aW9uKGFyZ3VtZW50cyl7XG5cdCAgICBcdHJldHVybiAgQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzKTtcblx0ICAgIH0sXG5cblx0ICAgIC8qXG5cdCAgICBzdXBwb3J0cyBoaXN0b3J5IEFQST9cblx0ICAgICAqL1xuXHQgICAgY2hlY2tMb2NhbFN0b3JhZ2U6IGZ1bmN0aW9uKCkge1xuXHQgICAgICAgIGlmKCdsb2NhbFN0b3JhZ2UnIGluIHdpbmRvdyAmJiB3aW5kb3dbJ2xvY2FsU3RvcmFnZSddICE9PSBudWxsKSB7XG5cdFx0ICAgICAgICByZXR1cm4gdHJ1ZVxuXHQgICAgICAgIH0gICAgICAgIFxuXHQgIFx0XHR0aGlzLndhcm4oJ0Nhbm5vdCBzdG9yZSB1c2VyIHByZWZlcmVuY2VzIGFzIHlvdXIgYnJvd3NlciBkbyBub3Qgc3VwcG9ydCBsb2NhbCBzdG9yYWdlJyk7XG5cdCAgXHRcdHJldHVybiBmYWxzZTtcdFxuICAgIFx0fSxcblxuXHQgIFx0Y2xlYXJTdG9yYWdlOiBmdW5jdGlvbigpe1xuXHQgIFx0XHRpZighdGhpcy5jaGVja0xvY2FsU3RvcmFnZSkgcmV0dXJuXG5cdCAgICAgICAgZm9yICh2YXIgcHJvcCBpbiBzZXNzaW9uU3RvcmFnZSl7XG5cdCAgICAgICAgICAgIGRlbGV0ZSBzZXNzaW9uU3RvcmFnZVtwcm9wXTtcblx0ICAgICAgICB9XG5cdCAgICB9LFxuXG5cdCAgICBtdXN0QmVTdG9yZWQ6IGZ1bmN0aW9uIChpdGVtKXtcblx0ICAgICAgICBpZihpdGVtLnR5cGUgPT09ICd0ZXh0JyB8fCBpdGVtLnR5cGUgPT09ICdlbWFpbCd8fCBpdGVtLnR5cGUgPT09ICdzZWxlY3Qtb25lJyApe1xuXHQgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcblx0ICAgICAgICB9XG5cdCAgICAgICAgcmV0dXJuIGZhbHNlO1xuXHQgICAgfSxcblxuXHQgICAgc3RvcmU6IGZ1bmN0aW9uIChrZXksIHZhbHVlKXtcblx0ICAgICAgICBpZighdGhpcy5jaGVja0xvY2FsU3RvcmFnZSkgcmV0dXJuXG5cdCAgICAgICAgc2Vzc2lvblN0b3JhZ2Uuc2V0SXRlbShrZXksIHZhbHVlKTsgICAgXG5cdCAgICB9LFxuXG5cdCAgICAvKlxuXHQgICAgc3VwcG9ydHMgaGlzdG9yeSBBUEk/XG5cdCAgICAgKi9cblx0ICAgIHN1cHBvcnRzX2hpc3RvcnlfYXBpOiBmdW5jdGlvbigpIHtcblx0XHQgIGlmICghd2luZG93Lmhpc3RvcnkgJiYgIWhpc3RvcnkucHVzaFN0YXRlKXtcblx0XHQgIFx0dGhpcy53YXJuKCdZb3VyIGJyb3dzZXIgbm90IHN1cHBvcnQgSGlzdG9yeSBBUEknKTtcblx0XHQgIFx0cmV0dXJuIGZhbHNlO1xuXHRcdCAgfVxuXHRcdCAgcmV0dXJuIHRydWU7XG5cdFx0fSxcblxuXHRcdC8qKlxuXHRcdCAqIGVycm9yIGhhbmRsaW5nXG5cdFx0ICovXG5cdFx0XG5cdFx0ZmFpbDogZnVuY3Rpb24odGhpbmcpIHtcblx0XHQgXHR0aHJvdyBuZXcgRXJyb3IodGhpbmcpO1xuXHRcdH0sXG5cblx0XHR3YXJuOiBmdW5jdGlvbih0aGluZykge1xuXHRcdCBcdGNvbnNvbGUubG9nKFtcIldBUk5JTkc6XCIsIHRoaW5nXS5qb2luKCcgJykpO1xuXHRcdH0sXG5cblx0XHRub3RlOiBmdW5jdGlvbih0aGluZykge1xuXHRcdCBcdGNvbnNvbGUubG9nKFtcIk5PVEU6XCIsIHRoaW5nXS5qb2luKCcgJykpO1xuXHRcdH1cblx0fVxufVxuXG5cbiIsIid1c2Ugc3RyaWN0J1xudmFyIFV0aWxzID0gcmVxdWlyZSgndXRpbHMnKTtcbnZhciB1dGlscyA9IFV0aWxzLmNhbGwodGhpcylcblxudmFyIHdyYXBwZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnd3JhcHBlcicpXG52YXIgZG9tSW1nID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI3dyYXBwZXIgaW1nJylcblxudmFyIHJlbW90ZSA9ICd3czovL2xvY2FsaG9zdDo4MDgwJztcbnZhciBpbnRlcnZhbFRpbWUgPSA3MDAwOyBcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihsaWJyYXJ5KXtcblxuXHR2YXIgcHJvdG8gPSB7XG5cdFx0aW5pdDogZnVuY3Rpb24oKXtcblx0XHRcdHZhciBzID0gdGhpcy5fc29ja2V0ID0gbmV3IFdlYlNvY2tldChyZW1vdGUpO1xuXHRcdFx0cy5vbm1lc3NhZ2UgPSBmdW5jdGlvbihlKSB7XG5cdFx0IFx0XHQvLyBpZiAoZS5kYXRhID09ICdvaycpIHsvL3N0YXJ0IGFza2luZyBwaG90b3Ncblx0IFx0XHRcdGlmKCF0aGlzLmludGVydmFsSWQpe1xuXHQgXHRcdFx0XHR0aGlzLmludGVydmFsSWQgPSB3aW5kb3cuc2V0SW50ZXJ2YWwoZnVuY3Rpb24oKXtcblx0XHRcdFx0XHRcdHMuc2VuZChKU09OLnN0cmluZ2lmeSh7XG5cdFx0XHRcdFx0XHRcdGFjdGlvbjonbmV4dCdcblx0XHRcdFx0XHRcdH0pKVxuXHRcdFx0XHRcdH0sIGludGVydmFsVGltZSk7XHRcblx0IFx0XHRcdH0gXG5cdFx0ICBcdFx0Y3JlYXRlSW1hZ2UoZS5kYXRhKVxuXHRcdFx0fVxuXG5cdFx0XHRzLm9ub3BlbiA9IGZ1bmN0aW9uKGUpIHtcblx0XHQgXHRcdHMuc2VuZChKU09OLnN0cmluZ2lmeSh7XG5cdFx0IFx0XHRcdGFjdGlvbjonbG9hZCcsXG5cdFx0IFx0XHRcdGxpYnJhcnk6IGxpYnJhcnlcblx0XHQgXHRcdH0pKVxuXHRcdFx0fVxuXG5cdFx0XHRzLm9uY2xvc2UgPSBmdW5jdGlvbigpe1xuXHRcdFx0XHRjb25zb2xlLmxvZygnY2xvc2VkIHNvY2tldCcpXG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gdGhpcztcblx0XHR9LFxuXHRcdHJlc3RhcnQgOiBmdW5jdGlvbiAobGlicmFyeSl7XG5cdFx0XHQvL3dpbmRvdy5jbGVhckludGVydmFsKHRoaXMuaW50ZXJ2YWxJZClcblx0XHRcdHRoaXMuX3NlbmQoe1xuXHQgXHRcdFx0YWN0aW9uOidsb2FkJyxcblx0IFx0XHRcdGxpYnJhcnk6IGxpYnJhcnlcblx0IFx0XHR9KVxuXHRcdH0sXG5cdFx0X3NlbmQ6IGZ1bmN0aW9uIChtc2cpe1xuXHRcdFx0dGhpcy5fc29ja2V0LnNlbmQoSlNPTi5zdHJpbmdpZnkobXNnKSlcblx0XHR9XG5cblx0fVxuXG5cdGZ1bmN0aW9uIGNyZWF0ZUltYWdlIChibG9iKSB7XG5cdFx0Ly8gYm9keS4uLlxuXHRcdHZhciB1cmxDcmVhdG9yID0gd2luZG93LlVSTCB8fCB3aW5kb3cud2Via2l0VVJMXG5cdFx0XHQsaW1hZ2VVcmwgPSB1cmxDcmVhdG9yLmNyZWF0ZU9iamVjdFVSTChibG9iKVxuXHQgICAgICAgICxpbWcgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiaW1nXCIpO1xuXHQgICAgXG5cdCAgICByZW5kZXJJbWFnZShpbWFnZVVybClcblx0fVxuXG5cdGZ1bmN0aW9uIHJlbmRlckltYWdlKGltZ1VybCl7IFxuXHRcdHV0aWxzLnRvZ2dsZUNsYXNzKGRvbUltZywgJ2hpZGUnKTtcblx0XHRkb21JbWcuc3JjID0gaW1nVXJsO1xuXHRcdHV0aWxzLnJlbW92ZUNsYXNzKGRvbUltZywgJ2hpZGUnKTtcblx0fVxuXG5cdHZhciBzb2NrZXQgPSBPYmplY3QuY3JlYXRlKHByb3RvLCB7XG5cdFx0aW50ZXJ2YWw6IHsgd3JpdGFibGU6dHJ1ZSwgY29uZmlndXJhYmxlOnRydWUsIHZhbHVlOiBsaWJyYXJ5IH0sXG5cdH0pXG5cdHJldHVybiBzb2NrZXQ7XG5cbn1cbiIsInZhciB3ZWJTb2NrZXQgPSByZXF1aXJlKCcuLycpO1xudmFyIGRvbXJlYWR5ID0gcmVxdWlyZSgnZG9tcmVhZHknKTtcblxuZG9tcmVhZHkoZnVuY3Rpb24gKCkge1xuXHR2YXIgd3MgPSBudWxsO1xuXHRcblx0ZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBldmVudEhhbmRsZXIsIGZhbHNlKTtcblxuXHRmdW5jdGlvbiBldmVudEhhbmRsZXIoZSl7XG5cdFx0dmFyIHRhcmdldCA9IGUudGFyZ2V0XG5cdFx0XHQsbGlicmFyeSA9IHRhcmdldC5nZXRBdHRyaWJ1dGUoJ2RhdGEtbGluaycpIHx8IG51bGxcblxuXHRcdGUucHJldmVudERlZmF1bHQoKTtcblx0XHRpZihsaWJyYXJ5KSB7XHRcblx0XHRcdGlmKHdzKSByZXR1cm4gd3MucmVzdGFydChsaWJyYXJ5KVx0XG5cdFx0XHRlbHNlIHdzID0gd2ViU29ja2V0KGxpYnJhcnkpLmluaXQoKTtcblx0XHR9XG5cdH1cbn0pIl19
