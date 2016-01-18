'@fixture LegacyFixture';
'@page https://example.org';

'@test'['2.LegacyTest'] = {
    'TestStep': function () {
        act.click('#test');
    }
};
