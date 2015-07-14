/**
 * node-archiver
 *
 * Copyright (c) 2012-2014 Chris Talkington, contributors.
 * Licensed under the MIT license.
 * https://github.com/ctalkington/node-archiver/blob/master/LICENSE-MIT
 */
var engine = require('zip-stream');
var util = require('../../util');

var Zip = module.exports = function(options) {
  options = this.options = util.defaults(options, {
    comment: '',
    forceUTC: false,
    store: false
  });

  this.supports = {
    directory: true
  };

  this.engine = new engine(options);
};

Zip.prototype.append = function(source, data, callback) {
  this.engine.entry(source, data, callback);
};

Zip.prototype.finalize = function() {
  this.engine.finalize();
};

Zip.prototype.on = function() {
  return this.engine.on.apply(this.engine, arguments);
};

Zip.prototype.pipe = function() {
  return this.engine.pipe.apply(this.engine, arguments);
};