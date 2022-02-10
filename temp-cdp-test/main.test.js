import { ClientFunction, Selector } from 'testcafe';

fixture`main`;

test('test', async t => {
    await t.navigateTo('http://localhost:2022/');

    const getLoc = new ClientFunction(() => document.location.href);

    await t.expect(getLoc()).eql('http://localhost:2022/');
    await t.expect(Selector('button').textContent).eql('Click me!');

    const { error, log, warn, info } = await t.getBrowserConsoleMessages();

    await t.expect(log.length).eql(1);
    await t.expect(log[0]).eql('log some text');
    await t.expect(error.length).eql(1);
    await t.expect(error[0]).eql('error!!!!');
    await t.expect(warn.length).eql(1);
    await t.expect(warn[0]).eql('warning');
    await t.expect(info.length).eql(1);
    await t.expect(info[0]).eql('this is the test page');

    await t.click('button');
    await t.expect(Selector('button').textContent).eql('~clicked~');
});
