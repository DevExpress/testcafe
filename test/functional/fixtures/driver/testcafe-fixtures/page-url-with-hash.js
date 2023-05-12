fixture `Driver`;

test.page('http://localhost:3000/fixtures/driver/pages/empty-page.html/#/')('Test 1', async () => {
});

test.page('http://localhost:3000/fixtures/driver/pages/empty-page.html/#/')('Test 2', async () => {
});

test.page('http://localhost:3000/fixtures/driver/pages/empty-page.html/#/test')('Test 3', async () => {
});

test.page('http://localhost:3000/fixtures/driver/pages/empty-page.html/#/')('Test 4', async () => {
});
