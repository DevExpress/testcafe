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
