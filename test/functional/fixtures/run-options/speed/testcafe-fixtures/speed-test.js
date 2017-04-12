import { expect } from 'chai';

fixture `Speed`
    .page `http://localhost:3000/fixtures/run-options/speed/pages/index.html`;

test('Decrease speed', async t => {
    // NOTE: do the first click to wait while the page is loaded
    await t.click('#button1');

    var startTime = Date.now();

    await t.click('#button1');

    expect(Date.now() - startTime).to.be.at.least(1000);
});

test('Decrease speed in iframe', async t => {
    // NOTE: do the first click to wait while the iframe is loaded
    await t
        .switchToIframe('#iframe')
        .click('#button1');

    var startTime = Date.now();

    await t.click('#button1');

    expect(Date.now() - startTime).to.be.at.least(1000);
});

test('Default speed', async t => {
    // NOTE: do the first click to wait while the page is loaded
    await t.click('#button1');

    var startTime = Date.now();

    await t.click('#button1');

    expect(Date.now() - startTime).to.be.lessThan(1000);
});
