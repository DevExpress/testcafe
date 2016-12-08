---
layout: post
title: TestCafe v0.10.0 Released
permalink: /blog/:title.html
---
# TestCafe v0.10.0 Released

First of all, we would like to thank everyone who's reading this for your interest and support for TestCafe.
And we especially appreciate those of you who reached us to say thank you, offer help or share feedback.
Let's keep building a better testing framework together!

So, here is our first minor update and that's what it includes.

<!--more-->

## Enhancements

### Snapshot API shorthands
  
Previously, if you needed to use a single property from the snapshot, you had to introduce two assignments

```js
const snapshot = await selector();
const nodeType = snapshot.nodeType;
```

or additional parentheses.

```js
const nodeType = (await selector()).nodeType;
```

Now snapshot methods and property getters are exposed by selectors
(and selector promises as well) so that you can write more compact code.

```js
const nodeType = await selector.nodeType;

// or

const nodeType = await selector('someParam').nodeType;
```

However, shorthand properties do not allow you to omit parentheses when working with dictionary properties
like `style`, `attributes` or `boundingClientRect`.

```js
const width = (await selector.style)['width'];
```

That is why we have also introduced shorthand methods for these dictionaries: `getStyleProperty`, `getAttribute` and `getBoundingClientRectProperty`.

```js
const width = await selector.getStyleProperty('width');
const id    = await selector.getAttribute('id');
const left  = await selector.getBoundingClientRectProperty('left');
```

Finally, we have added the `hasClass` method.

```js
if (await selector.hasClass('foo')) {
    //...
}
```

See [Snapshot API Shorthands](https://devexpress.github.io/testcafe/documentation/test-api/selecting-page-elements/selectors.html#obtain-element-state).  

### Improved automatic wait mechanism

We got rid of unnecessary waiting so that tests now run almost two times faster.

![Tests running in v0.10.0 vs v0.9.0](https://raw.githubusercontent.com/DevExpress/testcafe/master/media/new-0-10-0-autowait.gif)

### Test execution speed control

We have introduced an option that allows you to specify how fast tests run.

By default, tests run at the maximum speed. However, if you need to watch a test running to understand what happens in it,
this speed may seem too fast. In this instance, use the new `speed` option to slow the test down.

This option is available from the command line

```sh
testcafe chrome my-tests --speed 0.1
```

and from the API.

```js
await runner.run({
    speed: 0.1
})
```

You can use factor values between `1` (the fastest, used by default) and `0.01` (the slowest).

### t.maximizeWindow test action

We have added a test action that maximizes the browser window.

```js
import { expect } from 'chai';
import { Selector } from 'testcafe';

const menu = Selector('#side-menu');

fixture `My fixture`
    .page `http://www.example.com/`;

test('Side menu is displayed in full screen', async t => {
    await t.maximizeWindow();

    expect(await menu.visible).to.be.ok;
});
```

## Bug Fixes

* The `t.resizeWindow` and `t.resizeWindowToFitDevice` actions now work correctly on macOS ([#816](https://github.com/DevExpress/testcafe/issues/816))
* Browser aliases are now case insensitive in the command line ([#890](https://github.com/DevExpress/testcafe/issues/890))
* Tests no longer hang if target scrolling coordinates are fractional ([#882](https://github.com/DevExpress/testcafe/issues/882))
* The 'Element is not visible' error is no longer raised when scrolling a document in Quirks mode ([#883](https://github.com/DevExpress/testcafe/issues/883))
* `<table>` child elements are now focused correctly ([#889](https://github.com/DevExpress/testcafe/issues/889))
* The page is no longer scrolled to the parent element when focusing on a non-focusable child during click automation ([#913](https://github.com/DevExpress/testcafe/issues/913))
* Browser auto-detection now works with all the Linux distributions ([#104](https://github.com/DevExpress/testcafe-browser-tools/issues/104),
  [#915](https://github.com/DevExpress/testcafe/issues/915))