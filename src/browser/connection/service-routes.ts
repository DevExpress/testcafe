export default {
    connect:                        '/browser/connect',
    connectWithTrailingSlash:       '/browser/connect/',
    heartbeat:                      '/browser/heartbeat',
    status:                         '/browser/status',
    statusDone:                     '/browser/status-done',
    initScript:                     '/browser/init-script',
    idle:                           '/browser/idle',
    idleForced:                     '/browser/idle-forced',
    activeWindowId:                 '/browser/active-window-id',
    closeWindow:                    '/browser/close-window',
    serviceWorker:                  '/service-worker.js',
    openFileProtocol:               '/browser/open-file-protocol',
    dispatchProxylessEvent:         '/browser/dispatch-proxyless-event',
    dispatchProxylessEventSequence: '/browser/dispatch-proxyless-event-sequence',
    parseSelector:                  '/parse-selector',

    assets: {
        index:  '/browser/assets/index.js',
        styles: '/browser/assets/styles.css',
        logo:   '/browser/assets/logo.svg',
    },
};
