import { RequestMock } from 'testcafe';

fixture `Hook array contains not RequestHook inheritor`;

test.requestHooks([RequestMock(), 1])('test', async t => {
});
