function exitDomains () {
    const domains = [];

    while (process.domain) {
        domains.push(process.domain);

        process.domain.exit();
    }

    return domains;
}

function enterDomains (domains) {
    let domain = domains.pop();

    while (domain) {
        domain.enter();

        domain = domains.pop();
    }
}

module.exports = {
    exitDomains:  exitDomains,
    enterDomains: enterDomains
};
