import { writable } from 'svelte/store';
import type { LocalUser, EnigmaToDelete } from '$lib/type';

export const language = writable<string>('FR');
export const user = writable<LocalUser>();
export const enigmaToDelete = writable<EnigmaToDelete | null>();