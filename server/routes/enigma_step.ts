import { pool } from "../index";
import { CheckParams } from "../utils";
import { CheckSessionToken } from "../utils";
import express  from "express";
import { QueryResult } from "pg";

export const router = express.Router();

router.post("/api/enigma/:id/step", async (req, res) => {
    try
    {
        const session_token: string = req.headers.session_token as string;
        if (!session_token)
        {
            return res.status(400).json({ message: "Missing session token" });
        }

        if (!CheckParams(req.body, ["index", "title"]))
        {
            return res.status(400).json({ message: "Missing parameters" });
        }

        const user: any = CheckSessionToken(session_token);
        if (user)
        {
            const enigma_id: string = req.params.id;
            const { index, title } = req.body;
         
            // Check if enigma exists and if it belongs to the user
            const enigma: QueryResult = await pool.query("SELECT * FROM enigma WHERE id = $1 AND owner_id = $2;", [enigma_id, user.id]);
            if (enigma.rowCount === 0)
            {
                return res.status(400).json({ message: "Enigma doesn't exist or doesn't belong to you" });
            }

            // Check if step already exists
            const step: QueryResult = await pool.query("SELECT * FROM enigma_step WHERE enigma_id = $1 AND index = $2;", [enigma_id, index]);
            if (step.rowCount !== 0)
            {
                return res.status(400).json({ message: "Step already exists" });
            }

            // Create step
            const new_step: QueryResult = await pool.query(`
                INSERT INTO enigma_step
                (id, enigma_id, index, title)
                VALUES (DEFAULT, $1, $2, $3)
                RETURNING *;
            `, [enigma_id, index, title]);
        
            return res.status(200).json({ step: new_step.rows[0] });
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

router.put("/api/enigma/:enigma_id/step/:step_id", async (req, res) => {
    try
    {
        const session_token: string = req.headers.session_token as string;
        if (!session_token)
        {
            return res.status(400).json({ message: "Missing session token" });
        }

        const user: any = CheckSessionToken(session_token);
        if (user)
        {
            const { enigma_id, step_id } = req.params;

            // Check if enigma exists and if it belongs to the user
            const enigma: QueryResult = await pool.query("SELECT * FROM enigma WHERE id = $1 AND owner_id = $2;", [enigma_id, user.id]);
            if (enigma.rowCount === 0)
            {
                return res.status(400).json({ message: "Enigma doesn't exist or doesn't belong to you" });
            }

            // Update step values if not null
            await pool.query(`
                UPDATE enigma_step
                SET
                    index = COALESCE($1, index),
                    title = COALESCE($2, title),
                    description = COALESCE($3, description),
                    attempt_limit = COALESCE($4, attempt_limit),
                    time_refresh = COALESCE($5, time_refresh),
                    solution = COALESCE($6, solution),
                    case_sensitive = COALESCE($7, case_sensitive)
                WHERE id = $8;
            `, [req.body.index ?? null, req.body.title ?? null, req.body.description ?? null, req.body.attempt_limit ?? null, req.body.time_refresh ?? null, req.body.solution ?? null, req.body.case_sensitive ?? null, step_id]);
            return res.status(200).json({  });
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

router.delete("/api/enigma/:enigma_id/step/:step_id", async (req, res) => {
    try
    {
        const session_token: string = req.headers.session_token as string;
        if (!session_token)
        {
            return res.status(400).json({ message: "Missing session token" });
        }

        const user: any = CheckSessionToken(session_token);
        if (user)
        {
            const { enigma_id, step_id } = req.params;

            // Check if enigma exists and if it belongs to the user
            const enigma: QueryResult = await pool.query("SELECT * FROM enigma WHERE id = $1 AND owner_id = $2;", [enigma_id, user.id]);
            if (enigma.rowCount === 0)
            {
                return res.status(400).json({ message: "Enigma doesn't exist or doesn't belong to you" });
            }

            // Delete step
            await pool.query("DELETE FROM enigma_step WHERE id = $1;", [step_id]);
            return res.status(200).json({  });
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