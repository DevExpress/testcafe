By default, only promises the [selectors](../../guides/basic-guides/select-page-elements.md#define-assertion-actual-value)
and [client functions](../../guides/basic-guides/obtain-data-from-the-client.md) return can be passed as the assertion's actual value. If you pass a regular unawaited promise, TestCafe throws an error.

If you need to assert a regular promise, set the `allowUnawaitedPromise` option to `true`.

```js
await t.expect(doSomethingAsync()).ok('check that a promise is returned', { allowUnawaitedPromise: true });
```
