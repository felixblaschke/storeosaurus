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

Other examples:

- [Counter](examples/counter.ts)
- [CORS-enabled Backend Service](examples/backend.ts)
- [Encryption](examples/encryption.ts)

### API

#### open()

Use the static method `Store.open()` to open a store. If it doesn't exists yet, it creates one for you.

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
| `filePath` | string | Custom path to the store file in case giving it a name isn't enought, e.g. `/tmp/my-file.json` |
| `default` | TypeOfStoreData | When creating the store for the first time, this value is used. If `default` is not defined, it's an empty object.
| `encrypt` | string | If set, encrypts the store file using the value of `encrypt` as a password. The encryption is not very strong. Don't rely on it. But it's good for obfuscating the data. |


If no `name` or `filePath` is specified it will name the file `store.json`


#### write()

Use `write()` to modify the data in your store by supplying a function. This function gets the store data passed as argument:

```ts
await store.write(data => data.myValue = 42);

// or asynchronously:

await store.write(async (data) => {
    data.myValue = await valueFromPromiseFn();
});
```


#### read()

Use `read()` to access data in your store by supplying a function. This function gets the store data passed as argument:

```ts
await store.read(data => console.log(data.myValue));

// or asynchronously:

await store.read(async (data) => {
    await doAsyncFn(data.myValue);
});
```
