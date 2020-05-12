---
layout: docs
title: Use TestCafe with Grunt
permalink: /documentation/recipes/integrations/grunt.html
redirect_from:
  - /documentation/recipes/using-testcafe-with-grunt.html
  - /documentation/recipes/use-task-runners/grunt.html
---
# Use TestCafe with Grunt

You can easily integrate TestCafe with the [Grunt.js](https://gruntjs.com/) task runner.
This recipe shows how to configure a Grunt task to run TestCafe tests.

> You need to have Grunt v0.4 or newer to use it with TestCafe.

## Step 1 - Install TestCafe Grunt Plugin

Assuming that you already have Grunt installed in your project, you also need to install the [TestCafe Grunt plugin](https://github.com/crudo/grunt-testcafe).

```sh
npm install grunt-testcafe --save-dev
```

## Step 2 - Adding a TestCafe Task to Gruntfile

In `Gruntfile.js`, add a property named `testcafe` to the data object passed to the `grunt.initConfig` method.

```js
grunt.initConfig({
    testcafe: {
        test: {
            options: {
                files: ['tests/*.js'],
                browsers: ['chrome']
            }
        }
    }
});
```

This code declares a task that opens Google Chrome and runs tests from all test files in the `tests` directory.

For more information about the available options, see [Grunt Plugin Options](https://github.com/crudo/grunt-testcafe#options).

You also need to add a line of code that loads the TestCafe plugin. Put this below the `initConfig` method call.

```js
grunt.loadNpmTasks('grunt-testcafe');
```

## Step 3 - Running the Grunt Task

Now you can run the Grunt task from the console with a single command.

```sh
grunt testcafe
```

## Acknowledgements

Thanks to [Martin Cermak](https://github.com/crudo) for making the TestCafe Grunt plugin.
