---
layout: docs
title: Debugging with Visual Studio Code
permalink: /documentation/recipes/debugging-with-visual-studio-code.html
---
# Debugging with Visual Studio Code

Before debugging in Visual Studio Code, ensure that your root test directory contains a `package.json` file that includes `testcafe` in the `devDependencies` section.

```json
{
  "devDependencies": {
    "testcafe": "x.y.z"
  }
}
```

where `x.y.z` is the TestCafe version you use.

Then you need to install TestCafe locally in the tests directory via `npm`.

```sh
npm install
```

The next step is adding a launch configuration that runs TestCafe tests. See the [Visual Studio Code documentation](https://code.visualstudio.com/docs/editor/debugging#_launch-configurations) to learn how to create a configuration.

You will need to add the following configuration to the `launch.json` file.

```json
{
    "type": "node",
    "protocol": "inspector",
    "request": "launch",
    "name": "Launch test files with TestCafe",
    "program": "${workspaceRoot}/node_modules/testcafe/bin/testcafe.js",
    "args": [
        "firefox",
        "${file}"
    ],
    "cwd": "${workspaceRoot}"
}
```

This configuration contains the following attributes:

* `type` - specifies the type of the configuration. Set to `node` for a Node.js configuration.
* `protocol` - specifies the Node.js [debugger wire protocol](https://code.visualstudio.com/docs/nodejs/nodejs-debugging#_supported-nodelike-runtimes). Note that the inspector protocol is supported in Node.js v6.3 (or v6.9 for Windows) or later. For early versions, omit this property. In that case, a legacy debugger protocol will be used. Legacy protocol is well known for its issues with source map support, therefore newer versions of Node.js are recommended.
* `request` - specifies the request type. Set to `launch` since this configuration launches a program.
* `name` - specifies the name of the configuration.
* `program` - path to a JS file that will be executed. In this case, it is the TestCafe module.
* `args` - [command line arguments](../using-testcafe/command-line-interface.md) passed to the launched program. In this case, they specify the browser in which the tests should run and the test file.
* `cwd` - the current working directory. Set to the workspace root.

Save the `launch.json` file. The new configuration will appear in the configuration drop-down.

Now you can open a file with TestCafe tests, select the configuration you have just created and click the Run button.
Tests will run with the debugger attached. You can put breakpoints in test code and the debugger will stop at them.
