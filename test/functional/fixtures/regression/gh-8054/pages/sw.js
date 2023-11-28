self.addEventListener('fetch', event => {
    if (event.request.url.indexOf('?test') > -1) {
        event.respondWith(
            fetch('http://localhost:3000/fixtures/regression/gh-8054/pages/index.html')
                .then(response => {
                    self.clients.matchAll().then((clients) => {
                        clients.forEach((client) => {
                            client.postMessage({
                                result: 'success',
                            });
                        });
                    });

                    return response;
                })
        );
    }
});
