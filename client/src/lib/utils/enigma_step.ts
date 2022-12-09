import type { assets } from "$app/paths";
import { API_URL } from "$lib/const";
import type { EnigmaStep } from "$lib/type";

export async function CreateEnigmaStep(title: string, index: number, enigma_id: number, token: string): Promise<any>
{
    const res: Response = await fetch(`${API_URL}/api/enigma/${enigma_id}/step`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "session_token": token
        },
        body: JSON.stringify({
            title,
            index
        })
    });
    const json: any = await res.json();
    return json;
}

export async function UpdateEnigmaStep(step: EnigmaStep, token: string): Promise<any>
{
    const res: Response = await fetch(`${API_URL}/api/enigma/${step.enigma_id}/step/${step.id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "session_token": token
        },
        body: JSON.stringify({
            title: step.title,
            index: step.index,
            description: step.description,
            attempt_limit: step.attempt_limit,
            time_refresh: step.time_refresh,
            solution: step.solution,
            case_sensitive: step.case_sensitive
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