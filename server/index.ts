import { Pool, QueryResult } from 'pg';

require('dotenv').config();

export const pool = new Pool({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: Number(process.env.PGPORT)
});
 
pool.query('SELECT * FROM test_table;', (err: Error, res: QueryResult<any>) => {
  console.log(res.rows);
});

pool.end();