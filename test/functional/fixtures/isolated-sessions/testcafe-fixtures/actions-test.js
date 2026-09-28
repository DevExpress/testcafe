import * as fs from 'fs';
import * as path from 'path';
import { PNG } from 'pngjs';
import { Selector, ClientFunction } from 'testcafe';

const PAGE_URL = 'http://localhost:3000/fixtures/isolated-sessions/pages/actions.html';

fixture `Isolated Sessions - Actions`
    .page(PAGE_URL);

async function openActionsPage (t) {
    const t2 = await t.openIsolatedSession();

    await t2.navigateTo(PAGE_URL);

    return t2;
}

function readResult (t2) {
    return t2.eval(() => document.querySelector('#result').textContent);
}

test('rightClick with modifiers', async t => {
    const t2 = await openActionsPage(t);

    await t2.rightClick('#target', { modifiers: { shift: true } });

    await t.expect(await readResult(t2)).eql('contextmenu button:2 shift:true');
});

test('drag by offset', async t => {
    const t2 = await openActionsPage(t);

    await t2.drag('#drag-source', 100, 50);

    await t.expect(await readResult(t2)).contains('moved:100,50');
});

test('dragToElement', async t => {
    const t2 = await openActionsPage(t);

    await t2.dragToElement('#drag-source', '#drop-target');

    await t.expect(await readResult(t2)).contains('target:drop-target');
});

test('selectText in an input', async t => {
    const t2 = await openActionsPage(t);

    await t2.selectText('#long-input', 2, 5);

    const selection = await t2.eval(() => {
        const el = document.querySelector('#long-input');

        return el.value.substring(el.selectionStart, el.selectionEnd);
    });

    await t.expect(selection).eql('cde');
});

test('selectText in a contenteditable honors start and end', async t => {
    const t2 = await openActionsPage(t);

    await t2.selectText('#editable', 6, 9);

    await t.expect(await t2.eval(() => window.getSelection().toString())).eql('big');

    await t2.selectText('#editable', 10);

    await t.expect(await t2.eval(() => window.getSelection().toString())).eql('World');
});

test('setWindowBounds', async t => {
    const t2 = await openActionsPage(t);

    await t2.setWindowBounds({ width: 700, height: 500 });

    await t.expect(await t2.eval(() => window.outerWidth)).eql(700);
    await t.expect(await t2.eval(() => window.outerHeight)).eql(500);
});

test('scroll positions and element scrolling', async t => {
    const t2 = await openActionsPage(t);

    const scroller = () => t2.eval(() => {
        const el = document.querySelector('#scroller');

        return {
            pos:    el.scrollLeft + ',' + el.scrollTop,
            max:    el.scrollWidth - el.clientWidth + ',' + (el.scrollHeight - el.clientHeight),
            center: Math.floor(el.scrollWidth / 2 - el.clientWidth / 2) + ',' + Math.floor(el.scrollHeight / 2 - el.clientHeight / 2),
        };
    });

    await t2.scroll('#scroller', 'bottomRight');
    await t.expect((await scroller()).pos).eql((await scroller()).max);

    await t2.scroll('#scroller', 'topLeft');
    await t.expect((await scroller()).pos).eql('0,0');

    await t2.scroll('#scroller', 'center');
    await t.expect((await scroller()).pos).eql((await scroller()).center);

    await t2.scroll('#scroller', 30, 40);
    await t.expect((await scroller()).pos).eql('30,40');

    await t2.scrollBy('#scroller', 5, 10);
    await t.expect((await scroller()).pos).eql('35,50');

    await t2.scroll('bottom');
    await t.expect(await t2.eval(() => window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 1)).ok();

    await t2.scroll('top');
    await t.expect(await t2.eval(() => window.scrollY)).eql(0);
});

test('navigateTo a failing URL throws', async t => {
    const t2 = await t.openIsolatedSession();

    let message = '';

    try {
        await t2.navigateTo('http://localhost:3999/');
    }
    catch (err) {
        message = err.message;
    }

    await t
        .expect(message).contains('failed to navigate to http://localhost:3999/')
        .expect(message).contains('net::ERR_CONNECTION_REFUSED');
});

test('element-taking commands wait for late elements', async t => {
    const t2 = await openActionsPage(t);

    const addLate = html => t2.eval(new Function(`
        setTimeout(function () {
            document.body.insertAdjacentHTML('beforeend', ${JSON.stringify(html)});
        }, 500);
    `));

    await addLate('<input id="late-select" value="late text">');
    await t2.selectText('#late-select', 0, 4);

    await addLate('<div id="late-scroll" style="width:50px;height:50px;overflow:auto"><div style="height:500px"></div></div>');
    await t2.scroll('#late-scroll', 0, 20);

    await addLate('<div id="late-scroll-by" style="width:50px;height:50px;overflow:auto"><div style="height:500px"></div></div>');
    await t2.scrollBy('#late-scroll-by', 0, 20);

    await addLate('<div id="late-into-view" style="margin-top:3000px">x</div>');
    await t2.scrollIntoView('#late-into-view');

    await addLate('<div id="late-event">x</div>');
    await t2.dispatchEvent('#late-event', 'click');

    await addLate('<input id="late-file" type="file">');
    await t2.setFilesToUpload('#late-file', path.resolve(__dirname, '../pages/index.html'));

    await addLate('<input id="late-clear" type="file">');
    await t2.clearUpload('#late-clear');

    await addLate('<div id="late-shot" style="width:20px;height:20px;background:red"></div>');
    fs.unlinkSync(await t2.takeElementScreenshot('#late-shot'));

    await addLate('<iframe id="late-frame" src="iframe-content.html"></iframe>');
    await t2.switchToIframe('#late-frame');

    await t.expect(await t2.eval(() => document.querySelector('#iframe-title').textContent)).eql('Inside Iframe');
});

