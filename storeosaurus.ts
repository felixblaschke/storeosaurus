export class Store<T> {

    private data: T = {} as T;

    static async open<U>(options: StoreOptions<U> = {}) {
        return new Store<U>(options);
    }

    private constructor(private options: StoreOptions<T>) {
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
            const file = await Deno.readTextFile(this.storeFilePath);
            if (file) {
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
            } else {
                throw e;
            }
        }
    }

    private async writeToDisk() {
        await Deno.writeTextFile(this.storeFilePath, JSON.stringify({
            isStoreFile: true,
            type: 'v1',
            version: 1,
            data: this.data
        }));
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
