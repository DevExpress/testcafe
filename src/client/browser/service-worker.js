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
    let error    = null;
    let response = null;

    for (let i = 0; i < MAX_RETRY; i++) {
        ({ error, response } = await tryGetResponse(request));

        if (!error)
            return response;

        // eslint-disable-next-line no-console
        console.error(error.stack || error);

        await delay(RETRY_DELAY);
    }

    throw error;
}

self.addEventListener('fetch', event => {
    if (event.request.mode !== PAGE_FETCH_MODE)
        return;

    event.respondWith(getResponse(event.request));
});

self.addEventListener('install', () => {
    self.skipWaiting();
});
