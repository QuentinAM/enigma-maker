import { API_URL } from "$lib/const";

export async function GetMyEnigma(token: string): Promise<any>
{
    const res: Response = await fetch(`${API_URL}/api/enigma/me`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "session_token": token
        }
    });
    const json: any = await res.json();
    return json;
}

export async function CreateEnigma(enigma_title: string, start_date: string, end_date: string, token: string): Promise<any>
{
    const res: Response = await fetch(`${API_URL}/api/enigma`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "session_token": token
        },
        body: JSON.stringify({
            enigma_title,
            start_date,
            end_date
        })
    });
    const json: any = await res.json();
    return json;
}

export async function DeleteEnigma(token: string, id: number)
{
    const res: Response = await fetch(`${API_URL}/api/enigma/${id}`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
            "session_token": token
        }
    });
    const json: any = await res.json();
    return json;
}