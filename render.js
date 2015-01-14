var config = require('./config');
var hyperglue = require('hyperglue');
var find = require('findit')
var fs = require('fs');

var directories = []
var finder = find(config.photosPath)

module.exports = function(cb){

	finder.on('directory', function (dir) {
		var name = dir.split('/')[1]
		directories.push('<li><a href="#" data-link="'+ name +'">' + name + '</a></li>')
	})

	finder.on('end', function(){
		console.log(createIndex(directories.join('\n')))
	})

	var template = fs.readFileSync('tmp/index.html');

	//our static final file
	var wstream = fs.createWriteStream('public/index.html');

	function createIndex (directories) {
	    var out = hyperglue(template, {
	        '#menu': { _html: directories }
	    }).outerHTML;

	    wstream.write(out);
	    cb();
	}	
}
