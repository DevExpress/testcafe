const createTestDiv =
    `window.setTimeout(function () {
         var div = document.createElement('div');

         div.className = 'testDiv';
         div.setAttribute('style', 'background-color: red; width: 100px; height: 100px');
         document.body.appendChild(div);
     }, 2000);
     `;

const mockDate =
    `  window.Date = function () { throw new Error('Use a stored native method instead of the Date constructor.'); };
       window.Date.now = function () { throw new Error('Use a stored native method instead of Date.now() function.'); };
    `;

fixture `Fixture`
    .clientScripts([
        { content: createTestDiv },
        { content: mockDate }
    ]);

test('test', async t => {
    await t.click('.testDiv');
});
