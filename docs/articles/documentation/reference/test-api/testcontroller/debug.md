---
layout: docs
title: t.debug Method
permalink: /documentation/reference/test-api/testcontroller/debug.html
---
# t.debug Method

Pauses the test and allows you to use the browser's developer tools.

```text
t.debug()
```

When test execution reaches `t.debug`, it pauses so that you can open the browser's developer tools
and check the web page state, DOM element location, their CSS styles, etc.

You can also use the [--debug-mode](../../command-line-interface.md#-d---debug-mode)
command line option to pause the test before the first action or assertion.
