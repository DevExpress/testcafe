setTimeout(function () {
    self.postMessage('Header is set from worker');

    fetch('http://localhost:3000/?fromWorker');
}, 1000);
