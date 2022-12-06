import { pool } from "../index";
import { QueryResult } from "pg";
import { RetrieveUserInfos } from '../utils/users';
import * as jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import express  from "express";

export const router = express.Router();

// Create a new user

router.post("/users", async (req, res) => {
    try
    {
        const { email, password } = req.body;
        
        // Encrypt password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        await pool.query("INSERT INTO users (id, email, password) VALUES (DEFAULT, $1, $2);", [email, hashedPassword]);
        res.json({ message: "User created successfully" });
    }
    catch (error: any)
    {
        return res.status(400).json({ msg: error.message });
    }
});

// Login a user

router.post("/users/login", async (req, res) => {
    try
    {
        const { email, password, session_token } = req.body;
        const secret: jwt.Secret = process.env.TOKEN_SECRET as jwt.Secret;
        
        if (session_token)
        {
            const user = jwt.verify(session_token, secret);

            if (user)
            {
                const userInfos = await RetrieveUserInfos(undefined, session_token);

                // Retrieve user infos
                return res.status(200).json({ message: "User logged in successfully", user: userInfos });
            }
            else
            {
                return res.status(400).json({ message: "Invalid session token" });
            }
        }

        // Find hashed password in database
        const user: QueryResult = await pool.query("SELECT * FROM users WHERE email = $1;", [email]);

        if (user.rows.length === 0)
        {
            return res.status(400).json({ msg: "The email address " + email + " is not associated with any account. Double-check your email address and try again." });
        }

        // Compare hashed password with password from request
        const hashedPassword: string = user.rows[0].password;
        const isMatch = await bcrypt.compare(password, hashedPassword);

        if (!isMatch)
        {
            return res.status(400).json({ msg: "Invalid credentials" });
        }

        // Create and assign a token
        const id: number = user.rows[0].id;
        const token: string = jwt.sign({ id: id }, secret);

        // Add token to database
        await pool.query("UPDATE users SET session_token = $1 WHERE id = $2;", [token, id]);

        // Retrieve user infos
        const userInfos = await RetrieveUserInfos(id, undefined);
        return res.status(200).json({ token, user: userInfos });
    }
    catch (error: any)
    {
        return res.status(400).json({ msg: error.message });
    }
});