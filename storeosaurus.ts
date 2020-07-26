import {StringEncrypter} from './string-encrypter.ts';

export class Store<T> {

    private data: T = {} as T;
    private encrypter?: StringEncrypter;

    static async open<U>(options: StoreOptions<U> = {}) {
        return new Store<U>(options);
    }

    private constructor(private options: StoreOptions<T>) {
        if (options.encrypt) {
            this.encrypter = new StringEncrypter(options.encrypt);
        }
    }

    async read(fn: (data: T) => any) {
        await this.loadJsonFromDisk();
        const result = fn(this.data);
        if (result instanceof Promise) {
            await result;
        }
    }


    async write(fn: (data: T) => any) {
        await this.loadJsonFromDisk();
        const result = fn(this.data);
        if (result instanceof Promise) {
            await result;
        }
        await this.writeToDisk();
    }

    private async loadJsonFromDisk() {
        try {
            let file = await Deno.readTextFile(this.storeFilePath);
            if (file) {
                if (this.encrypter) {
                    file = this.encrypter.decode(file);
                }

                const document = JSON.parse(file) as any;
                if (document.isStoreFile && document.type === 'v1') {
                    this.data = document.data;
                } else {
                    // noinspection ExceptionCaughtLocallyJS
                    throw new Error('Invalid file format');
                }
            }
        } catch (e) {
            if (e instanceof Deno.errors.NotFound) {
                this.data = this.options?.default || {} as T;
            } else if (e instanceof SyntaxError) {
                throw Error("Can not decrypt the storage file. Maybe you are using the wrong passphrase token?")
            } else {
                throw e;
            }
        }
    }

    private async writeToDisk() {
        let file = JSON.stringify({
            isStoreFile: true,
            type: 'v1',
            version: 1,
            data: this.data
        });

        if (this.encrypter) {
            file = this.encrypter.encode(file);
        }

        await Deno.writeTextFile(this.storeFilePath, file);
    }

    get storeFilePath(): string {
        if (!this.options?.name && !this.options?.filePath) {
            return 'store.json';
        }

        return this.options?.filePath || `${this.options?.name?.toLowerCase()}.store.json`;
    }
}

export interface StoreOptions<T> {
    name?: string;
    default?: T;
    filePath?: string;
    encrypt?: string;
}
