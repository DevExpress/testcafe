import { ClientFunction, Selector } from 'testcafe';

fixture `Typing in non-text input elements`;

const getInput            = type => Selector(`input[type="${type}"]`);
const getChangeEventCount = ClientFunction(() => window.changeEvtCounter);
const getInputEventCount  = ClientFunction(() => window.inputEvtCounter);

const inputValuePair = {
    'date':           '2016-02-03',
    'week':           '2016-W03',
    'month':          '2016-02',
    'datetime-local': '2016-02-03T01:00',
    'color':          '#003000',
    'time':           '23:00',
    'range':          '25',
};

test.page('http://localhost:3000/fixtures/regression/gh-1327/pages/empty-input.html')
('Type value', async t => {
    const types = Object.keys(inputValuePair);

    for (let i = 0; i < types.length; i++) {
        await t
            .typeText(getInput(types[i]), inputValuePair[types[i]])
            .expect(getInput(types[i]).value).eql(inputValuePair[types[i]]);
    }

    await t.expect(getChangeEventCount()).eql(7);
    await t.expect(getInputEventCount()).eql(7);
});

test.page('http://localhost:3000/fixtures/regression/gh-1327/pages/filled-input.html')
('Type value with caret position', async t => {
    await t
        .typeText(getInput('date'), '2017', { caretPos: 0 })
        .typeText(getInput('date'), '02-02', { caretPos: 5 })
        .expect(getInput('date').value).eql('2017-02-02')
        .typeText(getInput('week'), '2017', { caretPos: 0 })
        .typeText(getInput('week'), 'W02', { caretPos: 5 })
        .expect(getInput('week').value).eql('2017-W02')
        .typeText(getInput('month'), '17-02', { caretPos: 2 })
        .expect(getInput('month').value).eql('2017-02')
        .typeText(getInput('datetime-local'), '-05T03:10', { caretPos: 7 })
        .expect(getInput('datetime-local').value).eql('2015-01-05T03:10')
        .typeText(getInput('range'), '6', { caretPos: 1 })
        .expect(getInput('range').value).eql('56')
        .typeText(getInput('color'), '600', { caretPos: 4 })
        .expect(getInput('color').value).eql('#005600')
        .typeText(getInput('time'), ':59', { caretPos: 8 })
        .expect(getInput('time').value).eql('23:59:59');
});

test.page('http://localhost:3000/fixtures/regression/gh-1327/pages/filled-input.html')
('Type value with replace', async t => {
    const types = Object.keys(inputValuePair);

    for (let i = 0; i < types.length; i++) {
        await t
            .typeText(getInput(types[i]), inputValuePair[types[i]], { replace: true })
            .expect(getInput(types[i]).value).eql(inputValuePair[types[i]]);
    }
});
