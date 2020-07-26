import {assertEquals, assertThrowsAsync, cleanedRun, exists, Store} from './test_deps.ts';

const testData = {
    name: 'John',
    surname: 'Doe',
    age: 42,
    children: [
        'Peter', 'Jill', 'Mary'
    ],
    job: 'Freelancer'
};

Deno.test('encrypted store', async () => {
    await cleanedRun(async () => {
        const store1 = await Store.open<any>({
            encrypt: 'secret-passphrase'
        });
        await store1.write(data => data.person = testData);

        assertEquals(await exists('store.json'), true);
        const file = await Deno.readTextFile('store.json');
        assertEquals(file.includes('John'), false);
        assertEquals(file.includes('Doe'), false);
        assertEquals(file.includes('Peter'), false);
        assertEquals(file.includes('Jill'), false);
        assertEquals(file.includes('Mary'), false);

        const store2 = await Store.open<any>({
            encrypt: 'secret-passphrase'
        });
        await store2.read(data => assertEquals(data.person, testData));

        const store3 = await Store.open<any>({
            encrypt: 'invalid-passphrase'
        });
        assertThrowsAsync(async () => await store3.read(() => null), Error, 'Can not decrypt the storage file. Maybe you are using the wrong passphrase token?');

    });
});
