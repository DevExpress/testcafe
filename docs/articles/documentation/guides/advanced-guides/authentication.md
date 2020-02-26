## User Roles

### Troubleshooting

When navigation to a cached page occurs in role code], local and session storage content is not preserved. See [Troubleshooting: Test Actions Fail After Authentication](test-actions-fail-after-authentication) for more information.

You can disable page caching to keep items in these storages after navigation. Use the [fixture.disablePageCaching](../../reference/test-api/fixture/disablepagecaching.md) and [test.disablePageCaching](../../reference/test-api/test/disablepagecaching.md) methods to disable caching during a particular fixture or test.

```js
fixture
    .disablePageCaching `My fixture`
    .page `https://example.com`;
```

```js
test
    .disablePageCaching
    ('My test', async t => { /* ... */ });
```

To disable page caching during the entire test run, use either of the following options:

* the [--disable-page-caching](../../reference/command-line-interface.md#--disable-page-caching) command line flag,
* the `disablePageCaching` option in the [runner.run](../../reference/programming-interface/runner.md#run) method,
* the [disablePageCaching](../../reference/configuration-file.md#disablepagecaching) configuration file option.
