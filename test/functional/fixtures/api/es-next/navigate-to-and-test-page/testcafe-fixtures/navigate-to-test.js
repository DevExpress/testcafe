import path from 'path';
import { ClientFunction } from 'testcafe';

fixture `NavigateTo`
    .page `http://localhost:3000/fixtures/api/es-next/navigate-to-and-test-page/pages/index.html`;

const getLocation    = ClientFunction(() => window.location.toString().toLowerCase().replace(/\/\/\//g, '//'));
const resolveFileUrl = relativeUrl => `file://${path.join(__dirname, relativeUrl)}`.replace(/\\/g, '/').toLowerCase();

test('Navigate to absolute http page', async t => {
    await t
        .navigateTo('http://localhost:3000/fixtures/api/es-next/navigate-to-and-test-page/pages/navigation.html')
        .click('#button')
        .expect(getLocation()).eql('http://localhost:3000/fixtures/api/es-next/navigate-to-and-test-page/pages/navigation.html');
});

test('Navigate to relative http page', async t => {
    await t
        .navigateTo('navigation.html')
        .click('#button')
        .expect(getLocation()).eql('http://localhost:3000/fixtures/api/es-next/navigate-to-and-test-page/pages/navigation.html');
});

test('Navigate to scheme-less http page', async t => {
    await t
        .navigateTo('//localhost:3000/fixtures/api/es-next/navigate-to-and-test-page/pages/navigation.html')
        .click('#button')
        .expect(getLocation()).eql('http://localhost:3000/fixtures/api/es-next/navigate-to-and-test-page/pages/navigation.html');
});

test
    .page `file://${path.join(__dirname, '../pages/index.html')}`
('Navigate to relative file page', async t => {
    await t
        .navigateTo('navigation.html')
        .click('#button')
        .expect(getLocation()).eql(resolveFileUrl('../pages/navigation.html'));
});

test
    .page `file://${path.join(__dirname, '../pages/index.html')}`
('Navigate to absolute file page', async t => {
    await t
        .navigateTo(path.join(__dirname, '../pages/navigation.html'))
        .click('#button')
        .expect(getLocation()).eql(resolveFileUrl('../pages/navigation.html'));
});

test
    .page `file://${path.join(__dirname, '../pages/index.html')}`
('Navigate to scheme-less file page', async t => {
    await t
        .navigateTo(`//${path.join(__dirname, '../pages/navigation.html')}`)
        .click('#button')
        .expect(getLocation()).eql(resolveFileUrl('../pages/navigation.html'));
});

test('Navigate to absolute file page with scheme', async t => {
    await t
        .navigateTo(`file://${path.join(__dirname, '../pages/navigation.html')}`)
        .click('#button')
        .expect(getLocation()).eql(resolveFileUrl('../pages/navigation.html'));
});

test('Navigate to about:blank', async t => {
    await t
        .navigateTo('about:blank')
        .expect(getLocation()).eql('about:blank');
});

test('Incorrect protocol', async t => {
    await t.navigateTo('ftp://localhost:3000/fixtures/api/es-next/navigate-to-and-test-page/pages/index.html');
});

test.page `http://localhost:3000/fixtures/api/es-next/navigate-to-and-test-page/pages/navigation.html`
('Absolute http page', async t => {
    await t.click('#button');
});

test
    .page `../pages/navigation.html`
('Relative file page', async t => {
    await t
        .click('#button')
        .expect(getLocation()).eql(resolveFileUrl('../pages/navigation.html'));
});

test
    .page `${path.join(__dirname, '../pages/navigation.html')}`
('Absolute file page', async t => {
    await t
        .click('#button')
        .expect(getLocation()).eql(resolveFileUrl('../pages/navigation.html'));
});

test
    .page `localhost:3000/fixtures/api/es-next/navigate-to-and-test-page/pages/navigation.html`
('Scheme-less http page 1', async t => {
    await t
        .click('#button')
        .expect(getLocation()).eql('http://localhost:3000/fixtures/api/es-next/navigate-to-and-test-page/pages/navigation.html');
});

test
    .page `//localhost:3000/fixtures/api/es-next/navigate-to-and-test-page/pages/navigation.html`
('Scheme-less http page 2', async t => {
    await t
        .click('#button')
        .expect(getLocation()).eql('http://localhost:3000/fixtures/api/es-next/navigate-to-and-test-page/pages/navigation.html');
});

test
    .page `file://${path.join(__dirname, '../pages/navigation.html')}`
('Absolute file page with scheme', async t => {
    await t
        .click('#button')
        .expect(getLocation()).eql(resolveFileUrl('../pages/navigation.html'));
});

test
    .page `about:blank`
('about:blank', async t => {
    await t.expect(getLocation()).eql('about:blank');
});

