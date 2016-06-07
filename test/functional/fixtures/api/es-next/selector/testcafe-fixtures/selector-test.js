// NOTE: to preserve callsites, add new tests AFTER the existing ones
import { Selector } from 'testcafe';
import { expect } from 'chai';

fixture `Selector`
    .page `http://localhost:3000/api/es-next/selector/pages/index.html`;

const getElementById = Selector(id => document.getElementById(id));

test('HTMLElement snapshot basic properties', async () => {
    const el = await getElementById('htmlElement');

    expect(el.nodeType).eql(1);
    expect(el.id).eql('htmlElement');
    expect(el.tagName).eql('div');

    expect(el.attributes['id']).eql('htmlElement');
    expect(el.attributes['class']).eql('yo hey cool');
    expect(el.attributes['style']).contains('width: 40px; height: 30px; padding-top: 2px; padding-left: 2px;');

    expect(el.namespaceURI).eql('http://www.w3.org/1999/xhtml');
    expect(el.hasChildNodes).to.be.true;
    expect(el.childNodeCount).eql(3);
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

    expect(el.namespaceURI).eql('http://www.w3.org/2000/svg');
    expect(el.hasChildNodes).to.be.true;
    expect(el.childNodeCount).eql(1);
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

    expect(el.textContent).eql('Hey');
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

    el = await getElementById('checkInput');

    expect(el.focused).to.be.false;
    expect(el.value).eql('on');
    expect(el.checked).to.be.false;

    await t.click('#checkInput');

    el = await getElementById('checkInput');

    expect(el.focused).to.be.true;
    expect(el.value).eql('on');
    expect(el.checked).to.be.true;
});

test('`innerText` element snapshot property', async () => {
    const el = await getElementById('htmlElementWithInnerText');

    expect(el.innerText).eql('Hey\nyo test ');
});
