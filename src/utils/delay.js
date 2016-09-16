import Promise from 'pinkie';


export default function delay (ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
