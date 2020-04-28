---
layout: docs
title: Runner.startApp Method
permalink: /documentation/reference/testcafe-api/runner/startapp.html
---
# Runner.startApp Method

Specifies a shell command that is executed before TestCafe runs tests. Use it to launch or deploy the tested application.

```text
async startApp(command, initDelay) → this
```

After tests are finished, the application is automatically terminated.

The `startApp` function takes the following parameters:

Parameter         | Type    | Description   Default
----------------- | ------- | -------- | -------
`command`                     | String | The shell command to be executed.
`initDelay`&#160;*(optional)* | Number | The amount of time (in milliseconds) allowed for the command to initialize the tested application. | `1000`

> TestCafe adds `node_modules/.bin` to `PATH` so that you can use binaries the locally installed dependencies provide without prefixes.

*Related configuration file properties*:

* [appCommand](../../configuration-file.md#appcommand)
* [appInitDelay](../../configuration-file.md#appinitdelay)

**Example**

```js
runner.startApp('node server.js', 4000);
```
