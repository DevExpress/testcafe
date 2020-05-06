---
layout: docs
title: Reporter Plugin
permalink: /documentation/guides/extend-testcafe/reporter-plugin.html
redirect_from:
  - /documentation/extending-testcafe/reporter-plugin/
---
# Reporter Plugin

TestCafe has a number of [built-in reporters](../../guides/concepts/reporters.md) to generate test reports in different formats.
You can also create a **custom reporter** that will output information in your own format and style.
For this purpose, you can use the [TestCafe reporter generator](https://github.com/DevExpress/generator-testcafe-reporter).
The generator will scaffold out a reporter plugin, so that you only need to write a few lines of code.

To create a reporter plugin, go through the following steps.

* [Generate a Reporter Project](#generate-a-reporter-project)
* [Implement the Reporter](#implement-the-reporter)
* [Build the Reporter](#build-the-reporter)
* [Test the Reporter](#test-the-reporter)
* [Preview the Report](#preview-the-report)
* [Use the Reporter Development Version](#use-the-reporter-development-version)
* [Publish the Reporter to npm](#publish-the-reporter-to-npm)

> You can also specify a reporter object in the [TestCafe programming interface](../../reference/testcafe-api/runner/reporter.md#specify-a-custom-reporter). However, a reporter plugin is easier to reuse and maintain.

## Generate a Reporter Project

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

> It is recommended that you name the directory as you would name your reporter project. When you run the generator,
it will automatically suggest the reporter name that matches the reporter directory name.
>
> The generator will also automatically create the reporter package name that consists of two parts - the `testcafe-reporter-` prefix and the name of the reporter itself, for example, `testcafe-reporter-my-reporter`.
>
> **Important:** If you name the reporter package manually, its name must begin with the `testcafe-reporter-` prefix. Otherwise, TestCafe will be unable to recognize the plugin.

Then, run the reporter generator to create a new project.

```bash
yo testcafe-reporter
```

The generator will ask you a few questions about the reporter.
Then Yeoman will automatically scaffold out your reporter, install the required dependencies, and pull in several useful Gulp tasks for your workflow.

## Implement the Reporter

Once the reporter has been scaffolded out, go to the reporter directory and open the `src/index.js` file.

Implement the following reporter methods (four mandatory and one optional):

```js
export default function () {
    return {
        async reportTaskStart (/* startTime, userAgents, testCount */) {
            throw new Error('Not implemented');
        },

        async reportFixtureStart (/* name, path, meta */) {
            throw new Error('Not implemented');
        },

        async reportTestStart (/* name, meta */) {
            // NOTE: This method is optional.
        },

        async reportTestDone (/* name, testRunInfo, meta */) {
            throw new Error('Not implemented');
        },

        async reportTaskDone (/* endTime, passed, warnings, result */) {
            throw new Error('Not implemented');
        }
    };
}
```

TestCafe calls these methods during the test run. Use data they receive through their parameters to create a report.
See [Reporter Methods](../../reference/plugin-api/reporter.md) for API description and examples.

Use [helper methods and libraries](../../reference/plugin-api/reporter.md#helper-methods) to write and format the report.
TestCafe mixes the helper methods into the reporter. You can access them with `this`.

In the `src/index.js` file, you can specify the `noColors` property to enable or disable colors in the reporter output.
To customize colors, use the [chalk](../../reference/plugin-api/reporter.md#chalk) methods.

**Example**

The following example demonstrates how you can implement the four main methods,
so that the generated report contains information about user agents used for testing,
the result of individual test execution, summary information about passed/failed tests,
and the overall duration of the tests.

```js
export default function () {
    return {
        async reportTaskStart (startTime, userAgents, testCount) {
            this.startTime = startTime;
            this.testCount = testCount;

            this.write(`Running tests in: ${userAgents}`)
                .newline()
                .newline();
        },

        async reportFixtureStart (name, path, meta) {
            this.currentFixtureName = name;
        },

        async reportTestDone (name, testRunInfo, meta) {
            const errors      = testRunInfo.errs;
            const warnings    = testRunInfo.warnings;
            const hasErrors   = !!errors.length;
            const hasWarnings = !!warnings.length;
            const result      = hasErrors ? `passed` : `failed`;

            name = `${this.currentFixtureName} - ${name}`;

            const title = `${result} ${name}`;

            this.write(title);

            if(hasErrors) {
                this.newline()
                    .write('Errors:');

                errors.forEach(error => {
                    this.newline()
                        .write(this.formatError(error));
                });
            }

            if(hasWarnings) {
                this.newline()
                    .write('Warnings:');

                warnings.forEach(warning => {
                    this.newline()
                        .write(warning);
                });
            }
        },

        async reportTaskDone (endTime, passed, warnings, result) {
            const durationMs  = endTime - this.startTime;
            const durationStr = this.moment
                                    .duration(durationMs)
                                    .format('h[h] mm[m] ss[s]');
            let footer = result.failedCount ?
                        `${result.failedCount}/${this.testCount} failed` :
                        `${result.passedCount} passed`;

            footer += ` (Duration: ${durationStr})`;
            footer += ` (Skipped: ${result.skippedCount})`;
            footer += ` (Warnings: ${warnings.length})`;

            this.write(footer)
                .newline();
        }
    };
}
```

Here is a sample report generated by this reporter.

```text
Running tests in: Chrome 41.0.2227 / Mac OS X 10.10.1,Firefox 47 / Mac OS X 10.10.1

failed First fixture - First test in first fixture
failed First fixture - Second test in first fixture
failed First fixture - Third test in first fixture
failed Second fixture - First test in second fixture
failed Second fixture - Second test in second fixture
failed Third fixture - First test in third fixture
2/6 failed (Duration: 15m 25s)
```

## Build the Reporter

You can build the reporter project by using the `build` Gulp task.

```bash
gulp build
```

## Test the Reporter

To make sure your reporter operates well, you can use the `test` Gulp task.
To get this task to work, provide reference reports in your format.
During testing, reports generated by the reporter will be compared with these reference reports.

First, you need to know what data to use in these reports. There are two ways of determining this.

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

## Preview the Report

You can preview the report built by your reporter using the `preview` Gulp task.

```bash
gulp preview
```

## Use the Reporter Development Version

If you are still developing the reporter, but need to test it within TestCafe, there is no need to publish the reporter package to npm.
You can link the reporter to TestCafe by using the [npm link](https://docs.npmjs.com/cli/link) command.
This allows you to work on the reporter project and test it iteratively without having to re-publish the project every time you make a change to it.

To link the reporter package, navigate to the reporter directory and run `npm link`:

```bash
cd my-reporter
npm link
```

After that, TestCafe will use the reporter version you are currently developing.

For information on how to specify a reporter in tests, see [Using Reporters](../concepts/reporters.md#use-the-reporters).

## Publish the Reporter to npm

When you finish developing the reporter, you can publish it to npm by running the `publish-please` npm script.
This script builds the package, tests the reporter and then uses [publish-please](https://github.com/inikulin/publish-please) to publish it to npm.
That is why using the `publish-please` script instead of `npm publish` is what is recommended.

```bash
npm run publish-please
```

After that, you can install the reporter plugin as you would [install any other plugin](install-plugins.md) and use it in the same manner
as you would use [built-in reporters](../concepts/reporters.md#use-the-reporters).
