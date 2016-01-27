import tagOrFunc from '../utils/tag-or-func';

export default class Globals {
    constructor (filename) {
        this.filename       = filename;
        this.currentFixture = null;
        this.collectedTests = [];

        this.globalFunctions = {
            'fixture': tagOrFunc(this._onFixture.bind(this)),
            'page':    tagOrFunc(this._onPage.bind(this)),
            'test':    this._onTest.bind(this)
        };
    }

    _onFixture (name) {
        this.currentFixture = {
            name: name,
            path: this.filename,
            page: 'about:blank'
        };
    }

    _onPage (url) {
        this.currentFixture.page = url;
    }

    _onTest (name, fn) {
        this.collectedTests.push({
            name:    name,
            fixture: this.currentFixture,
            fn:      fn
        });
    }

    setup () {
        Object.keys(this.globalFunctions).forEach(name => global[name] = this.globalFunctions[name]);
    }

    remove () {
        Object.keys(this.globalFunctions).forEach(name => delete global[name]);
    }
}

