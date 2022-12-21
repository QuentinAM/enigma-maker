<script lang="ts">
	import { onMount } from "svelte";
    import { enigmaToDelete } from "$lib/utils/store";
    import type { Enigma } from "$lib/type";
	import { goto } from "$app/navigation";
	import Countdown from "../Countdown.svelte";
	import { JoinEnigma } from "$lib/utils/enigma";
	import { FormatDate } from "$lib/utils";

    export let enigma: Enigma;
    export let manage: boolean = false;
    export let is_public: boolean = false;
    export let step_message: string = '';
    const now: string = new Date().toLocaleString();
    let status: string = '';
    let error_message: string = '';
    let redirect_timer: number = 3;

    async function JoinEnigmaForm()
    {
        const token: string | null = localStorage.getItem('token');
        if (token)
        {
            const res: any = await JoinEnigma(`${enigma.id}`, token);
            if (res.message)
            {
                if (res.message == "You are already assigned to this enigma")
                {
                    error_message = res.message + `, you will be redirected in ${redirect_timer} seconds`;

                    const interval = setInterval(() =>
                    {
                        redirect_timer--;
                        error_message = res.message + `, you will be redirected in ${redirect_timer} seconds`;
                        if (redirect_timer <= 0)
                        {
                            clearInterval(interval);
                            goto(`/enigma/${enigma.id}`);
                        }
                    }, 1000);
                }
                else
                {
                    error_message = res.message;
                }
            }
            else
            {
                goto(`/enigma/${enigma.id}`);
            }
        }
        else
        {
            goto(`/login?redirect=/enigma/${enigma.id}/join`);
        }
    }

    onMount(() => {

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
    });

</script>

<div class="card card-side bg-base-100 shadow-lg w-full h-[19rem]">
    <figure class="w-1/5"><img class="h-full" src="https://placeimg.com/200/280" alt="Movie"/></figure>
    <div class="card-body p-4 gap-1 w-4/5 relative">
        <h2 class="card-title">{enigma.title}</h2>
        <div class="flex flex-col space-y-2">
            {#if enigma.description}
                <p class:truncate={!manage}>{enigma.description}</p>
            {/if}
            <p>Status : {status}</p>
            {#if now >= enigma.start_date}
                <p>Completed: {enigma.completed ? '✅' : '❌'}</p>
            {/if}
            {#if step_message && !enigma.completed}
                <p>Current step: {step_message}</p>
            {/if}
        </div>
        {#if !manage}
            {#if enigma.countdown_date && enigma.countdown_message}
                <Countdown date={enigma.countdown_date} message={enigma.countdown_message} />
            {/if}
        {/if}
        <div class="absolute bottom-3 right-3">
            {#if manage}
                <button on:click={() => goto(`/enigma/${enigma.id}/manage`)} class="btn btn-primary">Manage</button>
                <label for="delete-modal" on:click={() => {
                    enigmaToDelete.set({
                        id: enigma.id,
                        title: enigma.title
                    });
                }} class="btn btn-error">Delete</label>
            {:else if is_public}    
                <button on:click={JoinEnigmaForm} class="btn btn-primary">Join</button>
            {:else}
                <button on:click={() => goto(`/enigma/${enigma.id}`)} class="btn btn-primary">See</button>
            {/if}
        </div>
        {#if error_message}
            <p class="text-error font-semibold">{error_message}</p>
        {/if}
        {#if enigma.joined_date}
            <p class="italic absolute bottom-3 left-3">Joined at: <span class="font-semibold">{FormatDate(enigma.joined_date)}</span></p>
        {/if}
    </div>
</div>