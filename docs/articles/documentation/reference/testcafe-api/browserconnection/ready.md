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

When this event fires, browser has opened and connected to TestCafe, but is not yet ready to run tests.  
Remote browser is ready to test when [BrowserConnection.opened](opened.md) fires.
