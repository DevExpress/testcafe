'use strict';
var path = require('path');
var globby = require('globby');
var eachAsync = require('each-async');
var isPathCwd = require('is-path-cwd');
var isPathInCwd = require('is-path-in-cwd');
var rimraf = require('rimraf');

function safeCheck(file) {
	if (isPathCwd(file)) {
		throw new Error('Cannot delete the current working directory. Can be overriden with the `force` option.');
	}

	if (!isPathInCwd(file)) {
		throw new Error('Cannot delete files/folders outside the current working directory. Can be overriden with the `force` option.');
	}
}

module.exports = function (patterns, opts, cb) {
	if (typeof opts === 'function') {
		cb = opts;
		opts = {};
	}

	var force = opts.force;
	delete opts.force;

	globby(patterns, opts, function (err, files) {
		if (err) {
			cb(err);
			return;
		}

		eachAsync(files, function (el, i, next) {
			if (!force) {
				safeCheck(el);
			}

			if (opts.cwd) {
				el = path.resolve(opts.cwd, el);
			}

			rimraf(el, next);
		}, cb);
	});
};

module.exports.sync = function (patterns, opts) {
	opts = opts || {};

	var force = opts.force;
	delete opts.force;

	globby.sync(patterns, opts).forEach(function (el) {
		if (!force) {
			safeCheck(el);
		}

		if (opts.cwd) {
			el = path.resolve(opts.cwd, el);
		}

		rimraf.sync(el);
	});
};
