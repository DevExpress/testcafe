// NOTE: to preserve callsites, add new tests AFTER the existing ones
import { ClientFunction } from 'testcafe';
import { expect } from 'chai';

fixture `Driver`
    .page `http://localhost:3000/fixtures/driver/pages/page1.html`;

function wait (ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

test('Click and wait for page unloading', async t => {
    await t.click('#link');
    await wait(1000);
    await t.click('#btn');
});

test('Mixed execution order', async t => {
    const getLocation = ClientFunction(() => document.location.toString());
    const getHostname = ClientFunction(() => document.location.hostname);

    const clickPromise = t.click('#btn1');

    const clientFnPromise = Promise.all([getLocation(), getHostname()]);

    await clickPromise;

    const [location, hostname] = await clientFnPromise;

    expect(location).eql('http://localhost:3000/fixtures/driver/pages/page1.html');
    expect(hostname).eql('localhost');

    expect(await t.eval(() => document.querySelector('#btn1').textContent)).eql('Hey ya!');
});
