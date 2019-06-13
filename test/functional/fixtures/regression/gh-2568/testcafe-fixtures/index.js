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
    const selector = Selector('div')
        .filter('.filtered')
        .withText('loren')
        .withExactText('loren ipsum')
        .withAttribute('attr', '3')
        .filterVisible()
        .nth(500);

    await t.click(selector);
});

test('nth in collectionMode', async t => {
    const selector = Selector('div')
        .nth(500)
        .filter('.filtered')
        .withText('loren')
        .withExactText('loren ipsum')
        .withAttribute('attr', '3')
        .filterVisible();

    await t.click(selector);
});

test('filterVisible', async t => {
    const selector = Selector('div')
        .filter('.filtered')
        .withText('loren')
        .withExactText('loren ipsum')
        .withAttribute('attr', '1')
        .filterVisible()
        .nth(0);

    await t.click(selector);
});

test('filterHidden', async t => {
    const selector = Selector('div')
        .filter('.filtered')
        .withText('loren')
        .withExactText('loren ipsum')
        .withAttribute('attr', '3')
        .filterHidden()
        .nth(0);

    await t.click(selector);
});

test('withAttribute', async t => {
    const selector = Selector('div')
        .filter('.filtered')
        .withText('loren')
        .withExactText('loren ipsum')
        .withAttribute('attr', '4')
        .filterVisible()
        .nth(0);

    await t.click(selector);
});

test('root', async t => {
    const selector = Selector('divf')
        .filter('.filtered')
        .withText('loren')
        .withExactText('loren ipsum')
        .withAttribute('attr', '3')
        .filterVisible()
        .nth(500);

    await t.click(selector);
});

test('parent', async t => {
    const selector = Selector('body')
        .find('div.parent > div')
        .nextSibling()
        .parent('span')
        .child('p');

    await t.click(selector);
});

test('drag', async t => {
    const selector = Selector('div.parent').child('ul');

    await t.dragToElement('div.parent', selector);
});

test('snapshot', async () => {
    await Selector('ul li').filter('test').hasClass('yo');
});

test('custom DOM properties', async t => {
    const selector = Selector('ul li').addCustomDOMProperties({
        innerHTML: el => el.innerHTML
    });

    await t.expect(selector.innerHTML).eql('test');
});

test('custom methods', async t => {
    let selector = Selector('div').addCustomMethods({
        customFilter: nodes => nodes.filter(node => !!node.id)
    }, { returnDOMNodes: true });

    selector = selector
        .customFilter('1', 2, { key: 'value' }, new RegExp('regexp'), () => {})
        .withText('loren');

    await t.click(selector);
});

test('with - failed before', async t => {
    await t.click(Selector('non-existing-element').with({ timeout: 100 }).find('ul'));
});

test('with - failed after', async t => {
    await t.click(Selector('body').with({ timeout: 100 }).find('non-existing-element'));
});
