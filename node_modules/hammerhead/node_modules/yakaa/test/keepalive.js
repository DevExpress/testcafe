var test = require('tap').test;
var Agent = require('../index.js')
var http = require('http')
var web = http.createServer(function(req,res){req.pipe(process.stdout); res.end()});

test("yakaa should reuse the socket", function (t) {
  t.plan(7);

  web.listen();
  var PORT = web.address().port;
  var agent = new Agent({keepAlive : true, keepAliveTimeoutMsecs: 100});
  var opts = {
    port      : PORT,
    agent     : agent,
  };

  var socket;

  var i = 0;
  agent.on('free', function (sock, opts) {
    t.ok(i++ < 2, 'free socket');
  });

  // only destroyed once at the end
  var j = 0;
  agent.on('yakaa_destroy', function (s) {
    t.ok(j++ < 1, 'destroy');
    t.equals(j,1, 'destroy called once')
    t.equals(i,2, 'free called twice')
    t.end()
  });

  new http.ClientRequest(opts, next).end();

  function next(res) {
    res.pipe(process.stdout)
    t.ok(res, 'first response');

    // set short timeout so this test ends quickly
    new http.ClientRequest(opts, done).end();
  }

  function done(res) {
    res.pipe(process.stdout);
    t.ok(res, 'second response');
    web.close();
  }
});

test("yakaa should destroy the socket after each request", function (t) {
  t.plan(8);

  web.listen();
  var PORT = web.address().port;

  // set a super short socket lifetime
  // normally this would kill a TLS session,
  // but our super simple test won't mind
  var agent = new Agent({keepAlive : true, keepAliveTimeoutMsecs: 1});
  var opts = {
    port      : PORT,
    agent     : agent,
  };

  var j=0;
  agent.on('yakaa_destroy', function () {
    t.ok(j++ < 2, 'destroy');

    if (j==2) {
      t.equals(j,2, 'destroy called twice')
      t.equals(i,2, 'free called twice')
      t.end();
    }
  })

  var i=0;
  agent.on('free', function (sock, opts) {
    t.ok(i++ < 2, 'free socket');
  });

  new http.ClientRequest(opts, next).end();

  function next(res) {
    res.pipe(process.stdout)
    t.ok(res, 'first response');
    setTimeout(function () {
      new http.ClientRequest(opts, done).end();
    }, 10);
  }

  function done(res) {
    res.pipe(process.stdout);
    t.ok(res, 'second response');
    web.close();
  }
});
