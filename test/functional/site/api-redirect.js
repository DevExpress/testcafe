const router = require('express').Router();

const responses = {
    handleGetResult: (res) => {
        return {
            data: {
                name:     'James Livers',
                position: 'CEO',
            },
            params:  res.query,
            cookies: res.headers.cookie,
        };
    },
};

router.get('/data', (req, res) => {
    res.send(responses.handleGetResult(req));
});

module.exports = router;
