import { RequestMock, Selector } from 'testcafe';

fixture `Delayed response`;

function wait (ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const testBody = async t => {
    await t.addRequestHooks(
        RequestMock()
            .onRequestTo(new RegExp('/data'))
            .respond(async (req, res) => {
                await wait(5_000);

                res.setBody(JSON.stringify({}));
            })
    );

    await t
        .navigateTo('http://localhost:3000/fixtures/api/es-next/request-hooks/pages/request-mock/delayed-response.html')
        .expect(Selector('h1').withText('Delayed response').visible).ok();
};

test('Test 1', testBody);
test('Test 2', testBody);
test('Test 2', testBody);
