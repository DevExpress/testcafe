---
layout: post
title: "v1.10.0: New Compiler Options API, Resize and Screenshot Support for Child Windows"
permalink: /blog/:title.html
---
# v1.10.0: New Compiler Options API, Resize and Screenshot Support for Child Windows

...and the selector API for shadow DOM access, plus multiple bugfixes.

<!--more-->

## Enhancements

### Window Resize and Screenshot Support for Child Windows in Chrome ([PR #5661](https://github.com/DevExpress/testcafe/pull/5661), [PR #5567](https://github.com/DevExpress/testcafe/pull/5567))

You can now use the following actions in Google Chrome when you switch the test context to a [child window](../documentation/guides/advanced-guides/multiple-browser-windows.md):

* [t.maximizeWindow](../documentation/reference/test-api/testcontroller/maximizewindow.md)
* [t.resizeWindow](../documentation/reference/test-api/testcontroller/resizewindow.md)
* [t.resizeWindowToFitDevice](../documentation/reference/test-api/testcontroller/resizewindowtofitdevice.md)
* [t.takeElementScreenshot](../documentation/reference/test-api/testcontroller/takeelementscreenshot.md)
* [t.takeScreenshot](../documentation/reference/test-api/testcontroller/takescreenshot.md)

### New API to Specify Compiler Options ([#5519](https://github.com/DevExpress/testcafe/issues/5519))

In previous versions, you used the following methods to specify TypeScript compiler options:

* the [--ts-config-path](../documentation/reference/command-line-interface.md#--ts-config-path-path) command line flag

    ```sh
    testcafe chrome my-tests --ts-config-path path/to/config.json
    ```

* the [runner.tsConfigPath](../documentation/reference/testcafe-api/runner/tsconfigpath.md) method

    ```js
    runner.tsConfigPath('path/to/config.json');
    ```

* the [tsConfigPath](../documentation/reference/configuration-file.md#tsconfigpath) configuration file property

    ```json
    {
        "tsConfigPath": "path/to/config.json"
    }
    ```

In v1.10.0, we introduced a new easy-to-use API that allows you to specify the compiler options in the command line, API or TestCafe configuration file, without creating a separate JSON file. The new API is also designed to accept options for more compilers (for instance, Babel) in future releases.

The API consists of the following members:

* the [--compiler-options](../documentation/reference/command-line-interface.md#--compiler-options-options) command line flag

    ```sh
    testcafe chrome my-tests --compiler-options typescript.experimentalDecorators=true
    ```

* the [runner.compilerOptions](../documentation/reference/testcafe-api/runner/compileroptions.md) method

    ```js
    runner.compilerOptions({
        typescript: {
            experimentalDecorators: true
        }
    });
    ```

* the [compilerOptions](../documentation/reference/configuration-file.md#compileroptions) configuration file property

    ```json
    {
        "compilerOptions": {
            "typescript": {
                "experimentalDecorators": true
            }
        }
    }
    ```

If you prefer to keep compiler settings in a configuration file, you can use the new API to specify the path to this file:

```sh
testcafe chrome my-tests --compiler-options typescript.configPath='path/to/config.json'
```

In v1.10.0, you can customize TypeScript compiler options only.

For more information, see [TypeScript and CoffeeScript](../documentation/guides/concepts/typescript-and-coffeescript.md).

### Added a Selector Method to Access Shadow DOM ([PR #5560](https://github.com/DevExpress/testcafe/pull/5560) by [@mostlyfabulous](https://github.com/mostlyfabulous))

This release introduces the [selector.shadowRoot](../documentation/reference/test-api/selector/shadowroot.md) method that allows you to access and interact with the shadow DOM elements. This method returns a shadow DOM root hosted in the selector's matched element.

```js
import { Selector } from 'testcafe'

fixture `Target Shadow DOM elements`
    .page('https://devexpress.github.io/testcafe/example')

test('Get text within shadow tree', async t => {
    const shadowRoot = Selector('div').withAttribute('id', 'shadow-host').shadowRoot();
    const paragraph  = shadowRoot.child('p');

    await t.expect(paragraph.textContent).eql('This paragraph is in the shadow tree');
});
```

Note that you should chain other [selector methods](../documentation/guides/basic-guides/select-page-elements.md#member-tables) to [selector.shadowRoot](../documentation/reference/test-api/selector/shadowroot.md) to access elements in the shadow DOM. You cannot interact with the root element (an error occurs if you specify `selector.shadowRoot` as an action's target element).

## Bug Fixes

* Browsers now restart correctly on BrowserStack when the connection is lost ([#5238](https://github.com/DevExpress/testcafe/issues/5238))
* Fixed an error that occurs if a child window is opened in an `iframe` ([#5033](https://github.com/DevExpress/testcafe/issues/5033))
* TestCafe can now switch between the child and parent windows after the parent window is reloaded ([#5463](https://github.com/DevExpress/testcafe/issues/5463), [#5597](https://github.com/DevExpress/testcafe/issues/5597))
* Fixed an issue when touch and mouse events fired on mobile devices even though the mouse event was prevented in page code ([#5380](https://github.com/DevExpress/testcafe/issues/5380))
* Cross-domain `iframes` are now focused correctly in Safari ([#4793](https://github.com/DevExpress/testcafe/issues/4793))
* Fixed an excessive warning displayed when an assertion is executed in a loop or against an element returned by a `selector.xxxSibling` method ([#5449](https://github.com/DevExpress/testcafe/issues/5449), [#5389](https://github.com/DevExpress/testcafe/issues/5389))
* Cross-domain `iframe` source links now have the correct protocol when SSL is used ([PR testcafe-hammerhead/#2478](https://github.com/DevExpress/testcafe-hammerhead/pull/2478))
* A page error is no longer emitted if the destination server responded with the `304` status ([#5025](https://github.com/DevExpress/testcafe/issues/5025))
* Fixed an issue when TestCafe could not authenticate websites that use MSAL ([#4834](https://github.com/DevExpress/testcafe/issues/4834))
* The `srcdoc` attributes for `iframes` are now processed ([testcafe-hammerhead/#1237](https://github.com/DevExpress/testcafe-hammerhead/issues/1237))
* The `authorization` header is now preserved in response headers of fetch requests ([testcafe-hammerhead/#2334](https://github.com/DevExpress/testcafe-hammerhead/issues/2334))
* The `document.title` for an `iframe` without `src` can now be correctly obtained in Firefox ([PR testcafe-hammerhead/#2466](https://github.com/DevExpress/testcafe-hammerhead/pull/2466))
* TestCafe UI is now displayed correctly if the tested page's body content is added dynamically ([PR testcafe-hammerhead/#2454](https://github.com/DevExpress/testcafe-hammerhead/pull/2454))
* Service Workers now receive `fetch` events ([testcafe-hammerhead/#2412](https://github.com/DevExpress/testcafe-hammerhead/issues/2412))
* Fixed the case of headers sent to the web app server ([testcafe-hammerhead/#2344](https://github.com/DevExpress/testcafe-hammerhead/issues/2344))
* `Location` objects in `iframes` without `src` now contain the correct data ([PR testcafe-hammerhead/#2448](https://github.com/DevExpress/testcafe-hammerhead/pull/2448))
* Native function wrappers are now converted to strings correctly ([testcafe-hammerhead/#2394](https://github.com/DevExpress/testcafe-hammerhead/issues/2394))
