'use strict';
var gutil = require('gulp-util');
var through = require('through2');
var applySourceMap = require('vinyl-sourcemaps-apply');
var objectAssign = require('object-assign');
var replaceExt = require('replace-ext');
var babel = require('babel-core');

module.exports = function (opts) {
	opts = opts || {};

	return through.obj(function (file, enc, cb) {
		if (file.isNull()) {
			cb(null, file);
			return;
		}

		if (file.isStream()) {
			cb(new gutil.PluginError('gulp-babel', 'Streaming not supported'));
			return;
		}

		try {
			var fileOpts = objectAssign({}, opts, {
				filename: file.path,
				filenameRelative: file.relative,
				sourceMap: !!file.sourceMap
			});

			var res = babel.transform(file.contents.toString(), fileOpts);

			if (file.sourceMap && res.map) {
				applySourceMap(file, res.map);
			}

			file.contents = new Buffer(res.code);
			file.path = replaceExt(file.path, '.js');
			this.push(file);
		} catch (err) {
			this.emit('error', new gutil.PluginError('gulp-babel', err, {fileName: file.path, showProperties: false}));
		}

		cb();
	});
};
