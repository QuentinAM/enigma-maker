<script lang="ts">
    import { DateInput } from "date-picker-svelte";
    import { slide } from "svelte/transition";
	import { goto } from "$app/navigation";
    import { user, enigmaToDelete } from "$lib/utils/store";
	import { LoginToken } from "$lib/utils/user";
	import { onMount } from "svelte";
    import { GetMyEnigma, CreateEnigma, DeleteEnigma } from "$lib/utils/enigma";
    import EnigmaCard from "$lib/components/enigmas/EnigmaCard.svelte";
    import type { Enigma } from "$lib/type";

    let enigmas: Enigma[] = [];
    let creatingEnigma: boolean = false;

    // Create enigma
    let enigma_error: string = "";
    let enigma_title: string = "";
    let now = new Date();
    let enigma_start_date: Date;
    let enigma_end_date: Date ;

    async function CreateEnigmaForm()
    {
        const token: string | null = localStorage.getItem('token');
        if (token)
        {
            const start_date_str = enigma_start_date.toLocaleString();
            const end_date_str = enigma_end_date.toLocaleString();
            const res: any = await CreateEnigma(enigma_title, start_date_str, end_date_str, token);
            if (res.message)
            {
                enigma_error = res.message;
            }
            else
            {
                // Create new enigma object
                const new_enigma: Enigma = {
                    id: res.enigma_id,
                    owner_id: $user.id,
                    description: "",
                    title: enigma_title,
                    enigma_steps: [],
                    start_date: start_date_str,
                    end_date: end_date_str,
                    created: new Date().toLocaleString()
                }
                enigmas = [new_enigma, ...enigmas];

                // Reset forms 
                enigma_error = "";
                enigma_title = "";
                creatingEnigma = false;
            }
        }
        else
        {
            goto('/login');
        }
    }

    async function DeleteEnigmaForm()
    {
        const token: string | null = localStorage.getItem('token');
        if (token)
        {
            if ($enigmaToDelete)
            {
                const id = $enigmaToDelete.id;
                const res: any = await DeleteEnigma(token, id);
                if (res.message)
                {

                }
                else
                {
                    enigmas = enigmas.filter(enigma => enigma.id !== id);
                    enigmaToDelete.set(null);
                }
            }
        }
        else
        {
            goto('/login');
        }
    }

    onMount(async () => {
        const token: string | null = localStorage.getItem('token');
        if (!token)
        {
            goto('/login');
        }
        else
        {
            if (!user)
            {
                const res: any = await LoginToken(token);
                if (res.message)
                {
                    goto('/login');
                }
            }

            const res: any = await GetMyEnigma(token);
            enigmas = res.enigmas;
        }
    });

</script>

<div class="min-h-screen bg-base-200 flex justify-center">
	<div class="flex flex-col items-center space-y-4 w-[95%] lg:w-2/3">
        <input type="checkbox" id="delete-modal" class="modal-toggle" />
        <label for="delete-modal" class="modal">
            <div class="modal-box">
                <h3 class="font-bold text-lg">Delete an enigma ?</h3>
                <p class="py-4">Are you sure you want to delete {$enigmaToDelete?.title} ?</p>
                <div class="modal-action">
                    <label for="delete-modal" class="btn">No</label>
                    <label for="delete-modal" on:click={DeleteEnigmaForm} class="btn btn-error">Yes</label>
                </div>
            </div>
        </label>

        <div class="flex flex-row mt-3">
            <div class="avatar">
                <div class="w-24 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                    <img src="https://placeimg.com/192/192/people" alt="profile"/>
                </div>
            </div>
            <div class="flex flex-col justify-center items-center ml-5">
                <p class="font-semibold text-base">{$user.email}</p>
                <p class="text-sm text-primary ml-2">{$user.created}</p>
            </div>
        </div>

        <p class="font-semibold text-lg w-full">My enigmas <span on:click={() => creatingEnigma = !creatingEnigma} class="text-lg hover:cursor-pointer">➕</span></p>
        {#each enigmas as enigma}
            <EnigmaCard {enigma} />
        {/each}
        {#if creatingEnigma}
            <div transition:slide class="card flex-shrink-0 w-full shadow-lg bg-base-100 mb-3">
                <div class="card-body">
                    <h2 class="card-title">New enigma</h2>
                    <div class="form-control">
                        <p class="label">
                            <span class="label-text">Title</span>
                        </p>
                        <input on:change={() => enigma_error = ''} bind:value={enigma_title} type="text" placeholder="..." class="input input-bordered" />
                    </div>
                    <div class="form-control">
                        <p class="label">
                            <span class="label-text">Start date</span>
                        </p>
                        <DateInput min={now} bind:value={enigma_start_date} />
                    </div>
                    <div class="form-control">
                        <p class="label">
                            <span class="label-text">End date</span>
                        </p>
                        <DateInput min={enigma_start_date} bind:value={enigma_end_date} />
                    </div>
                    <label class="label">
                        <input class="hidden"/>
                        <p class="label-text-alt">You can modify these values at any time</p>
                    </label>
                    <p class="text-error text-sm font-semibold">{enigma_error}</p>
                    <div class="form-control mt-6">
                        <button on:click={CreateEnigmaForm} class="btn btn-primary">Create enigma</button>
                    </div>
                </div>
            </div>
        {/if}
    </div>
</div>