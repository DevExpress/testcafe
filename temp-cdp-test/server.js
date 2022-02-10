require('http')
    .createServer((req, res) => {
        if (req.url === '/') {
            res.writeHead(200, {
                'content-type': 'text/html',
            });

            res.end(`
                <body>
                    <button onclick="this.textContent = '~clicked~'">Click me!</button>
                    <script>
                        console.log('log some text');
                        console.error('error!!!!');
                        console.warn('warning');
                        console.info('this is the test page');
                    </script>
                </body>
            `);
        }
        else
            res.destroy();
    })
    .listen(2022, () => console.log('Open http://localhost:2022/'));