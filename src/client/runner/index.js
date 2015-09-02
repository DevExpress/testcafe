import Runner from './runner';
import iframeDispatcher from './iframe-dispatcher';

exports.Runner           = Runner;
exports.iframeDispatcher = iframeDispatcher;

exports.get = require;

Object.defineProperty(window, '%testCafeRunner%', {
    enumerable:   false,
    configurable: false,
    writable:     false,
    value:        exports
});
