fixture `fixture1`.skip;

test.before(async t => {

})
('fixture1test1', async t => {
}).after(async t => {

});


fixture.skip`fixture2`;

test`fixture2test1`.skip;
test.skip`fixture2test2`;

test(`fixture2test3`).skip('wrongTestNameUsage');
test.skip('fixture2test4');

fixture.only('fixture 3');

test(`fixture3test1`).only('wrongTestNameUsage');
test.only('fixture3test2');

test
    .before(async t => {

    })
    `fixture3test4`
    .after(async t => {

    });


fixture
    .beforeEach(async t => {})
    .before(async t => {})
    ('fixture4');

test
    .before(async t => {})
    .after(async t => {})
    ('fixture4test1');

fixture
    .beforeEach(async t => {})
    .before(async t => {})
    ('fixture5');

test
    .before(async t => {})
    .after(async t => {})
    `fixture5test1`;

fixture
    .beforeEach(async t => {})
    .before(async t => {})
    ('fixture6')
    .after(async t => {});

test
    .before(async t => {})
    .after(async t => {})
    ('fixture6test1')
    .page('http://example.com');

fixture
    .beforeEach(async t => {})
    .before(async t => {})
    (`fixture7`)
    .after(async t => {});

test
    .before(async t => {})
    .after(async t => {})
    (`fixture7test1`)
    .page('http://example.com');

fixture
    .beforeEach(async t => {})
    .before(async t => {})
    `fixture8`
    .after(async t => {});

test
    .before(async t => {})
    .after(async t => {})
    `${value}`
    .page('http://example.com');

fixture.only(`fixture9`).skip;

test.only(`fixture9test1`);

fixture(`fixture10`)
.before(async t => {})
.beforeEach(async t => {})
.afterEach(async t => {})
.after(async t => {})
.skip;

test(`fixture10test1`);

fixture(`fixture11`);

test.only(`fixture11test1`).skip;

test
    .before(async t => {})
    `fixture11test2`
    .after(async t => {})
    .skip;

test
    .skip
    .before(async t => {})
    .after(async t => {})
    `fixture11test3`;

test
    .before(async t => {})
    .skip
    .after(async t => {})
    (`fixture11test4`, async t => {});

test
.skip
.clientScripts()
.requestHooks()
.timeouts({
    pageLoadTimeout: 2000,
})
.httpAuth({
    username: 'user1',
    password: '123'
})
.meta(`key1`,'value1')
(`fixture11test5`);

test.disablePageCaching
    .before(async t => {})
    .after(async t => {})
    .requestHooks()
    .clientScripts()
    .meta(`key2`, `value2`)
    .timeouts({
        pageLoadTimeout: 2000,
    })
    `fixture11test6`.skip;

fixture
    .skip
    .beforeEach(async t => {})
    .before(async t => {})
    .after(async t => {})
    ('fixture12');

fixture(`fixture13`)
    .before(async t => {})
    .after(async t => {})
    .disablePageCaching
    .clientScripts()
    .timeouts({
        pageLoadTimeout: 2000,
    })
    .skip
    .page(`https://devexpress.github.io/testcafe/example/`);
