import { pool } from "../../index";
import { CheckSessionToken } from "../../utils";
import express  from "express";
import { QueryResult } from "pg";

export const router = express.Router();

router.get("/api/enigma/own", async (req, res) => {
    try
    {
        // Check in headers
        const session_token: string = req.headers.session_token as string;

        if (!session_token)
        {
            return res.status(400).json({ message: "Missing session token" });
        }

        const user: any = CheckSessionToken(session_token);
        if (user)
        {
            const enigmas: QueryResult = await pool.query("SELECT * FROM enigma WHERE owner_id = $1;", [user.id]);
            return res.status(200).json({ enigmas: enigmas.rows });
        }
        else
        {
            return res.status(400).json({ message: "Invalid session token" });
        }
    }
    catch (error: any)
    {
        return res.status(400).json({ message: error.message });
    }
});

router.get("/api/enigma/me", async (req, res) => {
    try
    {
        // Check in headers
        const session_token: string = req.headers.session_token as string;

        if (!session_token)
        {
            return res.status(400).json({ message: "Missing session token" });
        }

        const user: any = CheckSessionToken(session_token);
        if (user)
        {
            const enigmas: QueryResult = await pool.query(`
                SELECT * FROM enigma e
                INNER JOIN enigma_assignment ea ON e.id = ea.enigma_id
                WHERE ea.user_id = $1;
            `, [user.id]);
            return res.status(200).json({ enigmas: enigmas.rows });
        }
        else
        {
            return res.status(400).json({ message: "Invalid session token" });
        }
    }
    catch (error: any)
    {
        return res.status(400).json({ message: error.message });
    }
});

router.get("/api/enigma/:id", async (req, res) => {
    try
    {
        const request_res: QueryResult = await pool.query("SELECT * FROM enigma WHERE id = $1;", [req.params.id]);
        if (request_res.rowCount === 0)
        {
            return res.status(400).json({ message: "Enigma doesn't exist" });
        }

        const enigma: any = request_res.rows[0];

        // Get all enigma_steps
        const enigma_steps: QueryResult = await pool.query("SELECT * FROM enigma_step WHERE enigma_id = $1 ORDER BY index;", [enigma.id]);
        enigma.enigma_steps = enigma_steps.rows;

        return res.status(200).json({ enigma: enigma });
    }
    catch (error: any)
    {
        return res.status(400).json({ message: error.message });
    }
});