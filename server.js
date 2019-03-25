const http = require('http');

http
    .createServer((req, res) => {
        if (req.url === '/') {
            res.writeHead(200, { 'content-type': 'text/html' });
            res.end(`
                <h1 id="header"></h1>
                <a id="anchor" href="#login">log in</a>
                <input id="button" type="button" value="log in">

                <script>
                    var onHashChange = function () {
                        var newHash = location.hash;

                        if (newHash === '') {
                            if (localStorage.getItem('isLoggedIn')) {
                                header.textContent = 'Authorized';
                                header.style.display = 'block';
                                anchor.style.display = 'none';
                                button.style.display = 'none';
                            }
                            else {
                                header.textContent = 'Unauthorized';
                                anchor.style.display = 'block';
                                button.style.display = 'none';
                            }
                        } 
                        else if (newHash === '#login') {
                            if (localStorage.getItem('isLoggedIn'))
                                return location.hash = '';

                            header.style.display = 'none';
                            anchor.style.display = 'none';
                            button.style.display = 'block';

                            button.addEventListener('click', function() {
                                localStorage.setItem('isLoggedIn', 'true');
                                location.hash = '';
                            });
                        }
                    };

                    onHashChange();

                    window.addEventListener('hashchange', onHashChange);
                </script>
            `);
        }
        else
            res.end();
    })
    .listen(4100);