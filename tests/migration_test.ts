import {assertEquals, assert, cleanedRun, Store} from './test_deps.ts';


Deno.test('migration', async () => {
    await cleanedRun(async () => {
        const store1 = await Store.open<any>();

        assertEquals(store1.version, 1);

        store1.set({value: 42});

        // days later...

        interface NewModel {
            counter: number;
        }

        const store2 = await Store.open<NewModel>({
            version: 2,
            migrate: (oldData: any, oldVersion: number) => {
                if (oldVersion === 1) {
                    return {
                        counter: oldData.value
                    };
                } else {
                    throw Error('Can not migrate from unknown version');
                }
            }
        });

        assertEquals(store2.version, 2);
        assertEquals(store2.get(), {counter: 42});

    });
});


Deno.test('migration without function', async () => {
    await cleanedRun(async () => {
        const store1 = await Store.open<any>();

        assertEquals(store1.version, 1);
        store1.set({value: 42});

        // days later...

        const store2 = await Store.open<any>({
            version: 2,
        });

        assertEquals(store2.version, 2);
        assertEquals(store2.get(), {value: 42});
    });
});


Deno.test('migration function with same version', async () => {
    await cleanedRun(async () => {
        const store1 = await Store.open<any>({
            version: 2
        });

        store1.set({value: 42});

        // days later...

        const store2 = await Store.open<any>({
            version: 2,
            migrate: async () => {
                assert(false, 'migrate function should not be called');
            },
        });

        assertEquals(store2.get(), {value: 42});
    });
});

