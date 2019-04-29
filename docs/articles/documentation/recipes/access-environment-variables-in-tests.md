---
layout: docs
title: Access Environment Variables in Tests
permalink: /documentation/recipes/access-environment-variables-in-tests.html
---
# Access Environment Variables in Tests

Use the Node.js [process.env](https://nodejs.org/api/process.html#process_process_env) property to access environment variables in test code.

The following example prints the `PATH` envornment variable:

```js
fixture `My Fixture`;

test('Print an Environment Variable', async t => {
    console.log('Path: ', process.env.PATH);
});
```

## Set Environment Variables

Use the `export` command to create an environment variable on macOS and Linux:

```sh
export DEV_MODE=true
testcafe chrome test.js
```

On Windows, use the `set` command:

```sh
set DEV_MODE=true
testcafe chrome test.js
```

For more information on how to set environment variables, see [this answer on StackExchange](https://superuser.com/questions/284342/what-are-path-and-other-environment-variables-and-how-can-i-set-or-use-them/284351#284351).