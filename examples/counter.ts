/**
 * Run example:
 * deno run --allow-read=. --allow-write=. https://raw.githubusercontent.com/felixblaschke/storeosaurus/master/examples/counter.ts
 */

import {Store} from '../mod.ts';

const counter = Store.open<number>({
    name: 'counter',
    default: 0
});

counter.set(counter.get() + 1);

console.log('Counter: ', counter.get());
