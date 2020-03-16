---
layout: docs
title: BrowserConnection.ready Event
permalink: /documentation/reference/api/browserconnection/ready.html
---
# BrowserConnection.ready Event

Fires when a remote browser connects to the TestCafe server.

```js
browserConnection.once('ready', callback)
```

Typically, you can run tests without waiting for the `ready` event to fire. The [runner.run](../runner/run.md) method automatically waits for all browser connections to be established. If remote browsers do not connect within **30** seconds, an error is thrown. Thus, you need to wait for the `ready` event only if there is a chance that any of your remote connections take more than 30 seconds to establish.
