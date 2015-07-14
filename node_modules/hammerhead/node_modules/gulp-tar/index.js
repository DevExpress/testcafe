'use strict';
var path = require('path');
var gutil = require('gulp-util');
var through = require('through2');
var assign = require('object-assign');
var archiver = require('archiver');

module.exports = function (filename, options) {
	if (!filename) {
		throw new gutil.PluginError('gulp-tar', '`filename` required');
	}

	var firstFile;
	var archive = archiver('tar');

	return through.obj(function (file, enc, cb) {
		if (file.isNull()) {
			cb();
			return;
		}

		if (firstFile === undefined) {
			firstFile = file;
		}

		archive.append(file.contents, assign({
			name: file.relative.replace(/\\/g, '/')
		}, options || {}));

		cb();
	}, function (cb) {
		if (firstFile === undefined) {
			cb();
			return;
		}

		archive.finalize();

		this.push(new gutil.File({
			cwd: firstFile.cwd,
			base: firstFile.base,
			path: path.join(firstFile.base, filename),
			contents: archive
		}));

		cb();
	});
};
