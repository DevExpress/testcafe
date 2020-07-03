const MAX_RETRY   = 10;
const RETRY_DELAY = 500;

const PAGE_FETCH_MODE = 'navigate';

function delay (ms) {
    return new Promise(r => setTimeout(r, ms));
}

async function tryGetResponse (request) {
    try {
        return { response: await fetch(request) };
    }
    catch (error) {
        return { error };
    }
}

async function getResponse (request) {
    let { error, response } = await tryGetResponse(request);
    let retryAttempt        = 0;

    while (error && retryAttempt < MAX_RETRY) {
        // eslint-disable-next-line no-console
        console.error(error.stack || error);

        retryAttempt += 1;

        await delay(RETRY_DELAY);

        ({ error, response } = await tryGetResponse(request));
    }

    if (error)
        throw error;

    return response;
}

self.addEventListener('fetch', event => {
    if (event.request.mode !== PAGE_FETCH_MODE)
        return;

    event.respondWith(getResponse(event.request));
});

self.addEventListener('install', () => {
    self.skipWaiting();
});
