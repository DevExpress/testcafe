'use strict';
var through = require('through2'),
	uglify = require('uglify-js'),
	merge = require('deepmerge'),
	PluginError = require('gulp-util/lib/PluginError'),
	applySourceMap = require('vinyl-sourcemaps-apply'),
	reSourceMapComment = /\n\/\/# sourceMappingURL=.+?$/,
	pluginName = 'gulp-uglify';

function minify(file, options, cb) {
	var mangled;

	try {
		mangled = uglify.minify(String(file.contents), options);
		mangled.code = new Buffer(mangled.code.replace(reSourceMapComment, ''));
		cb(null, mangled);
	} catch (e) {
		cb(new PluginError(pluginName, e.message || e.msg, {
			fileName: file.path,
			lineNumber: e.line,
			stack: e.stack,
			showStack: false
		}));
	}
}

function setup(opts) {
	var options = merge(opts || {}, {
		fromString: true,
		output: {}
	});

	if (options.preserveComments === 'all') {
		options.output.comments = true;
	} else if (options.preserveComments === 'some') {
		// preserve comments with directives or that start with a bang (!)
		options.output.comments = /^!|@preserve|@license|@cc_on/i;
	} else if (typeof options.preserveComments === 'function') {
		options.output.comments = options.preserveComments;
	}

	return options;
}

module.exports = function(opt) {

	var options = setup(opt);

	function uglify(file, encoding, callback) {
		/*jshint validthis:true */

		if (file.isNull()) {
			return callback(null, file);
		}

		if (file.isStream()) {
			return callback(new PluginError(pluginName, 'Streaming not supported', {
				fileName: file.path,
				showStack: false
			}));
		}

		if (file.sourceMap) {
			options = merge(options, {
				outSourceMap: file.relative,
				inSourceMap: file.sourceMap.mappings !== '' ? file.sourceMap : undefined
			});
		}

		minify(file, options, function(err, mangled) {
			if (err) {
				return callback(err);
			}
			
			file.contents = mangled.code;

			if (file.sourceMap) {
				applySourceMap(file, mangled.map);
			}

			callback(null, file);
		});
	}

	return through.obj(uglify);
};
