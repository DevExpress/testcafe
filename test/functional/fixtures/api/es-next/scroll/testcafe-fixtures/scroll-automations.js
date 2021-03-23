import { ClientFunction, Selector } from 'testcafe';

const getScrollPosition = selector => ClientFunction(() => {
    const el = selector();

    return {
        top:  el.scrollTop,
        left: el.scrollLeft
    };
}, { dependencies: { selector } });

const getMaxScrollPosition = ClientFunction(() => {
    const el = document.scrollingElement || document.documentElement;

    return {
        maxY: el.scrollHeight - el.clientHeight,
        maxX: el.scrollWidth - el.clientWidth
    };
});

fixture `Scroll/ScrollBy/ScrollIntoView`
    .page('http://localhost:3000/fixtures/api/es-next/scroll/pages/scroll-automations.html');

const selectorHTML               = Selector(() => document.scrollingElement || document.documentElement);
const selectorScrollable         = Selector('#scrollable');
const selectorScrollableDeferred = Selector('#scrollable-deferred');

const target = Selector('#target');

async function assert (t, selector, expected) {
    const actual = await getScrollPosition(selector)();

    await t.expect(Math.abs(actual.left < expected.left)).lte(1);
}

test(`html`, async t => {
    await t.scroll(100, 500);

    await assert(t, selectorHTML, { left: 100, top: 500 });
});

test(`el`, async t => {
    await t.scroll(selectorScrollable, 100, 500);

    const position = await getScrollPosition(selectorScrollable)();

    await t.expect(position).eql({ left: 100, top: 500 });
});

test(`wait for deferred el`, async t => {
    await t.scroll(selectorScrollableDeferred, 100, 500);

    const position = await getScrollPosition(selectorScrollableDeferred)();

    await t.expect(position).eql({ left: 100, top: 500 });
});

test(`position for html`, async t => {
    const snapshot = await selectorHTML();

    const { maxX, maxY } = await getMaxScrollPosition();

    const centerX = Math.floor(snapshot.scrollWidth / 2 - snapshot.clientWidth / 2);
    const centerY = Math.floor(snapshot.scrollHeight / 2 - snapshot.clientHeight / 2);

    await t.scroll('top');
    await assert(t, selectorHTML, { left: centerX, top: 0 });

    await t.scroll('left');
    await assert(t, selectorHTML, { left: 0, top: centerY });

    await t.scroll('right');
    await assert(t, selectorHTML, { left: maxX, top: centerY });

    await t.scroll('bottom');
    await assert(t, selectorHTML, { left: centerX, top: maxY });

    await t.scroll('topLeft');
    await assert(t, selectorHTML, { left: 0, top: 0 });

    await t.scroll('topRight');
    await assert(t, selectorHTML, { left: maxX, top: 0 });

    await t.scroll('bottomLeft');
    await assert(t, selectorHTML, { left: 0, top: maxY });

    await t.scroll('bottomRight');
    await assert(t, selectorHTML, { left: maxX, top: maxY });
});

test(`position for el`, async t => {
    const snapshot = await selectorScrollable();

    const maxX    = snapshot.scrollWidth - snapshot.clientWidth;
    const maxY    = snapshot.scrollHeight - snapshot.clientHeight;
    const centerX = Math.floor(snapshot.scrollWidth / 2 - snapshot.clientWidth / 2);
    const centerY = Math.floor(snapshot.scrollHeight / 2 - snapshot.clientHeight / 2);

    await t.scroll(selectorScrollable, 'top');
    await t.expect(getScrollPosition(selectorScrollable)()).eql({ left: centerX, top: 0 });

    await t.scroll(selectorScrollable, 'left');
    await t.expect(getScrollPosition(selectorScrollable)()).eql({ left: 0, top: centerY });

    await t.scroll(selectorScrollable, 'right');
    await t.expect(getScrollPosition(selectorScrollable)()).eql({ left: maxX, top: centerY });

    await t.scroll(selectorScrollable, 'bottom');
    await t.expect(getScrollPosition(selectorScrollable)()).eql({ left: centerX, top: maxY });

    await t.scroll(selectorScrollable, 'topLeft');
    await t.expect(getScrollPosition(selectorScrollable)()).eql({ left: 0, top: 0 });

    await t.scroll(selectorScrollable, 'topRight');
    await t.expect(getScrollPosition(selectorScrollable)()).eql({ left: maxX, top: 0 });

    await t.scroll(selectorScrollable, 'bottomLeft');
    await t.expect(getScrollPosition(selectorScrollable)()).eql({ left: 0, top: maxY });

    await t.scroll(selectorScrollable, 'bottomRight');
    await t.expect(getScrollPosition(selectorScrollable)()).eql({ left: maxX, top: maxY });

    await t.scroll(selectorScrollable, 'center');
    await t.expect(getScrollPosition(selectorScrollable)()).eql({ left: centerX, top: centerY });
});

