---
layout: docs
title: Fixture.only Method
permalink: /documentation/reference/test-api/fixture/only.html
---
# Fixture.only Method

Specifies that TestCafe should run only this fixture and skip all other fixtures.

```text
fixture.only
```

You can also use the [test.only](../test/only.md) method to run individual tests separately.

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
