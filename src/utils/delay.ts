import Promise from 'pinkie';


export default function delay (ms: number): Promise<void> {
    return new Promise(
        resolve => setTimeout(resolve, ms)
    );
}
