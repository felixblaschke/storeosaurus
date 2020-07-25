/**
 * Run example:
 * deno run --allow-read=. --allow-write=. https://raw.githubusercontent.com/felixblaschke/store-o-saurus/master/examples/counter.ts
 */

import {Store} from 'https://raw.githubusercontent.com/felixblaschke/store-o-saurus/master/mod.ts';

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
