---
layout: docs
title: Test.skip Method
permalink: /documentation/reference/test-api/test/skip.html
---
# Test.skip Method

Specifies that TestCafe should not run the test.

```text
test.skip
```

You can also use the [fixture.skip](../fixture/skip.md) method to skip the entire fixture:

```js
fixture.skip `Fixture 1`; // All tests in this fixture are skipped

test('Fixture 1 - Test 1', () => {});
test('Fixture 1 - Test 2', () => {});

fixture `Fixture 2`;

test('Fixture 2 - Test 1', () => {});
test.skip('Fixture 2 - Test 2', () => {}); // This test is skipped
test('Fixture 2 - Test 3', () => {});
```
