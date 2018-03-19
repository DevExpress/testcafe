// NOTE: to preserve callsites, add new tests AFTER the existing ones
import { Selector, ClientFunction } from 'testcafe';

fixture `Selector`
    .page `http://localhost:3000/fixtures/api/es-next/selector/pages/index.html`;

const getElementById = Selector(id => document.getElementById(id));

const isIEFunction = ClientFunction(() => {
    var userAgent = window.navigator.userAgent;
    var appName   = window.navigator.appName;
    var isIE11Re  = new RegExp('Trident/.*rv:([0-9]{1,}[.0-9]{0,})');

    return appName === 'Microsoft Internet Explorer' ||
           appName === 'Netscape' && isIE11Re.exec(userAgent) !== null;
});

test('HTMLElement snapshot basic properties', async t => {
    const el = await getElementById('htmlElement');

    await t
        .expect(el.nodeType).eql(1)
        .expect(el.id).eql('htmlElement')
        .expect(el.tagName).eql('div')

        .expect(el.attributes['id']).eql('htmlElement')
        .expect(el.getAttribute('id')).eql('htmlElement')
        .expect(el.attributes['class']).eql('yo hey cool')
        .expect(el.attributes['style']).contains('width: 40px; height: 30px; padding-top: 2px; padding-left: 2px;')

        .expect(el.style['width']).eql('40px')
        .expect(el.getStyleProperty(['width'])).eql('40px')
        .expect(el.style['height']).eql('30px')
        .expect(el.style['padding-top']).eql('2px')
        .expect(el.style['padding-left']).eql('2px')
        .expect(el.style['display']).eql('block')

        .expect(el.namespaceURI).eql('http://www.w3.org/1999/xhtml')
        .expect(el.hasChildNodes).ok()
        .expect(el.childNodeCount).eql(3)
        .expect(el.hasChildElements).ok()
        .expect(el.childElementCount).eql(1)
        .expect(el.visible).ok()

        .expect(el.clientWidth).eql(42)
        .expect(el.clientHeight).eql(32)
        .expect(el.clientTop).eql(0)
        .expect(el.clientLeft).eql(1)

        .expect(el.offsetWidth).eql(43)
        .expect(el.offsetHeight).eql(32)
        .expect(el.offsetTop).eql(0)
        .expect(el.offsetLeft).eql(0)

        .expect(el.scrollWidth).eql(42)
        .expect(el.scrollHeight).eql(32)
        .expect(el.scrollTop).eql(0)
        .expect(el.scrollLeft).eql(0)

        .expect(el.focused).notOk()
        .expect(el.value).eql(void 0)
        .expect(el.checked).eql(void 0)
        .expect(el.selected).eql(void 0)

        .expect(el.boundingClientRect.width).eql(43)
        .expect(el.boundingClientRect.left).eql(0)
        .expect(el.getBoundingClientRectProperty('left')).eql(0)

        .expect(el.textContent).eql('\n    \n        42\n    \n    Yo\n')
        .expect(el.classNames).eql(['yo', 'hey', 'cool']);
});

test('SVGElement snapshot basic properties', async t => {
    const el = await getElementById('svgElement');

    await t
        .expect(el.nodeType).eql(1)
        .expect(el.id).eql('svgElement')
        .expect(el.tagName).eql('rect')

        .expect(el.attributes['id']).eql('svgElement')
        .expect(el.attributes['width']).eql('300px')
        .expect(el.attributes['height']).eql('100px')
        .expect(el.attributes['class']).eql('svg1 svg2')
        .expect(typeof el.attributes['style']).eql('string')

        .expect(el.style['display']).eql('inline')
        .expect(el.style['visibility']).eql('visible')

        .expect(el.namespaceURI).eql('http://www.w3.org/2000/svg')
        .expect(el.hasChildNodes).ok()
        .expect(el.childNodeCount).eql(1)
        .expect(el.hasChildElements).notOk()
        .expect(el.childElementCount).eql(0)
        .expect(el.visible).ok()

        .expect(el.clientWidth).eql(0)
        .expect(el.clientHeight).eql(0)
        .expect(el.clientTop).eql(0)
        .expect(el.clientLeft).eql(0)

        .expect(el.boundingClientRect.width).eql(300)
        .expect(el.boundingClientRect.height).eql(100)
        .expect(el.boundingClientRect.top).eql(32)
        .expect(el.boundingClientRect.left).eql(0)

        .expect(el.focused).notOk()
        .expect(el.value).eql(void 0)
        .expect(el.checked).eql(void 0)
        .expect(el.selected).eql(void 0)

        .expect(el.textContent).eql('\n        Hey\n    ')
        .expect(el.classNames).eql(['svg1', 'svg2']);
});

