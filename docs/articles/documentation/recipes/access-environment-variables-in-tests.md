---
layout: docs
title: Access Environment Variables in Tests
permalink: /documentation/recipes/access-environment-variables-in-tests.html
---
# Access Environment Variables in Tests

Use the `export` command to set an environment variable on macOS and Linux:

```sh
export DEV_MODE=true
testcafe chrome test.js
```

On Windows, use `set`:

```sh
set DEV_MODE=true
testcafe chrome test.js
```

You can access this variable as `process.env.DEV_MODE` in test code:

```js
fixture `My Fixture`
    .page `http://example.com`;

test('Print an Environment Variable', async t => {
    console.log('Development mode: ', process.env.DEV_MODE);
});
```