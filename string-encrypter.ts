import {LZString} from './lz-string.js';

/**
 * Simple unsafe string encrypter. Don't use it for security relevant application. It just meant for obfuscation .
 */
export class StringEncrypter {
    constructor(private token: string) {
    }

    encode = (text: string): string => {
        const arr = new TextEncoder().encode(text);
        const tokenArr = new TextEncoder().encode(this.token);
        const tokenSum = tokenArr.reduce((a, b) => a + b) % 1000000;

        const newArr = arr.map((value, index) => {
            return (value + tokenArr[index % tokenArr.length] * tokenSum) % 256;
        });

        return LZString.compressToBase64(newArr.join('-')) as string;
    };


    decode = (text: string): string => {
        const bytes = (LZString.decompressFromBase64(text) as string).split('-').map(s => parseInt(s));
        const arr = new Uint8Array(bytes);
        const tokenArr = new TextEncoder().encode(this.token);
        const tokenSum = tokenArr.reduce((a, b) => a + b) % 1000000;

        const newArr = arr.map((value, index) => {
            return (value - tokenArr[index % tokenArr.length] * tokenSum) % 256;
        });

        return new TextDecoder().decode(newArr);
    };
}

