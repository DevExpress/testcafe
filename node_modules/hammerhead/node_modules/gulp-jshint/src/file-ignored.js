var fs = require('fs');
var Minimatch = require('minimatch').Minimatch;
var resolve = require('path').resolve;
var relative = require('path').relative;
var gfPath = require('./gulpfile-path');
var RcLoader = require('rcloader');
var PluginError = require('gulp-util').PluginError;

var noSlashesRE = /^[^\/]*\/?$/;

var ignoreLoader = new RcLoader('.jshintignore', {}, {
  loader: function (path) {
    // .jshintignore is a line-delimited list of patterns
    // convert to an array and filter empty lines
    var contents = fs.readFileSync(path, 'utf8');
    return {
      ignoreFile: path,
      patterns: contents.toString('utf8')
        .split(/\r?\n/)
        .filter(function (line) { return !!line.trim(); })
    };
  }
});

// get the .jshintignore closest to the directory containing the gruntFile
var cfg = ignoreLoader.for(gfPath);

module.exports = (function () {
  if (!cfg.ignoreFile) {
    return function (file, cb) {
      cb(null, false);
    };
  }

  var mms = {};
  cfg.patterns.forEach(function (pattern) {
    mms[pattern] = new Minimatch(pattern, { nocase: true });
  });

  return function check(file, cb) {
    if (file.isNull()) return cb(null, true); // ignore null files
    if (file.isStream()) return cb(new PluginError('gulp-jshint', 'Streaming not supported')); // throw an error

    var ignored = cfg.patterns.some(function (pattern) {
      var resolvedPath = resolve(file.path);
      var relativePath = relative(file.base, file.path);
      var mm = mms[pattern];

      if (resolvedPath === pattern) return true;
      if (mm.match(resolvedPath)) return true;

      if (noSlashesRE.test(pattern)) {
        var relPath = relative(pattern, relativePath);
        if (relPath.substring(0, 2) !== '..') return true;
      }
    });

    if (!ignored) return cb(null, false);

    cb(null, true);
  };
}());