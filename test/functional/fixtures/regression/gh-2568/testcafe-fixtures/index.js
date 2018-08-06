import { Selector } from 'testcafe';

fixture `GH-2568`
    .page `http://localhost:3000/fixtures/regression/gh-2568/pages/index.html`;

test('nested selector', async t => {
    await t.click(Selector(Selector(Selector(Selector(Selector('div'))).filter('.non-existing-class'))).filterVisible());
});

test('client function selector', async t => {
    await t.click(Selector(function () {
        return document.querySelectorAll('b');
    }).filterVisible());
});

test('nested client function selector', async t => {
    await t.click(Selector(function () {
        return document.querySelectorAll('div');
    })
        .withText('loren')
        .filter(function () {
            return true;
        })
        .filter(function () {
            return false;
        })
        .filterVisible());
});

test('nth', async t => {
    var selector = Selector('div')
        .filter('.filtered')
        .withText('loren')
        .withExactText('loren ipsum')
        .withAttribute('attr', '3')
        .filterVisible()
        .nth(500);

    await t.click(selector);
});

test('filterVisible', async t => {
    var selector = Selector('div')
        .filter('.filtered')
        .withText('loren')
        .withExactText('loren ipsum')
        .withAttribute('attr', '1')
        .filterVisible()
        .nth(0);

    await t.click(selector);
});

test('filterHidden', async t => {
    var selector = Selector('div')
        .filter('.filtered')
        .withText('loren')
        .withExactText('loren ipsum')
        .withAttribute('attr', '3')
        .filterHidden()
        .nth(0);

    await t.click(selector);
});

test('withAttribute', async t => {
    var selector = Selector('div')
        .filter('.filtered')
        .withText('loren')
        .withExactText('loren ipsum')
        .withAttribute('attr', '4')
        .filterVisible()
        .nth(0);

    await t.click(selector);
});

test('withExactText', async t => {
    var selector = Selector('div')
        .filter('.filtered')
        .withText('loren')
        .withExactText('loren ipsums')
        .withAttribute('attr', '3')
        .filterVisible()
        .nth(500);

    await t.click(selector);
});

test('withText', async t => {
    var selector = Selector('div')
        .filter('.filtered')
        .withText('lorenps')
        .withExactText('loren ipsums')
        .withAttribute('attr', '3')
        .filterVisible()
        .nth(500);

    await t.click(selector);
});

test('filter', async t => {
    var selector = Selector('div')
        .filter('.filteredddddd')
        .withText('loren')
        .withExactText('loren ipsum')
        .withAttribute('attr', '3')
        .filterVisible()
        .nth(500);

    await t.click(selector);
});

test('root', async t => {
    var selector = Selector('divf')
        .filter('.filtered')
        .withText('loren')
        .withExactText('loren ipsum')
        .withAttribute('attr', '3')
        .filterVisible()
        .nth(500);

    await t.click(selector);
});

test('child', async t => {
    var selector = Selector('body')
        .find('div.parent > div')
        .nextSibling()
        .parent('div')
        .child('p');

    await t.click(selector);
});

test('parent', async t => {
    var selector = Selector('body')
        .find('div.parent > div')
        .nextSibling()
        .parent('span')
        .child('p');

    await t.click(selector);
});

test('nextSibling', async t => {
    var selector = Selector('body')
        .find('div.parent > div:last-child')
        .nextSibling()
        .parent('div')
        .child('span');

    await t.click(selector);
});

test('prevSibling', async t => {
    var selector = Selector('body')
        .find('div.parent > div:first-child')
        .prevSibling()
        .parent('div')
        .child('span');

    await t.click(selector);
});

test('sibling', async t => {
    var selector = Selector('body')
        .find('div.parent > div:first-child > div')
        .sibling()
        .parent('div')
        .child('span');

    await t.click(selector);
});

test('find', async t => {
    var selector = Selector('body')
        .find('div.not-existing')
        .nextSibling()
        .parent('div')
        .child('span');

    await t.click(selector);
});
