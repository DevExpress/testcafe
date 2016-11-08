// NOTE: to preserve callsites, add new tests AFTER the existing ones
import { Selector, ClientFunction } from 'testcafe';
import { expect } from 'chai';

fixture `Selector`
    .page `http://localhost:3000/fixtures/api/es-next/selector/pages/index.html`;

const getElementById = Selector(id => document.getElementById(id));

test('HTMLElement snapshot basic properties', async () => {
    const el = await getElementById('htmlElement');

    expect(el.nodeType).eql(1);
    expect(el.id).eql('htmlElement');
    expect(el.tagName).eql('div');

    expect(el.attributes['id']).eql('htmlElement');
    expect(el.getAttribute(['id'])).eql('htmlElement');
    expect(el.attributes['class']).eql('yo hey cool');
    expect(el.attributes['style']).contains('width: 40px; height: 30px; padding-top: 2px; padding-left: 2px;');

    expect(el.style['width']).eql('40px');
    expect(el.getStyleProperty(['width'])).eql('40px');
    expect(el.style['height']).eql('30px');
    expect(el.style['padding-top']).eql('2px');
    expect(el.style['padding-left']).eql('2px');
    expect(el.style['display']).eql('block');

    expect(el.namespaceURI).eql('http://www.w3.org/1999/xhtml');
    expect(el.hasChildNodes).to.be.true;
    expect(el.childNodeCount).eql(3);
    expect(el.hasChildElements).to.be.true;
    expect(el.childElementCount).eql(1);
    expect(el.visible).to.be.true;

    expect(el.clientWidth).eql(42);
    expect(el.clientHeight).eql(32);
    expect(el.clientTop).eql(0);
    expect(el.clientLeft).eql(1);

    expect(el.offsetWidth).eql(43);
    expect(el.offsetHeight).eql(32);
    expect(el.offsetTop).eql(0);
    expect(el.offsetLeft).eql(0);

    expect(el.scrollWidth).eql(42);
    expect(el.scrollHeight).eql(32);
    expect(el.scrollTop).eql(0);
    expect(el.scrollLeft).eql(0);

    expect(el.focused).to.be.false;
    expect(el.value).to.be.undefined;
    expect(el.checked).to.be.undefined;
    expect(el.selected).to.be.undefined;

    expect(el.boundingClientRect.width).eql(43);
    expect(el.boundingClientRect.left).eql(0);
    expect(el.getBoundingClientRectProperty('left')).eql(0);

    expect(el.textContent).eql('\n    \n        42\n    \n    Yo\n');
    expect(el.classNames).eql(['yo', 'hey', 'cool']);
});

test('SVGElement snapshot basic properties', async () => {
    const el = await getElementById('svgElement');

    expect(el.nodeType).eql(1);
    expect(el.id).eql('svgElement');
    expect(el.tagName).eql('rect');

    expect(el.attributes['id']).eql('svgElement');
    expect(el.attributes['width']).eql('300px');
    expect(el.attributes['height']).eql('100px');
    expect(el.attributes['class']).eql('svg1 svg2');
    expect(el.attributes['style']).to.be.a.string;

    expect(el.style['display']).eql('inline');
    expect(el.style['visibility']).eql('visible');

    expect(el.namespaceURI).eql('http://www.w3.org/2000/svg');
    expect(el.hasChildNodes).to.be.true;
    expect(el.childNodeCount).eql(1);
    expect(el.hasChildElements).to.be.false;
    expect(el.childElementCount).eql(0);
    expect(el.visible).to.be.true;

    expect(el.clientWidth).eql(0);
    expect(el.clientHeight).eql(0);
    expect(el.clientTop).eql(0);
    expect(el.clientLeft).eql(0);

    expect(el.boundingClientRect.width).eql(300);
    expect(el.boundingClientRect.height).eql(100);
    expect(el.boundingClientRect.top).eql(32);
    expect(el.boundingClientRect.left).eql(0);

    expect(el.focused).to.be.false;
    expect(el.value).to.be.undefined;
    expect(el.checked).to.be.undefined;
    expect(el.selected).to.be.undefined;

    expect(el.textContent).eql('\n        Hey\n    ');
    expect(el.classNames).eql(['svg1', 'svg2']);
});

