async function dep1(num: number) {
    for (var i = 1; i < 4; i++)
        num += i;

    return await num;
}

export default dep1;
