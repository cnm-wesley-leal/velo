import { Kysely, PostgresDialect } from 'kysely'
import pg from 'pg'
import { Database } from './schema'
import path from 'path'
import dotenv from 'dotenv'

import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Carrega as variáveis de ambiente do .env na raiz do projeto
dotenv.config({ path: path.resolve(__dirname, '../../../.env') })

const dialect = new PostgresDialect({
  pool: new pg.Pool({
    user: 'postgres.vfcqdkntijdamxnktlue',
    password: '@Cnmti26*',
    host: 'aws-1-sa-east-1.pooler.supabase.com',
    port: 6543,
    database: 'postgres',
    max: 10,
  })
})

export const db = new Kysely<Database>({
  dialect,
})
