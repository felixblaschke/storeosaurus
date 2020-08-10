import {assertEquals, cleanedRun, exists, Store, StoreOptions} from './test_deps.ts';


Deno.test('default store read / write', async () => {
    await cleanedRun(async () => {
        const store1 = Store.open<any>();
        assertEquals(store1.get(), {})

        store1.set({name: 'John'});

        assertEquals(store1.storeFilePath, 'store.json');
        assertEquals(await exists('store.json'), true);

        assertEquals(store1.get(), {name: 'John'})

        const store2 = Store.open<any>();
        assertEquals(store2.get(), {name: 'John'})
    });
});


Deno.test('concurrent access 1', async () => {
    await cleanedRun(async () => {
        const store1 = await Store.open<any>();
        const store2 = await Store.open<any>();

        store1.set({propA: 'First'});
        assertEquals(store2.get().propA, "First");
        store2.set({
            ...store2.get(),
            propB: 'Second'
        });

        assertEquals(store1.get(), {propA: 'First', propB: 'Second'});
        assertEquals(store2.get(), {propA: 'First', propB: 'Second'});
    });
});


Deno.test('concurrent access 2', async () => {
    for (let n = 0; n < 10; n++) {
        await cleanedRun(async () => {
            interface Counter {
                count: number
            }

            const options: StoreOptions<Counter> = {
                default: {count: 0}
            };
            const store1 = await Store.open<Counter>(options);
            const store2 = await Store.open<Counter>(options);

            for (let i = 1; i <= 100; i++) {
                const randomStoreWrite = Math.random() < 0.5 ? store1 : store2;
                const randomStoreRead = Math.random() < 0.5 ? store1 : store2;
                randomStoreWrite.set({count: randomStoreWrite.get().count + 1});
                assertEquals(randomStoreRead.get().count, i);
            }

            assertEquals(store1.get(), {count: 100});
            assertEquals(store2.get(), {count: 100});
        });
    }
});


Deno.test('store file names', async () => {
    await cleanedRun(async () => {
        const store1 = Store.open();
        assertEquals(store1.storeFilePath, 'store.json');
        store1.set(true);
        assertEquals(await exists('store.json'), true);

        const store2 = Store.open({name: 'counter'});
        assertEquals(store2.storeFilePath, 'counter.store.json');
        store2.set(true);
        assertEquals(await exists('counter.store.json'), true);

        const store3 = Store.open({filePath: 'custom-file.any.store.json'});
        assertEquals(store3.storeFilePath, 'custom-file.any.store.json');
        store3.set(true);
        assertEquals(await exists('custom-file.any.store.json'), true);


        const store4 = Store.open({name: 'books', filePath: 'custom-book-file.store.json'});
        assertEquals(store4.storeFilePath, 'custom-book-file.store.json');
        store4.set(true);
        assertEquals(await exists('custom-book-file.store.json'), true);
        assertEquals(await exists('books.store.json'), false);
    });
});


Deno.test('default values options', async () => {
    await cleanedRun(async () => {
        const store1 = Store.open<any>();
        assertEquals(store1.get(), {});

        const store2 = Store.open<any>({
            default: {
                name: 'John',
                array: [1, 2, 3],
                object: {
                    foo: 'bar'
                }
            }
        });
        assertEquals(store2.get(), {
            name: 'John',
            array: [1, 2, 3],
            object: {
                foo: 'bar'
            }
        });
    });
});
