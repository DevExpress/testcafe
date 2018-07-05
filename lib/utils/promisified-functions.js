'use strict';

exports.__esModule = true;
exports.exec = exports.killProcess = exports.findProcess = exports.deleteFile = exports.readFile = exports.writeFile = exports.stat = exports.ensureDir = undefined;

var _child_process = require('child_process');

var _child_process2 = _interopRequireDefault(_child_process);

var _gracefulFs = require('graceful-fs');

var _gracefulFs2 = _interopRequireDefault(_gracefulFs);

var _mkdirp = require('mkdirp');

var _mkdirp2 = _interopRequireDefault(_mkdirp);

var _psNode = require('ps-node');

var _psNode2 = _interopRequireDefault(_psNode);

var _promisify = require('./promisify');

var _promisify2 = _interopRequireDefault(_promisify);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ensureDir = exports.ensureDir = (0, _promisify2.default)(_mkdirp2.default);
var stat = exports.stat = (0, _promisify2.default)(_gracefulFs2.default.stat);
var writeFile = exports.writeFile = (0, _promisify2.default)(_gracefulFs2.default.writeFile);
var readFile = exports.readFile = (0, _promisify2.default)(_gracefulFs2.default.readFile);
var deleteFile = exports.deleteFile = (0, _promisify2.default)(_gracefulFs2.default.unlink);

var findProcess = exports.findProcess = (0, _promisify2.default)(_psNode2.default.lookup);
var killProcess = exports.killProcess = (0, _promisify2.default)(_psNode2.default.kill);

var exec = exports.exec = (0, _promisify2.default)(_child_process2.default.exec);