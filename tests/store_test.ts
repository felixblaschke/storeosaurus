import {assertEquals, cleanedRun, exists, Store, StoreOptions} from './test_deps.ts';


Deno.test('default store read / write', async () => {
    await cleanedRun(async () => {
        const store1 = await Store.open<any>();
        await store1.read(data => assertEquals(data, {}));

        await store1.write(data => data.name = 'John');

        assertEquals(store1.storeFilePath, 'store.json');
        assertEquals(await exists('store.json'), true);

        await store1.read(data => assertEquals(data, {name: 'John'}));

        const store2 = await Store.open<any>();
        await store2.read(data => assertEquals(data, {name: 'John'}));
    });
});


Deno.test('concurrent access 1', async () => {
    await cleanedRun(async () => {
        const store1 = await Store.open<any>();
        const store2 = await Store.open<any>();

        await store1.write(data => data.propA = 'First');
        await store2.write(data => {
            assertEquals(data.propA, 'First');
            data.propB = 'Second';
        });

        await store1.read(data => assertEquals(data, {propA: 'First', propB: 'Second'}));
        await store2.read(data => assertEquals(data, {propA: 'First', propB: 'Second'}));
    });
});


Deno.test('concurrent access 2', async () => {
    for (let n = 0; n < 10; n++) {
        await cleanedRun(async () => {
            interface Counter {
                count: number
            };

            const options: StoreOptions<Counter> = {
                default: {count: 0}
            };
            const store1 = await Store.open<Counter>(options);
            const store2 = await Store.open<Counter>(options);

            for (let i = 1; i <= 100; i++) {
                const randomStoreWrite = Math.random() < 0.5 ? store1 : store2;
                const randomStoreRead = Math.random() < 0.5 ? store1 : store2;
                await randomStoreWrite.write(data => data.count++);
                await randomStoreRead.read(data => assertEquals(data.count, i));
            }

            await store1.read(data => assertEquals(data, {count: 100}));
            await store2.read(data => assertEquals(data, {count: 100}));
        });
    }
});


Deno.test('store file names', async () => {
    await cleanedRun(async () => {
        const store1 = await Store.open();
        assertEquals(store1.storeFilePath, 'store.json');
        await store1.write(() => null);
        assertEquals(await exists('store.json'), true);

        const store2 = await Store.open({name: 'counter'});
        assertEquals(store2.storeFilePath, 'counter.store.json');
        await store2.write(() => null);
        assertEquals(await exists('counter.store.json'), true);

        const store3 = await Store.open({filePath: 'custom-file.any.store.json'});
        assertEquals(store3.storeFilePath, 'custom-file.any.store.json');
        await store3.write(() => null);
        assertEquals(await exists('custom-file.any.store.json'), true);


        const store4 = await Store.open({name: 'books', filePath: 'custom-book-file.store.json'});
        assertEquals(store4.storeFilePath, 'custom-book-file.store.json');
        await store4.write(() => null);
        assertEquals(await exists('custom-book-file.store.json'), true);
        assertEquals(await exists('books.store.json'), false);


    });
});
