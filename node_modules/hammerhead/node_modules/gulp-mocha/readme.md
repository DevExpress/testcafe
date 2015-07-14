# gulp-mocha [![Build Status](https://travis-ci.org/sindresorhus/gulp-mocha.svg?branch=master)](https://travis-ci.org/sindresorhus/gulp-mocha)

> Run [Mocha](https://github.com/mochajs/mocha/) tests

*Keep in mind that this is just a thin wrapper around Mocha and your issue is most likely with Mocha.*


## Install

```
$ npm install --save-dev gulp-mocha
```


## Usage

```js
var gulp = require('gulp');
var mocha = require('gulp-mocha');

gulp.task('default', function () {
	return gulp.src('test.js', {read: false})
		// gulp-mocha needs filepaths so you can't have any plugins before it
		.pipe(mocha({reporter: 'nyan'}));
});
```


## API

### mocha([options])

#### options

##### ui

Type: `string`  
Default: `bdd`  
Values: `bdd`, `tdd`, `qunit`, `exports`

The interface to use.

##### reporter

Type: `string`  
Default: `spec` | `dot` prior to mocha v1.21.0  
Values: [reporters](https://github.com/mochajs/mocha/tree/master/lib/reporters)

The reporter that will be used.

This option can also be used to utilize third-party reporters. For example if you `npm install mocha-lcov-reporter` you can then do use `mocha-lcov-reporter` as value.

##### globals

Type: `array`

List of accepted global variable names, example `['YUI']`. Accepts wildcards to match multiple global variables, e.g. `['gulp*']` or even `['*']`. See [Mocha globals option](http://mochajs.org/#globals-option).

##### timeout

Type: `number`  
Default: `2000`

Test-case timeout in milliseconds.

##### bail

Type: `boolean`  
Default: `false`

Bail on the first test failure.

##### ignoreLeaks

Type: `boolean`  
Default: `false`

Ignore global leaks.

##### grep

Type: `string`

Only run tests matching the given pattern which is internally compiled to a RegExp.

##### require

Type: `array`

Require custom modules before tests are run.


## FAQ

### Test suite not exiting

If your test suite is not exiting it might be because you still have a lingering callback, most often caused by an open database connection. You should close this connection or do the following:

```js
gulp.task('default', function () {
	return gulp.src('test.js')
		.pipe(mocha())
		.once('error', function () {
			process.exit(1);
		})
		.once('end', function () {
			process.exit();
		});
});
```

### CoffeeScript

Add `require('coffee-script/register')` to the top of your `gulpfile.js`.


## License

MIT © [Sindre Sorhus](http://sindresorhus.com)
