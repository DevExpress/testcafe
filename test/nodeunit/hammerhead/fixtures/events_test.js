var Events = require('../../../../hammerhead/lib/events');

exports['Listen and emit events'] = function (t) {
    var events = new Events();

    t.expect(6);

    events.for('owner1').listen('event1', function (arg1, arg2) {
        t.strictEqual(arg1, 'owner1event1arg1');
        t.strictEqual(arg2, 'owner1event1arg2');
    });

    events.for('owner1').listen('event2', function (arg1, arg2) {
        t.strictEqual(arg1, 'owner1event2arg1');
        t.strictEqual(arg2, 'owner1event2arg2');
    });

    events.for('owner2').listen('event1', function (arg1, arg2) {
        t.strictEqual(arg1, 'owner2event1arg1');
        t.strictEqual(arg2, 'owner2event1arg2');
    });

    events.for('owner1').emit('event1', 'owner1event1arg1', 'owner1event1arg2');
    events.for('owner1').emit('event2', 'owner1event2arg1', 'owner1event2arg2');
    events.for('owner2').emit('event1', 'owner2event1arg1', 'owner2event1arg2');

    t.done();
};

exports['Listen and emit broadcast events'] = function (t) {
    var events = new Events();

    t.expect(4);

    events.broadcast.listen('event1', function (arg1, arg2) {
        t.strictEqual(arg1, 'event1arg1');
        t.strictEqual(arg2, 'event1arg2');
    });

    events.broadcast.listen('event2', function (arg1, arg2) {
        t.strictEqual(arg1, 'event2arg1');
        t.strictEqual(arg2, 'event2arg2');
    });


    events.broadcast.emit('event1', 'event1arg1', 'event1arg2');
    events.broadcast.emit('event2', 'event2arg1', 'event2arg2');

    t.done();
};

exports['Emit in proxy context'] = function (t) {
    var events = new Events();

    t.expect(2);

    var ownerToken = 'testToken',
        ctx = {
            jobInfo: {
                ownerToken: ownerToken
            }
        };

    events.for(ownerToken).listen('event1', function (evtCtx, arg1) {
        t.strictEqual(ctx, evtCtx);
        t.strictEqual(arg1, 'test');
    });

    events.in(ctx).emit('event1', 'test');
    events.in({}).emit('event1', 'test');

    t.done();
};

exports['Can handle'] = function (t) {
    var events = new Events();

    var ctx = {
        jobInfo: {
            ownerToken: 'owner'
        }
    };

    events.for('owner').listen('event1', function (arg1, arg2) {
    });

    t.ok(events.in(ctx).canHandle('event1'));
    t.ok(!events.in(ctx).canHandle('event2'));

    t.done();
};