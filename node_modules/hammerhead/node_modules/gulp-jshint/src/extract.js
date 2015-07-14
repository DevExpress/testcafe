var PluginError = require('gulp-util').PluginError;
var jshintcli = require('jshint/src/cli');
var fileIgnored = require('./file-ignored');
var stream = require('./stream');

module.exports = function extract(when) {
  when = when || 'auto';

  return stream(function (file, cb) {
    fileIgnored(file, function (err, ignored) {
      if (err) return cb(err);
      if (ignored) return cb(null, file);

      file.jshint = file.jshint || {};
      file.jshint.extracted = jshintcli.extract(file.contents.toString('utf8'), when);
      return cb(null, file);
    });
  });
};