'@fixture same domain iframe';
'@page ./same-domain-iframe.html';

'@test'['same-domain iframe test'] = {
    '1.Wait for error': inIFrame('#iframe', function () {
        act.wait(0);
    })
};
