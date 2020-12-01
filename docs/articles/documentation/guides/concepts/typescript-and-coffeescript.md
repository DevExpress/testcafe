---
layout: docs
title: TypeScript and CoffeeScript
permalink: /documentation/guides/concepts/typescript-and-coffeescript.html
redirect_from:
  - /documentation/test-api/typescript-support.html
  - /documentation/test-api/coffeescript-support.html
---
# TypeScript and CoffeeScript

## TypeScript Support

TestCafe allows you to write tests with [TypeScript](https://www.typescriptlang.org/) - a typed superset of JavaScript.
TypeScript comes with rich coding assistance,
painless scalability, check-as-you-type code verification, and much more.

> You do not need to manually compile TypeScript tests. TestCafe does this automatically on launch.

TestCafe bundles the TypeScript declaration file with the npm package, so you do not need to install it separately.

### Write Tests with TypeScript

To start writing tests with TypeScript, install TestCafe into your project directory. For more information, see [Install TestCafe](../basic-guides/install-testcafe.md#local-installation).

If your text editor supports code completion (e.g., VSCode, Sublime Text, WebStorm, etc.) but does not auto-complete TestCafe keywords, it needs to be made aware of the TypeScript declarations that ship with TestCafe. Include the following `import` statement in one of your test files:

```js
import { Selector } from 'testcafe';
```

> If installed [globally](../basic-guides/install-testcafe.md#global-installation), TestCafe will successfully compile and run your tests written in TypeScript. However, your IDE will not be able to locate the TestCafe declaration file and provide code completion.

![Writing Tests with TypeScript](../../../images/typescript-support.png)

The syntax of TestCafe is identical for both JavaScript and TypeScript.

Whenever TestCafe encounters TypeScript compilation errors, it includes corresponding error messages in the test report.

> [Extending selectors](../basic-guides/select-page-elements.md#extend-selectors-with-custom-properties-and-methods)
> in TypeScript differs from extending selectors in JavaScript. Refer to the
> [selector.addCustomDOMProperties](../../reference/test-api/selector/addcustomdomproperties.md)
> and [selector.addCustomMethods](../../reference/test-api/selector/addcustommethods.md)
> sections to learn how to extend selectors in TypeScript.

### Customize Compiler Options

TestCafe users can modify [the settings](https://www.typescriptlang.org/docs/handbook/compiler-options.html) of the TypeScript compiler in one of the following three ways:

* the [--compiler-options](../../reference/command-line-interface.md#--compiler-options-options) command line parameter,

    ```sh
    testcafe chrome my-tests --compiler-options typescript.options.lib=lib.es5.d.ts,lib.webworker.d.ts;typescript.typesRoot='this value contains spaces'
    ```

* the [runner.compilerOptions](../../reference/testcafe-api/runner/compileroptions.md) API method,

    ```js
    runner.compilerOptions({
    "typescript": {
        customCompilerModulePath: '../node_modules/typescript-v4',
        …
     }});
   ```

* the [compilerOptions](../../reference/configuration-file.md#compileroptions) configuration file property.

    ```json
    {
    "compilerOptions": {
        "typescript": {
           "configPath": "<path to tsconfig.json>"
           "customCompilerModulePath": "path to custom Typescript compiler module"
           "options": {"experimentalDecorators":  "true"}
           }
        }
    }
    ```

See the full list of available options in the [TypeScript Compiler Options](https://www.typescriptlang.org/docs/handbook/compiler-options.html) topic.

TestCafe passes the following options to the TypeScript compiler unless you override them:

Option                    | Value
------------------------- | ------
`allowJs`                 | `true`
`emitDecoratorMetadata`   | `true`
`experimentalDecorators`  | `true`
`inlineSourceMap`         | `true`
`noImplicitAny`           | `false`
`pretty`                  | `true`
`suppressOutputPathCheck` | `true`
`skipLibCheck`            | `true`

> TestCafe enables the `skipLibCheck` option for performance reasons. If you need to check types in your declaration files, set `skipLibCheck` to `false`.

## CoffeeScript Support

TestCafe allows you to write tests with [CoffeeScript](https://coffeescript.org/).

**Example**

```coffee
import { Selector } from 'testcafe'

fixture 'CoffeeScript Example'
    .page 'https://devexpress.github.io/testcafe/example/'

nameInput = Selector '#developer-name'

test 'Test', (t) =>
    await t
        .typeText(nameInput, 'Peter')
        .typeText(nameInput, 'Paker', { replace: true })
        .typeText(nameInput, 'r', { caretPos: 2 })
        .expect(nameInput.value).eql 'Parker';
```

You do not need to manually compile CoffeeScript tests. TestCafe does this automatically on launch.
