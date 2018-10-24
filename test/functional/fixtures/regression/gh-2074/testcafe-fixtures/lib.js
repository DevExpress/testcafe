export default function libraryTests () {
    fixture('gh-2074').page('../pages/index.html');

    test('Do nothing', async () => {
        throw new Error('test is executed');
    });
}


