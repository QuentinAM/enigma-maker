import { pool } from "../index";
import { QueryResult } from "pg";

export function RetrieveUserInfos(id: number): Promise<QueryResult<any>>
{
    return pool.query("SELECT (id, email, created) FROM users WHERE id = $1;", [id]);
}