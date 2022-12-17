<script lang="ts">
	import { goto } from "$app/navigation";
	import { page } from "$app/stores";
	import { FormatDate, FormatDescription, ParseDate } from "$lib/utils";
	import { AttemptEnigmaStep, GetEnigma, GetEnigmaMyAttempts } from "$lib/utils/enigma";
	import { user } from "$lib/utils/store";
	import { LoginToken } from "$lib/utils/user";
	import { onMount } from "svelte";
	import type { Enigma, EnigmaAttempt, EnigmaStep } from "$lib/type";
	import EnigmaStepCard from "$lib/components/enigmas/EnigmaStepCard.svelte";
    import Spinner from '$lib/assets/spinner.png';
	import Countdown from "$lib/components/Countdown.svelte";

    const enigma_id: string = $page.params.id;
    let enigma: Enigma;
    let enigma_error: string = '';
    let enigma_success_message: string = '';
    let enigma_completed: boolean = false;
    let enigma_attempts: EnigmaAttempt[] = [];
    
    let loading: boolean = true;

    // Extra data
    let next_step_index: number = -1;
    let countdown_message: string = 'Enigma starts in';
    let countdown_date: string = '';
    let enigma_on_going: boolean = false;

    // Selected step
    let answer: string = '';
    let selected_step: EnigmaStep;
    let selected_step_completed: boolean = false;

    function HasCompletedStep(step: EnigmaStep): boolean
    {
        const res = enigma_attempts.find((attempt: EnigmaAttempt) => attempt.enigma_step_id == step.id && attempt.success);
        return res != undefined;
    }

    async function AttemptEnigmaStepForm()
    {
        if (answer == '')
        {
            return;
        }

        const token: string | null = localStorage.getItem('token');
        if (token)
        {
            const res: any = await AttemptEnigmaStep(selected_step.id, answer, token);
            console.log(res);
            if (res.message)
            {
                enigma_error = res.message;
            }
            else
            {
                const new_attempt: EnigmaAttempt = {
                    id: res.attempt.id,
                    enigma_step_id: res.attempt.enigma_step_id,
                    user_id: res.attempt.user_id,
                    attempt: res.attempt.attempt,
                    created: res.attempt.created,
                    username: '',
                    email: '',
                    index: 0,
                    success: true
                };
                enigma_attempts = [...enigma_attempts, new_attempt];
                enigma.enigma_steps = enigma.enigma_steps; // To trigger update
                selected_step_completed = true;
                enigma_success_message = 'Correct answer!';
                enigma_error = '';
                answer = '';
                next_step_index = selected_step.index + 1;

                if (res.res.completed)
                {
                    // Finished enigma
                    enigma_success_message = 'Congratulations! You finished the enigma!';
                    enigma_completed = true;
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
            return goto('/login');
        }
        else
        {
            if (!user)
            {
                const res: any = await LoginToken(token);
                if (res.message)
                {
                    return goto(`/login?message=${res.message}`);
                }
            }

            const res: any = await GetEnigma(enigma_id, token);
            if (res.message)
            {
                return goto(`/login?message=${res.message}`);
            }
            enigma = res.enigma as Enigma;

            // If no description or enignma_steps means not assigned to and not user
            if (!enigma.description || !enigma.enigma_steps)
            {
                return goto(`/login?message=${res.message}`);
            }

            // Get my attemps
            const res2: any = await GetEnigmaMyAttempts(enigma_id, token);
            if (res2.message)
            {
                return goto(`/login?message=${res.message}`);
            }
            enigma_attempts = res2.enigma_step_attempts as EnigmaAttempt[];
            console.log(enigma_attempts);

            // Get index of next uncompleted step
            for (let i = 0; i < enigma.enigma_steps.length; i++)
            {
                const step: EnigmaStep = enigma.enigma_steps[i];
                if (!HasCompletedStep(step))
                {
                    next_step_index = step.index;
                    break;
                }
            }

            if (next_step_index == -1 || next_step_index == enigma.enigma_steps.length + 1)
            {
                // Finished enigma
                enigma_success_message = 'Congratulations! You finished the enigma!';
                enigma_completed = true;
            }

            // Countdown message
            if (ParseDate(enigma.start_date) > new Date())
            {
                countdown_message = 'Enigma starts in';
                countdown_date = enigma.start_date;
            }
            else if (ParseDate(enigma.end_date) < new Date())
            {
                countdown_message = 'Enigma ended';
                countdown_date = enigma.end_date;
            }
            else
            {
                countdown_message = 'Enigma ends in';
                countdown_date = enigma.end_date;
                enigma_on_going = true;
            }

            loading = false;
        }
    });
</script>

{#if loading}
    <img src={Spinner} class="animate-spin h-14 m-2" alt="Loading..." />
{:else if enigma}
    <div class="flex flex-col mx-5">
        <div class="mt-3 flex flex-row w-full">
            <div class="flex flex-row space-x-2 w-3/4">
                <figure><img class="rounded h-40" src="https://placeimg.com/200/280" alt="Movie"/></figure>
                <div class="flex flex-col space-y-2">
                    <h1 class="text-2xl font-semibold">{enigma.title} {enigma_completed ? '✅   ' : ''}</h1>
                    <p class="italic">Created the {FormatDate(enigma.created)}</p>
                    <p class="mt-2">{@html FormatDescription(enigma.description)}</p>
                </div>
            </div>
            <div class="divider divider-horizontal"></div>
            <div class="w-1/4 flex flex-col items-center">
                <div class="">
                    <p>Start: <span class="font-semibold">{enigma.start_date}</span></p>
                    <p>End: <span class="font-semibold">{enigma.end_date}</span></p>
                </div>
                <div class="divider divider-vertical"></div>
                <Countdown message={countdown_message} date={countdown_date}/>
            </div>
        </div>
        <div class="divider divider-vertical"></div>
        <div class="flex flex-row h-[30rem]">
            <div class="w-[25rem]">
                <p class="text-xl font-semibold">Steps</p>
                <div class="overflow-y-auto space-y-4 py-3 px-5 h-full">
                    {#if enigma.enigma_steps}
                        {#each enigma.enigma_steps as enigmaStep}
                            <EnigmaStepCard on:click={() => {
                                if (next_step_index < enigmaStep.index && next_step_index != -1) return;
                                selected_step = enigmaStep;
                                selected_step_completed = HasCompletedStep(enigmaStep);
                            }} {enigmaStep} blur={next_step_index < enigmaStep.index && next_step_index != -1} details completed={HasCompletedStep(enigmaStep)} />
                        {/each}
                    {/if}
                </div>
            </div>
            <div class="divider divider-horizontal"></div>
            <div class="h-full w-full overflow-y-auto relative px-2">
                {#if selected_step}
                    <p class="font-semibold text-xl">{selected_step.index}/{enigma.enigma_steps.length} - {selected_step.title}</p>
                    <p class="text-lg mt-3 whitespace-pre-line">{@html FormatDescription(selected_step.description) ?? 'No description...'}</p>
                    <div class="divider divider-vertical"></div>
                    <p><span class="font-semibold">Attempt limit</span>: {selected_step.attempt_limit == 0 ? 'No attempt limit' : selected_step.attempt_limit}</p>
                    <p><span class="font-semibold">Time between guess</span>: {selected_step.time_refresh == 0 ? 'No time between guess' : selected_step.time_refresh + 's'}</p>
                    {#if selected_step.case_sensitive}
                        <div class="badge badge-outline">Case sensitive</div>
                    {/if}
                    <div class="divider divider-vertical"></div>
                    {#if !selected_step_completed && enigma_on_going}
                        {#if enigma_error}
                            <p class="text-error text-sm font-semibold">{enigma_error}</p>
                        {/if}
                        <div class="form-control">
                            <p class="label">
                                <span class="label-text">Answer</span>
                            </p>
                            <input bind:value={answer} type="text" placeholder="..." class="input input-bordered" />
                            <button on:click={AttemptEnigmaStepForm} class="btn btn-success mt-4">Submit</button>
                        </div>
                    {:else if enigma_success_message}
                        <p class="text-success text-sm font-semibold">{enigma_success_message}</p>
                    {/if}
                {/if}
            </div>
        </div>
    </div>
{/if}
