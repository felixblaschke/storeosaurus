import {assertEquals, cleanedRun, Store} from './test_deps.ts';


Deno.test('lazy read store', async () => {
    await cleanedRun(async () => {
        const store1 = await Store.open<any>({lazyRead: true});

        await store1.write(data => data.name = 'John');

        const store2 = await Store.open<any>({lazyRead: true});
        assertEquals(await store2.read(), {name: 'John'});

        await store2.write(data => data.age = 42);
        assertEquals(await store2.read(), {name: 'John', age: 42});

        assertEquals(await store1.read(), {name: 'John'});

        await store1.reload();
        assertEquals(await store1.read(), {name: 'John', age: 42});
    });
});


Deno.test('lazy write store', async () => {
    await cleanedRun(async () => {
        const store1 = await Store.open<any>({lazyWrite: true});
        await store1.write(data => data.name = 'John');
        assertEquals(await store1.read(), {name: 'John'});

        const store2 = await Store.open<any>();
        assertEquals(await store2.read(), {});

        await store1.sync()

        assertEquals(await store2.read(), {name: 'John'});
    });
});
