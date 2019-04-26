---
layout: docs
title: Import Node.js Modules
permalink: /documentation/recipes/import-nodejs-modules.html
---
# Import Node.js Modules

You can use the ECMAScript [import](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import) statement or Node.js [require](https://nodejs.org/api/modules.html#modules_require_id) function to import Node.js modules to test files:

```js
import array from 'lodash/array';
import minimist from 'minimist';
```

```js
const array    = require('lodash/array');
const minimist = require('minimist');
```

Then you can use these modules in test code:

```js
import array from 'lodash/array';
import minimist from 'minimist';

fixture `My Fixture`
    .page `https://example.com`;

test(`My Test`, async t => {
    const args    = minimist(process.argv.slice(2));
    const numbers = array.concat([1, 2], 3, 4);

    // ...
});
```