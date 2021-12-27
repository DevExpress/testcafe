const parent = 'http://localhost:3000/fixtures/multiple-windows/pages/api/parent.html';
const child = 'http://localhost:3000/fixtures/multiple-windows/pages/api/child-2.html';

fixture('Should not hang on close window whide video is recording')
    .page(parent);

for (let i = 0; i < 10; i++) {
    test(`attempt ${i}`, async t => {
        await t
            .openWindow(child)
            .closeWindow();
    });
}
