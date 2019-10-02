const userName = Selector('#user-name');

const someUser = Role('http://localhost:3000/fixtures/api/es-next/roles/pages/login-page.html', async() => {
    await t
        .typeText('input[name="name"]', 'SomeUser')
        .click('input[value="LogIn"]');
}, { preserveUrl: false });

(async() => {
    await t
        .useRole(someUser)
        .expect(userName.textContent).eql('SomeUser')
        .useRole(Role.anonymous())
        .expect(userName.textContent).eql('');
})();
