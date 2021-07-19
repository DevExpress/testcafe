export default async function <T> (arr: T[], predicate: (value: Readonly<T>, index: number, array: T[]) => unknown): Promise<T[]> {
    const results = await Promise.all(arr.map(predicate));

    return arr.filter((_, index) => results[index]);
}
