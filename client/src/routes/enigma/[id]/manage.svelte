<script lang="ts">
	import { goto } from "$app/navigation";
	import { user } from "$lib/utils/store";
	import { LoginToken } from "$lib/utils/user";
    import { page } from '$app/stores';
	import { onMount } from "svelte";
    import { GetEnigma } from "$lib/utils/enigma";
    import { FormatDate } from "$lib/utils";
    import EnigmaStepCard from "$lib/components/enigmas/EnigmaStepCard.svelte";
    import Spinner from '$lib/assets/spinner.png';
	import type { Enigma, LocalUser } from "$lib/type";

    const enigma_id: string = $page.params.id;
    let loading: boolean = true;
    let enigma: Enigma;
    let status: string = '';

    onMount(async () => {
        const token: string | null = localStorage.getItem('token');
        if (!token)
        {
            goto('/login');
        }
        else
        {
            if (!$user)
            {
                const res: any = await LoginToken(token);
                if (res.message)
                {
                    goto('/login');
                }
            }

            const res: any = await GetEnigma(enigma_id);
            if (res.message)
            {
                goto('/');
            }
            console.log(res.enigma);
            enigma = res.enigma as Enigma;
            
            user.subscribe((val: LocalUser) => {
                if (val && val.id !== enigma.owner_id)
                {
                    goto('/');
                }
            });

            const now: string = new Date().toLocaleString();

            // Set status
            if (now < enigma.start_date)
            {
                status = 'Not started ⏳';
            }
            else if (now > enigma.end_date)
            {
                status = 'Ended ✅';
            }
            else
            {
                status = 'Started 🚀';
            }
                
                loading = false;
            }
        });
</script>

{#if loading}
    <img src={Spinner} class="animate-spin h-14 m-2" alt="Loading..." />
{:else}
    <div class="w-full mt-3 mb-3">
        <div class="flex flex-row space-x-3">
            <figure><img class="rounded" src="https://placeimg.com/200/280" alt="Movie"/></figure>
            <div class="flex flex-col w-full">
                <p class="text-xl font-semibold">{enigma.title}</p>
                <p class="italic">Created the {FormatDate(enigma.created)}</p>
                {#if $user}
                    <p>By {$user.email}</p>
                {/if}
                <p>Id: {enigma.id}</p>
                <div class="mt-5 bg-base-100 rounded p-2">
                    <p class="text-lg font-semibold">{status}</p>
                    <p>Start : <span class="text-white">{enigma.start_date}</span></p>
                    <p>End : <span class="text-white">{enigma.end_date}</span></p>
                </div>
            </div>
        </div>
        <div class="mt-5 bg-base-100 rounded p-2">
            <p class="text-lg font-semibold">Description</p>
            <p>{enigma.description ?? 'No description...'}</p>
        </div>
        <div class="space-y-4 mt-5">
            {#if enigma.enigma_steps}
                {#each enigma.enigma_steps as enigmaStep}
                    <EnigmaStepCard {enigmaStep} />
                {/each}
            {/if}
        </div>
    </div>
{/if}