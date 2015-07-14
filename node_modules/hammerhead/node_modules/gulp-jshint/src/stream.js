var through2 = require('through2');

module.exports = function (config, handler, flush) {
  if (typeof config === 'function') {
    flush = handler;
    handler = config;
    config = {};
  }

  // default to a pass through stream
  if (typeof handler !== 'function') handler = function (a) { this.push(a); };

  var ms = (config && config.timeout) || 30000;

  // if a handler leaves off the done callback, we will call it for them
  var async = handler.length >= 2;

  var str = through2({ objectMode: true }, function (obj, enc, _cb) {
    var timeout;
    var done = function (err, obj) {
      if (async) clearTimeout(timeout);

      if (err) str.emit('error', err);
      if (obj) str.push(obj);

      _cb();
    };


    if (async) {
      timeout = setTimeout(function () {
        str.emit('error', new Error('Failed to call done in a stream handler before ' + ms + 'ms timeout.'));
      }, ms);
      handler.call(str, obj, done);
    } else {
      handler.call(str, obj);
      done();
    }
  }, function (done) {
    if (flush) {
      flush.call(this, done);
    }

    if (!flush || flush.length === 0) done();
  });

  return str;
};