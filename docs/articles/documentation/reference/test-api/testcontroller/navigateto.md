---
layout: docs
title: t.navigateTo Method
permalink: /documentation/reference/test-api/testcontroller/navigateto.html
redirect_from:
  - /documentation/test-api/actions/navigate.html
---
# t.navigateTo Method

Navigates to the specified URL. Can be chained with other `TestController` methods.

```text
t.navigateTo(url) → this | Promise<any>
```

Parameter | Type   | Description
--------- | ------ | -----------------------
`url`     | String | The URL to navigate to. Absolute or relative to the current page.

The following example shows how to use the `t.navigateTo` action.

```js
fixture `My fixture`
    .page `http://www.example.com/`;

test('Navigate to the main page', async t => {
    await t
        .click('#submit-button')
        .navigateTo('http://devexpress.github.io/testcafe');
});
```

You can use the `file://` scheme or relative paths to navigate to a webpage in a local directory. Relative file paths are resolved from the current page, rather than the test file.

```js
fixture `My fixture`
    .page `http://www.example.com/`;

test('Navigate to local pages', async t => {
    await t
        .navigateTo('file:///user/my-website/index.html')
        .navigateTo('../my-project/index.html');
});
```

TestCafe waits for the server to respond after a redirect occurs.
The test resumes if the server does not respond within **15** seconds.
