'@fixture prevent real action in same domain page';
'@page ./same-domain.html';


'@test'['Type and wait in iframe in an obsolete manner'] = {
    '1.Type in input': function () {
        var input = $('#input', $('#iframe').contents());

        act.type(input, 'Hello, world!');
    },

    '2.Perform native click': inIFrame('#iframe', function () {
        // NOTE: We simulate a click performed by a user during TestCafe test execution. If TestCafe
        // doesn't prevent a click, test will fail with an unexpected alert dialog error.
        window['%hammerhead%'].nativeMethods.click.call(document.getElementById('alertDiv'));
    })
};
