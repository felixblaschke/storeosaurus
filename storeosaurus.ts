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
    static open<U>(options: StoreOptions<U> = {}) {
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
    get(): T {
        this.loadJsonFromDisk();
        return this.data as T;
    }

    /**
     * Writes data to the store.
     */
    set(data: T): void {
        this.loadJsonFromDisk();
        this.data = data;
        this.writeToDisk();
    }

    private loadJsonFromDisk(force = false): void {
        if (!force && this.options.lazyRead === true && this.data) {
            return;
        }

        try {
            let file: string;
            if (this.encrypter) {
                file = this.encrypter.decode(Deno.readFileSync(this.storeFilePath));
            } else {
                file = Deno.readTextFileSync(this.storeFilePath);
            }

            const document = JSON.parse(file) as any;
            if (document.isStoreFile && document.type === 'v1') {


                if (document.version < this.version && this.options.migrate) {
                    this.data = this.options.migrate(document.data, document.version);
                    this.writeToDisk(true);
                } else {
                    this.data = document.data;
                }


            } else {
                // noinspection ExceptionCaughtLocallyJS
                throw new Error('Invalid file format');
            }
        } catch (e) {
            if (e instanceof Deno.errors.NotFound) {
                this.data = this.options?.default as T;
            } else if (this.encrypter && e instanceof SyntaxError) {
                throw Error('Can not decrypt the storage file. Maybe you are using the wrong passphrase token?');
            } else {
                throw e;
            }
        }
    }

    private writeToDisk(force = false): void {
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
            Deno.writeFileSync(this.storeFilePath, this.encrypter.encode(file));
        } else {
            Deno.writeTextFileSync(this.storeFilePath, file);
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
    reload(): void {
        this.loadJsonFromDisk(true);
    }

    /**
     * Flushes all data to the store file.
     * This is only useful when using lazyWrite option.
     */
    sync(): void {
        this.writeToDisk(true);
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
    migrate?: (oldData: any, oldVersion: number) => T;
}
