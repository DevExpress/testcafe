---
layout: docs
title: TypeScript Support
permalink: /documentation/test-api/typescript-support.html
checked: true
---
# TypeScript Support

TestCafe allows you to write tests with [TypeScript](https://www.typescriptlang.org/) - a typed superset of JavaScript.
Using of TypeScript brings you all the advantages of strongly typed languages: rich coding assistance,
painless scalability, check-as-you-type code verification and much more.

> TestCafe automatically compiles TypeScript before running tests, so you do not need to compile the TypeScript code.

TestCafe bundles the TypeScript declaration file with the npm package, so you do not need to install it separately.

## Writing Tests with TypeScript

When writing test in TypeScript, it is required to import TestCafe module first.

```js
import { Selector } from 'testcafe';
```

After importing a testcafe module, an IDE (e.g. VS Code, Sublime Text, WebStorm, etc.) will load TestCafe declaration
file and will show you code completion hints for TestCafe API:

![Writing Tests with TypeScript](../../images/typescript-support.png)

Now, you can write tests in the same manner as in JavaScript.
When you run a test Testcafe will output if there are any compilation errors.

> The [extending selectors](https://devexpress.github.io/testcafe/documentation/test-api/selecting-page-elements/selectors.html#extending-selectors)
> in TypeScript differs from extending selectors in JavaScript. Refer to the
> [Custom Properties](https://devexpress.github.io/testcafe/documentation/test-api/selecting-page-elements/selectors.html#custom-properties)
> and [Custom Methods](https://devexpress.github.io/testcafe/documentation/test-api/selecting-page-elements/selectors.html#custom-methods)
> sections to learn how to extend selectors in TypeScript.
