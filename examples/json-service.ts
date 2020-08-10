/**
 * Run example with:
 * deno run --allow-net --allow-read=. --allow-write=. https://raw.githubusercontent.com/felixblaschke/storeosaurus/master/examples/json-service.ts
 */

import {Application, Router, BodyJson} from 'https://deno.land/x/oak@v6.0.1/mod.ts';
import {oakCors} from 'https://deno.land/x/cors@v1.0.0/mod.ts';
import {Store} from '../mod.ts';

const getStore =  (name: string): Store<any> => {
    return  Store.open<any>({name,});
}


const router = new Router();
router
    .get('/', async (context) => {
        context.response.body = "JSON Service.\n\nYou can either GET '/STORENAME' to retrieve stored JSON. Or POST 'application/json' to '/STORENAME'."
    })
    .get('/:store', async (context) => {
        const storeName = context.params.store;
        if (storeName && /^[a-z]+$/ig.test(storeName)) {
            context.response.body = JSON.stringify(getStore(storeName).get().json);
        } else {
            context.response.body = "Illegal store name";
        }
    })
    .post('/:store', async (context) => {
        const storeName = context.params.store;
        const bodyJson: BodyJson = context.request.body({ type: 'json' });
        const json = await bodyJson.value;

        if (storeName && /^[a-z]+$/ig.test(storeName)) {
            console.log("access on store ", storeName)
            getStore(storeName).set({json})
            context.response.body = json;
        } else {
            context.response.body = "Illegal store name";
        }
    });

const app = new Application();
app.use(oakCors());
app.use(router.routes());

console.info(`JSON-Service listening at port: http://localhost:8080/`);
await app.listen({port: 8080});
