---
layout: docs
title: Pass Custom Command Line Parameters
permalink: /documentation/recipes/pass-custom-command-line-parameters.html
---
# Pass Custom Command Line Parameters

You can pass custom command line parameters to TestCafe and access their values from test code.

The following example passes a custom `mode` parameter:

```sh
testcafe chrome test.js --mode=debug
```

In test code, obtain command line arguments with the Node.js [process.argv](https://nodejs.org/api/process.html#process_process_argv) property and parse the result with a parser library like [minimist](https://github.com/substack/minimist):

```js
import minimist from 'minimist';

fixture `My Fixture`;

test('Print a Custom Command Line Parameter', async t => {
    const args = minimist(process.argv.slice(2));

    console.log('Mode: ', args.mode);
});
```