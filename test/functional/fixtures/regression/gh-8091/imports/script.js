export default async function testFunction () {
    try {
        await fetch('');
    }
    catch {
        return true;
    }

    return true;
}
