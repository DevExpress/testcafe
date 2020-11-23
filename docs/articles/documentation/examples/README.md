---
layout: docs
title: Examples
permalink: /documentation/examples/
---
# Examples

This section lists examples from the [testcafe-examples](https://github.com/DevExpress/testcafe-examples) repository. All examples are ready to run.

## Locating Elements

Example | Description
------- | ------------
[Find Element By Trimmed Text](https://github.com/DevExpress/testcafe-examples/tree/master/examples/find-element-by-trimmed-text) | Ignores white-space characters when searching for an element by text.
[Use XPath Selectors](https://github.com/DevExpress/testcafe-examples/tree/master/examples/use-xpath-selectors) | Find an input with an XPath selector.

## Testing the DOM

Example | Description
------- | ------------
[Access Element Properties](https://github.com/DevExpress/testcafe-examples/tree/master/examples/element-properties) | Access DOM element properties and verify them with assertions.
[Iterate Over Table Rows](https://github.com/DevExpress/testcafe-examples/tree/master/examples/iterate-over-table-rows) | Verify cell content for even and odd rows.
[Test \<select\> Elements](https://github.com/DevExpress/testcafe-examples/tree/master/examples/test-select-elements) | Open a `<select>` element's drop-down list, click an item, and verify the value.
[Page Manipulation](https://github.com/DevExpress/testcafe-examples/tree/master/examples/page-manipulation) | Execute custom code on the page to obtain data or manipulate the page state (for instance, to reload the page).
[Change Element's Style](https://github.com/DevExpress/testcafe-examples/tree/master/examples/change-element-style) | Modify an element's style from test code.
[Check Whether Web Page Is Opened With TestCafe](https://github.com/DevExpress/testcafe-examples/tree/master/examples/check-if-opened-with-testcafe) | Use code to check whether the application is opened with TestCafe
[Iterate Over a List of Elements](https://github.com/DevExpress/testcafe-examples/tree/master/examples/iterate-over-list-elements) | Iterate over a list of elements and use their values in assertions.
[Scroll Elements Into View](https://github.com/DevExpress/testcafe-examples/tree/master/examples/scroll) | Scroll the page manually during tests.
[Select a Table Row by Cell Content](https://github.com/DevExpress/testcafe-examples/tree/master/examples/select-table-row-by-cell-content) | Select a table row based on the content of its cells.
[Submit a Form](https://github.com/DevExpress/testcafe-examples/tree/master/examples/submit-a-form) | Submit a form with DOM API.
[Check If an Image Has Loaded](https://github.com/DevExpress/testcafe-examples/tree/master/examples/check-if-image-loaded) | Check whether an image on the page has loaded.
[Simulate the Web Page Losing Focus](https://github.com/DevExpress/testcafe-examples/tree/master/examples/blur-window) | Simulate the web page losing focus.

## Test Organization

Example | Description
------- | ------------
[Extract Code to Helpers](https://github.com/DevExpress/testcafe-examples/tree/master/examples/extract-code-to-helpers) | Extract test code to functions defined in a separate module.
[Create Data-Driven Tests](https://github.com/DevExpress/testcafe-examples/tree/master/examples/create-data-driven-tests) | Create a test that performs parameterized actions.
[Use Page Model](https://github.com/DevExpress/testcafe-examples/tree/master/examples/use-page-model) | Extract element selectors and common operations with these elements to a page model.
[Pass Parameters to Tests](https://github.com/DevExpress/testcafe-examples/tree/master/examples/pass-parameters-to-tests) | Pass parameters to TestCafe tests.

## Upload/Download

Example | Description
------- | ------------
[Check the Downloaded File Name and Content](https://github.com/DevExpress/testcafe-examples/tree/master/examples/check-downloaded-file-name-and-content) | Check the name and the content of a file downloaded during a test.
[Select Files To Upload](https://github.com/DevExpress/testcafe-examples/tree/master/examples/upload-files) | Add files to an `<input type="file">`.

## Control HTTP Requests

Example | Description
------- | ------------
[Set a Custom Referrer](https://github.com/DevExpress/testcafe-examples/tree/master/examples/set-a-custom-referrer) | Set a custom [referrer](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Referer) for the specified requests during tests.

## Interoperability

Example | Description
------- | ------------
[Inject Custom Client Scripts](https://github.com/DevExpress/testcafe-examples/tree/master/examples/client-scripts) | Inject Node.js modules into the tested webpage.
[Import Third-Party Modules](https://github.com/DevExpress/testcafe-examples/tree/master/examples/import-third-party-modules) | Import a third-party Node.js module into test code.
[Extended Client-Side Error Tracking](https://github.com/DevExpress/testcafe-examples/tree/master/detached-examples/extended-error-tracking) | Filter client-side errors that occur during a test.

## Browser API Mocks

Example | Description
------- | ------------
[Mock Date](https://github.com/DevExpress/testcafe-examples/tree/master/examples/mock-date) | Substitutes current data with [mockdate](https://www.npmjs.com/package/mockdate).
[Mock Geolocation API](https://github.com/DevExpress/testcafe-examples/tree/master/examples/mock-geolocation-api) | Substitutes the current location with a mock location.
[Mock Camera/Microphone Access](https://github.com/DevExpress/testcafe-examples/tree/master/detached-examples/mock-camera-microphone-access) | Use mock data for the microphone and camera.

## Wait Mechanisms

Example | Description
------- | ------------
[Wait Until an Element Property Has a Specific Value](https://github.com/DevExpress/testcafe-examples/tree/master/examples/wait-for-element-property-value) | Use an assertion to pause the test until an element's width is `100%`.
[Wait For File Download](https://github.com/DevExpress/testcafe-examples/tree/master/examples/wait-for-file-download) | Specify that the test should wait for the file to download.
