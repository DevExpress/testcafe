---
layout: post
title: "How to Speed up Debugging in TestCafe: Tips and Tricks"
permalink: /media/team-blog/:title.html
isTeamBlog: true
author: Sergey Shurygin, Vasily Strelyaev
---
# How to Speed up Debugging in TestCafe: Tips and Tricks

In the previous post, we talked about the approaches you can follow to debug TestCafe tests. In this post, we will focus on best practices that help you save time while debugging.  We will also mention a few things to keep in mind in order to write easy-to-debug tests.

<!--more-->

## Tips on how to debug tests

**If you know which test throws an error, run this test separately.**

If you only need to check one test, do not wait until all tests pass. TestCafe can run any single test separately. Add the [--test shell argument](../../documentation/reference/command-line-interface.md#-t-name---test-name) or use the [test.only](../../documentation/reference/test-api/test/only.md) method in test code. (Be sure to remove `.only` before you commit changes.)

```sh
testcafe chrome ./tests --test "My test name"
```

```js
test('My first test', async t => {
    /* ... */
}).only;
```

**Use live mode when you edit tests.**

If you find yourself running a test repeatedly while you write or debug it, try live mode. In this mode, TestCafe watches the test file and restarts the test automatically after you save changes. To enable live mode, run the test with the [--live flag](../../documentation/reference/command-line-interface.md#-l---live).

```sh
testcafe chrome ./tests --live
```

**To identify an issue visually, decrease the test speed.**

By default, tests are executed at full speed – with minimum delays between actions and assertions. This makes it difficult to identify problems visually during a test run. To slow the test down, use the [--speed flag](../../documentation/reference/command-line-interface.md#--speed-factor). The argument value is between `1` (fastest) and `0.01` (slowest).

```sh
testcafe chrome ./tests --speed 0.1
```

**Use TestCafe Studio to determine why a selector does not work.**

TestCafe may report that a selector does not return any element, although you have written it correctly. The reason may be an invisible DOM element that matches the same selector expression. To get a better understanding of the issue, record a similar test in TestCafe Studio and compare your selector to the selector that is generated.

**If a test fails on CI, use screenshots and videos to clarify the reason.**

You do not have to run a test locally to determine the reason why a test fails on CI. TestCafe can take a screenshot when the test fails and record a video of the test run. To enable screenshots and video recording, use the [--screenshots-on-fail](../../documentation/reference/command-line-interface.md#-s---screenshots-on-fails) and [--video](../../documentation/reference/command-line-interface.md#--video-basepath) CLI options. See the following help topic for details: [Screenshots and Videos](../../documentation/guides/advanced-guides/screenshots-and-videos.md).

## Tips on how to write tests that are easy to debug

**Tests should be easy to run locally.**

If it is difficult to run a test locally, developers are likely to delay test fixes, so that they turn 'green' only shortly before the release. These delays may complicate the debug process.

Developers can easily reproduce test scenarios locally and maintain 'green' tests if the following is true:

* Tests are isolated from each other.
* The workstation environment is similar to the test environment.

Ideally, a developer must be able to run any test locally with a single command, which requires the following:

* The product test build is easy to run in a Docker container (or by another approach that emulates the test environment).
* Test data is seeded in test code (for example, within the `before` and `after` hooks).

**Tests should be independent.**

If subsequent tests use data produced by previous tests, you can expect the following two issues:

* When a previous test fails, all dependent tests will also fail.
* You cannot debug a test until all previous tests are complete.

To simplify debugging in the future, be sure to avoid dependencies between tests.

For more best practice tips, see the following help topic: [How to Scroll Web Pages Using TestCafe](https://devexpress.github.io/testcafe/media/team-blog/how-to-scroll-web-pages-using-testcafe.html).
