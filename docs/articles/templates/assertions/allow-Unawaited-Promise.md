Only promises the [selectors](/testcafe/documentation/guides/basic-guides/select-page-elements.html#define-assertion-actual-value)
and [client functions](/testcafe/documentation/guides/basic-guides/obtain-client-side-info.html) return can be passed as the assertion's actual value. If you pass a regular unawaited promise, TestCafe throws an error.

If you need to assert a regular promise, set the `allowUnawaitedPromise` option to `true`.

```js
await t.expect(doSomethingAsync()).ok('check that a promise is returned', { allowUnawaitedPromise: true });
```
