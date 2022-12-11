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

router.get("/api/enigma/:id/leadboard", async (req, res) => {
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

            const leadboard: QueryResult = await pool.query(`
                SELECT u.email, ea.*
                FROM enigma_assignment ea
                INNER JOIN users u ON ea.user_id = u.id
                WHERE ea.enigma_id = $1
                ORDER BY ea.completed ASC, ea.current_step_index DESC;
            `, [req.params.id]);
        
            return res.status(200).json({ leadboard: leadboard.rows });
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

// router.get("/api/enigma/:id/my_attempts/:step_id", async (req, res) => {
//     try
//     {
//         // Check in headers
//         const session_token: string = req.headers.session_token as string;

//         if (!session_token)
//         {
//             return res.status(400).json({ message: "Missing session token" });
//         }

//         const user: any = CheckSessionToken(session_token);
//         if (user)
//         {
//             // Check if user is assigned to enigma
//             const { id, step_id } = req.params;
//             const request_res: QueryResult = await pool.query(`
//                 SELECT * FROM enigma_assignment ea
//                 INNER JOIN enigma e ON ea.enigma_id = e.id
//                 WHERE ea.user_id = $1 AND e.id = $2;
//             `, [user.id, id]);
//             if (request_res.rowCount === 0)
//             {
//                 return res.status(400).json({ message: "Enigma doesn't exist or you are not assigned to it" });
//             }

//             // Get enigma_step_attempt related to enigma
//             const enigma_step_attempts: QueryResult = await pool.query(`
//                 SELECT * FROM enigma_step_attempt esa
//                 WHERE esa.enigma_step_id = $1 AND esa.user_id = $2;
//             `, [step_id, user.id]);

//             return res.status(200).json({ enigma_step_attempts: enigma_step_attempts.rows });
//         }
//         else
//         {
//             return res.status(400).json({ message: "Invalid session token" });
//         }
//     }
//     catch (error: any)
//     {
//         return res.status(400).json({ message: error.message });
//     }
// });