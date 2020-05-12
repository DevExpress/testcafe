---
layout: docs
title: Fixture.skip Method
permalink: /documentation/reference/test-api/fixture/skip.html
---
# Fixture.skip Method

Indicates that TestCafe should not run the fixture.

```text
fixture.skip
```

You can also use the [test.skip](../test/skip.md) method to skip individual tests:

```js
fixture.skip `Fixture 1`; // All tests in this fixture are skipped

test('Fixture 1 - Test 1', () => {});
test('Fixture 1 - Test 2', () => {});

fixture `Fixture 2`;

test('Fixture 2 - Test 1', () => {});
test.skip('Fixture 2 - Test 2', () => {}); // This test is skipped
test('Fixture 2 - Test 3', () => {});
```
