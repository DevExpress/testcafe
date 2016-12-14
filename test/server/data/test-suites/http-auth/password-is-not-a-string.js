fixture `Password is not a string`
    .httpAuth({ username: 'username', password: {} });

test('Some test', () => {

});
