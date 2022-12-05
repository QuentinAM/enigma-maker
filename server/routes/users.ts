import { pool } from "../index";
import express  from "express";

export const router = express.Router();

router.get("/users", async (req, res) => {
    try
    {
        const users = await pool.query("SELECT * FROM users;");
        res.json(users.rows);
    }
    catch (error: any)
    {
        console.error(error.message);
    }
});

router.post("/users", async (req, res) => {
    try
    {
        const { email, password } = req.body;
        const newUser = await pool.query("INSERT INTO users (id, email, password) VALUES (DEFAULT, $1, $2);", [email, password]);
        res.json(newUser.rows[0]);
    }
    catch (error: any)
    {
        console.error(error.message);
    }
});