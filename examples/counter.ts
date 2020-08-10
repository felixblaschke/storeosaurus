/**
 * Run example:
 * deno run --allow-read=. --allow-write=. https://raw.githubusercontent.com/felixblaschke/storeosaurus/master/examples/counter.ts
 */

import {Store} from '../mod.ts';

interface Counter {
    value: number
}

const counter = Store.open<Counter>({
    name: 'counter',
    default: {value: 0}
});

counter.set({value: counter.get().value + 1});

console.log('Counter: ', counter.get().value);
