module.exports = {
    customActions: {
        async makeCoffee (selector) {
            await this
                .click(selector)
                .custom.makeTea('https://example.org', 'a');
        },
        async makeTea (url, selector) {
            await this
                .navigateTo(url)
                .click(selector);
        },
        async getSelectorValue () {
            return 'a';
        },
    },
};

