import {assertEquals, cleanedRun, Store} from './test_deps.ts';


Deno.test('lazy read store', async () => {
    await cleanedRun(async () => {
        const store1 = Store.open<any>({lazyRead: true});

        store1.set({name: 'John'});

        const store2 = Store.open<any>({lazyRead: true});
        assertEquals(store2.get(), {name: 'John'});

        store2.set({
            ...store2.get(),
            age: 42
        });
        assertEquals(store2.get(), {name: 'John', age: 42});

        assertEquals(store1.get(), {name: 'John'});

        store1.reload();
        assertEquals(store1.get(), {name: 'John', age: 42});
    });
});


Deno.test('lazy write store', async () => {
    await cleanedRun(async () => {
        const store1 = Store.open<any>({lazyWrite: true});
        store1.set({name: 'John'});
        assertEquals(store1.get(), {name: 'John'});

        const store2 = await Store.open<any>();
        assertEquals(store2.get(), undefined);

        store1.sync()

        assertEquals(store2.get(), {name: 'John'});
    });
});
