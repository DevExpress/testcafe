---
layout: docs
title: TypeScript Support
permalink: /documentation/test-api/typescript-support.html
checked: true
---
# TypeScript Support

TestCafe allows you to write tests with [TypeScript](https://www.typescriptlang.org/) - a typed superset of JavaScript.
Using TypeScript brings you all the advantages of strongly typed languages: rich coding assistance,
painless scalability, check-as-you-type code verification and much more.

> TestCafe automatically compiles TypeScript before running tests, so you do not need to compile the TypeScript code.

TestCafe bundles the TypeScript declaration file with the npm package, so you do not need to install it separately.

## Writing Tests with TypeScript

To start writing tests with TypeScript, install TestCafe into your project directory. For more information, see [Installing TestCafe](../using-testcafe/installing-testcafe.md#locally).

When writing test in TypeScript, it is required to import TestCafe module first.

```js
import { Selector } from 'testcafe';
```

After importing a `testcafe` module, an IDE (e.g. VS Code, Sublime Text, WebStorm, etc.) will load TestCafe declaration
file and will show you code completion hints for TestCafe API:

![Writing Tests with TypeScript](../../images/typescript-support.png)

> If installed [globally](../using-testcafe/installing-testcafe.md#globally), TestCafe will successfully compile and run your tests written in TypeScript.
In this case, your IDE will not be able to find the TestCafe declaration file and provide code completion.

Now, you can write tests in the same manner as in JavaScript.
When you run a test Testcafe will output if there are any compilation errors.

> The [extending selectors](./selecting-page-elements/selectors/extending-selectors.md)
> in TypeScript differs from extending selectors in JavaScript. Refer to the
> [Custom Properties](./selecting-page-elements/selectors/extending-selectors.md#custom-properties)
> and [Custom Methods](./selecting-page-elements/selectors/extending-selectors.md#custom-methods)
> sections to learn how to extend selectors in TypeScript.

## Customize Compiler Options

TestCafe allows you to specify [TypeScript compiler options](https://www.typescriptlang.org/docs/handbook/compiler-options.html) in the `tsconfig.json` file. You can use these options to enable JSX compilation, import code or typings with `paths` aliases, set aliases to React typings, or customize other compiler settings.

To apply a custom TypeScript configuration file, specify its location in one of the following ways:

* the [--ts-config-path](../using-testcafe/command-line-interface.md#--ts-config-path-path) command line parameter,

    ```sh
    testcafe chrome my-tests --ts-config-path /Users/s.johnson/testcafe/tsconfig.json
    ```

* the [runner.tsConfigPath](../using-testcafe/programming-interface/runner.md#tsconfigpath) API method,

    ```js
    runner.tsConfigPath('/Users/s.johnson/testcafe/tsconfig.json');
    ```

* the [tsConfigPath](../using-testcafe/configuration-file.md#tsconfigpath) configuration file property.

    ```json
    {
        "tsConfigPath": "/Users/s.johnson/testcafe/tsconfig.json"
    }
    ```

In `tsconfig.json`, define the `compilerOptions` property and specify the compiler options in this property:

```json
{
    "compilerOptions": {
        "jsx": "react",
        "jsxFactory": "myFactory",
        "paths": {
            "jquery": [ "node_modules/jquery/dist/jquery" ]
        },
        "alwaysStrict": true
    }
}
```

See the available options in the [TypeScript Compiler Options](https://www.typescriptlang.org/docs/handbook/compiler-options.html) topic.

> Important! You cannot override the `module` and `target` options.

Save `tsconfig.json` to the directory from which you run TestCafe (usually the project's root directory), or specify the [tsConfigPath](../using-testcafe/configuration-file.md#tsconfigpath) option in the [configuration file](../using-testcafe/configuration-file.md) to use a different location.

TestCafe passes the following options to the TypeScript compiler unless you override them in `tsconfig.json`:

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

> TestCafe enables the `skipLibCheck` option for performance reasons. If you need to check types in your declaration files, set `skipLibCheck` to `false` in `tsconfig.json`.
