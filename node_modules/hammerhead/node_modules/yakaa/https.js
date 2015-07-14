'use strict';

// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.


function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}

function isNumber(arg) {
  return typeof arg === 'number';
}

function isString(arg) {
  return typeof arg === 'string';
}

var tls = require('tls');
var inherits = require('util').inherits;
var Agent = require('./http.js');
var debug = require('./lib/debuglog.js')('httpsagent');

// HTTPS agents.
function createConnection(port, host, options) {
  if (isObject(port)) {
    options = port;
  }
  else if (isObject(host)) {
    options = host;
  }
  else if (isObject(options)) {
    options = options;
  }
  else {
    options = {};
  }

  if (isNumber(port)) {
    options.port = port;
  }

  if (isString(host)) {
    options.host = host;
  }

  debug('createConnection', options);
  return tls.connect(options);
}


function SSLAgent(options) {
  Agent.call(this, options);
  this.defaultPort = 443;
  this.protocol = 'https:';
}
inherits(SSLAgent, Agent);

SSLAgent.prototype.createConnection = createConnection;

SSLAgent.prototype.getName = function(options) {
  var name = Agent.prototype.getName.call(this, options);

  // name += ':';
  // if (options.ca)
  //   name += options.ca;

  name += ':';
  if (options.cert)
    name += options.cert;

  name += ':';
  if (options.ciphers)
    name += options.ciphers;

  name += ':';
  if (options.key)
    name += options.key;

  name += ':';
  if (options.pfx)
    name += options.pfx;

  // name += ':';
  // if (!isUndefined(options.rejectUnauthorized))
  //   name += options.rejectUnauthorized;

  return name;
};

module.exports = SSLAgent;
