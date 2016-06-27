it('[Regression](GH-418) Should resume test if redirect occurs in an iframe', function () {
    return runTests('testcafe-fixtures/index.test.js',
        'Click on the element in iframe after redirect occurs in the iframe - should pass',
        { selectorTimeout: 2000 });
});
