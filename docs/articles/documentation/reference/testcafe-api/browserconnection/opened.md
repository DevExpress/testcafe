---
layout: docs
title: BrowserConnection.opened Event
permalink: /documentation/reference/testcafe-api/browserconnection/opened.html
---
# BrowserConnection.opened Event

Fires when a browser launched by a [browser provider](../../../guides/extend-testcafe/browser-provider-plugin.md#implement-the-browser-provider) connects to TestCafe and reports that it is ready to run tests.

```js
browserConnection.once('opened', callback)
```

If every remote browser connection does not fire this event within **6 minutes**, TestCafe throws an error. You can configure this timeout with the [browserInitTimeout](../../configuration-file.md#browserinittimeout) configuration file property.

You can run tests without waiting for the `opened` event to fire.  The [runner.run](../runner/run.md) method waits for all browser connections to be established and all browsers to be ready within this time.

Wait for the `opened` event if there is a chance that a browser isn't ready in time.
