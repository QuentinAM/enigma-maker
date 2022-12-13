<script lang="ts">
	import { goto } from "$app/navigation";
	import { user } from "$lib/utils/store";
	import { LoginToken } from "$lib/utils/user";
	import { onMount } from "svelte";
    import { page } from '$app/stores';
    import { GetEnigma, JoinEnigma } from "$lib/utils/enigma";
	import type { Enigma } from "$lib/type";
	import { FormatDate } from "$lib/utils";

    const enigma_id: string = $page.params.id;
    
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
            const res: any = await JoinEnigma(enigma_id, token);
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
            goto(`/login?redirect=/enigma/${enigma_id}/join`);
        }
        else
        {
            if (!user)
            {
                const res: any = await LoginToken(token);
                if (res.message)
                {
                    goto(`/login?redirect=/enigma/${enigma_id}/join`);
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
                const now: string = new Date().toLocaleString();

                if (now < enigma.start_date)
                {
                    status = 'Not started ⏳';
                    status_message = 'You can modify the enigma until the start date.';
                }
                else if (now > enigma.end_date)
                {
                    status = 'Ended ✅';
                    status_message = 'Hope you enjoyed the enigma!';
                }
                else
                {
                    status = 'Started 🚀';
                    status_message = 'The enigma has started! You cannot modify it anymore.';
                }
            }
        }
    });
</script>

<div class="flex flex-col space-y-2 items-center justify-center">
    {#if enigma_error}
        <p class="text-error font-semibold">{enigma_error}</p>
    {/if}
    <div class="card card-side bg-base-100 shadow-lg shadow-black w-2/3">
        {#if enigma}
            <figure><img class="h-full" src="https://placeimg.com/200/280" alt="Movie"/></figure>
            <div class="card-body">
                <h2 class="card-title">{enigma.title}</h2>
                {#if enigma.description}
                    <p>{enigma.description}</p>
                {/if}
                <p>Status : {status}</p>
                <p class="italic">Created the {FormatDate(enigma.created)}</p>
                <p>Start the <span class=" text-white">{enigma.start_date}</span></p>
                <p>End the <span class=" text-white">{enigma.end_date}</span></p>
                <div class="card-actions justify-end">
                    <button on:click={JoinEnigmaForm} class="btn btn-primary">Join</button>
                </div>
            </div>
        {/if}
    </div>
</div>