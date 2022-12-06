import { pool } from "../index";
import { CheckParams } from "../utils";
import { CheckSessionToken } from "../utils";
import express  from "express";
import { QueryResult } from "pg";

export const router = express.Router();
router.post("/enigma", async (req, res) => {
    try
    {
        if (!CheckParams(req.body, ["session_token", "enigma_title", "start_date", "end_date"]))
        {
            return res.status(400).json({ message: "Missing parameters" });
        }

        const { session_token, enigma_title, start_date, end_date } = req.body;
        
        const user: any = CheckSessionToken(session_token);
        if (user)
        {
            // Get number of enigmas
            const enigmas: QueryResult = await pool.query("SELECT * FROM enigma WHERE owner_id = $1;", [user.id]);
            
            if (enigmas.rowCount >= 10)
            {
                if (false) // User is not premium
                {
                    return res.status(400).json({ message: "You can't create more than 10 enigmas" });
                }
            }
            const query_res: QueryResult = await pool.query("INSERT INTO enigma (id, owner_id, title, start_date, end_date) VALUES (DEFAULT, $1, $2, $3, $4) RETURNING id;", [user.id, enigma_title, start_date, end_date]);
            res.status(200).json({ message: "Enigma created successfully", enigma_id: query_res.rows[0].id });
        }
        else
        {
            return res.status(400).json({ message: "Session token expired" });
        }
    }
    catch (error: any)
    {
        return res.status(400).json({ msg: error.message });
    }
});

router.put("/enigma/:id", async (req, res) => {
    try
    {
        if (!CheckParams(req.body, ["session_token"]))
        {
            return res.status(400).json({ message: "Missing parameters" });
        }

        const { session_token, title, description, start_date, end_date } = req.body;
        const user: any = CheckSessionToken(session_token);

        // Check if modyfing enigma is owned by user
        const enigma: QueryResult = await pool.query("SELECT owner_id FROM enigma WHERE id = $1;", [req.params.id]);
        if (enigma.rowCount === 0)
        {
            return res.status(400).json({ message: "Enigma doesn't exist" });
        }
        if (enigma.rows[0].owner_id !== user.id)
        {
            return res.status(400).json({ message: "You don't have access to this enigma" });
        }

        // Update enigma
        await pool.query(`
            UPDATE enigma
            SET
                title = CASE WHEN $1::varchar(255) IS NOT NULL THEN $1 ELSE title END,
                description = CASE WHEN $2::text IS NOT NULL THEN $2 ELSE description END,
                start_date = CASE WHEN $3::date IS NOT NULL THEN $3 ELSE start_date END,
                end_date = CASE WHEN $4::date IS NOT NULL THEN $4 ELSE end_date END
            WHERE id = $5;
        `, [title ?? null, description ?? null, start_date ?? null, end_date ?? null, req.params.id]);
        res.status(200).json({ message: "Enigma updated successfully" });
    }
    catch (error: any)
    {
        return res.status(400).json({ msg: error.message });
    }
});
