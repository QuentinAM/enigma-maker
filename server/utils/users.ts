import { pool } from "../index";
import { QueryResult } from "pg";

export function RetrieveUserInfos(id?: number, token?: string): Promise<QueryResult<any>>
{
    if (id)
    {
        return pool.query("SELECT (email, created) FROM users WHERE id = $1;", [id]);
    }
    else if (token)
    {
        return pool.query("SELECT (email, created) FROM users WHERE session_token = $1;", [token]);
    }
    else
    {
        throw new Error("No id or token provided");
    }
}