test('Input-specific element snapshot properties', async t => {
    let el = await getElementById('textInput');

    expect(el.focused).to.be.false;
    expect(el.value).eql('');
    expect(el.checked).to.be.false;

    await t.typeText('#textInput', 'Hey!');

    el = await getElementById('textInput');

    expect(el.focused).to.be.true;
    expect(el.value).eql('Hey!');
    expect(el.checked).to.be.false;
    expect(el.selected).to.be.undefined;

    el = await getElementById('checkInput');

    expect(el.focused).to.be.false;
    expect(el.value).eql('on');
    expect(el.checked).to.be.false;

    await t.click('#checkInput');

    el = await getElementById('checkInput');

    expect(el.focused).to.be.true;
    expect(el.value).eql('on');
    expect(el.checked).to.be.true;

    el = await getElementById('option2');

    expect(el.selected).to.be.false;

    await t
        .click('#selectInput')
        .click('#option2');

    el = await getElementById('option2');

    expect(el.selected).to.be.true;
});

test('`innerText` element snapshot property', async () => {
    const el = await getElementById('htmlElementWithInnerText');

    // NOTE: we have to use this regexp because the innerText field
    // returns a little bit different values in IE9 and other browsers
    expect(/^Hey\nyo test {1,2}test( \u0000)?/.test(el.innerText.trim())).to.be.true;
});

test('Non-element node snapshots', async t => {
    await t.navigateTo('http://localhost:3000/fixtures/api/es-next/selector/pages/non-element-nodes.html');

    const doc = await Selector(() => document)();

    expect(doc.nodeType).eql(9);
    expect(doc.childNodeCount).eql(2);
    expect(doc.hasChildNodes).to.be.true;
    expect(doc.childElementCount).eql(1);
    expect(doc.hasChildElements).to.be.true;
    expect(doc.textContent).to.be.null;

    const textNode = await Selector(() => document.body.childNodes[0])();

    expect(textNode.nodeType).eql(3);
    expect(textNode.childNodeCount).eql(0);
    expect(textNode.hasChildNodes).to.be.false;
    expect(textNode.childElementCount).eql(0);
    expect(textNode.hasChildElements).to.be.false;
    expect(textNode.textContent).eql('Yo');

    const comment = await Selector(() => document.body.childNodes[1])();

    expect(comment.nodeType).eql(8);
    expect(comment.childNodeCount).eql(0);
    expect(comment.hasChildNodes).to.be.false;
    expect(comment.childElementCount).eql(0);
    expect(comment.hasChildElements).to.be.false;
    expect(comment.textContent).eql(' some comment ');

    const fragment = await Selector(() => {
        const f   = document.createDocumentFragment();
        const div = document.createElement('div');

        div.innerHTML = '42';
        f.appendChild(div);

        return f;
    })();

    expect(fragment.nodeType).eql(11);
    expect(fragment.childNodeCount).eql(1);
    expect(fragment.hasChildNodes).to.be.true;
    expect(fragment.childElementCount).eql(1);
    expect(fragment.hasChildElements).to.be.true;
    expect(fragment.textContent).eql('42');
});

test('Selector fn is not a function or string', async () => {
    await Selector(123)();
});

test('String ctor argument', async () => {
    const el1 = await Selector('#htmlElement')();
    const el2 = await Selector('.svg1')();

    expect(el1.tagName).eql('div');
    expect(el2.tagName).eql('rect');
});

test('Wait for element in DOM', async t => {
    await t.click('#createElement');

    const el = await Selector('#newElement')();

    expect(el.tagName).eql('div');
});

test('Element does not appear', async () => {
    const el = await Selector('#someElement')();

    expect(el).eql(null);
});

test('Error in code', async () => {
    const selector = Selector(() => {
        throw new Error('Hey ya!');
    });

    await selector();
});

test('Visibility check', async t => {
    const getInvisibleEl = Selector('#invisibleElement');

    let el = await getInvisibleEl();

    expect(el.tagName).eql('div');

    el = await getInvisibleEl.with({ visibilityCheck: true })();

    expect(el).to.be.a.null;

    await t.click('#makeVisible');

    el = await getInvisibleEl.with({ visibilityCheck: true })();

    expect(el.tagName).eql('div');
});

test('Timeout', async () => {
    const getSlowEl = Selector('#slowElement').with({ visibilityCheck: true, timeout: 300 });
    const el        = await getSlowEl();

    expect(el).to.be.a.null;
});

test('Return non-DOM node', async () => {
    await Selector(() => 'hey')();
});

test('Snapshot `selector` method', async () => {
    let el = await getElementById('htmlElement');

    el = await el.selector();

    expect(el.id).eql('htmlElement');
});

