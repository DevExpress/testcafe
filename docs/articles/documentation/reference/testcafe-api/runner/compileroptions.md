---
layout: docs
title: Runner.compilerOptions Method
permalink: /documentation/reference/testcafe-api/runner/compileroptions.html
---
# Runner.compilerOptions Method

Customizes the settings of the [TypeScript compiler](../../../guides/concepts/typescript-and-coffeescript.md#customize-compiler-options).

```text
async compilerOptions([{format, [options]}]) → this
```

Parameter | Type   | Description
--------- | ------ | ---------------------
`format` | String | The name of the compiler (Currently, `typescript` is the only supported value)
`customCompilerModulePath` |  String | The absolute or relative path to the TypeScript compiler module.
`configPath` | String | The absolute or relative path to the TypeScript configuration file. 
`options` | Array | Additional options to pass to the TypeScript compiler. The [official TypeScript documentation](https://www.typescriptlang.org/docs/handbook/compiler-options.html) contains the full list of configurable options.

> TestCafe resolves user-specified relative paths against the TestCafe installation folder.

    ```js
    runner.compilerOptions([
        {
              format: "typescript",
              customCompilerModulePath: '../node_modules/typescript-v4',
              ....
        }
   ]);
   ```

*Related configuration file property*: [compilerOptions](../../configuration-file.md#compileroptions)  
*Related CLI parameter*: [--compiler-options](../../command-line-interface.md#--compiler-options)

