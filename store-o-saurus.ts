export class Store<T> {

    private data: T = {} as T;

    static async open<U>(storeName: string = 'default', options: StoreOptions<U>) {
        const store = new Store<U>(storeName);

        if (options.default) {
            await store.applyDefault(options.default)
        }
        return store;
    }

    private constructor(private name: string) {
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
        await this.markDataDirty();
    }

    private async applyDefault(data: T) {
        await this.loadJsonFromDisk();

        Object.keys(data).forEach(key => {
            if ((this.data as any)[key] === undefined) {
                (this.data as any)[key] = (data as any)[key];
            }
        });
        await this.markDataDirty();
    }

    private async loadJsonFromDisk() {
        try {
            const file = await Deno.readTextFile(this.fileName());
            if (file) {
                this.data = JSON.parse(file) as T;
            }
        } catch (e) {
            if (e instanceof Deno.errors.NotFound) {
                // it's okay
            } else {
                throw e;
            }
        }
    }

    private async markDataDirty() {
        await Deno.writeTextFile(this.fileName(), JSON.stringify(this.data));
    }

    private fileName() {
        return `${this.name}.store.json`;
    }
}

interface StoreOptions<T> {
    default: T
}