test('Snapshot `getParentNode` method', async () => {
    let el     = await getElementById('textInput');
    let parent = await el.getParentNode();

    expect(parent.tagName).eql('form');

    el     = await getElementById('htmlElement');
    parent = await el.getParentNode();

    expect(parent.tagName).eql('body');
});

test('Snapshot `getChildNode` method', async () => {
    const body = await Selector(() => document.body)();

    let node = await body.getChildNode(0);

    expect(node.nodeType).eql(3);

    node = await body.getChildNode(1);

    expect(node.id).eql('htmlElement');

    node = await body.getChildNode(3);

    expect(node.tagName).eql('svg');
});

test('Snapshot `getChildElement` method', async () => {
    const doc = await Selector(() => document)();

    let el = await doc.getChildElement(0);

    expect(el.tagName).eql('html');

    el = await el.getChildElement(1);

    expect(el.tagName).eql('body');
});

test('Snapshot `hasClass` method', async () => {
    let el = await getElementById('htmlElement');

    expect(el.hasClass('yo')).to.be.true;
    expect(el.hasClass('cool')).to.be.true;
    expect(el.hasClass('42')).to.be.false;

    el = await getElementById('svgElement');

    expect(el.hasClass('svg1')).to.be.true;
    expect(el.hasClass('svg2')).to.be.true;
    expect(el.hasClass('cool')).to.be.false;
});

test('Element on new page', async t => {
    const getNewElement = Selector('#newPageElement').with({ timeout: 5000 });

    await t.click('#newPage');

    const el = await getNewElement();

    expect(el.tagName).eql('div');
});

test('Selector "index" option', async () => {
    // String selector
    const getSecondEl = Selector('.idxEl', { index: 1 });

    let el = await getSecondEl();

    expect(el.id).eql('el2');

    // Function selector
    const getThirdEl = Selector(() => document.querySelectorAll('.idxEl'), { index: 2 });

    el = await getThirdEl();

    expect(el.id).eql('el3');

    // Index should be ignored if functions returns element
    const getFirstEl = Selector(() => document.querySelectorAll('.idxEl')[0], { index: 2 });

    el = await getFirstEl();

    expect(el.id).eql('el1');
});

test('Selector "text" option', async () => {
    // String selector and string filter
    let selector = Selector('div', { text: 'element 4.' });

    let el = await selector();

    expect(el.id).eql('el4');

    // String selector and regexp filter
    selector = Selector('div', { text: /This is element \d+/ });

    el = await selector();

    expect(el.id).eql('el1');

    // Function selector and string filter
    selector = Selector(() => document.querySelectorAll('.idxEl'), { text: 'element 4.' });

    el = await selector();

    expect(el.id).eql('el4');

    // Function selector and regexp filter
    selector = Selector(() => document.querySelectorAll('.idxEl'), { text: /This is element \d+/ });

    el = await selector();

    expect(el.id).eql('el1');

    // Should filter element if text filter specified
    selector = Selector(id => document.getElementById(id), { text: 'element 4.' });

    el = await selector('el1');

    expect(el).to.be.null;

    el = await selector('el4');

    expect(el.id).eql('el4');

    // Should filter document if text filter specified
    selector = Selector(() => document, { text: 'Lorem ipsum dolor sit amet, consectetur' });

    el = await selector();

    expect(el).to.be.null;

    el = await selector.with({ text: 'Hey?! (yo)' })();

    expect(el.nodeType).eql(9);

    // Should text node if text filter specified
    selector = Selector(() => document.getElementById('el2').childNodes[0], { text: 'Lorem ipsum dolor sit amet, consectetur' });

    el = await selector();

    expect(el).to.be.null;

    el = await selector.with({ text: 'Hey?! (yo)' })();

    expect(el.nodeType).eql(3);
});

test('Compound filter', async t => {
    const selector = Selector('div', {
        text:  'Hey?! (yo)',
        index: 1
    });

    let el = await selector();

    expect(el.id).eql('el3');

    el = await selector.with({ text: /This is element \d+/ })();

    expect(el.id).eql('el4');

    // Selector should maintain filter when used as parameter
    const getId = ClientFunction(getEl => getEl().id);

    let id = await getId(selector);

    expect(id).eql('el3');

    // Selector should maintain filter when used as dependency
    id = await t.eval(() => selector().id, { dependencies: { selector: selector.with({ index: 0 }) } });

    expect(id).eql('el2');
});