test('typeText types at the end of the existing value', async t => {
    const t2 = await openActionsPage(t);

    await t2.typeText('#long-input', '!');

    await t.expect(await t2.eval(() => document.querySelector('#long-input').value)).eql('abcdefghijklmnopqrstuvwxyz0123456789!');

    await t2.typeText('#long-input', '_', { caretPos: 1 });

    await t.expect(await t2.eval(() => document.querySelector('#long-input').value)).eql('a_bcdefghijklmnopqrstuvwxyz0123456789!');
});

test('dispatchEvent builds the matching event type', async t => {
    const t2 = await openActionsPage(t);

    await t2.eval(() => {
        const target = document.querySelector('#target');
        const log    = [];

        window.__events = log;

        ['mousedown', 'keydown', 'my-event'].forEach(name => {
            target.addEventListener(name, e => {
                log.push([e.type, e.constructor.name, e.clientX, e.key, e.detail].join(':'));
            });
        });
    });

    await t2
        .dispatchEvent('#target', 'mousedown', { clientX: 12 })
        .dispatchEvent('#target', 'keydown', { key: 'a' })
        .dispatchEvent('#target', 'my-event', { eventConstructor: 'CustomEvent', detail: 'payload' });

    await t.expect(await t2.eval(() => window.__events)).eql([
        'mousedown:MouseEvent:12::1',
        'keydown:KeyboardEvent::a:0',
        'my-event:CustomEvent:::payload',
    ]);
});

test('dispatchEvent passes relatedTarget as an element', async t => {
    const t2 = await openActionsPage(t);

    await t2.eval(() => {
        document.querySelector('#target').addEventListener('mouseover', e => {
            window.__related = e.relatedTarget && e.relatedTarget.id;
        });
    });

    await t2.dispatchEvent('#target', 'mouseover', { relatedTarget: '#editable' });

    await t.expect(await t2.eval(() => window.__related)).eql('editable');
});

test('typeText with caretPos in a contenteditable', async t => {
    const t2 = await openActionsPage(t);

    await t2.typeText('#editable', 'X', { caretPos: 6 });

    await t.expect(await t2.eval(() => document.querySelector('#editable').textContent)).eql('Hello Xbig World');
});

test('takeScreenshot with fullPage captures the whole page', async t => {
    const t2 = await openActionsPage(t);

    const filePath = await t2.takeScreenshot({ fullPage: true });
    const png      = PNG.sync.read(fs.readFileSync(filePath));
    const viewport = await t2.eval(() => window.innerHeight);

    fs.unlinkSync(filePath);

    await t.expect(png.height).gt(viewport);
    await t.expect(png.height).gte(3500);
});

test('takeElementScreenshot of an element taller than the viewport', async t => {
    const t2 = await openActionsPage(t);

    const filePath = await t2.takeElementScreenshot('#tall');
    const png      = PNG.sync.read(fs.readFileSync(filePath));

    fs.unlinkSync(filePath);

    await t.expect(png.height).eql(3000);

    const idx = (png.width * (png.height - 5) + 5) * 4;

    await t.expect([png.data[idx], png.data[idx + 1], png.data[idx + 2]]).eql([0, 128, 0]);
});

test('native alert and confirm are dismissed and fail the command', async t => {
    const t2 = await openActionsPage(t);

    let alertError = '';

    await t2.click('#alert-btn').catch(err => {
        alertError = err.message;
    });

    await t.expect(alertError).contains('alert');
    await t.expect(await readResult(t2)).eql('after-alert');

    let confirmError = '';

    await t2.click('#confirm-btn').catch(err => {
        confirmError = err.message;
    });

    await t.expect(confirmError).contains('confirm');
    await t.expect(await readResult(t2)).eql('dismissed');
});

test('ClientFunction arguments inside t2.run()', async t => {
    const t2 = await openActionsPage(t);

    const summarize = ClientFunction((a, b, opts) => [document.title, a + b, opts.label, opts.when.getUTCFullYear(), window.location.pathname].join(':'));

    await t2.run(async () => {
        const value = await summarize(2, 3, { label: 'x', when: new Date(Date.UTC(2020, 0, 1)) });

        await t.expect(value).eql('Isolated Sessions Actions Page:5:x:2020:/fixtures/isolated-sessions/pages/actions.html');
    });
});

test('ClientFunction bound to t2', async t => {
    const t2 = await t.openIsolatedSession();

    await t2.navigateTo('http://localhost:3000/fixtures/isolated-sessions/pages/second.html');

    const getTitle = ClientFunction(() => document.title).with({ boundTestRun: t2 });

    await t.expect(await getTitle()).eql('Second Page');

    const title = await Selector('#title').with({ boundTestRun: t2 }).innerText;

    await t.expect(title).eql('Second Page');
});

test('ClientFunction and t2.eval dependencies', async t => {
    const t2 = await openActionsPage(t);

    // eslint-disable-next-line no-undef
    const withDeps = ClientFunction(() => prefix + double(settings.base), {
        dependencies: { prefix: 'n=', double: x => x * 2, settings: { base: 2 } },
    }).with({ boundTestRun: t2 });

    await t.expect(await withDeps()).eql('n=4');

    // eslint-disable-next-line no-undef
    const evalValue = await t2.eval(() => prefix + double(settings.base), {
        dependencies: { prefix: 'e=', double: x => x * 3, settings: { base: 2 } },
    });

    await t.expect(evalValue).eql('e=6');
});
