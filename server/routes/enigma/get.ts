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
                SELECT (e, ea.current_step_index, ea.completed, ea.created) FROM enigma e
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

router.get("/api/enigma/public", async (req, res) => {
    try
    {
        const enigmas: QueryResult = await pool.query("SELECT * FROM enigma WHERE public = true;");
        return res.status(200).json({ enigmas: enigmas.rows });
    }
    catch (error: any)
    {
        return res.status(400).json({ message: error.message });
    }
});

router.get("/api/enigma/:id", async (req, res) => {
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
            const request_res: QueryResult = await pool.query("SELECT * FROM enigma WHERE id = $1;", [req.params.id]);
            if (request_res.rowCount === 0)
            {
                return res.status(400).json({ message: "Enigma doesn't exist" });
            }

            const enigma: any = request_res.rows[0];

            // Check if user is owner of enigma or assigned to it
            let is_owner: boolean = false;
            const request_res2: QueryResult = await pool.query("SELECT * FROM enigma_assignment WHERE enigma_id = $1 AND user_id = $2;", [enigma.id, user.id]);
            if (request_res2.rowCount === 0)
            {
                const request_res3: QueryResult = await pool.query("SELECT * FROM enigma WHERE id = $1 AND owner_id = $2;", [enigma.id, user.id]);
                if (request_res3.rowCount === 0)
                {
                    // Remove description if not owner or assigned
                    delete enigma.description;
                    return res.status(200).json({ enigma: enigma });
                }
                is_owner = true;
                
            }

            // Get all enigma_steps
            const enigma_steps: QueryResult = await pool.query("SELECT * FROM enigma_step WHERE enigma_id = $1 ORDER BY index;", [enigma.id]);
            enigma.enigma_steps = enigma_steps.rows;

            if (!is_owner)
            {
                // Remove solution if not owner
                for (let i = 0; i < enigma.enigma_steps.length; i++)
                {
                    delete enigma.enigma_steps[i].solution;
                }
            }

            return res.status(200).json({ enigma: enigma });
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

router.get("/api/enigma/:id/attempts", async (req, res) => {
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
            // Check if user is owner of enigma
            const request_res: QueryResult = await pool.query("SELECT * FROM enigma WHERE id = $1 AND owner_id = $2;", [req.params.id, user.id]);
            if (request_res.rowCount === 0)
            {
                return res.status(400).json({ message: "Enigma doesn't exist or you are not the owner" });
            }

            const enigma: any = request_res.rows[0];

            // Get enigma_step_attempt related to enigma, also get email of user
            const enigma_step_attempts: QueryResult = await pool.query(`
                SELECT esa.*, u.email, es.index,
                CASE WHEN esa.attempt = es.solution THEN true ELSE false END AS success
                FROM enigma_step_attempt esa
                INNER JOIN users u ON esa.user_id = u.id
                INNER JOIN enigma_step es ON esa.enigma_step_id = es.id
                WHERE es.enigma_id = $1
                ORDER BY esa.created DESC;
            `, [enigma.id]);

            return res.status(200).json({ enigma_step_attempts: enigma_step_attempts.rows });
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

router.get("/api/enigma/:id/my_attempts", async (req, res) => {
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
            // Check if user is assigned to enigma
            const request_res: QueryResult = await pool.query(`
                SELECT * FROM enigma_assignment ea
                INNER JOIN enigma e ON ea.enigma_id = e.id
                WHERE ea.user_id = $1 AND e.id = $2;
            `, [user.id, req.params.id]);
            if (request_res.rowCount === 0)
            {
                return res.status(400).json({ message: "Enigma doesn't exist or you are not assigned to it" });
            }

            const enigma: any = request_res.rows[0];

            // Get enigma_step_attempt related to enigma, also get email of user
            const enigma_step_attempts: QueryResult = await pool.query(`
                SELECT esa.*, es.index,
                CASE WHEN esa.attempt = es.solution THEN true ELSE false END AS success
                FROM enigma_step_attempt esa
                INNER JOIN users u ON esa.user_id = u.id
                INNER JOIN enigma_step es ON esa.enigma_step_id = es.id
                WHERE es.enigma_id = $1 AND esa.user_id = $2
                ORDER BY esa.created DESC;
            `, [enigma.id, user.id]);

            return res.status(200).json({ enigma_step_attempts: enigma_step_attempts.rows });
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

router.get("/api/enigma/:id/users", async (req, res) => {
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
            // Get all users assigned to enigma
            const request_res: QueryResult = await pool.query(`
                SELECT u.email, ea.*
                FROM enigma_assignment ea
                INNER JOIN users u ON ea.user_id = u.id
                WHERE ea.enigma_id = $1
                ORDER BY ea.created DESC;
            `, [req.params.id]);

            return res.status(200).json({ users: request_res.rows });
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