import createTestCafe from 'testcafe';

fixture `Runner`;

test('Starts and terminates runner', async () => {
    const t = await createTestCafe();

    const remoteConnection = await t.createBrowserConnection();
    const runner = t.createRunner();

    runner
        .browsers(remoteConnection)
        .clientScripts({
            content: 'abracadabra',
            page:    'some/page'
        })
        .clientScripts([
            {
                module: 'some-module',
                page:   'some/page'
            },
            {
                path: '/some/path',
                page: 'some/page'
            }
        ])
        .video(
            'artifacts/videos',
            {
                singleFile:  true,
                failedOnly:  false,
                ffmpegPath:  '/usr/bin/ffmpeg',
                pathPattern: '${DATE}-${TIME}'
            },
            {
                'c:v':     'libx264',
                'preset':  'ultrafast',
                'pix_fmt': 'yuv420p',
                'r':       60,
                'aspect':  '16:9'
            }
        );

    return t.close();
});
