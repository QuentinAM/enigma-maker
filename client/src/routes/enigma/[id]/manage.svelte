<script lang="ts">
    import { slide } from "svelte/transition";
	import { goto } from "$app/navigation";
	import { user } from "$lib/utils/store";
	import { LoginToken } from "$lib/utils/user";
    import { page } from '$app/stores';
	import { onMount } from "svelte";
    import { GetEnigma } from "$lib/utils/enigma";
    import { FormatDate, FormatDescription } from "$lib/utils";
    import EnigmaStepCard from "$lib/components/enigmas/EnigmaStepCard.svelte";
    import Spinner from '$lib/assets/spinner.png';
	import type { Enigma, EnigmaStep, LocalUser } from "$lib/type";
	import { CreateEnigmaStep, UpdateEnigmaStep } from "$lib/utils/enigma_step";

    const enigma_id: string = $page.params.id;
    let loading: boolean = true;
    let enigma: Enigma;
    let status: string = '';
    let status_message: string = '';
    let enigma_error: string = '';
    let enigma_step_title: string = '';
    let modifying_step: boolean = false;
    let modifying_step_obj: EnigmaStep;
    let selected_step: EnigmaStep;

    async function CreateEnigmaStepForm()
    {
        if (enigma_step_title != '')
        {
            const token: string | null = localStorage.getItem('token');
            if (token)
            {
                const index: number = enigma.enigma_steps.length + 1;
                const res: any = await CreateEnigmaStep(enigma_step_title, index, enigma.id, token);
                if (res.message)
                {
                    enigma_error = res.message;
                }
                else
                {
                    // Create new enigma object
                    console.log(res.step);
                    const new_enigma_step: EnigmaStep = res.step;
                    enigma.enigma_steps = [...enigma.enigma_steps, new_enigma_step];
                    selected_step = new_enigma_step;

                    // Reset forms 
                    enigma_error = "";
                    enigma_step_title = "";
                }
            }
            else
            {
                goto('/login');
            }
        }
    }

    async function UpdateEnigmaForm()
    {
        const token: string | null = localStorage.getItem('token');
        if (token)
        {
            const res: any = await UpdateEnigmaStep(modifying_step_obj, token);
            if (res.message)
            {
                enigma_error = res.message;
            }
            else
            {
                // Update enigma object
                const index = modifying_step_obj.index - 1;
                enigma.enigma_steps[index] = modifying_step_obj;
                selected_step = modifying_step_obj;
                modifying_step = false;
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
                
            loading = false;
        }
    });
</script>

<input type="checkbox" id="create-enigma-step-modal" class="modal-toggle" />
<label for="create-enigma-step-modal" class="modal">
    <label for=" " class="modal-box">
        <h3 class="font-bold text-lg">Create a step for {enigma?.title}</h3>
        <div class="form-control">
            <p class="label">
                <span class="label-text">Title</span>
            </p>
            <input bind:value={enigma_step_title} type="text" placeholder="..." class="input input-bordered" />
        </div>
        <div class="modal-action">
            <label for="create-enigma-step-modal" on:click={CreateEnigmaStepForm} class="btn">Create</label>
        </div>
    </label>
</label>

