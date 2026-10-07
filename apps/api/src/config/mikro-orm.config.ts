import path from 'path';
import { createHash } from 'crypto';
import 'reflect-metadata';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(import.meta.dirname, '../../../../.env') });

import { defineConfig } from '@mikro-orm/postgresql';
import { ReflectMetadataProvider } from '@mikro-orm/decorators/legacy';

// Importo las entidades para que el orm las mapee a la bd
import { User } from '../entities/usuario.js';
import { Evento } from '../entities/evento.js';
import { Categoria } from '../entities/categoria.js';
import { Servicio } from '../entities/servicio.js';
import { EventoCategoria } from '../entities/evento-categoria.js';
import { Tablero } from '../entities/tablero.js';
import { TableroServicio } from '../entities/tablero-servicio.js';
import { SUPABASE_CA } from './supabase-ca.js';

// Las variables sueltas tienen prioridad sobre el connection string: la
// contraseña del pooler suele llevar caracteres que hay que percent-encodear en
// una URL, y ese escapado mal hecho es indistinguible de una credencial inválida.
// POSTGRES_URL queda última porque las integraciones la inyectan apuntando a la
// conexión directa, que no resuelve por DNS desde Vercel.
const urlSource = process.env.DATABASE_URL
  ? 'DATABASE_URL'
  : process.env.POSTGRES_URL
    ? 'POSTGRES_URL'
    : null;

const clientUrl = process.env.DB_HOST ? undefined : (urlSource ? process.env[urlSource] : undefined);

// Describe la conexión sin revelar la contraseña. La huella es el prefijo de un
// SHA-256: sirve para comparar el valor local con el de Vercel sin transmitirlo.
const describe = () => {
  const fingerprint = (value?: string) =>
    value ? createHash('sha256').update(value).digest('hex').slice(0, 8) : null;

  const flags = (value?: string) =>
    value
      ? {
          length: value.length,
          fingerprint: fingerprint(value),
          hasSurroundingWhitespace: value !== value.trim(),
          looksLikePlaceholder: /\[|\]|YOUR-PASSWORD/i.test(value),
          needsUrlEncoding: /[@/:?#&%[\] ]/.test(value)
        }
      : null;

  if (clientUrl) {
    let parsed: URL | undefined;
    try {
      parsed = new URL(clientUrl);
    } catch {
      return { source: urlSource, parseError: 'El connection string no es una URL válida' };
    }

    return {
      source: urlSource,
      host: parsed.hostname,
      port: parsed.port || '5432',
      user: decodeURIComponent(parsed.username),
      dbName: parsed.pathname.replace(/^\//, ''),
      password: flags(decodeURIComponent(parsed.password)),
      rawPasswordWasEncoded: parsed.password !== decodeURIComponent(parsed.password)
    };
  }

  return {
    source: process.env.DB_HOST ? 'DB_* (variables sueltas)' : 'valores por defecto (localhost)',
    host: process.env.DB_HOST || '127.0.0.1',
    port: String(Number(process.env.DB_PORT) || 5432),
    user: process.env.DB_USER || 'postgres',
    dbName: process.env.DB_NAME || 'postgres',
    password: flags(process.env.DB_PASSWORD)
  };
};

export const connectionInfo = {
  ...describe(),
  sslMode: process.env.DB_SSL === 'false' ? 'off' : process.env.DB_SSL === 'no-verify' ? 'no-verify' : 'verify-ca',
  availableVars: {
    DATABASE_URL: Boolean(process.env.DATABASE_URL),
    POSTGRES_URL: Boolean(process.env.POSTGRES_URL),
    DB_HOST: Boolean(process.env.DB_HOST),
    DB_PASSWORD: Boolean(process.env.DB_PASSWORD)
  }
};

console.log('Conexión a la base:', JSON.stringify(connectionInfo));

// Supabase firma con su propia CA; el certificado viaja en el código para no
// depender de variables multilínea. DB_CA_CERT permite sobrescribirlo.
// DB_SSL=no-verify cifra pero no valida el certificado: sólo para depurar,
// porque habilita ataques de intermediario.
const resolveSsl = () => {
  if (process.env.DB_SSL === 'false') return false;

  if (process.env.DB_SSL === 'no-verify') {
    console.warn('DB_SSL=no-verify: el certificado del servidor no se valida');
    return { rejectUnauthorized: false };
  }

  return { ca: process.env.DB_CA_CERT || SUPABASE_CA, rejectUnauthorized: true };
};

export default defineConfig({

  ...(clientUrl
    ? { clientUrl }
    : {
        host: process.env.DB_HOST || '127.0.0.1',
        port: Number(process.env.DB_PORT) || 5432,
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || '',
        dbName: process.env.DB_NAME || 'postgres'
      }),

  // driverOptions se pasa tal cual a pg: una clave "connection" la tomaría como
  // objeto Connection ya construido.
  driverOptions: {
    ssl: resolveSsl()
  },

  // Cada invocación serverless es un proceso efímero: mantener un pool grande
  // contra el pooler de Supabase sólo agota sus conexiones.
  pool: { min: 0, max: 2 },

  // El esquema se aplica con los scripts de migrations, no al conectar.
  ensureDatabase: false,

  entities: [  
    User,
    Evento,
    Categoria,
    Servicio,
    EventoCategoria,
    Tablero,
    TableroServicio
  ],

  metadataProvider: ReflectMetadataProvider,

  // El modo debug imprime cada query con sus parámetros: nunca en producción.
  debug: process.env.NODE_ENV !== 'production',

});