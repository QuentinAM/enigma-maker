import { pool } from "../index";
import { CheckParams, ParseDate, FormatDateUni, ToLocalDate, CheckSessionToken } from "../utils";
import express  from "express";
import { QueryResult } from "pg";

export const router = express.Router();

router.post("/api/enigma_step_attempt/:step_id", async (req, res) => {
    try
    {
        const session_token: string = req.headers.session_token as string;
        if (!session_token)
        {
            return res.status(400).json({ message: "Missing session token" });
        }

        if (!CheckParams(req.body, ["attempt"]))
        {
            return res.status(400).json({ message: "Missing parameters" });
        }

        const user: any = CheckSessionToken(session_token);
        if (user)
        {
            const step_id: string = req.params.step_id;
            const { attempt } = req.body;

            // Check if the step exists
            const step: QueryResult = await pool.query("SELECT * FROM enigma_step WHERE id = $1;", [step_id]);
            if (step.rowCount === 0)
            {
                return res.status(400).json({ message: "Step not found" });
            }

            // Check if user entered the enigma in enigma_assignment
            let enigma_assignment: QueryResult = await pool.query("SELECT * FROM enigma_assignment WHERE user_id = $1 AND enigma_id = $2;", [user.id, step.rows[0].enigma_id]);
            if (enigma_assignment.rowCount === 0)
            {
                return res.status(400).json({ message: "User not assigned to this enigma" });
            }

            // Check if the step is the next step
            const next_step: QueryResult = await pool.query("SELECT * FROM enigma_step WHERE enigma_id = $1 AND index = $2;", [step.rows[0].enigma_id, enigma_assignment.rows[0].current_step_index + 1]);
            if (next_step.rowCount === 0)
            {
                return res.status(400).json({ message: "Step not found" });
            }
            if (next_step.rows[0].id != step_id)
            {
                return res.status(400).json({ message: "Not the next step" });
            }

            // Check if enigma is on going  
            const enigma: QueryResult = await pool.query("SELECT * FROM enigma WHERE id = $1;", [step.rows[0].enigma_id]);
            if (enigma.rows[0].rowCount === 0)
            {
                return res.status(400).json({ message: "Enigma not found" });
            }

            if (ParseDate(enigma.rows[0].start_date) > new Date())
            {
                return res.status(400).json({ message: "Enigma not started yet" });
            }
            
            if (ParseDate(enigma.rows[0].end_date) < new Date())
            {
                return res.status(400).json({ message: "Enigma ended" });
            }

            // At this point we are sure we have the right step and the enigma is on going

            // Check if user can answer now by checking the time his previous attempt was made
            const now: Date = ToLocalDate(new Date());
            const last_attempt: QueryResult = await pool.query("SELECT * FROM enigma_step_attempt WHERE enigma_step_id = $1 AND user_id = $2 ORDER BY created DESC;", [step_id, user.id]);
            if (last_attempt.rowCount > 0)
            {
                // Check if the user can answer again by checking how much attempt he made
                if (last_attempt.rowCount >= step.rows[0].attempt_limit && step.rows[0].attempt_limit !== 0)
                {
                    return res.status(400).json({ message: "You can't answer again, you reached the attempt limit" });
                }

                const last_attempt_date: Date = ToLocalDate(new Date(last_attempt.rows[0].created));

                // Get diff in seconds
                const diff = now.getTime() - last_attempt_date.getTime();
                const seconds = Math.floor(diff / 1000);
                const time_left = step.rows[0].time_refresh - seconds;
                if (time_left > 0)
                {
                    return res.status(400).json({ message: `You can answer again in ${time_left} seconds` });
                }
            }

            // Add the attempt to the database
            const enigma_step_attempt: QueryResult = await pool.query("INSERT INTO enigma_step_attempt (id, enigma_step_id, user_id, attempt, created) VALUES (DEFAULT, $1, $2, $3, $4) RETURNING *;", [step_id, user.id, attempt, FormatDateUni(now)]);

            // Check if the attempt is correct
            const case_sensitive: boolean = step.rows[0].case_sensitive;
            if ((case_sensitive && attempt === step.rows[0].solution) || (!case_sensitive && attempt.toLowerCase() === step.rows[0].solution.toLowerCase()))
            {
                // Update the current step index
                enigma_assignment = await pool.query("UPDATE enigma_assignment SET current_step_index = $1 WHERE user_id = $2 AND enigma_id = $3 RETURNING *;", [enigma_assignment.rows[0].current_step_index + 1, user.id, step.rows[0].enigma_id]);

                // Check if the enigma is finished
                const next_step: QueryResult = await pool.query("SELECT * FROM enigma_step WHERE enigma_id = $1 AND index = $2;", [step.rows[0].enigma_id, enigma_assignment.rows[0].current_step_index + 1]);
                if (next_step.rowCount === 0)
                {
                    // Update the enigma assignment
                    const final_res: QueryResult = await pool.query("UPDATE enigma_assignment SET completed = true WHERE user_id = $1 AND enigma_id = $2 RETURNING *;", [user.id, step.rows[0].enigma_id]);

                    // We are done
                    return res.status(200).json({ res: final_res.rows[0], attempt: enigma_step_attempt.rows[0] });
                }
                else
                {   
                    // Go to the next step
                    return res.status(200).json({ res: enigma_assignment.rows[0], attempt: enigma_step_attempt.rows[0] });
                }
            }
            else
            {
                // Check if the user has more attempts
                const attempts: QueryResult = await pool.query("SELECT * FROM enigma_step_attempt WHERE enigma_step_id = $1 AND user_id = $2;", [step_id, user.id]);
                if (attempts.rowCount >= step.rows[0].attempt_limit && step.rows[0].attempt_limit !== 0)
                {
                    // No more attempts
                    return res.status(200).json({ message: "Wrong answer, you reached the attempt limit" });
                }
                else
                {
                    // Try again
                    return res.status(200).json({ message: "Wrong answer" });
                }
            }
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