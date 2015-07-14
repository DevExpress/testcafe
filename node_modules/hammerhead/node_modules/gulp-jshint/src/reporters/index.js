var PluginError = require('gulp-util').PluginError;
var stream = require('../stream');
var _ = require('lodash');

exports.failReporter = require('./fail');

exports.loadReporter = function (reporter) {
  // we want the function
  if (typeof reporter === 'function') return reporter;

  // object reporters
  if (typeof reporter === 'object' && typeof reporter.reporter === 'function') return reporter.reporter;

  // load jshint built-in reporters
  if (typeof reporter === 'string') {
    try {
      return exports.loadReporter(require('jshint/src/reporters/' + reporter));
    } catch (err) {}
  }

  // load full-path or module reporters
  if (typeof reporter === 'string') {
    try {
      return exports.loadReporter(require(reporter));
    } catch (err) {}
  }
};

exports.reporter = function (reporter, reporterCfg) {
  reporterCfg = reporterCfg || {};

  if (reporter === 'fail') {
    return exports.failReporter(reporterCfg);
  }

  var rpt = exports.loadReporter(reporter || 'default');

  if (typeof rpt !== 'function') {
    throw new PluginError('gulp-jshint', 'Invalid reporter');
  }

  // return stream that reports stuff
  return stream(function (file, cb) {
    if (file.jshint && !file.jshint.success && !file.jshint.ignored) {
      // merge the reporter config into this files config
      var opt = _.defaults({}, reporterCfg, file.jshint.opt);

      rpt(file.jshint.results, file.jshint.data, opt);
    }

    cb(null, file);
  });
};
