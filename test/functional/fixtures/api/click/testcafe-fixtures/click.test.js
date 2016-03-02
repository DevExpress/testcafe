'@fixture click';
'@page ./index.html';


var userAgent = window.navigator.userAgent.toLowerCase();
var isMSEdge  = !!/edge\//.test(userAgent);

var isIE11 = !!(navigator.appCodeName === 'Mozilla' &&
                /trident\/7.0/.test(userAgent));


'@test'['Pointer events test (T191183) [ONLY:ie]'] = {
    '1.Bind pointer event handlers and call click': function () {
        var input  = $('#input')[0];
        var shared = this;

        shared.events = [];

        function pointerHandler (e) {
            shared.events.push(e.type.toLowerCase().replace('ms', ''));

            eq(e.pointerType, isIE11 || isMSEdge ? 'mouse' : 4);
            eq(e.button, 0);
            eq(e.buttons, 1);
        }

        if (isMSEdge) {
            input.onpointerdown = pointerHandler;
            input.onpointerup   = pointerHandler;
        }
        else {
            input.onmspointerdown = pointerHandler;
            input.onmspointerup   = pointerHandler;
        }

        act.click(input);
    },

    '2.Check that handlers were called': function () {
        eq(this.events, ['pointerdown', 'pointerup']);
    }
};

'@test'['Should fail if the first argument is invisible'] = {
    '1.Click on invisible element': function () {
        var $input = $('#input').css('visibility', 'hidden');

        act.click($input);
    }
};
