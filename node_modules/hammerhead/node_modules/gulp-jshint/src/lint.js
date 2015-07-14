var RcLoader = require('rcloader');
var jshint = require('jshint').JSHINT;
var jshintcli = require('jshint/src/cli');
var minimatch = require("minimatch");
var _ = require("lodash");

module.exports = function createLintFunction(userOpts) {

  var rcLoader = new RcLoader('.jshintrc', userOpts, {
    loader: function (path) {
      var cfg = jshintcli.loadConfig(path);
      delete cfg.dirname;
      return cfg;
    }
  });

  var reportErrors = function (file, out, cfg) {
    var filePath = (file.path || 'stdin');

    out.results = jshint.errors.map(function (err) {
      if (!err) return;
      return { file: filePath, error: err };
    }).filter(Boolean);

    out.opt = cfg;
    out.data = [jshint.data()];
    out.data[0].file = filePath;
  };

  return function lint(file, cb) {
    // pass through dirs, streaming files, etc.
    if (!file.isBuffer()) {
      return cb(null, file);
    }
    rcLoader.for(file.path, function (err, cfg) {
      if (err) return cb(err);

      var globals = {};
      if (cfg.globals) {
        globals = cfg.globals;
        delete cfg.globals;
      }

      if (cfg.overrides) {
        _.each(cfg.overrides, function (options, pattern) {
          if (!minimatch(file.path, pattern, { nocase: true, matchBase: true })) return;

          if (options.globals) {
            globals = _.extend(globals, options.globals);
            delete options.globals;
          }

          _.extend(cfg, options);
        });

        delete cfg.overrides;
      }

      // get or create file.jshint, we will write all output here
      var out = file.jshint || (file.jshint = {});
      var str = _.isString(out.extracted) ? out.extracted : file.contents.toString('utf8');

      out.success = jshint(str, cfg, globals);
      if (!out.success) reportErrors(file, out, cfg);

      return cb(null, file);
    });
  };
};
