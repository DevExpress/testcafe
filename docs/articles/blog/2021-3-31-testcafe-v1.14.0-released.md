---
layout: post
title: TestCafe v1.14.0 Released
permalink: /blog/:title.html
---
# TestCafe v1.14.0 Released

This update includes a bugfix and new API methods for page scrolling.

<!--more-->

## Enhancements

### ⚙ Scroll Actions ([PR #6066](https://github.com/DevExpress/testcafe/pull/6066))

Users of earlier TestCafe versions had to interact with off-screen DOM elements to scroll the page.

This release introduces dedicated scroll actions.

* [t.scroll](../documentation/reference/test-api/testcontroller/scroll.md) - scrolls the element to a specified position
* [t.scrollBy](../documentation/reference/test-api/testcontroller/scrollby.md) - scrolls the element by the specified number of pixels
* [t.scrollIntoView](../documentation/reference/test-api/testcontroller/scrollintoview.md) - scrolls the element into view

The `t.scroll` action scrolls the target to reveal the specified coordinates:

```js
 import { Selector } from 'testcafe';

 fixture`Scroll Action`
     .page('http://example.com');

 test('Scroll the container', async t => {
     const container = Selector('#container');

     await t
         .scroll(container, 'bottomRight')
 });
 ```

 The `t.scrollBy` action scrolls the target by a set amount of pixels. The example below scrolls the webpage 200px up and 500px to the right:

 ```js
 fixture`Scroll Action`
     .page('http://example.com');

 test('Scroll the webpage', async t => {
     await t
         .scrollBy(500, -200)
 });
 ```

The `t.scrollIntoView` action scrolls an element into view:

```js
 import { Selector } from 'testcafe';

 fixture `Scroll Actions`
     .page `http://www.example.com/`;

 test('Scroll element into view', async t => {
     const target = Selector('#target')

     await t
         .scrollIntoView(target)
 });
 ```

## Bug Fixes

* Fixed an error that caused [expect.contains](../documentation/reference/test-api/testcontroller/expect/contains.md) assertions to display `undefined` instead of a value in the assertion result ([#5473](https://github.com/DevExpress/testcafe/issues/5473))
