---
layout: docs
title: Reporters
permalink: /documentation/guides/concepts/reporters.html
redirect_from:
  - /documentation/using-testcafe/common-concepts/reporters.html
---
# Reporters

Reporters are plugins used to output test run reports in a certain format.

TestCafe ships with the following reporters:

* [spec](https://github.com/DevExpress/testcafe-reporter-spec) - used by default
* [list](https://github.com/DevExpress/testcafe-reporter-list)
* [minimal](https://github.com/DevExpress/testcafe-reporter-minimal)
* [xUnit](https://github.com/DevExpress/testcafe-reporter-xunit)
* [JSON](https://github.com/DevExpress/testcafe-reporter-json)

You can also create a [custom reporter](../extend-testcafe/reporter-plugin.md) that fulfills your needs.

Here are some custom reporters developed by the community.

* [NUnit](https://github.com/AndreyBelym/testcafe-reporter-nunit)
* [Slack](https://github.com/Shafied/testcafe-reporter-slack)
* [TeamCity](https://github.com/Soluto/testcafe-reporter-teamcity)
* [Tesults](https://www.npmjs.com/package/testcafe-reporter-tesults)

For more information about the reporters, see the following sections.

* [Search for Reporter Plugins](#search-for-reporter-plugins)
* [Install the Reporters](#install-the-reporters)
* [Use the Reporters](#use-the-reporters)

## Search for Reporter Plugins

Reporter plugins are npm packages. The reporter package name consists of two parts - the `testcafe-reporter-` prefix and the name of a reporter itself; for example, `testcafe-reporter-list`.

You can search for available reporter packages on npm: [https://www.npmjs.com/search?q=testcafe-reporter](https://www.npmjs.com/search?q=testcafe-reporter).

## Install the Reporters

You can install reporter packages from npm as you would install any other plugin. See [Install Plugins](../extend-testcafe/install-plugins.md).

## Use the Reporters

When running tests, you can select a reporter to generate test reports.
You can do this by using the
[-r (--reporter)](../../reference/command-line-interface.md#-r-nameoutput---reporter-nameoutput) command line option or the
[runner.reporter](../../reference/testcafe-api/runner/reporter.md) API method.
