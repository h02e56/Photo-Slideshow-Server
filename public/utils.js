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


