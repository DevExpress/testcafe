---
layout: docs
title: Browser Provider Plugin
permalink: /documentation/extending-testcafe/browser-provider-plugin/
---
# Browser Provider Plugin

TestCafe supports testing in a number of popular browsers (see [Browser Support](../../using-testcafe/common-concepts/browsers/browser-support.md)).
If you need to use a different browser (for example, a browser from a cloud service), you can create a **custom browser provider plugin**.
The provider should expose methods for performing common actions on the browser windows during testing: opening and closing it, taking screenshot, etc.

This topic contains the following sections.

* [Generating Browser Provider Project](#generating-browser-provider-project)
* [Implementing the Browser Provider](#implementing-the-browser-provider)
* [Building the Provider](#building-the-provider)
* [Using the Provider Development Version](#using-the-provider-development-version)
* [Publishing the Provider to npm](#publishing-the-provider-to-npm)
* [Specifying a Browser for a Test Task](#specifying-a-browser-for-a-test-task)

> To run tests on [Sause Labs](https://saucelabs.com) or [headless](https://github.com/segmentio/nightmare) browsers,
> you can use the existing [testcafe-browser-provider-saucelabs](https://github.com/DevExpress/testcafe-browser-provider-saucelabs/)
> or [testcafe-browser-provider-nightmare](https://github.com/ryx/testcafe-browser-provider-nightmare) plugin.

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

async canResizeWindowToDimensions (/* browserId, width, height */) {
    return true;
}

async takeScreenshot (/* id, screenshotPath, pageWidth, pageHeight */) {
    this.reportWarning('The screenshot functionality is not supported by the "my-provider" browser provider.');
}

async maximizeWindow (/*browserId*/) {
    this.reportWarning('The window maximization functionality is not supported by the "my-provider" browser provider.');
}
```

To implement these methods, you can use the [testcafe-browser-tools](https://github.com/DevExpress/testcafe-browser-tools) library that contains methods for performing platform-dependent actions on browser windows.

### Example

The following example code demonstrates how you can implement the simple browser provider for portable browsers.

```js
import path from 'path';
import browserTools from 'testcafe-browser-tools';

function getScreenSize () {
    return { width: screen.availWidth, height: screen.availHeight };
}

export default {
    isMultiBrowser: true,
    screenSizes: {},

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

        await this.waitForConnectionReady(id);

        this.screenSizes[id] = await this.runInitScript(id, getScreenSize.toString());
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

    async canResizeWindowToDimensions (id, width, height) {
        var { width: screenWidth, height: screenHeight } = this.screenSizes[id];

        return width <= screenWidth && height <= screenHeight;
    }

    async maximizeWindow (id) {
        await browserTools.maximize(id);
    },

    async takeScreenshot (id, screenshotPath) {
        await browserTools.screenshot(id, screenshotPath);
    },
};
```

> To learn how to implement provider methods, you can also explore the existing browser provider plugins,
> for example, [testcafe-browser-provider-saucelabs](https://github.com/DevExpress/testcafe-browser-provider-saucelabs/)
> or [testcafe-browser-provider-nightmare](https://github.com/ryx/testcafe-browser-provider-nightmare).

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

For information on how to specify a browser in tests, see [Specifying a Browser for a Test Task](#specifying-a-browser-for-a-test-task).

## Publishing the Provider to npm

When you finish developing the provider, you can publish it to npm by running the `publish-please` npm script.
This script builds the package, tests the provider and then uses [publish-please](https://github.com/inikulin/publish-please) to publish it to npm.
That is why using the `publish-please` script instead of `npm publish` is what is recommended.

```bash
npm run publish-please
```

After that, you can install the provider plugin as you would [install any other plugin](../README.md#installing-plugins).

## Specifying a Browser for a Test Task

When running tests, you can specify a browser accessed through the provider plugin by using a *browser alias*.
The alias consists of the browser provider name and the name of the browser itself (the latter may be omitted in some providers); for example, `saucelabs:Chrome@52.0:Windows 8.1` or `nightmare`.

To obtain all the available aliases for your provider, run the `testcafe --list-browsers {shortProviderName}` command, where `{shortProviderName}` is the provider name (without the `testcafe-browser-provider-` prefix); for example, `testcafe --list-browsers my-provider`.