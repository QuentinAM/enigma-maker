export interface LocalUser {
    email: string;
    id: number;
    created: string;
}

export function SqlRowToLocalUser(row: string): LocalUser {
    const id: number = parseInt(row.split(',')[0].replace('(', ''));
    const email: string = row.split(',')[1].replace(/"/g, '');
    const created: string = row.split(',')[2].replace(/"/g, '').replace(')', '');
    return { id, email, created };
}

export interface Enigma {
    id: number;
    owner_id: number;
    title: string;
    description: string;
    start_date: string;
    end_date: string;
    created: string;
    enigma_steps: any[] | null;
}

export interface EnigmaStep {
    id: number;
    enigma_id: number;
    index: number;
    title: string;
    description: string;
    attempt_limit: number;
    time_refresh: number;
    solution: string;
    case_sensitive: boolean;
    created: string;
}

export interface EnigmaToDelete {
    id: number;
    title: string;
}