---
layout: docs
title: Pausing the Test
permalink: /documentation/test-api/pausing-the-test.html
checked: true
---
# Pausing the Test

Use the [test controller's](test-code-structure.md#test-controller) `wait` function to pause a test for a specified period of time.

```text
t.wait( timeout )
```

Parameter | Type    | Description
--------- | ------- | --------------------------------
`timeout` | Number  | The pause duration, in milliseconds.

The following example uses the `t.wait` function to pause the test while animation is playing.

```js
import { expect } from 'chai';

fixture `My fixture`
    .page('http://www.example.com/');

test('Wait Example', async t => {
    await t
        .click('#play-1-sec-animation')
        .wait(1000);

    const header = await t.select(() => document.getElementById('article-header'));

    expect(header.style.opacity).to.equal(0);
});
```