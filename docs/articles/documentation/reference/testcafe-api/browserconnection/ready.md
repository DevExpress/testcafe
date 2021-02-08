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

You can run tests without waiting for the `ready` event to fire. The [runner.run](../runner/run.md) method automatically waits for all browser connections to be established. If remote browsers do not connect within **30** seconds, TestCafe throws an error. Wait for the `ready` event only when there is a chance that a remote connection takes longer than **30** seconds to be established.
