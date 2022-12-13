<script lang="ts">
	import { onMount } from "svelte";
    import { FormatDate } from "$lib/utils";
    import { enigmaToDelete } from "$lib/utils/store";
    import type { Enigma } from "$lib/type";
	import { goto } from "$app/navigation";

    export let enigma: Enigma;
    let status: string = '';

    onMount(() => {
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
    });

</script>

<div class="card card-side bg-base-100 shadow-lg w-full">
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
            <button on:click={() => goto(`/enigma/${enigma.id}/manage`)} class="btn btn-primary">Manage</button>
            <label for="delete-modal" on:click={() => {
                enigmaToDelete.set({
                    id: enigma.id,
                    title: enigma.title
                });
            }} class="btn btn-error">Delete</label>
        </div>
    </div>
</div>