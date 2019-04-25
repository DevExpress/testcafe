---
layout: docs
title: Pass Custom Command Line Parameters
permalink: /documentation/recipes/pass-custom-command-line-parameters.html
---
# Pass Custom Command Line Parameters

The following command passes the `env` argument to the test code:

```sh
testcafe chrome test.js --env=development
```

In test code, use an argument parser library (like [minimist](https://github.com/substack/minimist)) to parse custom arguments:

```js
import minimist from 'minimist';

const args        = minimist(process.argv.slice(2));
const environment = args.env;

fixture('example')
    .page('http://example.com');

test('check environment', async t => {
    console.log('Environment:', environment);
});
```