<script lang="ts">
	import { goto } from "$app/navigation";
	import { user } from "$lib/utils/store";
    import { fade, slide } from "svelte/transition";
	import { LoginToken } from "$lib/utils/user";
	import { onMount } from "svelte";
    import { page } from '$app/stores';
    import { GetEnigma, JoinEnigma } from "$lib/utils/enigma";
	import type { Enigma } from "$lib/type";
	import { FormatDate, ParseDate } from "$lib/utils";
	import Countdown from "$lib/components/Countdown.svelte";

    const enigma_id: string = $page.params.id;

    let countdown_message: string = 'Enigma starts in';
    let countdown_date: string = '';

    let loading_join: boolean = false;
    
    let enigma: Enigma;
    let enigma_error: string = '';
    let status: string = '';
    let status_message: string = '';
    let redirect_timer: number = 3;

    async function JoinEnigmaForm()
    {
        const token: string | null = localStorage.getItem('token');
        if (token)
        {
            loading_join = true;
            const res: any = await JoinEnigma(enigma_id, token);
            loading_join = false;
            if (res.message)
            {
                if (res.message == "You are already assigned to this enigma")
                {
                    enigma_error = res.message + `, you will be redirected in ${redirect_timer} seconds`;

                    const interval = setInterval(() =>
                    {
                        redirect_timer--;
                        enigma_error = res.message + `, you will be redirected in ${redirect_timer} seconds`;
                        if (redirect_timer <= 0)
                        {
                            clearInterval(interval);
                            goto(`/enigma/${enigma_id}`);
                        }
                    }, 1000);
                }
                else
                {
                    enigma_error = res.message;
                }
            }
            else
            {
                goto(`/enigma/${enigma_id}`);
            }
        }
        else
        {
            goto(`/login?redirect=/enigma/${enigma_id}/join`);
        }
    }

    onMount(async () => {
        const token: string | null = localStorage.getItem('token');
        if (!token)
        {
            return goto(`/login?redirect=/enigma/${enigma_id}/join`);
        }
        else
        {
            if (!user)
            {
                const res: any = await LoginToken(token);
                if (res.message)
                {
                    return goto(`/login?redirect=/enigma/${enigma_id}/join`);
                }
            }

            const res: any = await GetEnigma(enigma_id, token);
            console.log(res);
            if (res.message)
            {
                enigma_error = res.message;
            }
            else
            {
                enigma = res.enigma as Enigma;
                const now: Date = new Date();

                // Countdown message
                if (ParseDate(enigma.start_date) > now)
                {
                    status = 'Not started ⏳';
                    countdown_message = 'Enigma starts in';
                    countdown_date = enigma.start_date;
                }
                else if (ParseDate(enigma.end_date) < now)
                {
                    status = 'Ended ✅';
                    countdown_message = 'Enigma ended';
                    countdown_date = enigma.end_date;
                }
                else
                {
                    status = 'Started 🚀';
                    countdown_message = 'Enigma ends in';
                    countdown_date = enigma.end_date;
                }
            }
        }
    });
</script>

<div class="flex flex-col space-y-2 mt-3 items-center justify-center">
    <div class="card card-side bg-base-100 shadow-lg shadow-black w-2/3" transition:fade>
        {#if enigma}
            <figure class="w-1/5"><img class="h-full" src="https://placeimg.com/200/280" alt="Movie"/></figure>
            <div class="card-body w-4/5">
                <h2 class="card-title">{enigma.title}</h2>
                {#if enigma.description}
                    <p>{enigma.description}</p>
                {/if}
                <p>Status : {status}</p>
                <p class="italic">Created the {FormatDate(enigma.created)}</p>
                <p>Start the <span class=" text-white">{enigma.start_date}</span></p>
                <p>End the <span class=" text-white">{enigma.end_date}</span></p>
                <Countdown message={countdown_message} date={countdown_date}/>
                <div class="card-actions justify-end">
                    <button class:loading={loading_join} on:click={JoinEnigmaForm} class="btn btn-primary">{loading_join ? '' : 'Join'}</button>
                </div>
            </div>
        {/if}
    </div>
    {#if enigma_error}
        <p class="text-error mt-4 font-semibold" transition:slide>{enigma_error}</p>
    {/if}
</div>