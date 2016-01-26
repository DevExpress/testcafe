'@fixture cross domain iframe';
'@page ./cross-domain-iframe.html';

'@test'['cross-domain iframe test'] = {
    '1.Wait for error': inIFrame('#iframe', function () {
        act.wait(0);
    })
};