test('Input-specific element snapshot properties', async t => {
    let el = await getElementById('textInput');

    await t
        .expect(el.focused).notOk()
        .expect(el.value).eql('')
        .expect(el.checked).notOk()

        .typeText('#textInput', 'Hey!');

    el = await getElementById('textInput');

    await t
        .expect(el.focused).ok()
        .expect(el.value).eql('Hey!')
        .expect(el.checked).notOk()
        .expect(el.selected).eql(void 0);

    el = await getElementById('checkInput');

    await t
        .expect(el.focused).notOk()
        .expect(el.value).eql('on')
        .expect(el.checked).notOk()

        .click('#checkInput');

    el = await getElementById('checkInput');

    await t
        .expect(el.focused).ok()
        .expect(el.value).eql('on')
        .expect(el.checked).ok();

    el = await getElementById('option2');

    await t.expect(el.selected).notOk();

    const select = Selector('#selectInput');

    await t.expect(await select.selectedIndex).eql(0);

    await t
        .click(select)
        .click('#option2')

        .expect(select.selectedIndex).eql(1);

    el = await getElementById('option2');

    await t.expect(el.selected).ok();
});

test('`innerText` element snapshot property', async t => {
    const isIE    = await isIEFunction();
    let innerText = await getElementById('htmlElementWithInnerText').innerText;

    innerText = innerText.trim().replace(/\r\n/, '\n');

    // NOTE: we have to use regexp because the innerText field
    // returns a little bit different values in IE9 and other browsers
    var expectedTextRe = isIE ? /^Hey\nyo test {2}42 test {2}'hey hey'; \.someClass \{ \}/ :
        /^Hey\nyo test {1,2}test/;

    await t.expect(expectedTextRe.test(innerText.trim())).ok();
});

test('Non-element node snapshots', async t => {
    await t.navigateTo(`http://localhost:3000/fixtures/api/es-next/selector/pages/non-element-nodes.html`);

    const doc = await Selector(() => document)();

    await t
        .expect(doc.nodeType).eql(9)
        .expect(doc.childNodeCount).eql(2)
        .expect(doc.hasChildNodes).ok()
        .expect(doc.childElementCount).eql(1)
        .expect(doc.hasChildElements).ok()
        .expect(doc.textContent).eql(null);

    const textNode = await Selector(() => document.body.childNodes[0])();

    await t
        .expect(textNode.nodeType).eql(3)
        .expect(textNode.childNodeCount).eql(0)
        .expect(textNode.hasChildNodes).notOk()
        .expect(textNode.childElementCount).eql(0)
        .expect(textNode.hasChildElements).notOk()
        .expect(textNode.textContent).eql('Yo');

    const comment = await Selector(() => document.body.childNodes[1])();

    await t
        .expect(comment.nodeType).eql(8)
        .expect(comment.childNodeCount).eql(0)
        .expect(comment.hasChildNodes).notOk()
        .expect(comment.childElementCount).eql(0)
        .expect(comment.hasChildElements).notOk()
        .expect(comment.textContent).eql(' some comment ');

    const fragment = await Selector(() => {
        const f   = document.createDocumentFragment();
        const div = document.createElement('div');

        div.innerHTML = '42';
        f.appendChild(div);

        return f;
    })();

    await t
        .expect(fragment.nodeType).eql(11)
        .expect(fragment.childNodeCount).eql(1)
        .expect(fragment.hasChildNodes).ok()
        .expect(fragment.childElementCount).eql(1)
        .expect(fragment.hasChildElements).ok()
        .expect(fragment.textContent).eql('42');
});

test('Selector fn is not a function or string', async () => {
    await Selector(123)();
});

test('String ctor argument', async t => {
    await t
        .expect(Selector('#htmlElement').tagName).eql('div')
        .expect(Selector('.svg1').tagName).eql('rect');
});

test('Wait for element in DOM', async t => {
    await t.click('#createElement');

    const el = await Selector('#newElement')();

    await t.expect(el.tagName).eql('div');
});

test('Element does not appear', async t => {
    const el = await Selector('#someElement')();

    await t.expect(el).eql(null);
});

test('Error in code', async () => {
    const selector = Selector(() => {
        throw new Error('Hey ya!');
    });

    await selector();
});

test('Visibility check', async t => {
    const getInvisibleEl = Selector('#invisibleElement');

    await t.expect(getInvisibleEl.tagName).eql('div');

    const el = await getInvisibleEl.with({ visibilityCheck: true })();

    await t
        .expect(el).eql(null)

        .click('#makeVisible')

        .expect(getInvisibleEl.with({ visibilityCheck: true }).tagName).eql('div');
});

