import 'testcafe';

fixture('Test');

test('Yo', async t => {
    await t.doSmthg();
});

test(123, async() => {
});

function sealed(constructor: Function) {
    Object.seal(constructor);
    Object.seal(constructor.prototype);
}

class Greeter {
    @sealed
    greeting: string;

    constructor(message: string) {
        this.greeting = message;
    }

    greet() {
        return "Hello, " + this.greeting;
    }
}
