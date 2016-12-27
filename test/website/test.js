'use strict';

const blc     = require('broken-link-checker');
const http    = require('http');
const https   = require('https');
const util    = require('gulp-util');
const url     = require('url');
const parse5  = require('parse5');
const Promise = require('pinkie');
const walk    = require('dom-walk');


class WebsiteTester {
    constructor () {
        this.parsedDocs    = {};
        this.checkedHashes = {};
    }

    _hasHash (tree, hash) {
        const attrMatches = attr => (attr.name === 'name' || attr.name === 'id') && attr.value === hash;
        const hasId       = node => node.attrs && node.attrs.some(attrMatches);

        return walk(tree, hasId);
    }

    _parsePage (pageUrl) {
        if (this.parsedDocs[pageUrl])
            return Promise.resolve(this.parsedDocs[pageUrl]);

        return new Promise(resolve => {
            const protocol = url.parse(pageUrl).protocol === 'http:' ? http : https;

            protocol.get(pageUrl, resolve);
        })
            .then(response => {
                return new Promise(resolve => {
                    let data = '';

                    response.on('data', chunk => {
                        data += chunk;
                    });

                    response.on('end', () => resolve(data));
                });
            })
            .then(body => {
                const parser   = new parse5.Parser();
                const document = parser.parse(body);

                this.parsedDocs[pageUrl] = document;
                return document;
            });
    }

    _isHashValid (link) {
        const parsedLink   = url.parse(link);
        const hashlessLink = link.substring(0, link.indexOf('#'));

        if (this.checkedHashes[link])
            return Promise.resolve(this.checkedHashes[link]);

        return this._parsePage(hashlessLink)
            .then(tree => {
                let hash = parsedLink.hash.substr(1);

                // NOTE: The Travis Documentation website contains lower case
                // anchors in the markup but uppercases them using scripts
                // before displaying the page.
                // So, we expect a lower case anchor to appear in the markup.
                if (parsedLink.host === 'docs.travis-ci.com')
                    hash = hash.toLowerCase();

                let res = this._hasHash(tree, hash);

                // NOTE: GitHub renders headers in md documents with ids that
                // start with 'user-content-'.
                if (!res && parsedLink.host === 'github.com')
                    res = this._hasHash(tree, 'user-content-' + hash);

                this.checkedHashes[link] = res;
                return res;
            });
    }

    _outputBrokenLinks (pageUrl, links) {
        if (links.length) {
            util.log('URL: ' + pageUrl);
            util.log(util.colors.red('Broken links:'));

            links.forEach(link => util.log(util.colors.red(link)));

            util.log();
        }
    }

    // NOTE: Echoes the link if it is broken;
    // otherwise, resolves to null.
    _getBrokenLink (result) {
        return Promise.resolve()
            .then(() => {
                if (result.broken)
                    return result.url.resolved || result.url.original;

                const link       = result.url.resolved;
                const parsedLink = url.parse(link);

                if (parsedLink.hash) {
                    return this._isHashValid(link)
                        .then(isValid => isValid ? null : link);
                }

                return null;
            });
    }

    checkLinks () {
        return new Promise(resolve => {
            const pageTests = [];
            let linkTests   = [];

            const siteChecker = new blc.SiteChecker({ excludeLinksToSamePage: false, requestMethod: 'get' }, {
                link: result => linkTests.push(this._getBrokenLink(result)),

                page: (error, pageUrl) => {
                    pageTests.push(Promise
                        .all(linkTests)
                        .then(res => {
                            const brokenLinks = res.filter(value => !!value);

                            this._outputBrokenLinks(pageUrl, brokenLinks);
                            return brokenLinks.length;
                        }));
                },

                html: (tree, robots, response, pageUrl) => {
                    linkTests                = [];
                    this.parsedDocs[pageUrl] = tree;
                },

                end: () => {
                    Promise
                        .all(pageTests)
                        .then(res => {
                            const brokenLinksCount = res.reduce((acc, value) => acc + value);

                            resolve(!!brokenLinksCount);
                        });
                }
            });

            siteChecker.enqueue('http://localhost:8080/testcafe');
        });
    }
}

module.exports = WebsiteTester;
