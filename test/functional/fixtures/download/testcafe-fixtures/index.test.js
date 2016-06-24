import { expect } from 'chai';
import { ClientFunction } from 'testcafe';

fixture `Download`
    .page `http://localhost:3000/download/pages/index.html`;

const isDivClicked = ClientFunction(() => window.divClicked);

test('Simple download', async t => {
    await t
        .click('#download-link')
        .click('#div');

    expect(await isDivClicked()).to.be.true;
});

test('Download after redirect', async t => {
    await t
        .click('#download-page-link')
        .click('#div');

    expect(await isDivClicked()).to.be.true;
});

test('Delayed download', async t => {
    await t
        .click('#delayed-download')
        .wait(6000)
        .click('#div');

    expect(await isDivClicked()).to.be.true;
});
