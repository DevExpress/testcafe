export async function whilst (condition: () => boolean, iterator: () => Promise<unknown>): Promise<void> {
    while (condition())
        await iterator();
}

export async function times (n: number, iterator: (j: number) => Promise<unknown>): Promise<void> {
    for (let i = 0; i < n; i++)
        await iterator(i);
}
