---
layout: post
title: TestCafe v1.3.1 Released
permalink: /blog/:title.html
---
# TestCafe v1.3.1 Released

This release fixes an issue caused by `tsconfig.json` auto-detection.

<!--more-->

Version 1.3.0 introduced support for [custom TypeScript configuration files](../documentation/guides/concepts/typescript-and-coffeescript.md#customize-compiler-options) where you can provide the compiler options. This feature included automatic detection of these configuration files. If the directory from which you run tests contained a `tsconfig.json` file, TestCafe would apply it by default.

However, this behavior caused troubles for users who have already had `tsconfig.json` files with conflicting settings in their projects. TestCafe attempted to apply these configurations, which resulted in issues with test compilation.

In v1.3.1, we have disabled `tsconfig.json` auto-detection. Now you must explicitly specify the `tsconfig.json` file location to apply the compiler settings. You can do it in one of the following ways:

* the [--ts-config-path](../documentation/reference/command-line-interface.md#--ts-config-path-path) command line parameter,

    ```sh
    testcafe chrome my-tests --ts-config-path /Users/s.johnson/testcafe/tsconfig.json
    ```

* the [runner.tsConfigPath](../documentation/reference/testcafe-api/runner/tsconfigpath.md) API method,

    ```js
    runner.tsConfigPath('/Users/s.johnson/testcafe/tsconfig.json');
    ```

* the [tsConfigPath](../documentation/reference/configuration-file.md#tsconfigpath) configuration file property.

    ```json
    {
        "tsConfigPath": "/Users/s.johnson/testcafe/tsconfig.json"
    }
    ```

We strongly recommend that you upgrade to v1.3.1. We apologize for any inconvenience.
