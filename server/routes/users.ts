import { pool } from "../index";
import { QueryResult } from "pg";
import { RetrieveUserInfos } from '../utils/users';
import { CheckParams, CheckSessionToken } from "../utils";
import * as jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import express  from "express";

export const router = express.Router();

// Create a new user

router.post("/api/users", async (req, res) => {
    try
    {
        if (!CheckParams(req.body, ["username", "password", "password_conf", "email"]))
        {
            return res.status(400).json({ message: "Missing parameters" });
        }

        const { username, email, password, password_conf } = req.body;

        // Check if is email pattern
        if (!email.match(/^([\w.%+-]+)@([\w-]+\.)+([\w]{2,})$/i))
        {
            return res.status(400).json({ message: "Invalid email address" });
        }

        // Check if password is strong enough
        if (password.length < 10)
        {
            return res.status(400).json({ message: "Password must be at least 10 characters long" });
        }

        // Check if password and password confirmation are the same
        if (password !== password_conf)
        {
            return res.status(400).json({ message: "Password and password confirmation must be the same" });
        }   
        
        // Encrypt password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        await pool.query("INSERT INTO users (id, email, username, password) VALUES (DEFAULT, $1, $2, $3);", [email, username, hashedPassword]);
        res.status(200).json({ });
    }
    catch (error: any)
    {
        return res.status(400).json({ msg: error.message });
    }
});

// Login a user

router.post("/api/users/login", async (req, res) => {
    try
    {
        const session_token: string = req.headers.session_token as string;
        const secret: jwt.Secret = process.env.TOKEN_SECRET as jwt.Secret;
        if (session_token)
        {
            const user: any = CheckSessionToken(session_token);

            if (user)
            {
                const userInfos: QueryResult = await RetrieveUserInfos(user.id);

                if (userInfos.rowCount > 0)
                {   
                    // Retrieve user infos
                    return res.status(200).json({ message: "User logged in successfully", user: userInfos.rows[0] });
                }
                return res.status(400).json({ message: "User not found" });
            }
            else
            {
                return res.status(400).json({ message: "Invalid session token" });
            }
        }
    
        if (!CheckParams(req.body, ["password", "email"]))
        {
            return res.status(400).json({ message: "Missing parameters" });
        }

        const { email, password } = req.body;

        // Find hashed password in database
        const user: QueryResult = await pool.query("SELECT * FROM users WHERE email = $1;", [email]);

        if (user.rows.length === 0)
        {
            return res.status(400).json({ message: "The email address " + email + " is not associated with any account. Double-check your email address and try again." });
        }

        // Compare hashed password with password from request
        const hashedPassword: string = user.rows[0].password;
        const isMatch = await bcrypt.compare(password, hashedPassword);

        if (!isMatch)
        {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        // Create and assign a token
        const id: number = user.rows[0].id;
        const token = jwt.sign({ id }, secret, { expiresIn: 86400 });

        // Get user infos
        const user_infos: QueryResult = await RetrieveUserInfos(id);
        return res.status(200).json({ message: "User logged in successfully", token, user: user_infos.rows[0] });
    }
    catch (error: any)
    {
        return res.status(400).json({ message: error.message });
    }
});