---
layout: docs
title: Navigate
permalink: /documentation/test-api/actions/navigate.html
checked: true
---
# Navigate

Navigates to the specified URL.

```text
t.navigateTo( url )
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

You can use the `file://` scheme or relative paths to navigate to a webpage in a local directory.

```js
fixture `My fixture`
    .page `http://www.example.com/`;

test('Navigate to local pages', async t => {
    await t
        .navigateTo('file:///user/my-website/index.html')
        .navigateTo('../my-project/index.html');
});
```