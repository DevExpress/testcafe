var PluginError = require('gulp-util').PluginError;
var reporters = require('./reporters');
var extract = require('./extract');
var fileIgnored = require('./file-ignored');
var makeLint = require('./lint');
var stream = require('./stream');

var jshintPlugin = function (opt) {
  var lint = makeLint(opt);

  return stream(function (file, cb) {
    fileIgnored(file, function (err, ignored) {
      if (err) return cb(err);
      if (ignored) return cb(null, file);

      lint(file, function (err) {
        if (err) return cb(err);
        cb(null, file);
      });
    });
  });
};

// expose the reporters
jshintPlugin.failReporter = reporters.fail;
jshintPlugin.loadReporter = reporters.load;
jshintPlugin.reporter = reporters.reporter;

// export the extractor
jshintPlugin.extract = extract;

module.exports = jshintPlugin;
