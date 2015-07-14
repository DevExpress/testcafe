/**
 * node-archiver
 *
 * Copyright (c) 2012-2014 Chris Talkington, contributors.
 * Licensed under the MIT license.
 * https://github.com/ctalkington/node-archiver/blob/master/LICENSE-MIT
 */
var ArchiverCore = require('./modules/core');
var formatModules = {};

var archiver = module.exports = function(format, options) {
  return archiver.create(format, options);
};

archiver.create = function(format, options) {
  if (formatModules[format]) {
    var inst = new ArchiverCore(options);
    inst.setModule(new formatModules[format](options));

    return inst;
  } else {
    throw new Error('unknown format: ' + format);
  }
};

archiver.registerFormat = function(format, module) {
  if (module && typeof module === 'function' && typeof module.prototype.append === 'function') {
    formatModules[format] = module;

    // backwards compat
    var compatName = 'create' + format.charAt(0).toUpperCase() + format.slice(1);
    archiver[compatName] = function(options) {
      return archiver.create(format, options);
    };
  } else {
    throw new Error('format module invalid: ' + format);
  }
};

archiver.registerFormat('zip', require('./modules/zip'));
archiver.registerFormat('tar', require('./modules/tar'));
archiver.registerFormat('json', require('./modules/json'));