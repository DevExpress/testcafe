/* jshint node: true */

var jsbeautify  = require('js-beautify').js_beautify;
var merge       = require('deepmerge');
var through     = require('through2');
var PluginError = require('gulp-util').PluginError;

module.exports = function (editor) {

  // edit JSON object by user specific function
  function editByFunction(json) {
    return JSON.stringify(editor(json));
  }

  // edit JSON object by merging with user specific object
  function editByObject(json) {
    return JSON.stringify(merge(json, editor));
  }

  // always beautify output
  var beautify = true;
  var editByXXX;

  // check options
  if (typeof editor === 'function') editByXXX = editByFunction;
  else if (typeof editor === 'object') editByXXX = editByObject;
  else if (typeof editor === 'undefined') throw new PluginError('gulp-json-editor', 'missing "editor" option');
  else throw new PluginError('gulp-json-editor', '"editor" option must be a function or object');

  // create through object
  return through.obj(function (file, encoding, callback) {

    // ignore it
    if (file.isNull()) {
      this.push(file);
      return callback();
    }

    // stream is not supported
    if (file.isStream()) {
      this.emit('error', new PluginError('gulp-json-editor', 'Streaming is not supported'));
      return callback();
    }

    // edit JSON object
    try {
      var json = editByXXX(JSON.parse(file.contents.toString('utf8')));
      if (beautify) {
        json = jsbeautify(json, {
          'indent_with_tabs': false,
          'indent_size':      2,
          'indent_char':      ' ',
          'indent_level':     0,
          'brace_style':      'collapse'
        });
      }
      file.contents = new Buffer(json);
    }
    catch (err) {
      this.emit('error', new PluginError('gulp-json-editor', err));
    }
    this.push(file);
    callback();

  });

};
