fixture`RequestLogger`
    .page(global.pageUrl);

test('Global', async t => {
    await t.wait(1000);
    await t
        .expect(global.logger.contains(r => r.response.statusCode === 200)).ok()
        .expect(global.logger.count(r => r.request.url === global.pageUrl)).eql(1);

    global.logger.clear();

    await t
        .expect(global.logger.contains(r => r.response.statusCode === 200)).notOk()
        .expect(global.logger.requests.length).eql(0);

    await t
        .navigateTo(global.pageUrl)
        .expect(global.logger.contains(r => r.request.url === global.pageUrl)).ok();

    await t
        .expect(global.logger.requests.length).eql(1)
        .expect(global.logger.requests[0].request.url).eql(global.pageUrl);
});
