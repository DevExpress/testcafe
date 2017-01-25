---
layout: docs
title: createTestCafe
permalink: /documentation/using-testcafe/programming-interface/createtestcafe.html
checked: true
---
# createTestCafe Factory

Creates a [TestCafe](testcafe.md) server instance.

```text
async createTestCafe([hostname], [port1], [port2]) → Promise<TestCafe>
```

Parameter                     | Type   | Description                                                                                                                                                                                                  | Default
----------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------
`hostname`&#160;*(optional)*       | String | The hostname or IP you will use to address the TestCafe server. Must resolve to the current machine. To test on external devices, use the hostname that is visible in the network shared with these devices. | Hostname of the OS. If the hostname does not resolve to the current machine - its network IP address.
`port1`, `port2`&#160;*(optional)* | Number | Ports that will be used to serve tested webpages.                                                                                                                                                            | Free ports selected automatically.

**Example**

```js
const createTestCafe = require('testcafe');

createTestCafe('localhost', 1337, 1338)
    .then(testcafe => {
        /* ... */
    });
```

## See Also

* [TestCafe Class](testcafe.md)