import { t, Selector, ClientFunction } from 'testcafe';

fixture `gh-1311`
    .page `http://localhost:3000/fixtures/regression/gh-1311/pages/index.html`;

const expandingSelect = Selector('#target1');
const scrollingSelect = Selector('#target2');
const getEvents       = ClientFunction(() => window.inputEventCounter);

const selectOptionInExpandingList = async () => {
    await t
        .click(expandingSelect)
        .click(expandingSelect.find('option').nth(1))
        .expect(expandingSelect.value).eql('Two');
};

const selectOptionInScrollingList = async () => {
    await t
        .click(scrollingSelect)
        .click(scrollingSelect.find('option').nth(2))
        .expect(scrollingSelect.value).eql('Tres');
};

test('Click on select option (Non IE)', async () => {
    await selectOptionInExpandingList();
    await t.expect(getEvents()).eql(1);
    await selectOptionInScrollingList();
    await t.expect(getEvents()).eql(2);
});

test('Click on select option (IE)', async () => {
    await selectOptionInExpandingList();
    await t.expect(getEvents()).eql(0);
    await selectOptionInScrollingList();
    await t.expect(getEvents()).eql(0);
});
