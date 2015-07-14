# [gulp](http://gulpjs.com)-tar [![Build Status](https://travis-ci.org/sindresorhus/gulp-tar.svg?branch=master)](https://travis-ci.org/sindresorhus/gulp-tar)

> Create [tarball](http://en.wikipedia.org/wiki/Tar_(computing)) from files


## Install

```sh
$ npm install --save-dev gulp-tar
```


## Usage

```js
var gulp = require('gulp');
var tar = require('gulp-tar');
var gzip = require('gulp-gzip');

gulp.task('default', function () {
	return gulp.src('src/*')
		.pipe(tar('archive.tar'))
		.pipe(gzip())
		.pipe(gulp.dest('dist'));
});
```


## API

### tar(filename, options)
`filename` filename for the output tar archive  
`options` default file headers passed to [tar-stream](https://github.com/mafintosh/tar-stream)


## License

MIT © [Sindre Sorhus](http://sindresorhus.com)
