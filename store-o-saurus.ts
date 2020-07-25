export class Store<T> {

    private data: T = {} as T;

    static async open<T>(storeName: string = 'default') {
        return new Store<T>(storeName);
    }

    private constructor(private name: string) {
    }

    async read(readFunction: (data: T) => any) {
        await this.loadJsonFromDisk();
        const result = readFunction(this.data);
        if (result instanceof Promise) {
            await result;
        }
    }


    async write(writeFunction: (data: T) => any) {
        await this.loadJsonFromDisk();
        const result = writeFunction(this.data);
        if (result instanceof Promise) {
            await result;
        }
        await this.markDataDirty();
    }

    async assure(data: T) {
        await this.loadJsonFromDisk();

        Object.keys(data).forEach(key => {
            // @ts-ignore
            if (this.data[key] === undefined) {
                // @ts-ignore
                this.data[key] = data[key];
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
                // its okay
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
