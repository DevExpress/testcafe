onmessage = function (e) {
    const result = parseInt(e.data.first, 10) * parseInt(e.data.second, 10);

    postMessage(isNaN(result) ? '' : result);
};
