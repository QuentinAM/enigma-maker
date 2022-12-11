import { pool } from "../../index";
import { CheckParams } from "../../utils";
import { CheckSessionToken } from "../../utils";
import express  from "express";
import { QueryResult } from "pg";

export const router = express.Router();

router.post("/api/enigma", async (req, res) => {
    try
    {
        const session_token: string = req.headers.session_token as string;
        if (!session_token)
        {
            return res.status(400).json({ message: "Missing session token" });
        }

        if (!CheckParams(req.body, ["enigma_title", "start_date", "end_date"]))
        {
            return res.status(400).json({ message: "Missing parameters" });
        }

        const { enigma_title, start_date, end_date } = req.body;
        
        const user: any = CheckSessionToken(session_token);
        if (user)
        {
            // Get number of enigmas
            const enigmas: QueryResult = await pool.query("SELECT * FROM enigma WHERE owner_id = $1;", [user.id]);
            
            if (enigmas.rowCount >= 5)
            {
                if (true) // User is not premium
                {
                    return res.status(400).json({ message: "You can't create more than 5 enigmas" });
                }
            }
            const query_res: QueryResult = await pool.query("INSERT INTO enigma (id, owner_id, title, start_date, end_date) VALUES (DEFAULT, $1, $2, $3, $4) RETURNING id;", [user.id, enigma_title, start_date, end_date]);
            return res.status(200).json({ enigma_id: query_res.rows[0].id });
        }
        else
        {
            return res.status(400).json({ message: "Session token expired" });
        }
    }
    catch (error: any)
    {
        return res.status(400).json({ message: error.message });
    }
});

router.put("/api/enigma/:id", async (req, res) => {
    try
    {
        const session_token: string = req.headers.session_token as string;
        if (!session_token)
        {
            return res.status(400).json({ message: "Missing session token" });
        }

        const { title, description, start_date, end_date, is_public } = req.body;
        const user: any = CheckSessionToken(session_token);

        if (user)
        {
            // Check if modyfing enigma is owned by user
            const enigma: QueryResult = await pool.query("SELECT * FROM enigma WHERE id = $1;", [req.params.id]);
            if (enigma.rowCount === 0)
            {
                return res.status(400).json({ message: "Enigma doesn't exist" });
            }
            if (enigma.rows[0].owner_id !== user.id)
            {
                return res.status(400).json({ message: "You don't have access to this enigma" });
            }

            // Check if enigma is already started
            if (enigma.rows[0].start_date < new Date())
            {
                return res.status(400).json({ message: "Enigma already started" });
            }

            // Update enigma
            await pool.query(`
                UPDATE enigma
                SET
                    title = COALESCE($1, title),
                    description = COALESCE($2, description),
                    start_date = COALESCE($3, start_date),
                    end_date = COALESCE($4, end_date),
                    public = COALESCE($5, public)
                WHERE id = $6;
            `, [title ?? null, description ?? null, start_date ?? null, end_date ?? null, is_public ?? null, req.params.id]);
            res.status(200).json({ });
        }
        else
        {
            return res.status(400).json({ message: "Session token expired" });
        }
    }
    catch (error: any)
    {
        return res.status(400).json({ message: error.message });
    }
});

router.delete("/api/enigma/:id", async (req, res) => {
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
            // Check if modyfing enigma is owned by user
            const enigma: QueryResult = await pool.query("SELECT owner_id FROM enigma WHERE id = $1 AND owner_id = $2;", [req.params.id, user.id]);
            if (enigma.rowCount === 0)
            {
                return res.status(400).json({ message: "Enigma doesn't exist or you don't have access to it" });
            }

            // Delete enigma
            await pool.query("DELETE FROM enigma WHERE id = $1;", [req.params.id]);
            return res.status(200).json({ });
        }
        else
        {
            return res.status(400).json({ message: "Session token expired" });
        }
    }
    catch (error: any)
    {
        return res.status(400).json({ message: error.message });
    }
});

router.post("/api/enigma/:id/assign", async (req, res) => {
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
            // Check if enigma exists
            const enigma: QueryResult = await pool.query("SELECT * FROM enigma WHERE id = $1;", [req.params.id]);
            if (enigma.rowCount === 0)
            {
                return res.status(400).json({ message: "Enigma doesn't exist" });
            }

            // Check user is already assigned to enigma
            const assignment: QueryResult = await pool.query("SELECT * FROM enigma_assignment WHERE enigma_id = $1 AND user_id = $2;", [req.params.id, user.id]);
            if (assignment.rowCount > 0)
            {
                return res.status(400).json({ message: "You are already assigned to this enigma" });
            }

            await pool.query(`
                INSERT INTO enigma_assignment (id, enigma_id, user_id)
                VALUES (DEFAULT, $1, $2);
            `, [req.params.id, user.id]);

            return res.status(200).json({ });
        }
        else
        {
            return res.status(400).json({ message: "Session token expired" });
        }
    }
    catch (error: any)
    {
        return res.status(400).json({ message: error.message });
    }
});