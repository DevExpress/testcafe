fixture `Unsupported protocol`
    .page `mail://testcafe@devexpress.io`;

test('Test', t => t.expect(6 * 9).eql(42));
