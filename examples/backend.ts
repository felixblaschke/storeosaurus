/**
 * Run example with:
 * deno run --allow-net --allow-read=. --allow-write=. https://raw.githubusercontent.com/felixblaschke/storeosaurus/master/examples/backend.ts
 */

import {Application, Router} from 'https://deno.land/x/oak@v6.0.1/mod.ts';
import {oakCors} from 'https://deno.land/x/cors@v1.0.0/mod.ts';
import {Store} from '../mod.ts';

interface MyList {
    todos: string[]
}

const myList = await Store.open<MyList>({
    name: 'my-list',
    default: {todos: []}
});

const router = new Router();
router
    .get('/', async (context) => {
        context.response.body = await (await fetch('https://raw.githubusercontent.com/felixblaschke/storeosaurus/master/examples/backend.html')).text();
    })
    .get('/todo', async (context) => {
        await myList.read(data => context.response.body = data.todos);
    })
    .post('/todo', async (context) => {
        const body: { item: string } = await (await context.request.body({type: 'json'})).value;
        await myList.write(data => data.todos.push(body.item));
        context.response.body = 'ok';
    });

const app = new Application();
app.use(oakCors());
app.use(router.routes());

console.info(`CORS-enabled backend with persistence listening: http://localhost:8080/`);
await app.listen({port: 8080});
