---
layout: docs
title: t.wait Method
permalink: /documentation/reference/test-api/testcontroller/wait.html
redirect_from: 
  - /documentation/test-api/pausing-the-test.html
---
# t.wait Method

Pauses a test for a specified period of time.

```text
t.wait( timeout )
```

Parameter | Type    | Description
--------- | ------- | --------------------------------
`timeout` | Number  | The pause duration, in milliseconds.

The following example uses the `t.wait` function to pause the test while animation is playing.

```js
import { Selector } from 'testcafe';

const header = Selector('#article-header');

fixture `My fixture`
    .page `http://www.example.com/`;

test('Wait Example', async t => {
    await t
        .click('#play-1-sec-animation')
        .wait(1000)
        .expect(header.getStyleProperty('opacity')).eql(0);
});
```