test('Timeout', async t => {
    const getSlowEl = Selector('#slowElement').with({ visibilityCheck: true, timeout: 300 });
    const el        = await getSlowEl();

    await t.expect(el).eql(null);
});

test('Return non-DOM node', async () => {
    await Selector(() => 'hey')();
});

test('Snapshot `selector` method', async t => {
    let el = await getElementById('htmlElement');

    el = await el.selector();

    await t.expect(el.id).eql('htmlElement');
});

test('Snapshot `hasClass` method', async t => {
    let el = await getElementById('htmlElement');

    await t
        .expect(el.hasClass('yo')).ok()
        .expect(el.hasClass('cool')).ok()
        .expect(el.hasClass('42')).notOk();

    el = await getElementById('svgElement');

    await t
        .expect(el.hasClass('svg1')).ok()
        .expect(el.hasClass('svg2')).ok()
        .expect(el.hasClass('cool')).notOk();
});

test('Element on new page', async t => {
    const getNewElement = Selector('#newPageElement').with({ timeout: 5000 });

    await t.click('#newPage');

    const el = await getNewElement();

    await t.expect(el.tagName).eql('div');
});

test('Derivative selector without options', async () => {
    var derivative = Selector(getElementById('textInput'));

    await derivative();
});

test('<option> text selector', async t => {
    const selector = Selector('#selectInput > option').withText('O2');

    await t.expect(selector.id).eql('option2');
});

