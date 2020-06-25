import { ClientFunction } from 'testcafe';

fixture `Fixture`;

const getLog = ClientFunction(() => window.log);

const INITIAL_VALUE_EXPECTED_LOG = [
    'head:before-first-title: ',
    'head:after-first-title: Test page title',
    'body: Test page title'
];

const EMPTY_VALUE_EXPECTED_LOG = [
    'head: ',
    'body: '
];

test
    .page('http://localhost:3000/fixtures/regression/hammerhead/gh-2350/pages/initial-value.html')
    ('initial value', async t => {
        await t.expect(getLog()).eql(INITIAL_VALUE_EXPECTED_LOG);
    });

test
    .page('http://localhost:3000/fixtures/regression/hammerhead/gh-2350/pages/empty-value.html')
    ('empty value', async t => {
        await t.expect(getLog()).eql(EMPTY_VALUE_EXPECTED_LOG);
    });
