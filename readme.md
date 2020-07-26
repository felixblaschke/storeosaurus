# Storeosaurus

Super simple JSON store for [Deno](https://deno.land).

Features:

- Fully **test-covered** and **type-safe**
- **Synchronous** file system access by default
- Supports **encryption** of store file

## Usage

```ts
import {Store} from 'https://raw.githubusercontent.com/felixblaschke/storeosaurus/master/mod.ts';

interface Counter {
    value: number
}

const counter = await Store.open<Counter>({
    name: 'counter',
    default: {value: 0}
});

await counter.write(data => data.value++);

await counter.read(data => {
    console.log('Counter: ', data.value);
});
```

Examples:

- [Counter](examples/counter.ts)
- [CORS-enabled Backend Service](examples/backend.ts)
- [Encrypted diary](examples/encryption.ts)
- [Encrypted diary with lazy writing](examples/lazy.ts)

### API

#### open()

Use the static method `Store.open()` to open a store. If it doesn't exist yet, it creates one for you.

```ts
const store = await Store.open<TypeOfStoreData>(options)
```

If you don't want to work type-safe you can specify `any`:

```ts
const untypedStore = await Store.open<any>(options)
```

**Available options are**

| Option | Type | Description |
| - | - | - |
| `name` | string | Name of the store. The store file name is derived from it. A store called `books` will create `books.store.json` |
| `filePath` | string | Custom path to the store file in case giving it a name isn't enough, e.g. `/tmp/my-file.json` |
| `default` | TypeOfStoreData | When creating the store for the first time, it's initialized with this value. If `default` is not defined, it's an empty object.
| `encrypt` | string | If set, encrypts the store file using the value of `encrypt` as a password. The encryption is not very strong. Don't rely on it. |
| `lazyRead` | boolean | If set to `true`, the store will not reload the store file on each read and write. This can lead to data corruption if two instances of `Store` access the same store file. You can manually trigger a reload by calling `reload()`. |
| `lazyWrite` | boolean | If set to `true`, the store will not synchronize to disk after a write. You need to manually trigger the synchronization by calling `sync()`. Enabling `lazyWrite` will also enable `lazyRead`. |
| `version` | number | Number representing the iteration of your store data. It's used for migration. The default value is `1`.|
| `migrate` | Function | The migrate function is used to upgrade your store's data model as your application grows. Read the topic [Migration](#migration) below. |

If no `name` or `filePath` is specified the store file will be `store.json`.

---

#### write()

Use `write()` to modify the data in your store by supplying a function. This function gets the store data passed as argument.

```ts
await store.write(data => data.myValue = 42);

// or asynchronously:

await store.write(async (data) => {
    data.myValue = await valueFromPromiseFn();
});
```
---

#### read()

Use `read()` to access data in your store by awaiting the Promise. Alternatively you can supply a function. This function gets the store data passed as argument.

```ts
console.log((await store.read()).myValue);

// or by function:

await store.read(data => console.log(data.myValue));

// or asynchronously:

await store.read(async (data) => {
    await doAsyncFn(data.myValue);
});
```

---

#### reload()

Use `reload()` to force the store to reload all data from the store file. This only makes sense when working with lazy options.

---

#### sync()

Use `sync()` to flush all unsychronized data from the `Store` instance to the store file. This only makes sense when working with lazy options.


### Migration

Over the time the data model of your store might change. Therefor you can increase the `version` number in options. This `version` is `1` by default. Whenever a `Store` loads a store file with a version lower then the current, it trys to call the migrate function. This function can be defined in the options.

```ts
const store = await Store.open({
    version: 2,
    migrate: async (oldData, oldVersion) => {
        return {
            books: oldData.bookEntries
        }
    }
})
```

You can use the `oldVersion` to handle different generations of data models.