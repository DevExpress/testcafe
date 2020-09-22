import { ClientFunction } from 'testcafe';

fixture `Fixture`;

const getLog = ClientFunction(() => window.log);

const INITIAL_VALUE = {
    SCRIPT_BEFORE_AND_AFTER_TITLE_EXPECTED_LOG: [
        'head:before-first-title: ',
        'head:after-first-title: Test page title',
        'body: Test page title'
    ],
    SCRIPT_ONLY_IN_BODY_EXPECTED_LOG: [
        'body: Test page title'
    ],
    SCRIPT_ONLY_IN_BODY_AND_TITLE_IS_NOT_LAST_EXPECTED_LOG: [
        'body: Test page title'
    ]
};

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

const TEXT_PROPERTY_GETTERS_OF_TITLE_ELEMENT_EXPECTED_LOG = [
    'text: Test title',
    'innerHTML: Test title',
    'innerText: Test title'
];

const SET_DOCUMENT_TITLE_IN_BODY_EXPECTED_LOG = [
    'body: Test page title',
];

test
    .page('http://localhost:3000/fixtures/regression/hammerhead/gh-2350/pages/initial-value/script-before-and-after.html')
    ('script before and after <title>', async t => {
        await t.expect(getLog()).eql(INITIAL_VALUE.SCRIPT_BEFORE_AND_AFTER_TITLE_EXPECTED_LOG);
    });

test
    .page('http://localhost:3000/fixtures/regression/hammerhead/gh-2350/pages/initial-value/script-only-in-body.html')
    ('script tag only in <body>', async t => {
        await t.expect(getLog()).eql(INITIAL_VALUE.SCRIPT_ONLY_IN_BODY_EXPECTED_LOG);
    });

test
    .page('http://localhost:3000/fixtures/regression/hammerhead/gh-2350/pages/initial-value/title-is-not-last.html')
    ('script tag only in <body> and <title> is not last in <head>', async t => {
        await t.expect(getLog()).eql(INITIAL_VALUE.SCRIPT_ONLY_IN_BODY_AND_TITLE_IS_NOT_LAST_EXPECTED_LOG);
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
        await t.expect(getLog()).eql(TEXT_PROPERTY_GETTERS_OF_TITLE_ELEMENT_EXPECTED_LOG);
    });

test
    .page('http://localhost:3000/fixtures/regression/hammerhead/gh-2350/pages/set-document-title-in-body.html')
    ('set document.title in body', async t => {
        await t.expect(getLog()).eql(SET_DOCUMENT_TITLE_IN_BODY_EXPECTED_LOG);
    });
