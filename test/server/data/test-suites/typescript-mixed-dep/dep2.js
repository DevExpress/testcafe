async function dep2 (num) {
    for (let i = 1; i < 4; i++)
          num += i;

    return await num;
}

export default dep2;
