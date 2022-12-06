import { Pool } from 'pg';
import express from 'express';
import * as Routes from './routes';

require('dotenv').config();

export const pool = new Pool({
    user: process.env.PGUSER,
    host: process.env.PGHOST,
    database: process.env.PGDATABASE,
    password: process.env.PGPASSWORD,
    port: Number(process.env.PGPORT)
});
 
const app = express();
app.use(express.json());
app.use(Routes.users_routes);
app.use(Routes.enigma_routes);

app.listen(3000, () => {
    console.log('Server started on port 3000');
});