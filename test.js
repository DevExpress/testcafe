fixture `123`.page`./element-screenshot.html`;

test('1', t => t.takeElementScreenshot('table', 'custom'  + '.png', { crop: { width: 50, height: 50 } }));
