import { ClientFunction } from 'testcafe';

fixture `Fixture`;

const getLog = ClientFunction(() => window.log);

const INITIAL_VALUE_EXPECTED_LOG = [
    'head:before-first-title: ',
    'head:after-first-title: Test page title',
    'body: Test page title'
];

const INITIAL_VALUE_SCRIPT_ONLY_IN_BODY_EXPECTED_LOG = [
    'body: Test page title'
];

const EMPTY_VALUE_EXPECTED_LOG = [
    'head: ',
    'body: '
];

const CHANGE_VALUE_EXPECTED_LOG = [
    'head:after-first-title: Test page title 1',
    'head:after-title-update: Test page title 2',
    'body: Test page title 2',
    'body:after-title-update: Test page title 3'
];

const TEXT_PROPERTY_GETTERS_OF_TITLE_ELEMENT = [
    'text: Test title',
    'innerHTML: Test title',
    'innerText: Test title'
];

test
    .page('http://localhost:3000/fixtures/regression/hammerhead/gh-2350/pages/initial-value.html')
    ('initial value', async t => {
        await t.expect(getLog()).eql(INITIAL_VALUE_EXPECTED_LOG);
    });

test
    .page('http://localhost:3000/fixtures/regression/hammerhead/gh-2350/pages/inital-value-script-only-in-body.html')
    ('initial value (script tag only in body)', async t => {
        await t.expect(getLog()).eql(INITIAL_VALUE_SCRIPT_ONLY_IN_BODY_EXPECTED_LOG);
    });

test
    .page('http://localhost:3000/fixtures/regression/hammerhead/gh-2350/pages/empty-value.html')
    ('empty value', async t => {
        await t.expect(getLog()).eql(EMPTY_VALUE_EXPECTED_LOG);
    });

test
    .page('http://localhost:3000/fixtures/regression/hammerhead/gh-2350/pages/change-value.html')
    ('change value', async t => {
        await t.expect(getLog()).eql(CHANGE_VALUE_EXPECTED_LOG);
    });

test
    .page('http://localhost:3000/fixtures/regression/hammerhead/gh-2350/pages/text-property-getters-of-title-element.html')
    ('text property getters of the title element', async t => {
        await t.expect(getLog()).eql(TEXT_PROPERTY_GETTERS_OF_TITLE_ELEMENT);
    });
