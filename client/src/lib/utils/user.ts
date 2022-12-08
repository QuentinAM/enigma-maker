import { API_URL } from "$lib/const";
import { user } from "$lib/utils/store";
import { SqlRowToLocalUser } from '$lib/type';
import type { LocalUser } from '$lib/type';

export async function LoginEmailPassword(email: string, password: string): Promise<any>
{
    // Fetch the user from the database
    const res: Response = await fetch(`${API_URL}/api/users/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
    });
    const json: any = await res.json();
    if (res.status === 200)
    {
        const token: string = json.token;

        // Store the token in the local storage
        localStorage.setItem("token", token);

        // Add user to store
        const localUser: LocalUser = SqlRowToLocalUser(json.user.row);
        user.set(localUser);
        
        return localUser;
    }
    return json;
}