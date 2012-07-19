var readFile = require('fs').readFile
	, watchFile = require('fs').watchFile
	, unwatchFile = require('fs').unwatchFile
	, extname = require('path').extname
	, basename = require('path').basename
	;

module.exports = Templater;

Templater.Engines = ["ejs", "jade"];

function Templater(options) {
	var self = this;
	
	self.engines = {};
	self.cache = {};
	self.watched = {};
	
	Templater.Engines.forEach(function (engine) {
		self.engines.__defineGetter__(engine, require.bind(require, engine));
	});
}

Templater.prototype.render = function (str, options, callback) {
	var self = this
		, engine
		, filename
		, fn
		;
	
	if (arguments.length === 2 && typeof str === 'object' && typeof options === 'function') {
		/*Templater.render(options, callback)*/
		callback = options;
		options = str;
		str = null;
	} else if (arguments.length !== 3) {
		throw Error("Wrong number of arguments passed to Templater.render([str,] options, callback)");
	}
	
	filename = options.filename;
	
	if (!str && filename) {
		options.engine = options.engine || extname(filename).split('.')[1];
		
		readFile(filename, 'utf8', function (err, data) {
			if (err) return callback(err);
			
			self.render(data, options, callback);
			
			//watch the file for changes
			watchFile(filename, function (curr, prev) {
				if (curr.mtime !== prev.mtime) {
					delete self.cache[filename];
					delete self.watched[filename];
					
					unwatchFile(filename);
				}
			});
			
			self.watched[filename] = true;
		});
		
		return;
	}
	else if (!str) {
		return callback ( { message : "Templater.render() : template string not found." });
	}
	
	engine = self.engines[options.engine];
	
	if (!engine) {
		return callback ( { message : "Templater.render() : engine not found: " + engine });
	}
	
	if (filename) {
		if (!self.cache[filename]) {
			self.cache[filename] = engine.compile(str, options);
		}
		
		return callback(null, self.cache[filename](options.context));
	}
	else {
		process.nextTick(function () {
			fn = engine.compile(str, options);
			
			return callback(null, fn(options.context));
		});
	}
};

Templater.prototype.end = function () {
	var self = this;
	
	Object.keys(self.watched).forEach(function (filename) {
		unwatchFile(filename);
	});
};
