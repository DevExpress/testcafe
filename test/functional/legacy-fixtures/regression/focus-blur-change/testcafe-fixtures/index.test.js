'@fixture Focus, blur, change handlers added by attachEvent() number of invocation';
'@page ./same-domain.html';


function addHandler (element, event, handler) {
    if (element.attachEvent)
        element.attachEvent('on' + event, handler);
    else
        element.addEventListener(event, handler);
}

var iFrameSelector = '#iframe';


'@test'['Blur change and focus in a same-domain  iFrame (regression from qunit)'] = {
    '1.Set handlers': inIFrame(iFrameSelector, function () {
        var $input = $('#input');
        var input  = $input[0];

        $input.data('focusCount', 0);
        $input.data('changeCount', 0);
        $input.data('blurCount', 0);

        addHandler(input, 'focus', function () {
            $(this).data('focusCount', $(this).data('focusCount') + 1);
        });

        addHandler(input, 'change', function () {
            $(this).data('changeCount', $(this).data('changeCount') + 1);
        });

        addHandler(input, 'blur', function () {
            $(this).data('blurCount', $(this).data('blurCount') + 1);
        });
    }),

    '2.Click input': inIFrame(iFrameSelector, function () {
        act.click('#input');
    }),

    '3.Type in input': inIFrame(iFrameSelector, function () {
        act.type('#input', 'test');
    }),

    '4.Click body': inIFrame(iFrameSelector, function () {
        act.click('body');
    }),

    '5.Check handlers calling count': inIFrame(iFrameSelector, function () {
        var $input = $('#input');

        eq($input.data('focusCount'), 1);
        eq($input.data('changeCount'), 1);
        eq($input.data('blurCount'), 1);
    })
};
