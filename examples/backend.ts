import {Application, Router, send} from 'https://deno.land/x/oak/mod.ts';
import {oakCors} from 'https://deno.land/x/cors/mod.ts';
import {Store} from '../store-o-saurus.ts';

interface MyList {
    todos: string[]
}

const myList = await Store.open<MyList>('my-list', {
    default: {todos: []}
});

const router = new Router();
router
    .get('/', async (context) => {
        await send(context, context.request.url.pathname, {
            root: `${Deno.cwd()}`,
            index: 'backend.html',
        });
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

console.info(`CORS-enabled backend with persistence listening on port 8080`);
await app.listen({port: 8080});
