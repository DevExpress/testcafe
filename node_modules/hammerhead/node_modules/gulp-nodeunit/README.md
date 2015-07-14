# gulp-nodeunit

> Run nodeunit tests from gulp

# Install

`npm install --save-dev gulp-nodeunit`

# Example

	var gulp     = require('gulp'),
		nodeunit = require('gulp-nodeunit');

	gulp.task('default', function () {
		gulp.src('**/*.test.js')
			.pipe(nodeunit({
				reporter: 'junit',
				reporterOptions: {
					output: 'test'
				}
			}));
	});
