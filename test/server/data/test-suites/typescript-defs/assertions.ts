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