var find = require('findit')
var debug = require('debug')('Get images from disk');
var config = require('./config'); 

module.exports = function (folder, cue, cb){
	//photo root path
	var finder = find(config.photosPath + folder)
	
	finder.on('directory', function (dir, stat, stop) {
	});

	finder.on('file', function (file, stat) {
	    debug('file added to cue', file)
	    cue.push(file)
	});

	finder.on('link', function (link, stat) {
	    debug(link);
	});  

	finder.on('end', function () {
		debug('DONE READING: ' + cue.length + ' files from folder:' + folder)
	    cb(null)//is done
	});
}	