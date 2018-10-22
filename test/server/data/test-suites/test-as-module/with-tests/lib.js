export default function libraryTests () {
    fixture('Library tests').page('http://example.com');

    test('test', async t => {
        await t.click('h1');
    });
}
