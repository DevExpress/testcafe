import { Selector } from 'testcafe';
import { expect } from 'chai';
import selectorApiExecutionMode from '../../../../../lib/client-functions/selector-api-execution-mode';

fixture `Selector`
    .page`../../api/es-next/selector/pages/index.html`;

test('Selector API', async () => {
    selectorApiExecutionMode.forceSync();

    const el = Selector('#htmlElement');

    expect(el.nodeType).eql(1);
    expect(el.id).eql('htmlElement');
    expect(el.tagName).eql('div');

    expect(el.attributes['id']).eql('htmlElement');
    expect(el.getAttribute('id')).eql('htmlElement');
    expect(el.attributes['class']).eql('yo hey cool');
    expect(el.attributes['style']).contains('width: 40px; height: 30px; padding-top: 2px; padding-left: 2px;');

    expect(el.style['width']).eql('40px');
    expect(el.getStyleProperty(['width'])).eql('40px');
    expect(el.style['height']).eql('30px');
    expect(el.style['padding-top']).eql('2px');
    expect(el.style['padding-left']).eql('2px');
    expect(el.style['display']).eql('block');

    expect(el.namespaceURI).eql('http://www.w3.org/1999/xhtml');
    expect(el.hasChildNodes).true;
    expect(el.childNodeCount).eql(3);
    expect(el.hasChildElements).true;
    expect(el.childElementCount).eql(1);
    expect(el.visible).true;

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

    expect(el.focused).false;
    expect(el.value).eql(void 0);
    expect(el.checked).eql(void 0);
    expect(el.selected).eql(void 0);

    expect(el.boundingClientRect.width).eql(43);
    expect(el.boundingClientRect.left).eql(0);
    expect(el.getBoundingClientRectProperty('left')).eql(0);

    expect(el.textContent).eql('\n    \n        42\n    \n    Yo\n');
    expect(el.classNames).eql(['yo', 'hey', 'cool']);

    const firstSelector = Selector('div').withText('Hey?! (yo)').nth(1);

    expect(firstSelector.id).eql('el3');

    const secondSelector = Selector('div').withText(/This is element \d+/).nth(1);

    expect(secondSelector.id).eql('el4');

    expect(Selector('.idxEl').count).eql(4);
    expect(Selector('.idxEl').nth(2).count).eql(1);
    expect(Selector('form').find('input').count).eql(2);
    expect(Selector('.notexists').count).eql(0);

    const withClass = Selector(className => document.getElementsByClassName(className));

    expect(withClass('idxEl').count).eql(4);
    expect(withClass('idxEl').withText('Hey?!').count).eql(2);

    expect(Selector('.idxEl').exists).true;
    expect(Selector('.idxEl').nth(2).exists).true;
    expect(Selector('form').find('input').exists).true;
    expect(Selector('.notexists').exists).false;
    expect(withClass('idxEl').exists).true;
    expect(withClass('idxEl').withText('Hey?!').exists).true;
    expect(withClass('idxEl').withText('testtesttest').exists).false;

    selectorApiExecutionMode.resetForcedSync();
});
