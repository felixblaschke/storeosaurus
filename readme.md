# Storeosaurus

Super simple JSON store for [Deno](https://deno.land).

## Usage

- Use `import` to add `Store` class to your project
- `await` on `Store.open<TYPE>('myStoreName')`
- Use `write()` and `read()` methods of your store instance

```typescript
import {Store} from 'https://raw.githubusercontent.com/felixblaschke/storeosaurus/master/mod.ts';

interface Counter {
    value: number
}

const counter = await Store.open<Counter>('counter', {
    default: {value: 0}
});

await counter.write( data => data.value++);

await counter.read(data => {
    console.log("Counter: ", data.value);
})
```

See [examples](examples/) for more usages.
