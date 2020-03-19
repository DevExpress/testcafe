---
layout: docs
title: Test.only Method
permalink: /documentation/reference/test-api/test/only.html
---
# Test.only Method

Specifies that TestCafe should skip all other tests and run only this test.

```text
test.only
```

You can also use the [fixture.only](../fixture/only.md) method to run individual fixtures separately.

If several tests or fixtures are marked with `only`, all the marked tests and fixtures are run.

```js
fixture.only `Fixture 1`;
test('Fixture 1 - Test 1', () => {});
test('Fixture 1 - Test 2', () => {});

fixture `Fixture 2`;

test('Fixture 2 - Test 1', () => {});
test.only('Fixture 2 - Test 2', () => {});
test('Fixture 2 - Test 3', () => {});

// Only tests in 'Fixture 1' and the 'Fixture 2 - Test 2' test are run
```
