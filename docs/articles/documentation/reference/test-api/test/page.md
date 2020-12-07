---
layout: docs
title: Test.page Method
permalink: /documentation/reference/test-api/test/page.html
---
# Test.page Method

Specifies the page where the test starts.

```text
test.page( url ) → this
test.page `url` → this
```

Parameter | Type   | Description
--------- | ------ | ------------------------------------------------
`url`     | String | The URL of the webpage at which the test starts.

You can also use the [fixture.page](../fixture/page.md) function to specify a start page for all tests in the fixture. However, start pages set with `test.page` override [fixture.page](../fixture/page.md).

```js
fixture `MyFixture`
    .page `http://devexpress.github.io/testcafe/example`;

test
    .page `http://devexpress.github.io/testcafe/blog/`
    ('My test', async t => {
        // Starts at http://devexpress.github.io/testcafe/blog/
    });
```

If the start page is not specified, the default URL is `about:blank`.

You can use the [file URI scheme](https://en.wikipedia.org/wiki/File_URI_scheme) or relative paths to test web pages in local and network directories.

```js
test
    .page `file://NETWORK-LOCATION/my-website/index.html`
    ('My test', async t => { });
```

For local files omit the `hostname`:

```js
test
    .page `file:///user/my-website/index.html`
    ('My test', async t => { });
```

Relative paths are resolved against a file with tests:

```js
test
    .page `../my-project/index.html`
    ('My test', async t => { });
```
