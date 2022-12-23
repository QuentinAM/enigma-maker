import { Pool } from 'pg';
import express from 'express';
import * as Routes from './routes';
import { handler } from '../client/build/handler.js';


require('dotenv').config();

export const pool = new Pool({
    user: process.env.PGUSER,
    host: process.env.PGHOST,
    database: process.env.PGDATABASE,
    password: process.env.PGPASSWORD,
    port: Number(process.env.PGPORT)
});
 
export const app = express();
app.use(express.json());

// Add headers before the routes are defined
app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5173');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', '*');

    // Pass to next layer of middleware
    next();
});

app.use(Routes.users_routes);
app.use(Routes.enigma_routes);
app.use(Routes.enigma_get_routes);
app.use(Routes.enigma_step_routes);
app.use(Routes.enigma_step_attempt_routes);
app.use(handler);
app.listen(3000, () => {
    console.log('Server started on port 3000');
});