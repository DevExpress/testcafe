---
layout: post
title: TestCafe v1.1.0 Released
permalink: /blog/:title.html
---
# TestCafe v1.1.0 Released

This release introduces TypeScript 3.0 support and enhanced TypeScript definitions for client functions.

<!--more-->

## Enhancements

### ⚙ TypeScript 3 Support ([#3401](https://github.com/DevExpress/testcafe/issues/3401))

TypeScript test files can now use the new syntax features introduced in [TypeScript 3.0](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-0.html) and [TypeScript 3.3](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-3.html).

### ⚙ Enhanced TypeScript Definitions for Client Functions ([#3431](https://github.com/DevExpress/testcafe/pull/3431)) by [@vitalics](https://github.com/vitalics)

The updated type definitions allow the TypeScript compiler to determine client function's return value type. Static typing now warns you when you call wrong methods for the return value.

```js
const getFoo = ClientFunction(() => 42);
const foo    = await getFoo();
foo.match(/foo/);
```

Before v1.1.0, an error occurred during test execution:

```text
$ testcafe chrome tests.ts
 Running tests in:
 - Chrome 72.0.3626 / Windows 10.0.0
 Fixture 1
 √ Test 1
 √ Test 2
 ...
 × Test N
   1) TypeError: foo.match is not a function
```

With v1.1.0, the TypeScript compiler throws an error before tests are started:

```text
$ testcafe chrome tests.ts
  ERROR Cannot prepare tests due to an error.
  Error: TypeScript compilation failed.

  tests.ts (4, 2): Property 'match' does not exist on type 'number'.
```

## Bug Fixes

* TestCafe no longer ignores test and fixture metadata filters specified in the configuration file ([#3443](https://github.com/DevExpress/testcafe/issues/3443)) by [@NanjoW](https://github.com/NanjoW)
* TestCafe no longer resolves placeholders to `null` in video path patterns ([#3455](https://github.com/DevExpress/testcafe/issues/3455))
* Fixed the `KeyboardEvent`'s `key` property emulation for Safari ([#3282](https://github.com/DevExpress/testcafe/issues/3282))
* TestCafe can now capture element screenshots after a long page scrolling ([#3292](https://github.com/DevExpress/testcafe/issues/3292))
* The compilation time of TypeScript tests no longer degrades for a large number of files ([#3475](https://github.com/DevExpress/testcafe/issues/3475))
* Reach Router can now navigate correctly when tested with TestCafe ([testcafe-hammerhead/#1863](https://github.com/DevExpress/testcafe-hammerhead/issues/1863))
* TestCafe now correctly handles websites that use the `WebKitMutationObserver` class ([testcafe-hammerhead/#1912](https://github.com/DevExpress/testcafe-hammerhead/issues/1912))
* TestCafe now processes ECMAScript modules in `<script>` tags ([testcafe-hammerhead/#1725](https://github.com/DevExpress/testcafe-hammerhead/issues/1725))
