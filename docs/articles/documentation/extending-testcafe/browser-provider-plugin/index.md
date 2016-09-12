---
layout: docs
title: Browser Provider Plugin
permalink: /documentation/extending-testcafe/browser-provider-plugin/
---
# Browser Provider Plugin

TestCafe has built-in support for testing in a number of popular browsers (see [Directly Supported Browsers](../../using-testcafe/common-concepts/browser-support.md#directly-supported-browsers)).
If you need to use a different browser (for example, a browser from a cloud service), you can create a **custom browser provider plugin**.
The provider should expose methods for performing common actions on the browser windows during testing: opening and closing it, taking screenshot, etc.

To create a browser provider plugin, go through the following steps.

* [Generating Browser Provider Project](#generating-browser-provider-project)
* [Implementing the Browser Provider](#implementing-the-browser-provider)
* [Building the Provider](#building-the-provider)
* [Using the Provider Development Version](#using-the-provider-development-version)
* [Publishing the Provider to npm](#publishing-the-provider-to-npm)

> To run tests in [Sause Labs](https://saucelabs.com) or [PhantomJS](http://phantomjs.org/) browsers, you can use the existing [testcafe-browser-provider-saucelabs](https://github.com/DevExpress/testcafe-browser-provider-saucelabs/) or [testcafe-browser-provider-phantomjs](https://github.com/DevExpress/testcafe-browser-provider-phantomjs) plugin.

## Generating Browser Provider Project

To create a browser provider project, use the [TestCafe browser provider generator](https://github.com/DevExpress/generator-testcafe-browser-provider).
The generator will scaffold out the plugin, so that you only need to write a few lines of code.

First, install [Yeoman](http://yeoman.io) and `generator-testcafe-browser-provider` using [npm](https://www.npmjs.com/).

```bash
npm install -g yo
npm install -g generator-testcafe-browser-provider
```

Create a new directory where the generator should place your scaffolded project files and go into it.

```bash
mkdir my-provider
cd my-provider
```

> It is recommended that you name the directory as you would name the browser provider project. When you run the generator, it will automatically suggest the browser provider name that matches the browser provider directory name.
>
> The generator will also automatically create the provider package name that consists of two parts - the `testcafe-browser-provider-` prefix and the name of the provider itself; for example, `testcafe-browser-provider-my-provider`.
>
> **Important:** If you name the provider package manually, its name must start with the `testcafe-browser-provider-` prefix. Otherwise, TestCafe will be unable to recognize the plugin.

Then, run the browser provider generator to create a new project.

```bash
yo testcafe-browser-provider
```

The generator will ask you a few questions about the browser provider. Then, Yeoman will automatically scaffold out the provider, install the required dependencies, and pull in several useful Gulp tasks for your workflow.

## Implementing the Browser Provider

Once the browser provider has been scaffolded out, go to the provider directory and open the `src/index.js` file.

There are several required and optional [provider methods](browser-provider-methods.md) you can implement.

```js
// Required methods
async openBrowser (/* id, pageUrl, browserName */) {
    throw new Error('Not implemented!');
},

async closeBrowser (/* id */) {
    throw new Error('Not implemented!');
},

// Optional initialization and cleanup methods
async init () {
    return;
},

async dispose () {
    return;
},

// Optional methods for multi-browser support
async getBrowserList () {
    throw new Error('Not implemented!');
},

async isValidBrowserName (/* browserName */) {
    return true;
},

// Optional extra methods
async resizeWindow (/* id, width, height, currentWidth, currentHeight */) {
    this.reportWarning('The window resize functionality is not supported by the "my-provider" browser provider.');
},

async takeScreenshot (/* id, screenshotPath, pageWidth, pageHeight */) {
    this.reportWarning('The screenshot functionality is not supported by the "my-provider" browser provider.');
}
```

To implement these methods, you can use the [testcafe-browser-tools](https://github.com/DevExpress/testcafe-browser-tools) library that contains methods for performing platform-dependent actions on browser windows.

### Example

The following example code demonstrates how you can implement the simple browser provider for portable browsers.

```js
import path from 'path';
import browserTools from 'testcafe-browser-tools';

export default {
    isMultiBrowser: true,

    async openBrowser (id, pageUrl, browserName) {
        var browserInfo = {};

        switch (browserName) {
            case 'firefox':
                browserInfo.path = path.join(process.env.PORTABLE_BROWSERS_PATH, 'FirefoxPortable/FirefoxPortable.exe');
                browserInfo.cmd  = '-new-window';
                break;
            case 'chrome':
                browserInfo.path = path.join(process.env.PORTABLE_BROWSERS_PATH, 'GoogleChromePortable/GoogleChromePortable.exe');
                browserInfo.cmd  = '--new-window';
                break;
            default:
                throw new Error('Unsupported browser!');
        }

        await browserTools.open(browserInfo, pageUrl);
    },

    async closeBrowser (id) {
        await browserTools.close(id);
    },

    async getBrowserList () {
        return ['firefox', 'chrome'];
    },

    async isValidBrowserName (browserName) {
        var browserList = await this.getBrowserList();

        return browserList.indexOf(browserName) > -1;
    },

    async resizeWindow (id, width, height, currentWidth, currentHeight) {
        await browserTools.resize(id, currentWidth, currentHeight, width, height);
    },

    async takeScreenshot (id, screenshotPath) {
        await browserTools.screenshot(id, screenshotPath);
    },
};
```

> To learn how to implement provider methods, you can also explore the existing browser provider plugins, for example, [testcafe-browser-provider-saucelabs](https://github.com/DevExpress/testcafe-browser-provider-saucelabs/) or [testcafe-browser-provider-phantomjs](https://github.com/DevExpress/testcafe-browser-provider-phantomjs).

## Building the Provider

You can build a browser provider project by using the `build` Gulp task.

```bash
gulp build
```

## Using the Provider Development Version

If you are still developing the browser provider, but need to test it within TestCafe, there is no need to publish the browser provider package to npm.
You can link the browser provider to TestCafe by using the [npm link](https://docs.npmjs.com/cli/link) command.
This allows you to work on the browser provider project and test it iteratively without having to re-publish everytime you make a change.

To link the browser provider package, navigate to the provider directory and run `npm link`:

```bash
cd my-provider
npm link
```

After that, TestCafe will use the provider version you are currently developing.

For information on how to specify a browser in tests, see [Specifying Browsers for Test Task](../../using-testcafe/common-concepts/browser-support.md#specifying-browsers-for-test-task).

## Publishing the Provider to npm

When you finish developing the provider, you can publish it to npm by running the `publish-please` npm script.
This script builds the package, tests the provider and then uses [publish-please](https://github.com/inikulin/publish-please) to publish it to npm.
That is why using the `publish-please` script instead of `npm publish` is what is recommended.

```bash
npm run publish-please
```

After that, you can install the provider plugin as you would [install any other plugin](../index.md#installing-plugins).