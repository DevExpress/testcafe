import { ClientFunction } from 'testcafe';

fixture `Video quarantine`
    .page `../pages/index.html`;

let counter = 0;

const colors = {
    0: 'red',
    1: 'yellow',
    2: 'blue',
    3: 'green'
};

const changeBackground = ClientFunction(i => {
    document.body.style.backgroundColor = colors[i];
}, { dependencies: { colors } });

test(`quarantine with attempts`, async t => {
    await changeBackground(counter);
    await t.wait(1000);

    counter++;

    if (counter < 2)
        throw new Error('error');
});

test(`quarantine without attempts`, async () => {
    await changeBackground(counter);
});
