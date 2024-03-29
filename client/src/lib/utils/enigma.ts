import { API_URL } from "$lib/const";

export async function GetEnigmaOwn(token: string): Promise<any>
{
    const res: Response = await fetch(`${API_URL}/api/enigma/own`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "session_token": token
        }
    });
    const json: any = await res.json();
    return json;
}

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

export async function GetEnigmaMyAttempts(id: string, token: string): Promise<any>
{
    const res: Response = await fetch(`${API_URL}/api/enigma/${id}/my_attempts`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "session_token": token
        }
    });
    const json: any = await res.json();
    return json;
}

export async function GetEnigma(id: string, token: string): Promise<any>
{
    const res: Response = await fetch(`${API_URL}/api/enigma/${id}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "session_token": token
        }
    });
    const json: any = await res.json();
    return json;
}

export async function CreateEnigma(enigma_title: string, start_date: string, end_date: string, is_public: boolean, token: string): Promise<any>
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
            end_date,
            is_public
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

export async function UpdateEnigma(token: string, id: number, enigma_title: string, description: string, start_date: string, end_date: string, is_public: boolean)
{
    const res: Response = await fetch(`${API_URL}/api/enigma/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "session_token": token
        },
        body: JSON.stringify({
            title: enigma_title,
            description,
            start_date,
            end_date,
            is_public: is_public
        })
    });
    const json: any = await res.json();
    return json;
}

export async function GetEnigmaAttempts(id: number, token: string): Promise<any>
{
    const res: Response = await fetch(`${API_URL}/api/enigma/${id}/attempts`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "session_token": token
        }
    });
    const json: any = await res.json();
    return json;
}

export async function GetEnigmaUsers(id: number, token: string): Promise<any>
{
    const res: Response = await fetch(`${API_URL}/api/enigma/${id}/users`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "session_token": token
        }
    });
    const json: any = await res.json();
    return json;
}

export async function JoinEnigma(id: string, token: string): Promise<any>
{
    const res: Response = await fetch(`${API_URL}/api/enigma/${id}/assign`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "session_token": token
        }
    });
    const json: any = await res.json();
    return json;
}

export async function AttemptEnigmaStep(step_id: number, attempt: string, token: string): Promise<any>
{
    const res: Response = await fetch(`${API_URL}/api/enigma_step_attempt/${step_id}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "session_token": token
        },
        body: JSON.stringify({
            attempt
        })
    });
    const json: any = await res.json();
    return json;
}

export async function GetPublicEnigma(): Promise<any>
{
    const res: Response = await fetch(`${API_URL}/api/enigma/public`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        }
    });
    const json: any = await res.json();
    return json;
}