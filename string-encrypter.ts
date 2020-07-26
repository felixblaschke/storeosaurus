import {LZString} from './lz-string.js';

/**
 * Simple unsafe string encrypter. Don't use it for security relevant application. It just meant for obfuscation .
 */
export class StringEncrypter {
    constructor(private token: string) {
    }

    encode = (text: string): Uint8Array => {
        const arr = new TextEncoder().encode(text);
        const tokenArr = new TextEncoder().encode(this.token);
        const tokenSum = tokenArr.reduce((a, b) => a + b) % 1000000;

        const newArr = arr.map((value, index) => {
            return (value + tokenArr[index % tokenArr.length] * tokenSum) % 256;
        });

        return newArr;
    };


    decode = (arr: Uint8Array): string => {
        const tokenArr = new TextEncoder().encode(this.token);
        const tokenSum = tokenArr.reduce((a, b) => a + b) % 1000000;

        const newArr = arr.map((value, index) => {
            return (value - tokenArr[index % tokenArr.length] * tokenSum) % 256;
        });

        return new TextDecoder().decode(newArr);
    };
}

