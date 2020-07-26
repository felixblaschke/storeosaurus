/**
 * Run example:
 * deno run --allow-read=. --allow-write=. https://raw.githubusercontent.com/felixblaschke/storeosaurus/master/examples/lazy.ts
 */

import {Store} from '../mod.ts';

interface Diary {
    entries: string[]
}

const diary = await Store.open<Diary>({
    name: 'diary',
    encrypt: 'secret-phrase',
    lazyWrite: true, // <-- add lazy write mode
    default: {entries: []}
});

const lorem = () => 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam diam orci, ornare in auctor placerat, tincidunt porta est. Sed a justo accumsan, tempor nunc et, vulputate ligula. Maecenas nec egestas nunc. Suspendisse molestie erat nibh, eu fringilla ex finibus ac. Phasellus vulputate ac sapien non accumsan. Vivamus sollicitudin, nulla non gravida interdum, arcu arcu sodales risus, non tincidunt odio elit id felis. Fusce ac lacus eu urna bibendum sodales vitae auctor mi.';

for (let i = 0; i < 100; i++) {
    await diary.write(data => data.entries.push(lorem()));
}

await diary.read(data => {
    console.log(`Diary now has ${data.entries.length} entries`);
});

await diary.sync(); // <-- sync store to disk
