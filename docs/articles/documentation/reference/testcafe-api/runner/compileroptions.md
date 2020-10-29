---
layout: docs
title: Runner.compilerOptions Method
permalink: /documentation/reference/testcafe-api/runner/compileroptions.html
---
# Runner.compilerOptions Method

Configures the [TypeScript compiler](../../../guides/concepts/typescript-and-coffeescript.md#customize-compiler-options).

```text
async compilerOptions(options) → this
```

Parameter | Type   | Description
--------- | ------ | ---------------------
`customCompilerModulePath` |  String | The absolute or relative path to the TypeScript compiler module.
`configPath` | String | The absolute or relative path to the TypeScript configuration file.

The `Runner.compilerOptions` method accepts all compiler options listed in the [official TypeScript documentation](https://www.typescriptlang.org/docs/handbook/compiler-options.html) as parameters.

> TestCafe resolves user-specified relative paths against the TestCafe installation folder.

```js
   runner.compilerOptions({
    "typescript": {
        customCompilerModulePath: '../node_modules/typescript-v4',
        configPath: 'custom-ts-config.json',
        experimentalDecorators: true
     ...
     }});
 ```

*Related configuration file property*: [compilerOptions](../../configuration-file.md#compileroptions)  
*Related CLI parameter*: [--compiler-options](../../command-line-interface.md#--compiler-options)

