---
layout: docs
title: Use TestCafe with Gulp
permalink: /documentation/recipes/integrations/gulp.html
redirect_from:
  - /documentation/recipes/using-testcafe-with-grunt.html
  - /documentation/recipes/use-task-runners/gulp.html
---
# Use TestCafe with Gulp

If you are using Gulp to organize your build process,
you can easily integrate TestCafe into the workflow.

Suppose you have a project that uses Gulp.js to run build tasks. To integrate TestCafe into the project, go through these steps.

* [Step 1 - Install TestCafe Gulp Plugin](#step-1---install-testcafe-gulp-plugin)
* [Step 2 - Create a TestCafe Gulp Task](#step-2---create-a-testcafe-gulp-task)
* [Step 3 - Run the TestCafe Task](#step-3---run-the-testcafe-task)

## Step 1 - Install TestCafe Gulp Plugin

To install the [TestCafe Gulp plugin](https://github.com/DevExpress/gulp-testcafe),
execute the following command from your project's root directory.

```sh
npm install --save-dev gulp-testcafe
```

## Step 2 - Create a TestCafe Gulp Task

Open `Gulpfile.js` and add a task that runs TestCafe tests.

```js
const gulp     = require('gulp');
const testcafe = require('gulp-testcafe');

gulp.task('run-testcafe-tests', () => {
    return gulp
        .src('tests/test.js')
        .pipe(testcafe({ browsers: ['chrome', 'firefox'] }));
});
```

This task runs tests from the `tests/test.js` file in Chrome and Firefox.

For a complete API Reference, see [the plugin page](https://github.com/DevExpress/gulp-testcafe#gulp-testcafe).

## Step 3 - Run the TestCafe Task

Run this task through the command line.

```sh
gulp run-testcafe-tests
```

> Gulp must be installed globally to run tasks from the command line.

Alternatively, you can create and run a dependent task.

```js
gulp.task('publish', ['run-testcafe-tests'], () => {
    /* ... */
});
```
