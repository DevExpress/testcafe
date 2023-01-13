import { RequestHook } from 'testcafe';
import ReExecutablePromise from '../../../../../../../../lib/utils/re-executable-promise.js';

const pageUrl = 'http://localhost:3000/fixtures/api/es-next/request-hooks/pages/request-logger/index.html';

class RequestHookEventClasses extends RequestHook {
    constructor () {
        super(pageUrl);

        this.eventClasses = [];
    }

    _addEventClass (event) {
        this.eventClasses.push(event.constructor.name);
    }

    get allEventRaised () {
        return ReExecutablePromise.fromFn(async () => {
            return this.eventClasses.length === 3;
        });
    }

    async onRequest (event) {
        this._addEventClass(event);
    }

    async onResponse (event) {
        this._addEventClass(event);
    }

    async _onConfigureResponse (event) {
        this._addEventClass(event);
    }
}

const requestHookEventClasses = new RequestHookEventClasses();

fixture `RequestHook events`
    .requestHooks(requestHookEventClasses);

test('test', async t => {
    await t
        .navigateTo(pageUrl)
        .expect(requestHookEventClasses.allEventRaised).ok()
        .expect(requestHookEventClasses.eventClasses).eql([
            'RequestEvent',
            'ConfigureResponseEvent',
            'ResponseEvent',
        ]);
});
