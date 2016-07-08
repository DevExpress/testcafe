---
layout: docs
title: Custom Reporter Plugin
permalink: /documentation/extending-testcafe/custom-reporter-plugin/
checked: true
---
# Custom Reporter Plugin

TestCafe has a number of [built-in reporters](../../using-testcafe/common-concepts/reporters.md) to generate test reports in different formats.
You can also create a **custom reporter** that will output information in your own format and style.
For this purpose, you can use the [TestCafe reporter generator](https://github.com/DevExpress/generator-testcafe-reporter).
The generator will scaffold out a reporter plugin, so that you only need to write a few lines of code.

For more information on how to implement the plugin, see the following sections.

* [Generating a Reporter Project](#generating-a-reporter-project)
* [Implementing the Reporter](#implementing-the-reporter)
* [Building the Reporter](#building-the-reporter)
* [Testing the Reporter](#testing-the-reporter)
* [Previewing the Report](#previewing-the-report)
* [Using the Reporter Development Version](#using-the-reporter-development-version)
* [Publishing the Reporter to NPM](#publishing-the-reporter-to-npm)
* [Reference](#reference)

## Generating a Reporter Project

First, install [Yeoman](http://yeoman.io) and `generator-testcafe-reporter` using [npm](https://www.npmjs.com/).

```bash
npm install -g yo
npm install -g generator-testcafe-reporter
```

Create a new directory where the generator should place your scaffolded project files and go into it.

```bash
mkdir my-reporter
cd my-reporter
```

**Note:** It is recommended to name the directory the same as you would like to name your reporter project. When you run the generator,
it will automatically suggest the reporter name that matches the reporter directory name. As for the reporter package name,
it will consist of two parts - the `{testcafe-reporter-}` prefix and the name of the reporter itself:

```text
{testcafe-reporter-my-reporter}
```

Then run the reporter generator to create a new project:

```bash
yo testcafe-reporter
```

The generator will provide additional settings to customize your reporter.
Then Yeoman will automatically scaffold out your reporter, install the required dependencies, and pull in several useful Gulp tasks for your workflow.

## Implementing the Reporter

Once the reporter has been scaffolded out, go to the reporter directory and open the `src/index.js` file.

You would need to implement four reporter methods.

```js
reportTaskStart (/* startTime, userAgents, testCount */) {
    throw new Error('Not implemented');
},

reportFixtureStart (/* name, path */) {
    throw new Error('Not implemented');
},

reportTestDone (/* name, errs, durationMs, unstable, screenshotPath */) {
    throw new Error('Not implemented');
},

reportTaskDone (/* endTime, passed */) {
    throw new Error('Not implemented');
}
```

These methods should output the desired information at certain moments during the test run.

* **reportTaskStart** - fires when a test task starts, which happens at the beginning of testing.

* **reportFixtureStart** - fires each time a fixture starts.

* **reportTestDone** - fires each time a test ends.

* **reportTaskDone** - fires when the entire task ends, which happens at the end of testing.

All the required data is provided for these methods through their parameters.

To output this information, use [helper methods](helper-methods.md) and libraries.
TestCafe will mixin the helper methods to the reporter, so that you can access the helper methods by using `this`.

In the `src/index.js` file, you can also enable or disable coloring of the reporter output by using the `noColors` property.
To color the output, use the [chalk](helper-methods.md#chalk) helper method.

**Example**

The following example demonstrates how you can implement the four main methods,
so that the generated report contains information about user agents used for testing,
the result of individual test execution, summary information about passed/failed tests,
and the overall duration of the tests.

```js
reportTaskStart (startTime, userAgents, testCount) {
    this.startTime = startTime;
    this.testCount = testCount;

    this.write(`Running tests in: ${userAgents}`)
        .newline()
        .newline();
},

reportFixtureStart (name) {
    this.currentFixtureName = name;
},

reportTestDone (name, errs) {
    const hasErr = !!errs.length;
    const result = hasErr ? `passed` : `failed`;

    name = `${this.currentFixtureName} - ${name}`;

    const title = `${result} ${name}`;

    this.write(title)
        .newline();
},

reportTaskDone (endTime, passed) {
    const durationMs  = endTime - this.startTime;
    const durationStr = this.moment
                            .duration(durationMs)
                            .format('h[h] mm[m] ss[s]');
    let footer = passed === this.testCount ?
                 `${this.testCount} passed` :
                 `${this.testCount - passed}/${this.testCount} failed`;

    footer += ` (Duration: ${durationStr})`;

    this.write(footer)
        .newline();
}
```

Here is a sample report generated by this reporter:

```text
Running tests in: Chrome,Firefox

failed fixture1 - fixture1test1

passed fixture1 - fixture1test2

failed fixture1 - fixture1test3

failed fixture2 - fixture2test1

failed fixture2 - fixture2test2

passed fixture3 - fixture3test1

2/6 failed (Duration: 15m 25s)
```

## Building the Reporter

You can build the reporter project by using the `build` Gulp task.

```bash
gulp build
```

## Testing the Reporter

To make sure your reporter operates well, you can use the `test` Gulp task.
To get this task to work, provide reference reports in your format.
During testing, reports generated by the custom reporter will be compared with these reference reports.

First, you need to know what data to use in these reports. There are two ways to do it.

* Refer to the test input data at `<reporter-directory>/test/utils/reporter-test-calls.js`. This file contains a
  sequence of reporter method calls. Each method uses a number of input data.
* Explore an existing reporter, say, the [list](https://github.com/DevExpress/testcafe-reporter-list) reporter.
  You can either run the `preview` Gulp task to view the reporter output in your terminal,
  or find the reference report at `/test/data/report-without-colors`.

Then, compose two reference reports.

* A regular report. Put it into `/test/data/` and name it `report-without-colors`.
* A colored report, which is a JSON file that consists of a single string - the report text with
  additional color information specified using [ANSI escape codes](https://en.wikipedia.org/wiki/ANSI_escape_code).
  Put this JSON file into `/test/data/` and name it `report-with-colors.json`.

After the reference reports are ready, you can use the `test` task.

```bash
gulp test
```

## Previewing the Report

You can preview the report built by your reporter using the `preview` Gulp task.

```bash
gulp preview
```

## Using the Reporter Development Version

If you are still developing the reporter, but need to test it within TestCafe, there is no need to publish the reporter package to npm.
You can link the reporter to TestCafe by using the [npm link](https://docs.npmjs.com/cli/link) command.
This allows you to work on the reporter project and test it iteratively without having to re-publish the project every time you make a change to it.

To link the reporter package, navigate to the reporter directory and run `npm link`:

```bash
cd my-reporter
npm link
```

After that TestCafe will use the reporter version you are currently developing.

For information on how to specify a reporter in tests, see [Using Reporters](../../using-testcafe/common-concepts/reporters.md#using-the-reporters).

## Publishing the Reporter to NPM

When you finish developing the reporter, you can publish it to npm by running the `publish-please` npm script.
This script builds the package, tests the reporter and then uses [publish-please](https://github.com/inikulin/publish-please) to publish it to npm.
That is why it is recommended to use the `publish-please` script instead of `npm publish`.

```bash
npm run publish-please
```

After that you can install the reporter and use it in the same manner
as you would use [built-in reporters](../../using-testcafe/common-concepts/reporters.md#using-the-reporters).

## Reference

* [Helper Methods](helper-methods.md)