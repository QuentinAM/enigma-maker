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
}

export interface EnigmaToDelete {
    id: number;
    title: string;
}