fixture `speed`;

async function runSpeedTest (t) {
    const text = 'some text';

    // Setup
    await t.typeText('#input', text)
        .pressKey('tab');

    // With default speed setting (0.5)
    await t.typeText('#input', text, { replace: true })
        .pressKey('tab');

    const defaultSlowEditingTime = await t.eval(() => window.lastEditingTime);

    // Change test speed to 1
    await t
        .setTestSpeed(1)
        .typeText('#input', text, { replace: true })
        .pressKey('tab');

    const testFastSpeedEditingTime = await t.eval(() => window.lastEditingTime);

    // With specific action speed
    await t.typeText('#input', text, { speed: 0.5, replace: true })
        .pressKey('tab', { speed: 0.5 });

    const actionSlowEditingTime = await t.eval(() => window.lastEditingTime);

    // Check default speed was not changed
    await t
        .typeText('#input', text, { replace: true })
        .pressKey('tab');

    const testFastSpeedSecondEditingTime = await t.eval(() => window.lastEditingTime);

    await t
        .expect(defaultSlowEditingTime / testFastSpeedEditingTime).gte(2)
        .expect(actionSlowEditingTime / testFastSpeedEditingTime).gte(2)
        .expect(actionSlowEditingTime / testFastSpeedSecondEditingTime).gte(2);
}

test
    .page `http://localhost:3000/fixtures/api/es-next/speed/pages/index.html`
('Speed', async t => {
    await runSpeedTest(t);
});

test
    .page `http://localhost:3000/fixtures/api/es-next/speed/pages/iframe.html`
('Speed in iframe', async t => {
    await t.switchToIframe('iframe');
    await runSpeedTest(t);
});
