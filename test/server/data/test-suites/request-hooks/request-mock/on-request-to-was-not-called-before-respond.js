import { RequestMock } from 'testcafe';

fixture `Fixture`;

const mock = RequestMock().respond(() => {}).onRequestTo({});

test('test', async t => {});
