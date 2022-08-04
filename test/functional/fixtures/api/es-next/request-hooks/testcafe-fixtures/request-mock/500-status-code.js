import { RequestMock } from 'testcafe';

fixture `Fixture`;

test
    .requestHooks(
        RequestMock()
            .onRequestTo(/d/)
            .respond('', 500)
    )
    ('should pass', async t => {
        await t.expect(true).ok();
    });