test('Derivative selector without options', async () => {
    var derivative = Selector(getElementById('textInput'));

    await derivative();
});

test('<option> text selector', async () => {
    const selector = Selector('#selectInput > option').with({ text: 'O2' });
    const el       = await selector();

    expect(el.id).eql('option2');
});

test('Snapshot properties shorthands on selector', async () => {
    let el = Selector('#htmlElement');

    expect(await el.nodeType).eql(1);
    expect(await el.id).eql('htmlElement');
    expect(await el.tagName).eql('div');
    expect(await el.namespaceURI).eql('http://www.w3.org/1999/xhtml');
    expect(await el.childNodeCount).eql(3);
    expect(await el.childElementCount).eql(1);
    expect(await el.visible).to.be.true;
    expect(await el.clientWidth).eql(42);
    expect(await el.offsetWidth).eql(43);
    expect(await el.focused).to.be.false;
    expect(await el.value).to.be.undefined;
    expect(await el.textContent).eql('\n    \n        42\n    \n    Yo\n');
    expect(await el.classNames).eql(['yo', 'hey', 'cool']);
    expect(await el.getStyleProperty('width')).eql('40px');
    expect(await el.getStyleProperty('display')).eql('block');
    expect(await el.getAttribute('id')).eql('htmlElement');
    expect(await el.getAttribute('class')).eql('yo hey cool');
    expect(await el.getBoundingClientRectProperty('width')).eql(43);
    expect(await el.getBoundingClientRectProperty('left')).eql(0);
    expect(await el.hasClass('yo')).to.be.true;
    expect(await el.hasClass('cool')).to.be.true;
    expect(await el.hasClass('some-class')).to.be.false;

    el = Selector('#checkInput');

    expect(await el.focused).to.be.false;
    expect(await el.value).eql('on');
    expect(await el.checked).to.be.false;

    el = Selector(() => document);

    expect(await el.hasClass('some-class')).to.be.false;
    expect(await el.getStyleProperty('width')).to.be.undefined;
    expect(await el.getAttribute('id')).to.be.undefined;
    expect(await el.getBoundingClientRectProperty('left')).to.be.undefined;

    const selector = Selector(id => document.getElementById(id));

    expect(await selector('htmlElement').tagName).eql('div');
    expect(await selector('htmlElement').classNames).eql(['yo', 'hey', 'cool']);
    expect(await selector('checkInput').checked).to.be.false;
    expect(await selector('checkInput').value).eql('on');
});

test("Snapshot property shorthand - selector doesn't match any element", async () => {
    await Selector('#someUnknownElement').tagName;
});

test("Snapshot shorthand method - selector doesn't match any element", async () => {
    await Selector('#someUnknownElement').getStyleProperty('width');
});

test('Snapshot property shorthand - selector error', async () => {
    await Selector(() => [].someUndefMethod()).nodeType;
});

test('Snapshot shorthand method - selector error', async () => {
    await Selector(() => [].someUndefMethod()).hasClass('yo');
});

test('Selector "nth()" method', async () => {
    // String selector
    const getSecondEl = Selector('.idxEl').nth(1);

    let el = await getSecondEl();

    expect(el.id).eql('el2');

    // Function selector
    const getThirdEl = Selector(() => document.querySelectorAll('.idxEl')).nth(2);

    el = await getThirdEl();

    expect(el.id).eql('el3');

    // Index should be ignored if functions returns element
    const getFirstEl = Selector(() => document.querySelectorAll('.idxEl')[0]).nth(2);

    el = await getFirstEl();

    expect(el.id).eql('el1');

    // Should work on parametrized selectors
    const elWithClass = Selector(className => document.querySelectorAll('.' + className));

    expect(await elWithClass('idxEl').nth(2).id).eql('el3');
    expect(await elWithClass('idxEl').nth(3).id).eql('el4');

    // Should be overridable
    expect(await elWithClass('idxEl').nth(2).nth(1).id).eql('el2');
    expect(await getSecondEl.nth(2).id).eql('el3');
});

