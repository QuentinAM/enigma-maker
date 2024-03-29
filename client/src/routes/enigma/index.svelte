<script lang="ts">
	import { goto } from "$app/navigation";
	import { page } from "$app/stores";
	import {  GetMyEnigma, GetPublicEnigma } from "$lib/utils/enigma";
	import { user } from "$lib/utils/store";
	import { LoginToken } from "$lib/utils/user";
	import { onMount } from "svelte";
	import type { Enigma } from "$lib/type";
    import Spinner from '$lib/assets/spinner.png';
	import Countdown from "$lib/components/Countdown.svelte";
	import EnigmaCard from "$lib/components/enigmas/EnigmaCard.svelte";
	import { ParseDate } from "$lib/utils";

    let message = $page.url.searchParams.get('message');
    let enigmas: Enigma[];
    let public_enigmas: Enigma[];
    let showing_public: boolean = false;

    let logged_in: boolean = false;

    let loading: boolean = true;

    onMount(async () => {
        const token: string | null = localStorage.getItem('token');
        if (token)
        {
            if (!user)
            {
                const res: any = await LoginToken(token);
                if (res.message)
                {
                    return goto(`/login?message=${res.message}`.replace(/\s/g, "%20"));
                }
            }
            logged_in = true;

            let res: any = await GetMyEnigma(token);
            if (res.message)
            {
                if (res.message == 'jwt expired')
                {
                    message = 'Your session has expired, please login again';
                }
                else
                {
                    message = res.message;
                }
            }
            else
            {   
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
            }
        }
        else
        {
            message = 'You can only see public enigmas, log in to see your enigmas';
            showing_public = true;
        }
            
        const res = await GetPublicEnigma();
        if (res.message)
        {
            return goto(`/login?message=${res.message}`.replace(/\s/g, "%20"));
        }
        public_enigmas = res.enigmas as Enigma[];
        
        // For each enigma, check if it has started
        public_enigmas.forEach((enigma: Enigma) => {
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
    });
</script>

<div class="min-h-screen bg-base-200 flex justify-center">
	<div class="flex flex-col items-center space-y-4 w-[95%] lg:w-2/3 mt-3">
        {#if loading}
            <img src={Spinner} class="animate-spin h-14 m-2" alt="Loading..." />
        {:else}
            <div class="tabs">
                <a on:click|preventDefault={() => {
                    if (logged_in) showing_public = false;
                }} href='/enigma' class:cursor-default={!logged_in} class:tab-active={!showing_public} class="tab tab-lg tab-lifted">Enigma I am assigned to</a> 
                <a on:click|preventDefault={() => showing_public = true} class:cursor-default={!logged_in} href='/enigma' class:tab-active={showing_public} class="tab tab-lg tab-lifted">Public Enigmas</a>
            </div>
            {#if message}
                <p class="text-error text-sm font-semibold">{message}</p>
            {/if}
            {#if showing_public && public_enigmas}
                {#each public_enigmas as enigma}
                    <EnigmaCard is_public {enigma} />
                {/each}
            {:else if enigmas}
                {#each enigmas as enigma}
                    <EnigmaCard step_message={`${(enigma.current_step_index ?? 0) + 1}`} {enigma} />
                {/each}
            {/if}
        {/if}
    </div>
</div>