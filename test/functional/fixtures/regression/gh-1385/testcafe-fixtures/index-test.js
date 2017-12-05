import { ClientFunction } from 'testcafe';

fixture `gh-1385`
    .page `http://localhost:3000/fixtures/regression/gh-1385/pages/index.html`;

test('Check "...fromPoint" functions', async t => {
    const getDataFromClient = ClientFunction(() => {
        return {
            caretPositionFromPointSupported: !!document.caretPositionFromPoint,
            caretRangeFromPointSupported:    !!document.caretRangeFromPoint,
            elementFromPointId:              window.elementFromPointId,
            caretPositionFromPointData:      window.caretPositionFromPointData,
            caretRangeFromPointData:         window.caretRangeFromPointData
        };
    });

    await t.click('#div');

    const {
        caretPositionFromPointSupported,
        caretRangeFromPointSupported,
        elementFromPointId,
        caretPositionFromPointData,
        caretRangeFromPointData
    } = await getDataFromClient();

    await t.expect(elementFromPointId).eql('div');

    if (caretPositionFromPointSupported)
        await t.expect(caretPositionFromPointData).eql('content');

    if (caretRangeFromPointSupported)
        await t.expect(caretRangeFromPointData).eql('content');
});