test('Selector "withText" method', async () => {
    // String selector and string filter
    let selector = Selector('div').withText('element 4.');

    let el = await selector();

    expect(el.id).eql('el4');

    // String selector and regexp filter
    selector = Selector('div').withText(/This is element \d+/);

    el = await selector();

    expect(el.id).eql('el1');

    // Function selector and string filter
    selector = Selector(() => document.querySelectorAll('.idxEl')).withText('element 4.');

    el = await selector();

    expect(el.id).eql('el4');

    // Function selector and regexp filter
    selector = Selector(() => document.querySelectorAll('.idxEl')).withText(/This is element \d+/);

    el = await selector();

    expect(el.id).eql('el1');

    // Should filter element if text filter specified
    selector = Selector(id => document.getElementById(id)).withText('element 4.');

    el = await selector('el1');

    expect(el).to.be.null;

    el = await selector('el4');

    expect(el.id).eql('el4');

    // Should filter document if text filter specified
    selector = Selector(() => document).withText('Lorem ipsum dolor sit amet, consectetur');

    el = await selector();

    expect(el).to.be.null;

    // Should be overridable
    el = await selector.withText('Hey?! (yo)')();

    expect(el.nodeType).eql(9);

    selector = Selector(() => document.getElementById('el2').childNodes[0]).withText('Lorem ipsum dolor sit amet, consectetur');

    el = await selector();

    expect(el).to.be.null;

    el = await selector.withText('Hey?! (yo)')();

    expect(el.nodeType).eql(3);

    // Should work on parametrized selectors
    const elWithClass = Selector(className => document.querySelectorAll('.' + className));

    expect(await elWithClass('idxEl').withText('element 4.').id).eql('el4');
    expect(await elWithClass('idxEl').withText('element 1.').id).eql('el1');
});

test('Combination of filter methods', async t => {
    const selector = Selector('div').withText('Hey?! (yo)').nth(1);

    let el = await selector();

    expect(el.id).eql('el3');

    el = await selector.withText(/This is element \d+/)();

    expect(el.id).eql('el4');

    // Selector should maintain filter when used as parameter
    const getId = ClientFunction(getEl => getEl().id);

    let id = await getId(selector);

    expect(id).eql('el3');

    // Selector should maintain filter when used as dependency
    id = await t.eval(() => selector().id, { dependencies: { selector: selector.nth(0) } });

    expect(id).eql('el2');
});

test('Selector "find" method', async () => {
    // String filter
    expect(await Selector('#htmlElement').find('span').id).eql('someSpan');

    // Function filter
    expect(await Selector('#container').find(node => node.id === 'el3').id).eql('el3');

    // Compound
    expect(await Selector('a').find('f').find('g').innerText).eql('h');

    // Deep search
    expect(await Selector('a').find('g').innerText).eql('h');
    expect(await Selector('a').find(node => node.tagName && node.tagName.toLowerCase() === 'g').innerText).eql('h');

    // Parametrized selector
    const withId = Selector(id => document.getElementById(id));

    expect(await withId('htmlElement').find('span').id).eql('someSpan');

    // With filters
    expect(await Selector('#container').find('div').withText('element 4').id).eql('el4');
});

test('Selector "parent" method', async () => {
    // Index filter
    expect((await Selector('g').parent(1).tagName).toLowerCase()).eql('a');
    expect((await Selector('g').parent().parent().tagName).toLowerCase()).eql('a');
    expect((await Selector('#option1').parent(2).tagName).toLowerCase()).eql('body');

    // CSS selector filter
    expect((await Selector('g').parent('a').tagName).toLowerCase()).eql('a');
    expect(await Selector('#childDiv').parent('.parent1').id).eql('p1');

    // Function selector
    expect(await Selector('#childDiv').parent(node => node.id === 'p2').id).eql('p2');

    // Parametrized selector
    const withId = Selector(id => document.getElementById(id));

    expect(await withId('childDiv').parent('.parent1').id).eql('p1');

    // With filters
    expect(await Selector('#childDiv').parent().withText(/Hey/).id).eql('p2');
    expect(await Selector('#childDiv').parent().nth(1).id).eql('p1');
});

test('Selector "child" method', async () => {
    // Index filter
    expect(await Selector('#container').child(1).id).eql('el2');
    expect(await Selector('#p2').child().child().id).eql('p0');
    expect(await Selector('#container').child(3).id).eql('el4');

    // CSS selector filter
    expect(await Selector('#container').child('#el3').id).eql('el3');
    expect(await Selector('form').child('select').id).eql('selectInput');

    // Function selector
    expect(await Selector('#container').child(el => el.id === 'el2').id).eql('el2');

    // Parametrized selector
    const withId = Selector(id => document.getElementById(id));

    expect(await withId('container').child('#el3').id).eql('el3');

    // With filters
    expect(await Selector('#container').child().withText('element 4').id).eql('el4');
});
