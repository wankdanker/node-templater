var readFile = require('fs').readFile
  , watchFile = require('fs').watchFile
  , unwatchFile = require('fs').unwatchFile
  , extname = require('path').extname
  , basename = require('path').basename
  , tryFileExtensions = require('find-alternate-file')
  , tryDirectoryIndex = require('find-alternate-index')
  , templaters = [];
  ;

module.exports = Templater;

Templater.Engines = ["ejs", "jade", "handlebars", "dustjs-linkedin", "trimpath-template"];

//Export a function that will end all templater instances
Templater.end = function () {
  templaters.forEach(function (t) {
    t.end();
  });
};

function Templater(options) {
  var self = this;
  
  if (this.constructor.name != 'Templater') {
    return new Templater(options);
  }

  templaters.push(self);

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
    self.loadFile(filename, function (err, data, resolvedPath) {
      if (err) return callback(err);
      
      //over-write the filename to the resolved filename/path
      options.filename = resolvedPath;
      
      fileExtension = extname(resolvedPath).split('.')[1];
      options.engine = options.engine || self.engineExtensions[fileExtension] || fileExtension;

      //check to see if we are already watching this file
      if (!self.watched[resolvedPath] && self.options.cache) {
        //watch the file for changes
        watchFile(resolvedPath, function (curr, prev) {
          if (curr.mtime !== prev.mtime) {
            delete self.cache[resolvedPath];
            delete self.watched[resolvedPath];

            unwatchFile(resolvedPath);
          }
        });

        self.watched[resolvedPath] = true;
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
    fn = engine.compile(str, options);
    
    try {
      return callback(null, fn(options.context));
    }
    catch (e) {
      return callback(e);
    }
  }
};

Templater.prototype.resolveFile = function (path, cb) {
  var self = this;

  self.resolveFileByExtension(path, function (err, foundPath) {
    if (foundPath) {
      return cb(null, foundPath);
    }

    self.resolveFileByDirectoryIndex(path, function (err, foundPath) {
      if (foundPath) {
        return cb(null, foundPath);
      }

      //return the original path anyway and let the path fail
      //if it doesn't exist
      return cb(null, path);
    });
  });
};

Templater.prototype.resolveFileByExtension = function (path, cb) {
  var self = this, ext;

  if (!self.options.alternateExtensions) {
    return cb(null, null);
  }

  if (self.options.allowedAlternateExtensions) {
    ext = extname(path);

    if (!~self.options.allowedAlternateExtensions.indexOf(ext)
      && !~self.options.allowedAlternateExtensions.indexOf(ext.split('.')[1])
    ) {
      return cb(null, null);
    }
  }

  return tryFileExtensions(path, self.options.alternateExtensions, cb);
};

Templater.prototype.resolveFileByDirectoryIndex = function (path, cb) {
  var self = this;

  if (!self.options.alternateIndexes) {
    return cb(null, null);
  }

  return tryDirectoryIndex(path, self.options.alternateIndexes, cb);
};

Templater.prototype.loadFile = function (path, cb) {
  var self = this;

  self.resolveFile(path, function (err, resolvedPath) {
    readFile(resolvedPath, 'utf8', function (err, data) {
      cb(err, data, resolvedPath);
    });
  });
};

Templater.prototype.end = function () {
  var self = this;
  
  Object.keys(self.watched).forEach(function (filename) {
    unwatchFile(filename);
  });

  templaters.splice(templaters.indexOf(self),1);
};

Templater.prototype.clearCache = function () {
  var self = this;

  self.cache = {};
};
