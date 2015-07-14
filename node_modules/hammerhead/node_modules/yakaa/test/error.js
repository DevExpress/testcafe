var test = require('tap').test;
var Agent = require('../index.js')
var http = require('http')

test("yakaa should destroy the socket after an error", function (t) {
  t.plan(2);

  // set a super short socket lifetime
  // normally this would kill a TLS session,
  // but our super simple test won't mind
  var agent = new Agent({keepAlive : true});
  var opts = {
    port      : 1,
    agent     : agent,
  };

  agent.on('yakaa_remove', function () {
    t.ok(true, 'removed');
  })

  var req = new http.ClientRequest(opts);
  req.on('error', function (err) {
    t.ok(err);
  })
  req.end();

});
