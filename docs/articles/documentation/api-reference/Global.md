---
layout: docs
title: Global Members
permalink: /documentation/api-reference/global/
---
# Global Members

## Functions

### <a class="anchor" name="createTestCafe"></a>createTestCafe(hostname, port1, port2) → Promise\<[TestCafe](/testcafe/documentation/api-reference/TestCafe/)\>

Creates a [TestCafe](/testcafe/documentation/api-reference/TestCafe/) server instance.

Parameter  | Type   | Description
---------- | ------ | ----------------------------------------------------------------------------------------------------
`hostname` | String | The hostname or IP you will use to address the TestCafe server. Must resolve to the current machine.
`port1`    | Number | The port to which the TestCafe server will listen.
`port2`    | Number | The port that will be reserved for internal needs.

#### Example

```js
var createTestCafe = require('testcafe');
var testCafe = await createTestCafe('localhost', 1337, 1338);
```