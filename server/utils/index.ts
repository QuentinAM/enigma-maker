import * as jwt from "jsonwebtoken";

export function CheckParams(params: any, requiredParams: string[]): boolean
{
    for (const param of requiredParams)
    {
        if (!params[param])
        {
            return false;
        }
    }
    return true;
}

export function CheckSessionToken(token: string): any | null
{
    const secret: jwt.Secret = process.env.TOKEN_SECRET as jwt.Secret;
    const user: any = jwt.verify(token, secret);
    return user ?? null;
}