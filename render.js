var config = require('./config');
var hyperglue = require('hyperglue');
var find = require('findit')
var fs = require('fs');

var finder = find(config.photosPath)

var directories = []
	, template = fs.readFileSync('tmp/index.html');//our template
	, wstream = fs.createWriteStream('public/index.html');//our static final html

module.exports = function(cb){
	
	finder.on('directory', function (dir) {
		var name = dir.split('/')[1]
		directories.push('<li><a href="#" data-link="'+ name +'">' + name + '</a></li>')
	})

	finder.on('end', function(){
		console.log(createIndex(directories.join('\n')))
	})

	function createIndex (directories) {
	    var out = hyperglue(template, {
	        '#menu': { _html: directories }
	    }).outerHTML;

	    wstream.write(out);
	    cb();
	}	
}
