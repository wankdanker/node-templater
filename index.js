var readFile = require('fs').readFile
  , watchFile = require('fs').watchFile
  , unwatchFile = require('fs').unwatchFile
  , extname = require('path').extname
  , basename = require('path').basename
  ;

module.exports = Templater;

Templater.Engines = ["ejs", "jade", "handlebars", "dustjs-linkedin", "trimpath-template"];

function Templater(options) {
  var self = this;
  
  if (this.constructor.name != 'Templater') {
    return new Templater(options);
  }

  options = options || {};

  self.options = options;
  self.engineExtensions = options.engineExtensions || module.exports.engineExtensions || {};
  self.engines = {};
  self.cache = {};
  self.watched = {};
 
  //default use caching if cache is not explicitly false
  if (self.options.cache !== false) {
    self.options.cache = true;
  }

  Templater.Engines.forEach(function (engine) {
    self.engines.__defineGetter__(engine, require.bind(require, engine));
  });
}

Templater.prototype.render = function (str, options, callback) {
  var self = this
    , engine
    , filename
    , fn
    , fileExtension
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
    fileExtension = extname(filename).split('.')[1];
    options.engine = options.engine || self.engineExtensions[fileExtension] || fileExtension;

    readFile(filename, 'utf8', function (err, data) {
      if (err) return callback(err);
      
      //check to see if we are already watching this file
      if (!self.watched[filename] && self.options.cache) {
        //watch the file for changes
        watchFile(filename, function (curr, prev) {
          if (curr.mtime !== prev.mtime) {
            delete self.cache[filename];
            delete self.watched[filename];

            unwatchFile(filename);
          }
        });

        self.watched[filename] = true;
      }

      self.render(data, options, callback);
    });
    
    return;
  }
  else if (!str) {
    return callback (new Error("Templater.render() : template string not found."));
  }
  
  engine = self.engines[options.engine];
  
  if (!engine) {
    return callback (new Error("Templater.render() : engine not found: " + engine ));
  }
  
  if (filename && self.options.cache) {
    if (!self.cache[filename]) {
      self.cache[filename] = engine.compile(str, options);
    }
    
    try {
      return callback(null, self.cache[filename](options.context));
    }
    catch (e) {
      return callback(e);
    }
  }
  else {
    process.nextTick(function () {
      fn = engine.compile(str, options);
      
      try {
      	return callback(null, fn(options.context));
      }
      catch (e) {
        return callback(e);
      }
    });
  }
};

Templater.prototype.end = function () {
  var self = this;
  
  Object.keys(self.watched).forEach(function (filename) {
    unwatchFile(filename);
  });
};
