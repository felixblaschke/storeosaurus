import {StringEncrypter} from './string-encrypter.ts';

/**
 * JSON store implementation.
 * See: https://github.com/felixblaschke/storeosaurus
 */
export class Store<T> {

    private data?: T;
    private readonly encrypter?: StringEncrypter;


    /**
     * Opens a store.
     */
    static async open<U>(options: StoreOptions<U> = {}) {
        return new Store<U>(options);
    }

    private constructor(private options: StoreOptions<T>) {
        if (options.lazyWrite) {
            options.lazyRead = true;
        }
        if (options.encrypt) {
            this.encrypter = new StringEncrypter(options.encrypt);
        }
    }

    /**
     * Reads data from the store
     */
    async read(fn?: (data: T) => any): Promise<T> {
        await this.loadJsonFromDisk();
        if (this.data) {
            if (fn) {
                const result = fn(this.data);
                if (result instanceof Promise) {
                    await result;
                }
            }
            return this.data;
        }
        throw new Error('Could not access data. Something went wrong while loading.');
    }

    /**
     * Writes data to the store.
     */
    async write(fn: (data: T) => any): Promise<void> {
        await this.loadJsonFromDisk();
        if (this.data) {
            const result = fn(this.data);
            if (result instanceof Promise) {
                await result;
            }
            await this.writeToDisk();
        } else {
            throw new Error('Could not access data. Something went wrong while loading.');
        }
    }

    private async loadJsonFromDisk(force = false): Promise<void> {
        if (!force && this.options.lazyRead === true && this.data) {
            return;
        }

        try {
            let file: string;
            if (this.encrypter) {
                file = this.encrypter.decode(await Deno.readFile(this.storeFilePath));
            } else {
                file = await Deno.readTextFile(this.storeFilePath);
            }

            const document = JSON.parse(file) as any;
            if (document.isStoreFile && document.type === 'v1') {



                if (document.version < this.version && this.options.migrate) {
                    this.data = await this.options.migrate(document.data, document.version);
                    await this.writeToDisk(true);
                } else {
                    this.data = document.data;
                }


            } else {
                // noinspection ExceptionCaughtLocallyJS
                throw new Error('Invalid file format');
            }
        } catch (e) {
            if (e instanceof Deno.errors.NotFound) {
                this.data = this.options?.default || {} as T;
            } else if (this.encrypter && e instanceof SyntaxError) {
                throw Error('Can not decrypt the storage file. Maybe you are using the wrong passphrase token?');
            } else {
                throw e;
            }
        }
    }

    private async writeToDisk(force = false): Promise<void> {
        if (!force && this.options.lazyWrite) {
            return;
        }

        let file = JSON.stringify({
            isStoreFile: true,
            type: 'v1',
            version: this.version,
            data: this.data
        });

        if (this.encrypter) {
            await Deno.writeFile(this.storeFilePath, this.encrypter.encode(file));
        } else {
            await Deno.writeTextFile(this.storeFilePath, file);
        }
    }

    /**
     * Returns the path of the store file.
     */
    get storeFilePath(): string {
        if (!this.options?.name && !this.options?.filePath) {
            return 'store.json';
        }

        return this.options?.filePath || `${this.options?.name?.toLowerCase()}.store.json`;
    }

    /**
     * Returns the version of the store
     */
    get version(): number {
        return this.options.version || 1;
    }

    /**
     * Forces the store to reload it's data from the store file.
     * This is only useful when using lazyRead option.
     */
    async reload(): Promise<void> {
        await this.loadJsonFromDisk(true);
    }

    /**
     * Flushes all data to the store file.
     * This is only useful when using lazyWrite option.
     */
    async sync() {
        await this.writeToDisk(true);
    }
}

export interface StoreOptions<T> {
    /**
     * Store name
     */
    name?: string;

    /**
     * Default value when the store is created for the first time
     */
    default?: T;

    /**
     * Custom file path for the store file
     */
    filePath?: string;

    /**
     * If set, the store will encrypt the data based on the string given
     */
    encrypt?: string;

    /**
     * If set to true, the store will not reload the store file for each read.
     * You can trigger that manually by calling [reload].
     */
    lazyRead?: boolean;

    /**
     * If set to true, the store will not automatically synchronize with the store file
     * on each write. You need to manually call [sync] to synchronize.
     */
    lazyWrite?: boolean;

    /**
     * Number representing the iteration of your store data.
     * Used for the migration process. Defaults to `1`.
     */
    version?: number;

    /**
     * Migration function that is called whenever the stored version is lower then the current version.
     * Inside the function you need to return an updated variant of the data model.
     * The stored data's version is passed in by argument `oldVersion`.
     */
    migrate?: (oldData: any, oldVersion: number) => Promise<T>;
}
