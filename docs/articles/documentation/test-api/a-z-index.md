---
layout: docs
title: A-Z Index
permalink: /documentation/test-api/a-z.html
---
# A-Z Index

This topic lists test API members in alphabetical order.

## ClientFunction

* [ClientFunction constructor](obtaining-data-from-the-client/README.md#creating-client-functions)
* [with](obtaining-data-from-the-client/README.md#overwriting-options)

Learn more: [Obtaining Data From the Client](obtaining-data-from-the-client/README.md)

## DOM Node State

* *[members](selecting-page-elements/dom-node-state.md#members-common-across-all-nodes)*

Learn more: [DOM Node State](selecting-page-elements/dom-node-state.md)

## fixture

* [after](test-code-structure.md#fixture-hooks)
* [afterEach](test-code-structure.md#initialization-and-clean-up)
* [before](test-code-structure.md#fixture-hooks)
* [beforeEach](test-code-structure.md#initialization-and-clean-up)
* [clientScripts](test-code-structure.md#inject-scripts-into-tested-pages)
* [disablePageCaching](test-code-structure.md#disable-page-caching)
* [httpAuth](authentication/http-authentication.md)
* [meta](test-code-structure.md#specifying-testing-metadata)
* [only](test-code-structure.md#skipping-tests)
* [page](test-code-structure.md#specifying-the-start-webpage)
* [requestHooks](intercepting-http-requests/attaching-hooks-to-tests-and-fixtures.md)
* [skip](test-code-structure.md#skipping-tests)

Learn more: [Fixtures](test-code-structure.md#fixtures)

## RequestOptions

* *[members](intercepting-http-requests/requestoptions-object.md)*

## RequestLogger

* [RequestLogger constructor](intercepting-http-requests/logging-http-requests.md#creating-a-logger)
* [contains](intercepting-http-requests/logging-http-requests.md#logger-methods)
* [count](intercepting-http-requests/logging-http-requests.md#logger-methods)
* [clear](intercepting-http-requests/logging-http-requests.md#logger-methods)
* [requests](intercepting-http-requests/logging-http-requests.md#logger-properties)

Learn more: [Logging HTTP Requests](intercepting-http-requests/logging-http-requests.md)

## RequestMock

* [RequestMock constructor](intercepting-http-requests/mocking-http-requests.md#creating-a-mocker)
* [onRequestTo](intercepting-http-requests/mocking-http-requests.md#the-onrequestto-method)
* [respond](intercepting-http-requests/mocking-http-requests.md#the-respond-method)

Learn more: [Mocking HTTP Requests](intercepting-http-requests/mocking-http-requests.md)

## Role

* [Role constructor](authentication/user-roles.md#create-and-apply-roles)
* [anonymous](authentication/user-roles.md#anonymous-role)

Learn more: [User Roles](authentication/user-roles.md)

## Selector

* [Selector constructor](selecting-page-elements/selectors/creating-selectors.md)
* [addCustomDOMProperties](selecting-page-elements/selectors/extending-selectors.md#custom-properties)
* [addCustomMethods](selecting-page-elements/selectors/extending-selectors.md#custom-methods)
* [child](selecting-page-elements/selectors/functional-style-selectors.md#child)
* [count](selecting-page-elements/selectors/using-selectors.md#check-if-an-element-exists)
* [exists](selecting-page-elements/selectors/using-selectors.md#check-if-an-element-exists)
* [filter](selecting-page-elements/selectors/functional-style-selectors.md#filter)
* [filterHidden](selecting-page-elements/selectors/functional-style-selectors.md#filterhidden)
* [filterVisible](selecting-page-elements/selectors/functional-style-selectors.md#filtervisible)
* [find](selecting-page-elements/selectors/functional-style-selectors.md#find)
* [nextSibling](selecting-page-elements/selectors/functional-style-selectors.md#nextsibling)
* [nth](selecting-page-elements/selectors/functional-style-selectors.md#nth)
* [parent](selecting-page-elements/selectors/functional-style-selectors.md#parent)
* [prevSibling](selecting-page-elements/selectors/functional-style-selectors.md#prevsibling)
* [sibling](selecting-page-elements/selectors/functional-style-selectors.md#sibling)
* [with](selecting-page-elements/selectors/selector-options.md#overwrite-options)
* [withAttribute](selecting-page-elements/selectors/functional-style-selectors.md#withattribute)
* [withExactText](selecting-page-elements/selectors/functional-style-selectors.md#withexacttext)
* [withText](selecting-page-elements/selectors/functional-style-selectors.md#withtext)

Learn more: [Selectors](selecting-page-elements/selectors/README.md)

## test

* [after](test-code-structure.md#initialization-and-clean-up)
* [before](test-code-structure.md#initialization-and-clean-up)
* [clientScripts](test-code-structure.md#inject-scripts-into-tested-pages)
* [disablePageCaching](test-code-structure.md#disable-page-caching)
* [httpAuth](authentication/http-authentication.md)
* [meta](test-code-structure.md#specifying-testing-metadata)
* [only](test-code-structure.md#skipping-tests)
* [page](test-code-structure.md#specifying-the-start-webpage)
* [requestHooks](intercepting-http-requests/attaching-hooks-to-tests-and-fixtures.md)
* [skip](test-code-structure.md#skipping-tests)

Learn more: [Tests](test-code-structure.md#tests)

## TestController

* [addRequestHooks](intercepting-http-requests/attaching-hooks-to-tests-and-fixtures.md)
* [browser](identify-the-browser-and-platform.md)
* [clearUpload](actions/upload.md#clear-file-upload-input)
* [click](actions/click.md)
* [ctx](test-code-structure.md#sharing-variables-between-test-hooks-and-test-code)
* [debug](debugging.md#client-side-debugging)
* [doubleClick](actions/double-click.md)
* [drag](actions/drag-element.md#drag-an-element-by-an-offset)
* [dragtoElement](actions/drag-element.md#drag-an-element-onto-another-one)
* [eval](obtaining-data-from-the-client/README.md#one-time-client-code-execution)
* [expect](assertions/README.md)
    * [eql](assertions/assertion-api.md#deep-equal)
    * [notEql](assertions/assertion-api.md#not-deep-equal)
    * [ok](assertions/assertion-api.md#ok)
    * [notOk](assertions/assertion-api.md#not-ok)
    * [contains](assertions/assertion-api.md#contains)
    * [notContains](assertions/assertion-api.md#not-contains)
    * [typeOf](assertions/assertion-api.md#type-of)
    * [notTypeOf](assertions/assertion-api.md#not-type-of)
    * [gt](assertions/assertion-api.md#greater-than)
    * [gte](assertions/assertion-api.md#greater-than-or-equal-to)
    * [lt](assertions/assertion-api.md#less-than)
    * [lte](assertions/assertion-api.md#less-than-or-equal-to)
    * [within](assertions/assertion-api.md#within)
    * [notWithin](assertions/assertion-api.md#not-within)
    * [match](assertions/assertion-api.md#match)
    * [notMatch](assertions/assertion-api.md#not-match)
* [fixtureCtx](test-code-structure.md#sharing-variables-between-fixture-hooks-and-test-code)
* [getBrowserConsoleMessages](accessing-console-messages.md)
* [getNativeDialogHistory](handling-native-dialogs.md#dialog-history)
* [hover](actions/hover.md)
* [maximizeWindow](actions/resize-window.md#maximizing-the-window)
* [navigate](actions/navigate.md)
* [pressKey](actions/press-key.md)
* [removeRequestHooks](intercepting-http-requests/attaching-hooks-to-tests-and-fixtures.md)
* [resizeWindow](actions/resize-window.md#setting-the-window-size)
* [resizeWindowToFitDevice](actions/resize-window.md#fitting-the-window-into-a-particular-device)
* [rightClick](actions/right-click.md)
* [selectEditableContent](actions/select-text.md#perform-selection-within-editable-content)
* [selectText](actions/select-text.md#select-text-in-input-elements)
* [selectTextAreaContent](actions/select-text.md#select-textarea-content)
* [setFilesToUpload](actions/upload.md#populate-file-upload-input)
* [setNativeDialogHandler](handling-native-dialogs.md#dialog-handler)
* [setPageLoadTimeout](test-code-structure.md#setting-page-load-timeout)
* [setTestSpeed](test-code-structure.md#setting-test-speed)
* [switchToIframe](working-with-iframes.md#switching-to-an-iframe)
* [switchToMainWindow](working-with-iframes.md#switching-back-to-the-main-window)
* [takeElementScreenshot](actions/take-screenshot.md#take-a-screenshot-of-a-page-element)
* [takeScreenshot](actions/take-screenshot.md#take-a-screenshot-of-the-entire-page)
* [typeText](actions/type-text.md)
* [useRole](authentication/user-roles.md)
* [wait](pausing-the-test.md)

Learn more: [Test Controller](test-code-structure.md#test-controller)
