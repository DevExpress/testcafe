# Changelog

## v0.10.0 (2016-11-2)

### Enhancements

* Snapshot API shorthands.
  
  Previously, if you needed to use a single property from the snapshot, you had to write two assignments

  ```js
  const snapshot = await selector();
  const nodeType = snapshot.nodeType;
  ```

  or additional parentheses.

  ```js
  const nodeType = (await selector()).nodeType;
  ```

  Now snapshot methods and property getters are exposed by selectors
  (and by promises returned by selectors as well) so that you can write more compact code.

  ```js
  const nodeType = await selector.nodeType;

  // or

  const nodeType = await selector('someParam').nodeType;
  ```

  However, shorthand properties are not enough to avoid using parentheses with dictionary properties
  like `style`, `attributes` or `boudingClientRect`.
  
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

  See [Snapshot API Shorthands](https://devexpress.github.io/testcafe/documentation/test-api/selecting-page-elements/selectors.html#snapshot-api-shorthands)
  ([#899](https://github.com/DevExpress/testcafe/pull/899) and [#924](https://github.com/DevExpress/testcafe/pull/924))
* Improved automatic wait mechanism.

  We got rid of unnecessary waiting and tests now run almost two times faster.

  ![Tests running in v0.10.0 vs v0.9.0](https://raw.githubusercontent.com/DevExpress/testcafe/master/media/new-0-10-0-autowait.gif)

  ([#933](https://github.com/DevExpress/testcafe/pull/933))
* Test execution speed control.

  We have introduced an option that allows you to specify how fast tests run.
  It controls the cursor speed and the delay between actions.

  By default, tests run at the maximum speed. If this is too fast for you to understand what happens,
  use the new `speed` option to slow them down.

  This option is available from the command line...

  ```sh
  testcafe chrome my-tests --speed 0.1
  ```
  
  ...and from the API.

  ```js
  await runner.run({
      speed: 0.1
  })
  ```

  You can use factor values between `1` (the fastest, used by default) and `0.01` (the slowest).
* `t.maximizeWindow` test action.

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

  ([#837](https://github.com/DevExpress/testcafe/pull/837))

### Bug Fixes

* The `t.resizeWindow` and `t.resizeWindowToFitDevice` actions now work correctly on Mac ([#837](https://github.com/DevExpress/testcafe/pull/837))
* Browser alias CLI parameter is now case insensitive ([#894](https://github.com/DevExpress/testcafe/pull/894))
* Tests no longer hang if target scrolling coordinates are fractional ([#926](https://github.com/DevExpress/testcafe/pull/926))
* The 'Element is not visible' error is no longer raised when scrolling a document in Quirks mode ([#883](https://github.com/DevExpress/testcafe/pull/883))
* `<table>` child elements are now focused correctly ([#893](https://github.com/DevExpress/testcafe/pull/893))
* The page is no longer scrolled to the parent element when focusing on a non-focusable child during click automation ([#921](https://github.com/DevExpress/testcafe/pull/921))

## v0.9.0 (2016-10-18)

:tada: Initial release :tada:
