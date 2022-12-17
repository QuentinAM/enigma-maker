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

export function ParseDate(date: string): Date
{
    // 13/12/2022 19:50:09
    const dateSplit = date.split(" ");
    const dateSplit2 = dateSplit[0].split("/");
    const dateSplit3 = dateSplit[1].split(":");
    return new Date(parseInt(dateSplit2[2]), parseInt(dateSplit2[1]) - 1, parseInt(dateSplit2[0]), parseInt(dateSplit3[0]), parseInt(dateSplit3[1]), parseInt(dateSplit3[2]));
}