(function sendXHR () {
    return new Promise(() => {
        fetch('http://localhost:3000/fixtures/regression/gh-7675/pages/foo.js')
            .then(res => res.text())
            .then(text => {
                self.postMessage({
                    foo: text,
                });
            });
    });
})();
