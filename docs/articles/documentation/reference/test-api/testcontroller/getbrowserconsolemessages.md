---
layout: docs
title: t.getBrowserConsoleMessages Method
permalink: /documentation/reference/test-api/testcontroller/getbrowserconsolemessages.html
---
# t.getBrowserConsoleMessages Method

Returns messages posted to the browser console.

```text
t.getBrowserConsoleMessages()
```

This method returns an object that contains the following fields.

Field | Type | Description
----- | ---- | -----------
`error` | Array of String | Error messages printed in the console.
`warn` | Array of String | Warning messages printed in the console.
`log`  | Array of String | Log messages printed in the console.
`info` | Array of String | Information messages printed in the console.

Note that this method returns only messages posted via the `console.error`, `console.warn`, `console.log` and `console.info` methods. Messages output by the browser (like when an unhandled exception occurs on the page) will not be returned.

**Example**

```js
// check-prop-types.js
import { t } from 'testcafe';

export default async function () {
    const { error } = await t.getBrowserConsoleMessages();

    await t.expect(error[0]).notOk();
}

// test.js
import { Selector } from 'testcafe';
import checkPropTypes from './check-prop-types';

fixture `react example`
    .page `http://localhost:8080/`  // https://github.com/mzabriskie/react-example
    .afterEach(() => checkPropTypes());

test('test', async t => {
    await t
        .typeText(Selector('.form-control'), 'devexpress')
        .click(Selector('button').withText('Go'))
        .click(Selector('h4').withText('Organizations'));
});
```
