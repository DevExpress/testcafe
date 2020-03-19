---
layout: docs
title: Fixture.page Method
permalink: /documentation/reference/test-api/fixture/page.html
---
# Fixture.page Method

Specifies the page where all tests in the fixture start.

```text
fixture.page( url )
fixture.page `url`
```

Parameter | Type   | Description
--------- | ------ | ------------------------------------------------
`url`     | String | The URL of the webpage at which tests start.

```js
fixture `MyFixture`
    .page `http://devexpress.github.io/testcafe/example`;

test('Test1', async t => {
    // Starts at http://devexpress.github.io/testcafe/example
});
```

You can also specify a start page for individual tests with the [test.page](../test/page.md) function that overrides the `fixture.page`.

If the start page is not specified, the default URL is `about:blank`.

You can use the `file://` scheme or relative paths to test web pages in local directories.

```js
fixture `MyFixture`
    .page `file:///user/my-website/index.html`;
```

```js
fixture `MyFixture`
    .page `../my-project/index.html`;
```
