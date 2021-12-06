import createTestCafe from 'testcafe';

fixture `Runner`;

test('Starts and terminates runner', async () => {
    const t = await createTestCafe({
        appCommand: 'test',
        appInitDelay: 500,

        browsers: ['chrome'],

        reporter: {
            name: 'spec',
            output: 'test.txt',
        },

        concurrency: 5,

        filter: {
            fixture:     'Fixture',
            test:        'Test',
            fixtureGrep: 'F*',
            testGrep:    'T*',
            testMeta:    { meta: 'ok' },
            fixtureMeta: { meta: 'ok' },
        },

        src: 'test.js',

        screenshots: {
            path: 'screenshots/',
            pathPattern: 'scr.png',
            takeOnFails: true,
            fullPage: true,
        },

        clientScripts: [
            {
                module: 'some-module',
                page:   'some/page',
            },
            {
                path: '/some/path',
                page: 'some/page',
            },
        ],

        videoPath: 'artifacts/videos',

        videoOptions:  {
            singleFile:  true,
            failedOnly:  false,
            ffmpegPath:  '/usr/bin/ffmpeg',
            pathPattern: '${DATE}-${TIME}',
        },

        videoEncodingOptions: {
            'c:v':     'libx264',
            'preset':  'ultrafast',
            'pix_fmt': 'yuv420p',
            'r':       60,
            'aspect':  '16:9',
        },

        proxy:       'localhost',
        proxyBypass: 'localhost',

        disableHttp2:           true,
        disableMultipleWindows: true,
    });

    const remoteConnection = await t.createBrowserConnection();
    const runner = t.createRunner();

    runner
        .filter(async (testName) => testName === 'test')
        .filter(testName => testName === 'test')
        .browsers(remoteConnection)
        .clientScripts({
            content: 'abracadabra',
            page:    'some/page',
        })
        .clientScripts([
            {
                module: 'some-module',
                page:   'some/page',
            },
            {
                path: '/some/path',
                page: 'some/page',
            },
        ])
        .video(
            'artifacts/videos',
            {
                singleFile:  true,
                failedOnly:  false,
                ffmpegPath:  '/usr/bin/ffmpeg',
                pathPattern: '${DATE}-${TIME}',
            },
            {
                'c:v':     'libx264',
                'preset':  'ultrafast',
                'pix_fmt': 'yuv420p',
                'r':       60,
                'aspect':  '16:9',
            }
        );

    return t.close();
});
