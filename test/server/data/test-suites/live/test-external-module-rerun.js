import module from './commonjs-module';

fixture('rerun with external module')
    .page('http://example.com');

test('rerun with external module', async t => {
    console.log('test');
});

