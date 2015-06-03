var url = require('url'),
    testUtils = require('../../test_utils'),
    CookieShelf = require('../../../../hammerhead/lib/cookie_shelf');

var watchdog = null,
    testCookieKit = [
        'Test1=Basic; expires=Wed, 13-Jan-2021 22:23:01 GMT',
        'Test2=PathMatch; expires=Wed, 13-Jan-2021 22:23:01 GMT; path=/TestPath',
        'Test3=PathNotMatch; expires=Wed, 13-Jan-2021 22:23:01 GMT; path=/SomePath/',
        'Test4=DomainMatch; expires=Wed, 13-Jan-2021 22:23:01 GMT; domain=.dc5f4ce48f6.com',
        'Test5=DomainNotMatch; expires=Wed, 13-Jan-2021 22:23:01 GMT; domain=.cbf4e2d79.com',
        'Test6=HttpOnly; expires=Wed, 13-Jan-2021 22:23:01 GMT; path=/; HttpOnly',
        'Test7=Secure; expires=Wed, 13-Jan-2021 22:23:01 GMT; path=/; Secure',
        'Test8=Expired; expires=Wed, 13-Jan-1977 22:23:01 GMT; path=/',
        'Test9=Duplicate; One=More; expires=Wed, 13-Jan-2021 22:23:01 GMT; path=/',
        'Test10={"prop1":5,"prop2":"value"}; expires=Wed, 13-Jan-2021 22:23:01 GMT; path=/'
    ];

function isCookieStringMatch(cookieStr, expectedCookies) {
    var cookies = cookieStr.split(/;\s*/);

    if (cookies.length !== expectedCookies.length)
        return false;

    for (var i = 0; i < expectedCookies.length; i++) {
        if (cookies.indexOf(expectedCookies[i]) === -1)
            return false;
    }

    return true;
}

