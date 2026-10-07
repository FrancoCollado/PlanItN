import { MikroORM } from '@mikro-orm/postgresql';
import mikroOrmConfig from './mikro-orm.config.js';
let orm;
let ormPromise;
// En serverless cada instancia arranca en frío: la conexión se crea bajo demanda
// y se reintenta si falló, en vez de depender de un arranque previo.
export function initOrm() {
    ormPromise ??= MikroORM.init(mikroOrmConfig)
        .then((instance) => {
        orm = instance;
        return instance;
    })
        .catch((error) => {
        ormPromise = undefined;
        throw error;
    });
    return ormPromise;
}
export function setOrm(instance) {
    orm = instance; // Asigno la instancia de MikroORM a la variable global
}
export function getOrm() {
    if (!orm)
        throw new Error('El ORM todavía no está inicializado');
    return orm;
}
