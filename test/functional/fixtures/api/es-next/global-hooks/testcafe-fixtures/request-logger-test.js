import { userVariables } from 'testcafe';

fixture`Global request logger`
    .page(userVariables.url);

test('test', async t => {
    await t
        .expect(userVariables.logger.contains(r => r.response.statusCode === 200)).ok()
        .expect(userVariables.logger.count(r => r.request.url === userVariables.url)).eql(1);

    userVariables.logger.clear();

    await t
        .expect(userVariables.logger.contains(r => r.response.statusCode === 200)).notOk()
        .expect(userVariables.logger.requests.length).eql(0);

    await t
        .navigateTo(userVariables.url)
        .expect(userVariables.logger.contains(r => r.request.url === userVariables.url)).ok();

    await t
        .expect(userVariables.logger.requests.length).eql(1)
        .expect(userVariables.logger.requests[0].request.url).eql(userVariables.url);
});
