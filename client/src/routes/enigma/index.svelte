<script lang="ts">
	import { goto } from "$app/navigation";
	import { page } from "$app/stores";
	import {  GetMyEnigma } from "$lib/utils/enigma";
	import { user } from "$lib/utils/store";
	import { LoginToken } from "$lib/utils/user";
	import { onMount } from "svelte";
	import type { Enigma } from "$lib/type";
    import Spinner from '$lib/assets/spinner.png';
	import Countdown from "$lib/components/Countdown.svelte";
	import EnigmaCard from "$lib/components/enigmas/EnigmaCard.svelte";
	import { ParseDate } from "$lib/utils";

    let enigmas: Enigma[];
    
    let loading: boolean = true;

    onMount(async () => {
        const token: string | null = localStorage.getItem('token');
        if (!token)
        {
            return goto(`/login?message=You need to connect to see your assigned enigmas`.replace(/\s/g, "%20"));
        }
        else
        {
            if (!user)
            {
                const res: any = await LoginToken(token);
                if (res.message)
                {
                    return goto(`/login?message=${res.message}`.replace(/\s/g, "%20"));
                }
            }

            const res: any = await GetMyEnigma(token);
            if (res.message)
            {
                return goto(`/login?message=${res.message}`.replace(/\s/g, "%20"));
            }
            enigmas = res.enigmas as Enigma[];
            
            // For each enigma, check if it has started
            enigmas.forEach((enigma: Enigma) => {
                // Countdown message
                if (ParseDate(enigma.start_date) > new Date())
                {
                    enigma.countdown_message = 'Enigma starts in';
                    enigma.countdown_date = enigma.start_date;
                }
                else if (ParseDate(enigma.end_date) < new Date())
                {
                    enigma.countdown_message = 'Enigma ended';
                    enigma.countdown_date = enigma.end_date;
                }
                else
                {
                    enigma.countdown_message = 'Enigma ends in';
                    enigma.countdown_date = enigma.end_date;
                }
            });

            loading = false;
        }
    });
</script>

<div class="min-h-screen bg-base-200 flex justify-center">
	<div class="flex flex-col items-center space-y-4 w-[95%] lg:w-2/3 mt-3">
        {#if loading}
            <img src={Spinner} class="animate-spin h-14 m-2" alt="Loading..." />
        {:else if enigmas}
            {#each enigmas as enigma}
                <EnigmaCard step_message={`${(enigma.current_step_index ?? 0) + 1}/${enigma.n_step}`} {enigma} />
            {/each}
        {/if}
    </div>
</div>