<div class="min-h-screen bg-base-200 flex">
	<div class="w-full mx-10 my-3">
        {#if loading}
            <img src={Spinner} class="animate-spin h-14 m-2" alt="Loading..." />
        {:else}
            <div class="flex flex-col space-y-5">
                <div class="flex flex-row items-center space-x-3">
                    <figure><img class="rounded" src="https://placeimg.com/200/280" alt="Movie"/></figure>
                    <div class="flex flex-col w-full">
                        <p class="text-xl font-semibold">{enigma.title}</p>
                        <p class="italic">Created the {FormatDate(enigma.created)}</p>
                        {#if $user}
                            <p>By {$user.email}</p>
                        {/if}
                        <p>Id: {enigma.id}</p>
                        {#if enigma_error}
                            <p class="text-error font-semibold">{enigma_error}</p>
                        {/if}
                        <div class="mt-5 bg-base-100 rounded p-2 shadow-black shadow-sm">
                            <p class="text-lg font-semibold">{status}</p>
                            <p>Start : <span class="text-white">{enigma.start_date}</span></p>
                            <p>End : <span class="text-white">{enigma.end_date}</span></p>
                            <p class="italic my-1"><i class="fa-solid fa-circle-info"></i> {status_message}</p>
                        </div>
                        <div class="mt-5 bg-base-100 rounded p-2 shadow-black shadow-md">
                            <p class="text-lg font-semibold">Description</p>
                            <p>{enigma.description ?? 'No description...'}</p>
                        </div>
                    </div>
                </div>
                <div class="flex flex-row h-[30rem]">
                    <div class="w-[25rem]">
                        <p class="text-xl font-semibold">Enigmas <label for="create-enigma-step-modal" class="text-lg hover:cursor-pointer">➕</label></p>
                        <div class="overflow-y-auto space-y-4 mt-3 h-[90%]">
                            {#if enigma.enigma_steps}
                                {#each enigma.enigma_steps as enigmaStep}
                                    <EnigmaStepCard on:click={() => {
                                            modifying_step = false;
                                            selected_step = enigmaStep;
                                            modifying_step_obj = enigmaStep;
                                        }} {enigmaStep} />
                                {/each}
                            {/if}
                        </div>
                    </div>
                    <div class="divider divider-horizontal"></div>
                    <div class="h-full w-full overflow-y-auto relative">
                        {#if modifying_step}
                            <div class="form-control">
                                <p class="label">
                                <span class="label-text">Title</span>
                                </p>
                                <input bind:value={modifying_step_obj.title} type="text" placeholder="..." class="input input-bordered" />
                            </div>
                            <div class="form-control">
                                <label class="label">
                                    <input class="hidden"/>
                                    <span class="label-text">Description</span>
                                </label> 
                                <textarea bind:value={modifying_step_obj.description} class="textarea textarea-bordered h-24" placeholder="..."></textarea>
                            </div>
                            <div class="form-control">
                                <p class="label">
                                <span class="label-text">Solution</span>
                                </p>
                                <input bind:value={modifying_step_obj.solution} type="text" placeholder="..." class="input input-bordered" />
                            </div>
                            <div class="form-control">
                                <label class="label cursor-pointer">
                                    <span class="label-text">Case sensitive</span> 
                                    <input type="checkbox" class="toggle" bind:checked={modifying_step_obj.case_sensitive}/>
                                </label>
                            </div>
                            <div class="flex flex-row w-full space-x-3">
                                <div class="form-control w-1/2">
                                    <p class="label">
                                    <span class="label-text">Attempt limit</span>
                                    </p>
                                    <input bind:value={modifying_step_obj.attempt_limit} min="0" type="number" placeholder="..." class="input input-bordered" />
                                </div>
                                <div class="form-control w-1/2">
                                    <p class="label">
                                    <span class="label-text">Time between guess</span>
                                    </p>
                                    <input bind:value={modifying_step_obj.time_refresh} min="0" type="number" placeholder="..." class="input input-bordered" />
                                </div>
                            </div>
                            <button on:click={UpdateEnigmaForm} class="btn btn-success mt-2 w-full">Save changes</button>
                        {:else}
                            {#if selected_step}
                                <button on:click={() => modifying_step = true} class="btn absolute top-0 right-0">Edit</button>
                                <p class="font-semibold text-xl">{selected_step.index}/{enigma.enigma_steps.length} - {selected_step.title}</p>
                                <p class="italic text-md">Created the {FormatDate(selected_step.created)}</p>
                                <p class="text-lg mt-3 whitespace-pre-line">{@html FormatDescription(selected_step.description) ?? 'No description...'}</p>
                                <div class="divider divider-vertical"></div>
                                <div>
                                    <span class="font-semibold">Solution</span>: {selected_step.solution} 
                                    {#if selected_step.case_sensitive}
                                            <div class="badge badge-outline">Case sensitive</div>
                                    {/if}
                                </div>
                                <p><span class="font-semibold">Attempt limit</span>: {selected_step.attempt_limit == 0 ? 'No attempt limit' : selected_step.attempt_limit}</p>
                                <p><span class="font-semibold">Time between guess</span>: {selected_step.time_refresh == 0 ? 'No time between guess' : selected_step.time_refresh + 's'}</p>
                            {/if}
                        {/if}
                    </div>
                </div>
            </div>
        {/if}
    </div>
</div>