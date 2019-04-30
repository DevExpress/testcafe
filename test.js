import { Selector } from 'testcafe';

fixture('Testing Begin...')
    .page('https://www.trustpilot.com/review/www.lego.com');

test('List names', async t => {

    await t.setTestSpeed(0.01);
    let reviewRow = Selector('div.review-card');

    let numReviews = await reviewRow.count;
    console.log(`Iterating ${numReviews} rows...`);

    for (let idx = 0 ; idx < numReviews ; idx ++) {
        let row = reviewRow.nth(idx);

        let nameNode = row.find('div.consumer-information__name');
        let notifyNode = row.find('button.has-tooltip');
        let name = await nameNode.innerText;
        console.log(name);

        await t
            .hover(notifyNode)
            .wait(500);
    }
});

// test('test1', async t => {
//     await t
//         .navigateTo('http://localhost:8080/')
//         .maximizeWindow();
//
//     const btns      = Selector('.btn');
//     const btnLenght = await btns.count;
//
//     for (let i = 0; i < btnLenght; i++) {
//         const currentBtn = btns.nth(i);
//
//         await t
//             .hover(currentBtn)
//             .wait(1000);
//     }
//
//     const log = await Selector('#eventLog').textContent;
//
//     console.log(log);
// });
