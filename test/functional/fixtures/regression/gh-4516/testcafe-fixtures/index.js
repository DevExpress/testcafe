import { RequestHook, Selector } from 'testcafe';

export default class CustomHook extends RequestHook {
    constructor (config) {
        super(null, config);

        this.pendingAjaxRequestIds = new Set();
        this.hasAjaxRequests       = false;
    }

    onRequest (event) {
        if (event.isAjax) {
            this.pendingAjaxRequestIds.add(event._requestInfo.requestId);
            this.hasAjaxRequests = true;
        }
    }

    onResponse (event) {
        this.pendingAjaxRequestIds.delete(event.requestId);
    }
}

const hook1 = new CustomHook();
const hook2 = new CustomHook({});
const hook3 = new CustomHook({ includeHeaders: true });

fixture `GH-4516`
    .page `http://localhost:3000/fixtures/regression/gh-4516/pages/index.html`;

test.requestHooks(hook1)('Without config', async t => {
    await t
        .expect(Selector('#result').visible).ok()
        .expect(hook1.hasAjaxRequests).ok()
        .expect(hook1.pendingAjaxRequestIds.size).eql(0);
});

test.requestHooks(hook2)('With empty config', async t => {
    await t
        .expect(Selector('#result').visible).ok()
        .expect(hook2.hasAjaxRequests).ok()
        .expect(hook2.pendingAjaxRequestIds.size).eql(0);
});

test.requestHooks(hook3)('With includeHeaders', async t => {
    await t
        .expect(Selector('#result').visible).ok()
        .expect(hook3.hasAjaxRequests).ok()
        .expect(hook3.pendingAjaxRequestIds.size).eql(0);
});
