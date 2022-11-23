module.exports = {
    customActions: {
        async makeSomething () {
           await this.click();
        },
        async doSomething () {
            await this.custom.makeSomething();
        },
        fake: 'some fake data'
    }
}
