---
layout: post
title: TestCafe v1.3.0 Released
permalink: /blog/:title.html
---
# TestCafe v1.3.0 Released

This release introduces support for the custom TypeScript configuration file and includes numerous bugfixes.

<!--more-->

## Enhancements

### ⚙ Customize TypeScript Compiler Options ([#1845](https://github.com/DevExpress/testcafe/issues/1845))

> **Update:** v1.3.1 disables automatic detection of the `tsconfig.json` file. See [v1.3.1 release notes](https://devexpress.github.io/testcafe/blog/testcafe-v1-3-1-released.html) for more information.

TestCafe now allows you to specify the [TypeScript compiler options](https://www.typescriptlang.org/docs/handbook/compiler-options.html) in the `tsconfig.json` configuration file. You can use these options to enable JSX compilation, import code or typings with `paths` aliases, set aliases to React typings, or customize other compiler settings.

Define the `compilerOptions` property in `tsconfig.json` and specify the compiler options in this property:

```json
{
    "compilerOptions": {
        "jsx": "react",
        "jsxFactory": "myFactory",
        "paths": {
            "jquery": [ "node_modules/jquery/dist/jquery" ]
        },
        "alwaysStrict": true
    }
}
```

Save this file to the directory from which you run tests (or use the [tsConfigPath](https://devexpress.github.io/testcafe/documentation/using-testcafe/configuration-file.html#tsconfigpath) setting in the main configuration file to specify a different location).

See [Customize Compiler Options](https://devexpress.github.io/testcafe/documentation/test-api/typescript-support.html#customize-compiler-options) for more information.

## Bug Fixes

* TestCafe now waits for asynchronous tasks in `reportTaskDone` to complete before it exits ([#3835](https://github.com/DevExpress/testcafe/issues/3835))
* `childNodes.length` now returns the correct result after you type in an `iframe` ([#3887](https://github.com/DevExpress/testcafe/issues/3887))
* TestCafe no longer hangs when a custom request hook throws an error ([#3786](https://github.com/DevExpress/testcafe/issues/3786))
* Error messages now show the correct selector chains for selectors that use the `with` method ([#3874](https://github.com/DevExpress/testcafe/issues/3874))
* TestCafe can now work with test files located on a Windows network drive ([#3918](https://github.com/DevExpress/testcafe/issues/3918))
* Page elements overlapped by the TestCafe status panel are now scrolled into view correctly ([#3924](https://github.com/DevExpress/testcafe/issues/3924))
* Labels with the `tabIndex` and `for` attributes are now focused correctly ([#3501](https://github.com/DevExpress/testcafe/issues/3501))
* Fixed a bug that prevented elements behind the footer from being scrolled up on some pages ([#2601](https://github.com/DevExpress/testcafe/issues/2601))
* Enhanced the previous fix for a Chrome 75 compatibility issue when `t.typeText` typed each character at the beginning of the input ([#3865](https://github.com/DevExpress/testcafe/issues/3865))
* jQuery scroll functions no longer cause errors ([testcafe-hammerhead/#2045](https://github.com/DevExpress/testcafe-hammerhead/issues/2045))
