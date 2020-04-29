---
layout: docs
title: Extending TestCafe
permalink: /documentation/guides/extend-testcafe/install-plugins.html
redirect_from:
  - /documentation/extending-testcafe/
---
# Install Plugins

The TestCafe functionality can be extended by using plugins and extensions.
You can install existing plugins or develop custom ones that will suit your needs.

You can install plugins from npm in two ways:

* **locally** - if you are going to use plugins within TestCafe installed locally.

    Navigate to your project directory and run the following command.

    ```bash
    npm install --save-dev {pluginName}
    ```

* **globally** - if the TestCafe module is installed globally or you are going to use plugins within other projects as well.

    Run the `npm install` command with a `-g` flag.

    ```bash
    npm install -g {pluginName}
    ```

## Create Plugins

The following topics provide detailed information on creating the most widely used plugins and extensions.

* [Reporter Plugin](reporter-plugin.md)
* [Browser Provider Plugin](browser-provider-plugin.md)

## Selected Plugins

This section lists the most popular plugins. Plugins developed by the TestCafe team are officially supported and maintained.

**Browser Providers**

* [SauceLabs](https://github.com/DevExpress/testcafe-browser-provider-saucelabs) (by the *TestCafe team*)
* [BrowserStack](https://github.com/DevExpress/testcafe-browser-provider-browserstack) (by the *TestCafe team*)
* [CrossBrowserTesting](https://github.com/sijosyn/testcafe-browser-provider-crossbrowsertesting) (by [@sijosyn](https://github.com/sijosyn))
* [LambdaTest](https://github.com/LambdaTest/testcafe-browser-provider-lambdatest) (by [@kanhaiya15](https://github.com/kanhaiya15))
* [Electron](https://github.com/DevExpress/testcafe-browser-provider-electron) (by the *TestCafe team*)
* [Puppeteer](https://github.com/jdobosz/testcafe-browser-provider-puppeteer) (by [@jdobosz](https://github.com/jdobosz))

**Framework-Specific Selectors**

* [React](https://github.com/DevExpress/testcafe-react-selectors) (by the *TestCafe team*)
* [Angular](https://github.com/DevExpress/testcafe-angular-selectors) (by the *TestCafe team*)
* [Vue](https://github.com/devexpress/testcafe-vue-selectors) (by the *TestCafe team*)
* [Aurelia](https://github.com/miherlosev/testcafe-aurelia-selectors) (by the *TestCafe team*)

**Plugins for Task Runners**

* [Grunt](https://github.com/crudo/grunt-testcafe) (by [@crudo](https://github.com/crudo))
* [Gulp](https://github.com/DevExpress/gulp-testcafe) (by [@inikulin](https://github.com/inikulin))

**Custom Reporters**

* [TeamCity](https://github.com/Soluto/testcafe-reporter-teamcity) (by [@nirsky](https://github.com/nirsky))
* [Slack](https://github.com/Shafied/testcafe-reporter-slack) (by [@Shafied](https://github.com/Shafied))
* [NUnit](https://github.com/AndreyBelym/testcafe-reporter-nunit) (by the *TestCafe team*)

**GitHub Actions**

* [Run TestCafe](https://github.com/DevExpress/testcafe-action/) (by the *TestCafe team*)

**IDE Plugins**

* [TestCafe Test Runner](https://github.com/romanresh/vscode-testcafe) for Visual Studio Code (by [@romanresh](https://github.com/romanresh))
* [TestLatte](https://github.com/Selminha/testlatte) for Visual Studio Code (by [@Selminha](https://github.com/Selminha))
* [TestCafe Runner for WebStorm](https://github.com/lilbaek/webstorm-testcafe) (by [@lilbaek](https://github.com/lilbaek))
* [SublimeText](https://github.com/churkin/testcafe-sublimetext) (by [@churkin](https://github.com/churkin))

More plugins are listed on the [TestCafe GitHub page](https://github.com/DevExpress/testcafe#plugins).