exports['Cookies management'] = {
    setUp: function (done) {
        watchdog = new testUtils.Watchdog();
        done();
    },

    tearDown: function (done) {
        watchdog.shrink();
        done();
    },

    'Set cookie by server': function (t) {
        var cookieShelf = new CookieShelf(),
            jobInfo = {
                uid: 'testUid',
                ownerToken: 't'
            };

        //1.Set cookies
        cookieShelf.setCookieByServer(jobInfo, 'http://test.dc5f4ce48f6.com/TestPath/Test', testCookieKit);

        //2.Get client cookie string
        var cookieStr = cookieShelf.getClientCookieString(jobInfo, 'http://test.dc5f4ce48f6.com/TestPath/Test');

        t.ok(isCookieStringMatch(cookieStr, [
            'Test1=Basic',
            'Test2=PathMatch',
            'Test4=DomainMatch',
            'Test9=Duplicate',
            'Test10={"prop1":5,"prop2":"value"}'
        ]));

        //3.Get client cookie string for secure connection
        cookieStr = cookieShelf.getClientCookieString(jobInfo, 'https://test.dc5f4ce48f6.com/TestPath/Test');

        t.ok(isCookieStringMatch(cookieStr, [
            'Test1=Basic',
            'Test2=PathMatch',
            'Test4=DomainMatch',
            'Test7=Secure',
            'Test9=Duplicate',
            'Test10={"prop1":5,"prop2":"value"}'
        ]));

        //4.Get cookie header
        cookieStr = cookieShelf.getCookieHeader(jobInfo, 'http://test.dc5f4ce48f6.com/TestPath/Test');

        t.ok(isCookieStringMatch(cookieStr, [
            'Test1=Basic',
            'Test2=PathMatch',
            'Test4=DomainMatch',
            'Test6=HttpOnly',
            'Test9=Duplicate',
            'Test10={"prop1":5,"prop2":"value"}'
        ]));

        //5.Get cookie header for secure connection
        cookieStr = cookieShelf.getCookieHeader(jobInfo, 'https://test.dc5f4ce48f6.com/TestPath/Test');

        t.ok(isCookieStringMatch(cookieStr, [
            'Test1=Basic',
            'Test2=PathMatch',
            'Test4=DomainMatch',
            'Test6=HttpOnly',
            'Test7=Secure',
            'Test9=Duplicate',
            'Test10={"prop1":5,"prop2":"value"}'
        ]));

        //6.Get non exist cookie header
        cookieStr = cookieShelf.getCookieHeader('fake', 'http://fake.com/');
        // T230376: TD15.1 - 'Server error 500' when trying to start recording on hypercomments.com (IE11)
        t.ok(cookieStr === null);

        //7.Get non exist client cookie string
        cookieStr = cookieShelf.getClientCookieString('fake', 'http://fake.com/');
        t.ok(cookieStr === '');

        t.done();
    },

    'Set cookie by client': function (t) {
        var cookieShelf = new CookieShelf(),
            jobInfo = {
                uid: 'testUid',
                ownerToken: 't'
            };

        //1.Set cookies
        cookieShelf.setCookieByClient(jobInfo, 'http://test.dc5f4ce48f6.com/TestPath/Test', testCookieKit);

        //2.Get client cookie string
        cookieStr = cookieShelf.getClientCookieString(jobInfo, 'http://test.dc5f4ce48f6.com/TestPath/Test');

        t.ok(isCookieStringMatch(cookieStr, [
            'Test1=Basic',
            'Test2=PathMatch',
            'Test4=DomainMatch',
            'Test9=Duplicate',
            'Test10={"prop1":5,"prop2":"value"}'
        ]));

        //3.Get client cookie string for secure connection
        cookieStr = cookieShelf.getClientCookieString(jobInfo, 'https://test.dc5f4ce48f6.com/TestPath/Test');

        t.ok(isCookieStringMatch(cookieStr, [
            'Test1=Basic',
            'Test2=PathMatch',
            'Test4=DomainMatch',
            'Test7=Secure',
            'Test9=Duplicate',
            'Test10={"prop1":5,"prop2":"value"}'
        ]));

        //4.Get Cookie header
        cookieStr = cookieShelf.getCookieHeader(jobInfo, 'http://test.dc5f4ce48f6.com/TestPath/Test');
        t.ok(isCookieStringMatch(cookieStr, [
            'Test1=Basic',
            'Test2=PathMatch',
            'Test4=DomainMatch',
            'Test9=Duplicate',
            'Test10={"prop1":5,"prop2":"value"}'
        ]));

        //5.Get Cookie header for secure connection
        cookieStr = cookieShelf.getCookieHeader(jobInfo, 'https://test.dc5f4ce48f6.com/TestPath/Test');
        t.ok(isCookieStringMatch(cookieStr, [
            'Test1=Basic',
            'Test2=PathMatch',
            'Test4=DomainMatch',
            'Test7=Secure',
            'Test9=Duplicate',
            'Test10={"prop1":5,"prop2":"value"}'
        ]));

        t.done();
    },

    'Remove cookies': function (t) {
        var cookieShelf = new CookieShelf(),
            jobInfo = {
                uid: 'testUid',
                ownerToken: 't'
            };

        //1.Set cookies
        cookieShelf.setCookieByClient(jobInfo, 'http://test.dc5f4ce48f6.com/TestPath/Test', testCookieKit);

        //2.Remove cookies
        cookieShelf.removeCookies(jobInfo);

        //3.Get client cookie string
        var cookieStr =  cookieShelf.getClientCookieString(jobInfo, 'http://test.dc5f4ce48f6.com/TestPath/Test');
        t.ok(!cookieStr);

        //4.Get Cookie header
        cookieStr = cookieShelf.getCookieHeader(jobInfo, 'http://test.dc5f4ce48f6.com/TestPath/Test');
        t.ok(!cookieStr);

        t.done();
    },

    'Empty cookie not saved': function(t){
        var cookieShelf = new CookieShelf(),
            jobInfo = {
                uid: 'testUid',
                ownerToken: 't'
            };
        var cookieValue = ['Test=123'];
        cookieShelf.setCookieByClient(jobInfo, 'http://test.dc5f4ce48f6.com/TestPath/Test', cookieValue);

        var emptyCookieValue = '';
        cookieShelf.setCookieByClient(jobInfo, 'http://test.dc5f4ce48f6.com/TestPath/Test', emptyCookieValue);
        var cookieStr = cookieShelf.getClientCookieString(jobInfo, 'http://test.dc5f4ce48f6.com/TestPath/Test');
        t.strictEqual(cookieStr, 'Test=123');

        cookieShelf.setCookieByServer(jobInfo, 'http://test.dc5f4ce48f6.com/TestPath/Test', emptyCookieValue);
        cookieStr = cookieShelf.getClientCookieString(jobInfo, 'http://test.dc5f4ce48f6.com/TestPath/Test');
        t.strictEqual(cookieStr, 'Test=123');

        t.done();
    }
};