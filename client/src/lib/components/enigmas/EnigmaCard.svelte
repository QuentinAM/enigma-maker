<script lang="ts">
	import { onMount } from "svelte";
    import { FormatDate } from "$lib/utils";
    import { enigmaToDelete } from "$lib/utils/store";
    import type { Enigma } from "$lib/type";
	import { goto } from "$app/navigation";
	import Countdown from "../Countdown.svelte";

    export let enigma: Enigma;
    export let manage: boolean = false;
    export let step_message: string = '';
    const now: string = new Date().toLocaleString();
    let status: string = '';

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

<div class="card card-side bg-base-100 shadow-lg w-full">
    <figure><img class="h-full" src="https://placeimg.com/200/280" alt="Movie"/></figure>
    <div class="card-body">
        <h2 class="card-title">{enigma.title}</h2>
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
        {#if !manage}
            {#if enigma.countdown_date && enigma.countdown_message}
                <Countdown date={enigma.countdown_date} message={enigma.countdown_message} />
            {/if}
        {/if}
        <div class="card-actions justify-end">
            {#if manage}
                <button on:click={() => goto(`/enigma/${enigma.id}/manage`)} class="btn btn-primary">Manage</button>
                <label for="delete-modal" on:click={() => {
                    enigmaToDelete.set({
                        id: enigma.id,
                        title: enigma.title
                    });
                }} class="btn btn-error">Delete</label>
            {:else}
                <button on:click={() => goto(`/enigma/${enigma.id}`)} class="btn btn-primary">See</button>
            {/if}
        </div>
    </div>
</div>