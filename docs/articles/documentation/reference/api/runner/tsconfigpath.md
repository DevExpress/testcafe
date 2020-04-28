---
layout: docs
title: Runner.tsConfigPath Method
permalink: /documentation/reference/api/runner/tsconfigpath.html
---
# Runner.tsConfigPath Method

Enables TestCafe to use a custom [TypeScript configuration file](../../../concepts/languages.md#customize-compiler-options) and specifies its location.

```text
async tsConfigPath(path) → this
```

Parameter | Type   | Description
--------- | ------ | ---------------------
`path`    | String | The absolute or relative path to the TypeScript configuration file. Relative paths are resolved against the current directory (the directory from which you run TestCafe).

```js
runner.tsConfigPath('/Users/s.johnson/testcafe/tsconfig.json');
```

*Related configuration file property*: [tsConfigPath](../../configuration-file.md#tsconfigpath)