test('Snapshot properties shorthands on selector', async t => {
    let el = Selector('#htmlElement');

    await t
        .expect(el.id).eql('htmlElement')
        .expect(el.nodeType).eql(1)
        .expect(el.tagName).eql('div')
        .expect(el.namespaceURI).eql('http://www.w3.org/1999/xhtml')
        .expect(el.childNodeCount).eql(3)
        .expect(el.childElementCount).eql(1)
        .expect(el.visible).ok()
        .expect(el.clientWidth).eql(42)
        .expect(el.offsetWidth).eql(43)
        .expect(el.focused).notOk()
        .expect(el.value).eql(void 0)
        .expect(el.textContent).eql('\n    \n        42\n    \n    Yo\n')
        .expect(el.classNames).eql(['yo', 'hey', 'cool'])
        .expect(el.getStyleProperty('width')).eql('40px')
        .expect(el.getStyleProperty('display')).eql('block')
        .expect(el.getAttribute('id')).eql('htmlElement')
        .expect(el.getAttribute('class')).eql('yo hey cool')
        .expect(el.getBoundingClientRectProperty('width')).eql(43)
        .expect(el.getBoundingClientRectProperty('left')).eql(0)
        .expect(el.hasClass('yo')).ok()
        .expect(el.hasClass('cool')).ok()
        .expect(el.hasClass('some-class')).notOk();

    el = Selector('#checkInput');

    await t
        .expect(el.focused).notOk()
        .expect(el.value).eql('on')
        .expect(el.checked).notOk();

    el = Selector(() => document);

    await t
        .expect(el.hasClass('some-class')).notOk()
        .expect(el.getStyleProperty('width')).eql(void 0)
        .expect(el.getAttribute('id')).eql(void 0)
        .expect(el.getBoundingClientRectProperty('left')).eql(void 0);

    const selector = Selector(id => document.getElementById(id));

    await t
        .expect(selector('htmlElement').tagName).eql('div')
        .expect(selector('htmlElement').classNames).eql(['yo', 'hey', 'cool'])
        .expect(selector('checkInput').checked).notOk()
        .expect(selector('checkInput').value).eql('on');
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

test('Selector "nth()" method', async t => {
    // String selector
    const getSecondEl = Selector('.idxEl').nth(-3);

    await t.expect(getSecondEl.id).eql('el2');

    // Function selector
    const getThirdEl = Selector(() => document.querySelectorAll('.idxEl')).nth(2);

    await t.expect(getThirdEl.id).eql('el3');

    // If single node is returned index should be always 0
    const getFirstEl = await Selector(() => document.querySelectorAll('.idxEl')[0]).nth(2)();

    await t.expect(getFirstEl).eql(null);

    // Should work on parameterized selectors
    const elWithClass = Selector(className => document.querySelectorAll('.' + className));

    await t
        .expect(elWithClass('idxEl').nth(2).id).eql('el3')
        .expect(elWithClass('idxEl').nth(-3).id).eql('el2')

        // Should be overridable
        .expect(elWithClass('idxEl').nth(2).nth(1).id).eql('el2')
        .expect(getSecondEl.nth(2).id).eql('el3');
});

test('Selector "withText" method', async t => {
    // String selector and string filter
    await t
        .expect(Selector('div').withText('element 4.').id).eql('el4')

        // String selector and regexp filter
        .expect(Selector('div').withText(/This is element \d+/).id).eql('el1')

        // Function selector and string filter
        .expect(Selector(() => document.querySelectorAll('.idxEl')).withText('element 4.').id).eql('el4')

        // Function selector and regexp filter
        .expect(Selector(() => document.querySelectorAll('.idxEl')).withText(/This is element \d+/).id).eql('el1')

        // Should filter element if text filter specified
        .expect(getElementById('el1').withText('element 4.').exists).notOk()
        .expect(getElementById('el4').withText('element 4.').id).eql('el4');

    var getDocument = Selector(() => document);

    // Should filter document if text filter specified
    await t
        .expect(getDocument.withText('Lorem ipsum dolor sit amet, consectetur').exists).notOk()
        .expect(getDocument.withText('Hey?! (yo)').nodeType).eql(9)

        //Compound
        .expect(Selector('div').withText('This').withText('element 4').id).eql('el4');

    var getNode = Selector(() => document.getElementById('el2').childNodes[0]);

    await t
        .expect(getNode().withText('Lorem ipsum dolor sit amet, consectetur').exists).notOk()
        .expect(getNode().withText('Hey?! (yo)').nodeType).eql(3);

    // Should work on parameterized selectors
    const elWithClass = Selector(className => document.querySelectorAll('.' + className));

    await t
        .expect(elWithClass('idxEl').withText('element 4.').id).eql('el4')
        .expect(elWithClass('idxEl').withText('element 1.').id).eql('el1');
});

test('Selector "withExactText" method', async t => {
    let selector = Selector('#withExactText div');

    await t
        .expect(selector.withText('Element with text').count).eql(6);

    selector = selector.withExactText('Element with text');

    await t
        .expect(selector.count).eql(3)
        .expect(selector.nth(0).id).eql('passed-0')
        .expect(selector.nth(1).id).eql('passed-1')
        .expect(selector.nth(2).id).eql('passed-2');
});

test('Selector "withAttribute" method', async t => {
    await t
    // string attr name
        .expect(Selector('div').withAttribute('data-store').id).eql('attr1')

        // regexp attr name
        .expect(Selector('div').withAttribute(/data/).id).eql('attr1')

        // string attr name and string attribute value
        .expect(Selector('div').withAttribute('data-store', 'data-attr2').id).eql('attr2')

        // string attr name and regexp attribute value
        .expect(Selector('div').withAttribute('data-store', /data-attr\d/).id).eql('attr1')

        // regexp attr name and regexp attribute value
        .expect(Selector('div').withAttribute(/store$/, /attr2$/).id).eql('attr2');

    //GH #1548
    await t
        .expect(Selector('div').withAttribute('store').exists).notOk()
        .expect(Selector('div').withAttribute('data-store', 'data-attr').exists).notOk();

    var byAtrSelector = Selector(() => document.querySelectorAll('.attr'));

    await t
    // Function selector and attr filter
        .expect(byAtrSelector.withAttribute('data-store', 'data-attr2').id).eql('attr2')

        // Function selector and regexp attr filter
        .expect(byAtrSelector.withAttribute(/data/, /data-attr\d/).id).eql('attr1')

        //Compound
        .expect(Selector('div').withAttribute('class', /attr/).withAttribute('data-store', 'data-attr2').id).eql('attr2');

    // Parameterized selector and attr filter
    var byClassNameSelector = Selector(className => document.getElementsByClassName(className));

    await t
        .expect(byClassNameSelector('attr').withAttribute('data-store', 'data-attr1').id).eql('attr1')
        .expect(byClassNameSelector('attr').withAttribute('data-store', 'data-attr2').id).eql('attr2');

    var documentSelector = Selector(() => document);

    // Should not filter document with attributes
    await t.expect(documentSelector.withAttribute('data-store', 'data-attr1').exists).notOk();

    var nodeSelector = Selector(() => document.getElementById('attr1').childNodes[0]);

    // Should not work for nodes
    await t.expect(nodeSelector.withAttribute('data-store').exists).notOk();
});

test('Selector "filter" method', async t => {
    // String filter
    await t
        .expect(Selector('body div').filter('#htmlElementWithInnerText').id).eql('htmlElementWithInnerText')

        // Function filter
        .expect(Selector('#container div').filter(node => node.id === 'el3').id).eql('el3')

        // Compound
        .expect(Selector('div').filter('.common').filter('.class1').id).eql('common2');

    // Parameterized selector
    const withClass = Selector(className => document.getElementsByClassName(className));

    await t
        .expect(withClass('common').filter('.class1').id).eql('common2')

        // With other filters
        .expect(Selector('div').filter('.common').nth(0).id).eql('common1');

    // Should not apply implicit index filter when used as transitive selector
    let label = Selector('#list *').filter('label');

    await t
        .expect(label.filter('#release').id).eql('release')
        .expect(label.filter('#write').id).eql('write');

    // Should apply explicit index filter when used as transitive selector
    label = Selector('#list *').filter('label');

    await t
        .expect(label.nth(0).parent(0).find('#release').exists).notOk()
        .expect(label.nth(1).parent(0).find('#release').exists).notOk()
        .expect(label.nth(2).parent(0).find('#release').exists).ok();
});

test('Combination of filter methods', async t => {
    const firstSelector = Selector('div').withText('Hey?! (yo)').nth(1);

    await t.expect(firstSelector.id).eql('el3');

    const secondSelector = Selector('div').withText(/This is element \d+/).nth(1);

    await t.expect(secondSelector.id).eql('el4');

    // Selector should maintain filter when used as parameter
    const getId = ClientFunction(getEl => getEl().id);

    let id = await getId(firstSelector);

    await t.expect(id).eql('el3');

    // Selector should maintain filter when used as dependency
    id = await t.eval(() => firstSelector().id, { dependencies: { firstSelector: firstSelector.nth(0) } });

    await t.expect(id).eql('el2');
});

test('Selector `filterVisible/filterHidden` methods with plain structure', async t => {
    const elements = Selector('#filterVisiblePlain div');

    await t.expect(elements.count).eql(4);
    await t.expect(elements.filterVisible().count).eql(1);
    await t.expect(elements.filterHidden().count).eql(3);
    await t.expect(elements.filterVisible().filterHidden().count).eql(0);
});

test('Selector `filterVisible/filterHidden` methods with hierarchical structure', async t => {
    let elements = Selector('#filterVisibleHierarchical > div');

    await t.expect(elements.child('p').count).eql(11);

    elements = elements.filterVisible().child('p');

    await t.expect(elements.count).eql(6);
    await t.expect(elements.filterVisible().count).eql(5);
    await t.expect(elements.filterVisible().filter('.p').count).eql(2);
    await t.expect(elements.filterHidden().count).eql(1);

    elements = Selector('#filterVisibleHierarchical > div').filterHidden().child('p');

    await t.expect(elements.count).eql(5);
    await t.expect(elements.filterHidden().count).eql(5);
});

test('Selector "find" method', async t => {
    await t
    // String filter
        .expect(Selector('#htmlElement').find('span').id).eql('someSpan')

        // Function filter
        .expect(Selector('#container').find(node => node.id === 'el3').id).eql('el3')

        // Compound
        .expect(Selector('a').find('f').find('g').innerText).eql('h')

        // Deep search
        .expect(Selector('a').find('g').innerText).eql('h')
        .expect(Selector('a').find(node => node.tagName && node.tagName.toLowerCase() === 'g').innerText).eql('h');

    // Parameterized selector
    const withId = Selector(id => document.getElementById(id));

    await t
        .expect(withId('htmlElement').find('span').id).eql('someSpan')

        // With filters
        .expect(Selector('#container').find('div').withText('element 4').id).eql('el4');

    // Should not apply implicit index filter when used as transitive selector
    let label = Selector('#list').find('li').find('label');

    await t
        .expect(label.withText('Write code').id).eql('write')
        .expect(label.withText('Test it').id).eql('test')
        .expect(label.withText('Release it').id).eql('release');

    // Should apply explicit index filter when used as transitive selector
    label = Selector('#list').find('li').nth(1).find('label');

    await t
        .expect(label.withText('Write code').exists).notOk()
        .expect(label.withText('Test it').exists).ok()
        .expect(label.withText('Release it').exists).notOk();
});

test('Selector "parent" method', async t => {
    // Index filter
    await t
        .expect(Selector('g').parent(1).tagName).eql('a')
        .expect(Selector('g').parent().parent().tagName).eql('a')
        .expect(Selector('#option1').parent(1).tagName).eql('form')
        .expect(Selector('#option1').parent(-2).tagName).eql('html')
        .expect(Selector('g').parent(0).count).eql(1)

        // CSS selector filter
        .expect(Selector('g').parent('a').tagName).eql('a')
        .expect(Selector('#childDiv').parent('.parent1').id).eql('p1')

        // Function selector
        .expect(Selector('#childDiv').parent(node => node.id === 'p2').id).eql('p2');

    // Parameterized selector
    const withId = Selector(id => document.getElementById(id));

    await t
        .expect(withId('childDiv').parent('.parent1').id).eql('p1')

        // With filters
        .expect(Selector('#childDiv').parent().withText(/Hey/).id).eql('p2')
        .expect(Selector('#childDiv').parent().nth(1).id).eql('p1');

    // Should not apply implicit index filter when used as transitive selector
    let selector = Selector('.common').parent('div').find('div');

    await t
        .expect(selector.nth(0).id).eql('common1')
        .expect(selector.nth(1).id).eql('common2');

    // Should apply explicit index filter when used as transitive selector
    selector = Selector('.common').parent('div').nth(0).find('div');

    await t
        .expect(selector.nth(0).exists).ok()
        .expect(selector.nth(1).exists).notOk();
});

test('Selector "child" method', async t => {
    // Index filter
    await t
        .expect(Selector('#container').child(1).id).eql('el2')
        .expect(Selector('#p2').child().child().id).eql('p0')
        .expect(Selector('#container').child(3).id).eql('el4')
        .expect(Selector('#container').child(-2).id).eql('el3')
        .expect(Selector('body').child(0).count).eql(1)

        // CSS selector filter
        .expect(Selector('#container').child('#el3').id).eql('el3')
        .expect(Selector('form').child('select').id).eql('selectInput')

        // Function selector
        .expect(Selector('#container').child(el => el.id === 'el2').id).eql('el2');

    // Parameterized selector
    const withId = Selector(id => document.getElementById(id));

    await t
        .expect(withId('container').child('#el3').id).eql('el3')

        // With filters
        .expect(Selector('#container').child().withText('element 4').id).eql('el4');

    // Should not apply implicit index filter when used as transitive selector
    let label = Selector('#list').child('li').child('label');

    await t
        .expect(label.withText('Write code').id).eql('write')
        .expect(label.withText('Test it').id).eql('test')
        .expect(label.withText('Release it').id).eql('release');

    // Should apply explicit index filter when used as transitive selector
    label = Selector('#list').child('li').nth(1).child('label');

    await t
        .expect(label.withText('Write code').exists).notOk()
        .expect(label.withText('Test it').exists).ok()
        .expect(label.withText('Release it').exists).notOk();
});

test('Selector "sibling" method', async t => {
    // Index filter
    await t
        .expect(Selector('#el2').sibling(1).id).eql('el3')
        .expect(Selector('#el2').sibling().sibling().id).eql('el2')
        .expect(Selector('#el1').sibling(2).id).eql('el4')
        .expect(Selector('#el1').sibling(-3).id).eql('el2')
        .expect(Selector('#el2').sibling(0).count).eql(1)

        // CSS selector filter
        .expect(Selector('#selectInput').sibling('[type=checkbox]').id).eql('checkInput')

        // Function selector
        .expect(Selector('#el2').sibling(el => el.id === 'el3').id).eql('el3');

    // Parameterized selector
    const withId = Selector(id => document.getElementById(id));

    await t
        .expect(withId('el2').sibling().id).eql('el1')

        // With filters
        .expect(Selector('#el2').sibling().withText('element 4').id).eql('el4');
});

test('Selector "count" and "exists" properties', async t => {
    await t
        .expect(Selector('.idxEl').count).eql(4)
        .expect(Selector('.idxEl').nth(2).count).eql(1)
        .expect(Selector('form').find('input').count).eql(2)
        .expect(Selector('.notexists').count).eql(0);

    const witClass = Selector(className => document.getElementsByClassName(className));

    await t
        .expect(witClass('idxEl').count).eql(4)
        .expect(witClass('idxEl').withText('Hey?!').count).eql(2)

        .expect(Selector('.idxEl').exists).ok()
        .expect(Selector('.idxEl').nth(2).exists).ok()
        .expect(Selector('form').find('input').exists).ok()
        .expect(Selector('.notexists').exists).notOk()
        .expect(witClass('idxEl').exists).ok()
        .expect(witClass('idxEl').withText('Hey?!').exists).ok()
        .expect(witClass('idxEl').withText('testtesttest').exists).notOk();
});

test('Snapshot "count" property - selector error', async () => {
    await Selector(() => [].someUndefMethod()).count;
});

test('Snapshot "exists" property - selector error', async () => {
    await Selector(() => [].someUndefMethod()).exists;
});

test('Selector filter dependencies and index argument', async t => {
    const isOne     = ClientFunction(i => i === 1);
    const isTwo     = ClientFunction(i => i === 2);
    const firstNode = ClientFunction((node, i) => isOne(i));

    await t
        .expect(Selector('.idxEl').filter((node, i) => isTwo(i), { isTwo }).id).eql('el3')
        .expect(Selector('.find-parent').find((node, i) => isOne(i), { isOne }).id).eql('find-child2')
        .expect(Selector('#childDiv').parent((node, i) => isTwo(i), { isTwo }).id).eql('p2')
        .expect(Selector('.find-parent').child((node, i) => isOne(i), { isOne }).id).eql('find-child3')
        .expect(Selector('#find-child1').sibling(firstNode, { isOne }).id).eql('find-child4');
});

test('Selector filter origin node argument', async t => {
    await t
        .expect(Selector('#p2').find((el, idx, ancestor) => {
            return ancestor.id === 'p2' && el.id === 'childDiv';
        }).id).eql('childDiv')

        .expect(Selector('#p0').child((el, idx, parent) => {
            return parent.id === 'p0' && el.id === 'childDiv';
        }).id).eql('childDiv')

        .expect(Selector('#childDiv').parent((el, idx, child) => {
            return child.id === 'childDiv' && el.id === 'p1';
        }).id).eql('p1')

        .expect(Selector('#el2').sibling((el, idx, refSibling) => {
            return refSibling.id === 'el2' && el.id === 'el3';
        }).id).eql('el3');
});

test('Selector `addCustomDOMProperties` method', async t => {
    let el = Selector('rect')
        .addCustomDOMProperties({
            prop1: () => 42,
            prop2: node => 'tagName: ' + node.tagName
        });

    await t
        .expect(await el.prop1).eql(42)
        .expect(await el.parent().filter(() => true).prop2).eql('tagName: svg')
        .expect(await el.exists).ok()
        .expect(await el.count).eql(1);

    el = el.addCustomDOMProperties({
        prop2: () => 'other value',
        prop3: () => 'test'
    });

    await t
        .expect(await el.prop1).eql(42)
        .expect(await el.prop2).eql('other value')
        .expect(await el.prop3).eql('test');

    const elSnapshot = await Selector('rect')
        .addCustomDOMProperties({
            prop1: () => 1,
            prop2: () => 2
        })();

    await t
        .expect(elSnapshot.prop1).eql(1)
        .expect(elSnapshot.prop2).eql(2);

    const nonExistingElement = await Selector('nonExistingElement').addCustomDOMProperties({
        prop: () => 'value'
    })();

    await t.expect(nonExistingElement).eql(null);

    const getSecondEl = Selector('div').addCustomDOMProperties({
        prop: () => 'second'
    }).nth(1);

    await t.expect(await getSecondEl.prop).eql('second');

    const doc = await Selector(() => document).addCustomDOMProperties({
        prop: () => 'documentProp'
    });

    await t.expect(await doc.prop).eql('documentProp');
});

test('Add custom DOM properties method - property throws an error', async () => {
    const el = Selector('rect').addCustomDOMProperties({
        prop: () => {
            throw new Error('test');
        }
    });

    await el();
});

test('Selector "nextSibling" method', async t => {
    // Index filter
    await t
        .expect(Selector('#el2').nextSibling(1).id).eql('el4')
        .expect(Selector('#el2').nextSibling().nextSibling().id).eql('el4')
        .expect(Selector('#el1').nextSibling().id).eql('el2')
        .expect(Selector('#el1').nextSibling(-2).id).eql('el3')
        .expect(Selector('#el2').nextSibling(0).count).eql(1)

        // CSS selector filter
        .expect(Selector('#textInput').nextSibling('select').id).eql('selectInput')

        // Function selector
        .expect(Selector('#el2').nextSibling(el => el.id === 'el3').id).eql('el3');

    // Parameterized selector
    const withId = Selector(id => document.getElementById(id));

    await t
        .expect(withId('el2').nextSibling().id).eql('el3')

        // With filters
        .expect(Selector('#el2').nextSibling().withText('element 4').id).eql('el4');
});

test('Selector "prevSibling" method', async t => {
    // Index filter
    await t
        .expect(Selector('#el3').prevSibling(1).id).eql('el2')
        .expect(Selector('#el3').prevSibling().nextSibling().prevSibling().id).eql('el1')
        .expect(Selector('#el3').prevSibling().id).eql('el1')
        .expect(Selector('#el3').prevSibling(-2).id).eql('el1')
        .expect(Selector('#el2').prevSibling(0).count).eql(1)

        // CSS selector filter
        .expect(Selector('#selectInput').prevSibling('[type=text]').id).eql('textInput')

        // Function selector
        .expect(Selector('#el3').prevSibling(el => el.id === 'el2').id).eql('el2');

    // Parameterized selector
    const withId = Selector(id => document.getElementById(id));

    await t
        .expect(withId('el2').prevSibling().id).eql('el1')

        // With filters
        .expect(Selector('#el4').prevSibling().withText('Hey?!').nth(0).id).eql('el2');
});

test('Selector `addCustomMethods` method', async t => {
    let el = Selector('rect').addCustomMethods({
        prop1: (node, str) => str + '42',
        prop2: (node, str, separator) => [str, node.tagName].join(separator)
    });

    await t
        .expect(await el.prop1('value: ')).eql('value: 42')
        .expect(await el().prop1('value: ')).eql('value: 42')
        .expect(await el.prop2('tagName', ': ')).eql('tagName: rect')

        .expect(await el.parent().filter(() => true).tagName).eql('svg')
        .expect(await el.exists).ok()
        .expect(await el.count).eql(1);

    const snapshot = await el();

    await t
        .expect(snapshot.prop1('value: ')).eql('value: 42')
        .expect(await snapshot.prop1('value: ')).eql('value: 42');

    el = el.addCustomMethods({
        prop1: (node, str) => str + '!!!'
    });

    await t
        .expect(el.prop1('Hi')).eql('Hi!!!')
        .expect(el.prop2('tagName', ': ')).eql('tagName: rect');

    const nonExistingElement = await Selector('nonExistingElement').addCustomMethods({
        prop: () => 'value'
    })();

    await t.expect(nonExistingElement).eql(null);
});

test('Add custom method - method throws an error', async () => {
    const el = Selector('rect').addCustomMethods({
        customMethod: () => {
            throw new Error('test');
        }
    });

    await el.customMethod();
});

test('hasAttribute method', async t => {
    let sel = Selector('#htmlElement');
    let el  = await sel();

    await t
        .expect(sel.hasAttribute('id')).ok()
        .expect(sel.hasAttribute('class')).ok()
        .expect(sel.hasAttribute('style')).ok()
        .expect(sel.hasAttribute('data-something')).notOk()
        .expect(sel.hasAttribute('data-something-else')).notOk()

        .expect(el.hasAttribute('id')).ok()
        .expect(el.hasAttribute('class')).ok()
        .expect(el.hasAttribute('style')).ok()
        .expect(el.hasAttribute('data-something')).notOk()
        .expect(el.hasAttribute('data-something-else')).notOk();

    await t.eval(() => {
        document.querySelector('#htmlElement').setAttribute('data-something', true);
        document.querySelector('#htmlElement').setAttribute('data-something-else', void 0);
    });

    await t
        .expect(sel.hasAttribute('data-something')).ok()
        .expect(sel.hasAttribute('data-something-else')).ok();

    el = await sel();

    await t
        .expect(el.hasAttribute('data-something')).ok()
        .expect(el.hasAttribute('data-something-else')).ok();

    sel = Selector(() => document);
    el  = await sel();

    // NOTE: method should not be available in snapshot for non-element nodes
    await t
        .expect(sel.hasAttribute('id')).notOk()
        .expect(el.hasAttribute).eql(void 0);
});

test('Selector `addCustomMethods` method - Selector mode', async t => {
    const sectionDiv = Selector('section div').addCustomMethods({
        customFilter:        nodes => nodes.filter(node => node.id === 'el2' || node.id === 'el3'),
        customFilterByParam: (nodes, id) => nodes.filter(node => node.id === id)
    }, { returnDOMNodes: true });

    const form = Selector('form').addCustomMethods({
        customFind:       (nodes) => nodes[0].querySelectorAll('input'),
        customFindByType: (nodes, type) => nodes[0].querySelectorAll(`input[type=${type}]`)
    }, { returnDOMNodes: true });

    let filteredDivs = sectionDiv.customFilter();
    let divsById     = sectionDiv.customFilterByParam('el4');

    await t
        .expect(filteredDivs.count).eql(2)
        .expect(filteredDivs.nth(0).id).eql('el2')
        .expect(filteredDivs.nth(1).id).eql('el3')

        .expect(divsById.id).eql('el4');

    const inputs      = form.customFind();
    const inputByType = form.customFindByType('checkbox');

    await t
        .expect(inputs.count).eql(2)
        .expect(inputs.nth(0).id).eql('textInput')
        .expect(inputs.nth(1).id).eql('checkInput')

        .expect(inputByType.id).eql('checkInput');

    const snapshot = await sectionDiv();

    filteredDivs = snapshot.customFilter();
    divsById     = snapshot.customFilterByParam('el4');

    await t
        .expect(filteredDivs.count).eql(2)
        .expect(filteredDivs.nth(0).id).eql('el2')
        .expect(filteredDivs.nth(1).id).eql('el3')

        .expect(divsById.id).eql('el4');

    const nonExistingElement = Selector('nonExistingElement').addCustomMethods({
        prop: () => 'value'
    }, { returnDOMNodes: true });

    await t.expect(await nonExistingElement()).eql(null);
});

