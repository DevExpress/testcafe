import { RequestMock } from 'testcafe';

fixture `Fixture`;

const mock = RequestMock().onRequestTo({}).onRequestTo({});

test('test', async t => {});
