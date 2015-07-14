[![Build Status](https://travis-ci.org/spenceralger/gulp-jshint.svg?branch=master)](https://travis-ci.org/spenceralger/gulp-jshint)

## Information

<table>
<tr>
<td>Package</td><td>gulp-jshint</td>
</tr>
<tr>
<td>Description</td>
<td>JSHint plugin for gulp</td>
</tr>
<tr>
<td>Node Version</td>
<td>>= 0.4</td>
</tr>
</table>

## Install

    npm install gulp-jshint --save-dev

## Usage

```js
var jshint = require('gulp-jshint');
var gulp   = require('gulp');

gulp.task('lint', function() {
  return gulp.src('./lib/*.js')
    .pipe(jshint())
    .pipe(jshint.reporter('YOUR_REPORTER_HERE'));
});
```

## Options

Plugin options:

- `lookup`
  - Default is `true`
  - When `false` do not lookup `.jshintrc` files. See the [JSHint docs](http://www.jshint.com/docs/) for more info.


You can pass in any other options and it passes them straight to JSHint. Look at their README for more info. You can also pass in the location of your jshintrc file as a string and it will load options from it.

## Results

Adds the following properties to the file object:

```js
  file.jshint.success = true; // or false
  file.jshint.errorCount = 0; // number of errors returned by JSHint
  file.jshint.results = []; // JSHint errors, see [http://jshint.com/docs/reporters/](http://jshint.com/docs/reporters/)
  file.jshint.data = []; // JSHint returns details about implied globals, cyclomatic complexity, etc
  file.jshint.opt = {}; // The options you passed to JSHint
```

## Reporters

### JSHint reporters

#### Built-in

You can choose any [JSHint reporter](https://github.com/jshint/jshint/tree/master/src/reporters)
when you call

```js
stuff
  .pipe(jshint())
  .pipe(jshint.reporter('default'))
```

#### External

Let's use [jshint-stylish](https://github.com/sindresorhus/jshint-stylish) as an example

```js
var stylish = require('jshint-stylish');

stuff
  .pipe(jshint())
  .pipe(jshint.reporter(stylish))
```

- OR -

```js
stuff
  .pipe(jshint())
  .pipe(jshint.reporter('jshint-stylish'))
```

JSHint plugins have no good module format so I tried to support all of them I saw in the wild. Hopefully it worked, but if a JSHint plugin isn't working with this library feel free to open an issue.

### Fail Reporter

Do you want the task to fail when a JSHint error happens? gulp-jshint includes a simple utility for this.

This example will log the errors using the stylish reporter, then fail if JSHint was not a success.

```js
stuff
  .pipe(jshint())
  .pipe(jshint.reporter('jshint-stylish'))
  .pipe(jshint.reporter('fail'))
```

### Custom Reporters

Custom reporters don't interact with this module at all. jshint will add some attributes to the file object and you can add a custom reporter downstream.

```js
var jshint = require('gulp-jshint');
var map = require('map-stream');

var myReporter = map(function (file, cb) {
  if (!file.jshint.success) {
    console.log('JSHINT fail in '+file.path);
    file.jshint.results.forEach(function (err) {
      if (err) {
        console.log(' '+file.path + ': line ' + err.line + ', col ' + err.character + ', code ' + err.code + ', ' + err.reason);
      }
    });
  }
  cb(null, file);
});

gulp.task('lint', function() {
  return gulp.files('./lib/*.js')
    .pipe(jshint())
    .pipe(myReporter);
});
```

### Reporter Configuration

Some reporters have options which, and you can pass them to `jshint.reporter()`. Here is an example of useing verbose mode with the default JSHint reporter.

```js
gulp.task('lint', function() {
  return gulp.files('./lib/*.js')
    .pipe(jshint())
    .pipe(jshint.reporter('default', { verbose: true }));
});
```

## Extract

Tells JSHint to extract JavaScript from HTML files before linting (see [JSHint CLI flags](http://www.jshint.com/docs/cli/)). Keep in mind that it doesn't override the file's content after extraction. This is your tool of choice to lint web components!

```js
gulp.task('lintHTML', function() {
  return gulp.src('./src/*.html')
    // if flag is not defined default value is 'auto'
    .pipe(jshint.extract('auto|always|never'))
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
});
```

## LICENSE

The MIT License (MIT)

Copyright (c) 2014 Spencer Alger

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
