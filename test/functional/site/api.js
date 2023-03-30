const path     = require('path');
const fs       = require('fs');
const { noop } = require('lodash');
const router   = require('express').Router();

const responses = {
    loadingResult:   {},
    handleGetResult: (res) => {
        return {
            data: {
                name:     'John Hearts',
                position: 'CTO',
            },
            params:  res.query,
            cookies: res.headers.cookie,
        };
    },
    handlePostResult: (data) => ({
        message: 'Data was posted',
        data,
    }),
    handleDeleteResult: (data) => ({
        message: 'Data was deleted',
        data,
    }),
    handlePutResult: (data) => ({
        message: 'Data was putted',
        data,
    }),
    handlePatchResult: (data) => ({
        message: 'Data was patched',
        data,
    }),
};

router.get('/data', (req, res) => {
    res.send(responses.handleGetResult(req));
});

router.get('/data/text', (req, res) => {
    res.send(JSON.stringify(responses.handleGetResult(req).data));
});

router.get('/data/file', (req, res) => {
    const pathFile = path.resolve('test/file');

    fs.writeFileSync(pathFile, JSON.stringify(responses.handleGetResult(req).data));
    res.sendFile(pathFile);
    fs.rm(pathFile, {
        force: true,
    }, noop);
});

router.get('/data/loading', (req, res) => {
    setTimeout(() => {
        Object.assign(responses.loadingResult, responses.handleGetResult(req).data);
    }, 100);

    res.send(responses.loadingResult);
});

router.get('/hanging', () => { });

router.get('/cookies', (req, res) => {
    res.cookie('cookieName', 'cookieValue');
    res.send();
});

router.post('/auth/basic', (req, res) => {
    res.send({
        token: req.rawHeaders[req.rawHeaders.indexOf('authorization') + 1],
    });
});

router.post('/auth/proxy/basic', (req, res) => {
    res.send({
        token: req.rawHeaders[req.rawHeaders.indexOf('proxy-authorization') + 1],
    });
});

router.post('/auth/bearer', (req, res) => {
    res.send(req.rawHeaders[req.rawHeaders.indexOf('authorization') + 1] ? 'authorized' : 'un-authorized');
});

router.post('/auth/key', (req, res) => {
    res.send(req.rawHeaders[req.rawHeaders.indexOf('API-KEY') + 1] ? 'authorized' : 'un-authorized');
});

router.post('/data', (req, res) => {
    res.send(responses.handlePostResult(req.body));
});

router.delete('/data/:dataId', (req, res) => {
    res.send(responses.handleDeleteResult(req.params));
});

router.put('/data', (req, res) => {
    res.send(responses.handlePutResult(req.body));
});

router.patch('/data', (req, res) => {
    res.send(responses.handlePatchResult(req.body));
});

router.head('/data', (req, res) => {
    res.send();
});

module.exports = router;
