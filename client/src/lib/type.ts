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