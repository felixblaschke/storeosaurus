export * from 'https://deno.land/std/testing/asserts.ts';
export {exists} from 'https://deno.land/std/fs/mod.ts';
export {Store, StoreOptions} from '../mod.ts';

export const cleanedRun = async (fn: () => Promise<void>) => {
    await removeAllStoreFilesInDirectory();
    await fn();
    await removeAllStoreFilesInDirectory();
};

const removeAllStoreFilesInDirectory = async () => {
    for await (const dirEntry of Deno.readDir('.')) {
        if (dirEntry.isFile && dirEntry.name.endsWith('store.json')) {
            await Deno.remove(`./${dirEntry.name}`);
        }
    }
};
