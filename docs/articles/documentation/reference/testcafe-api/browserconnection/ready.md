---
layout: docs
title: BrowserConnection.ready Event
permalink: /documentation/reference/testcafe-api/browserconnection/ready.html
---
# BrowserConnection.ready Event

Fires when a remote browser connects to the TestCafe server.

```js
browserConnection.once('ready', callback)
```

You can run tests without waiting for the `ready` event to fire. The [runner.run](../runner/run.md) method waits for all browser connections to be established.

If every specified browser do not connect within a time period (**6** minutes for remote browsers and **2** minutes for local browsers), TestCafe throws an error.

Only wait for the `ready` event if there is a chance that a browser doesn't connect within this time.

You can configure this timeout with the [browserInitTimeout](../../configuration-file.md#browserinittimeout) configuration file property.
