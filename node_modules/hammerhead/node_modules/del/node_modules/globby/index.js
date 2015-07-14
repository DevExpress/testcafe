'use strict';
var union = require('array-union');
var diff = require('array-differ');
var async = require('async');
var glob = require('glob');

function arrayify(arr) {
	return Array.isArray(arr) ? arr : [arr];
}

module.exports = function (patterns, opts, cb) {
	patterns = arrayify(patterns);

	if (patterns.length === 0) {
		cb(null, []);
		return;
	}

	if (typeof opts === 'function') {
		cb = opts;
		opts = {};
	}

	async.reduce(patterns, [], function (ret, pattern, next) {
		var process = union;

		if (pattern[0] === '!') {
			pattern = pattern.slice(1);
			process = diff;
		}

		glob(pattern, opts, function (err, paths) {
			if (err) {
				next(err);
				return;
			}

			next(null, process(ret, paths));
		});
	}, cb);
};

module.exports.sync = function (patterns, opts) {
	patterns = arrayify(patterns);

	if (patterns.length === 0) {
		return [];
	}

	opts = opts || {};

	return patterns.reduce(function (ret, pattern) {
		var process = union;

		if (pattern[0] === '!') {
			pattern = pattern.slice(1);
			process = diff;
		}

		return process(ret, glob.sync(pattern, opts));
	}, []);
};