test('scrollby html', async t => {
    await t.scrollBy(1, 2);
    await assert(t, selectorHTML, { left: 1, top: 2 });

    await t.scrollBy(10, 20);
    await assert(t, selectorHTML, { left: 11, top: 22 });

    await t.scrollBy(100, 200);
    await assert(t, selectorHTML, { left: 111, top: 222 });

    await t.scrollBy(-1, -2);
    await assert(t, selectorHTML, { left: 110, top: 220 });

    await t.scrollBy(-10, -20);
    await assert(t, selectorHTML, { left: 100, top: 200 });

    await t.scrollBy(-100, -200);
    await assert(t, selectorHTML, { left: 0, top: 0 });
});

test('scrollby el', async t => {
    await t.scrollBy(selectorScrollable, 1, 2);
    await t.expect(getScrollPosition(selectorScrollable)()).eql({ left: 1, top: 2 });

    await t.scrollBy(selectorScrollable, 10, 20);
    await t.expect(getScrollPosition(selectorScrollable)()).eql({ left: 11, top: 22 });

    await t.scrollBy(selectorScrollable, 100, 200);
    await t.expect(getScrollPosition(selectorScrollable)()).eql({ left: 111, top: 222 });

    await t.scrollBy(selectorScrollable, -1, -2);
    await t.expect(getScrollPosition(selectorScrollable)()).eql({ left: 110, top: 220 });

    await t.scrollBy(selectorScrollable, -10, -20);
    await t.expect(getScrollPosition(selectorScrollable)()).eql({ left: 100, top: 200 });

    await t.scrollBy(selectorScrollable, -100, -200);
    await t.expect(getScrollPosition(selectorScrollable)()).eql({ left: 0, top: 0 });
});

test('scroll into view', async t => {
    await t.scrollIntoView(target);
    await t.expect(getScrollPosition(selectorScrollable)()).eql({ left: 749, top: 749 });

    await t.scrollIntoView(target, { offsetX: 1, offsetY: 1 });
    await t.expect(getScrollPosition(selectorScrollable)()).eql({ left: 652, top: 652 });

    await t.scrollIntoView(target, { offsetX: -1, offsetY: -1 });
    await t.expect(getScrollPosition(selectorScrollable)()).eql({ left: 1248, top: 1248 });

    await t.scrollIntoView(target, { offsetX: -1, offsetY: 1 });
    await t.expect(getScrollPosition(selectorScrollable)()).eql({ left: 1248, top: 652 });

    await t.scrollIntoView(target, { offsetX: 1, offsetY: -1 });
    await t.expect(getScrollPosition(selectorScrollable)()).eql({ left: 652, top: 1248 });
});

test('scroll/scrollby options', async t => {
    await t.scroll(target, 100, 200, { offsetX: 1, offsetY: 1 });
    await t.expect(getScrollPosition(selectorScrollable)()).eql({ left: 250, top: 250 });
    await t.scrollBy(target, 100, 200, { offsetX: -1, offsetY: -1 });
    await t.expect(getScrollPosition(selectorScrollable)()).eql({ left: 1248, top: 1248 });
});
