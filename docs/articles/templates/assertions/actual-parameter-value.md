`actual` is a parameter that defines the value that TestCafe checks with assertion methods.

You can pass a [selector's property](/testcafe/documentation/guides/basic-guides/select-page-elements.html#define-assertion-actual-value) or a [client function](/testcafe/documentation/guides/basic-guides/obtain-client-side-info.html) promise as the value of this parameter. This activates the [Smart Assertion Query Mechanism](/testcafe/documentation/guides/basic-guides/assert.html#smart-assertion-query-mechanism) and the assertion automatically waits until it can obtain the `actual` value.

The value passed as the `actual` parameter needs to be of the data type supported by the assertion method.
