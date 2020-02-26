## Inject Scripts into Tested Pages

TestCafe allows you to inject custom scripts into pages visited during the tests. You can add scripts that mock browser API or provide helper functions.

Use the [fixture.clientScripts](../../reference/test-api/fixture/clientscripts.md) and [test.clientScripts](../../reference/test-api/test/clientscripts.md) methods to add scripts to pages visited during a particular test or fixture.

```js
fixture `My fixture`
    .page `http://example.com`
    .clientScripts('assets/jquery.js');
```

```js
test
    ('My test', async t => { /* ... */ })
    .clientScripts({ module: 'async' });
```

```js
test
    ('My test', async t => { /* ... */ })
    .clientScripts({
        page: /\/user\/profile\//,
        content: 'Geolocation.prototype.getCurrentPosition = () => new Positon(0, 0);'
    });
```

To inject scripts into pages visited during all tests, use either of the following:

* the [--cs (--client-scripts)](../using-testcafe/command-line-interface.md#--cs-pathpath2---client-scripts-pathpath2) command line option
* the [runner.clientScripts](../using-testcafe/programming-interface/runner.md#clientscripts) method
* the [clientScripts](../using-testcafe/configuration-file.md#clientscripts) configuration file property
