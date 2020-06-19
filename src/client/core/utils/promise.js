export async function whilst (condition, iterator) {
    while (condition())
        await iterator();
}

export async function times (n, iterator) {
    for (let i = 0; i < n; i++)
        await iterator(i);
}

export async function each (items, iterator) {
    for (const item of items)
        await iterator(item);
}
