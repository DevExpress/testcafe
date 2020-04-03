`actual` is a parameter that defines the value that TestCafe checks with assertion methods.

You can pass a [selector's property](../../../../guides/basic-guides/select-page-elements.md#define-assertion-actual-value) or a [client function](../../../../guides/basic-guides/obtain-data-from-the-client.md) promise as the value of this parameter. This activates the [Smart Assertion Query Mechanism](../../../../guides/basic-guides/assert.md#smart-assertion-query-mechanism) and the assertion automatically waits until it can obtain the `actual` value.

The value passed as the `actual` parameter needs to be of the data type supported by the assertion method.
