import { t } from 'testcafe';

fixture `ClientFunction`
    .page `http://localhost:3000/fixtures/api/es-next/client-function/pages/index.html`;

test(".contains", async t => {
    await t
        .expect("foobar").contains("foo")
        .expect([42, "foo"] as (number | string)[]).contains("foo")
        .expect([42, "foo"] as [number, string]).contains(42)
        .expect([42, 34] as number []).contains(34)
        .expect({ ans: 42, foo: "bar" }).contains({ foo: "bar" })
});

test(".notContains", async t => {
    await t
        .expect("foobar").notContains("foox")
        .expect([42, "foo"] as (number | string)[]).notContains(12)
        .expect([42, "foo"] as [number, string]).notContains("foox")
        .expect([42, 34] as number []).notContains(13)
        .expect({ ans: 42, foo: "bar" }).notContains({ foo: "baz" })
});

test(".typeOf", async t => {
    await t
        .expect((() => true)).typeOf('function')
        .expect({}).typeOf('object')
        .expect(1).typeOf('number')
        .expect('string').typeOf('string')
        .expect(true).typeOf('boolean')
        .expect(undefined).typeOf('undefined')
        .expect(null).typeOf('null')
        .expect(/regex/).typeOf('regex')
});

test(".notTypeOf", async t => {
    await t
        .expect('function').typeOf('function')
        .expect('object').typeOf('object')
        .expect('number').typeOf('number')
        .expect(1).typeOf('string')
        .expect('boolean').typeOf('boolean')
        .expect('undefined').typeOf('undefined')
        .expect('null').typeOf('null')
        .expect('regex').typeOf('regex')
});
