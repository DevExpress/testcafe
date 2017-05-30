declare var fixture: any;
declare var test: any;

function repeat (str: string, n: number = 7): string {
    return new Array(n + 1).join(str);
}

fixture `Flow`.page `https://example.com`;

test('test', async () => {
    return repeat('yo', 13);
});
