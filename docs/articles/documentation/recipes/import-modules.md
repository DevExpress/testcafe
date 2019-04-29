---
layout: docs
title: Import Modules
permalink: /documentation/recipes/import-modules.html
---
# Import Modules

You can import a module to a test file with the [import](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import) statement or [require](https://nodejs.org/api/modules.html#modules_require_id) function:

```js
import nanoid from 'nanoid';
```

```js
const nanoid = require('nanoid');
```

Then you can use this module in test code:

```js
import nanoid from 'nanoid';

fixture `My Fixture`
    .page `https://example.com`;

test(`My Test`, async t => {
    const randomCredentials = {
        username: 'user' + nanoid(),
        email: 'testuser' + nanoid() + '@mycompany.com',
        password: nanoid()
    };

    // ...
});
```