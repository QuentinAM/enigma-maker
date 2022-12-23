<script lang="ts">
	import { goto } from "$app/navigation";
	import { page } from "$app/stores";
    import { fade, slide } from "svelte/transition";
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
    let loading_attempt: boolean = false;

    // Extra data
    let next_step_index: number = -1;
    let countdown_message: string = 'Enigma starts in';
    let countdown_date: string = '';
    let enigma_on_going: boolean = false;

    // Selected step
    let answer: string = '';
    let selected_step_last_attempt: EnigmaAttempt | undefined;
    let selected_step_timer_message: string = '';
    let selected_step_attempts_count: number = 0;
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
            loading_attempt = true;

            if (selected_step.attempt_limit != 0 && selected_step_attempts_count >= selected_step.attempt_limit)
            {
                enigma_error = 'You have reached the attempt limit for this step';
                loading_attempt = false;
                return;
            }

            // Check last attempt time
            const now = new Date();
            if (selected_step.time_refresh != 0 && selected_step_last_attempt != undefined)
            {
                const last_attempt_time = new Date(selected_step_last_attempt.created);
                const diff = now.getTime() - last_attempt_time.getTime();
                const seconds = Math.floor(diff / 1000);
                if (seconds < selected_step.time_refresh)
                {
                    enigma_error = `You can try again in ${selected_step.time_refresh - seconds}s`;
                    loading_attempt = false;
                    return;
                }
            }
            const res: any = await AttemptEnigmaStep(selected_step.id, answer, token);

            // Add attempt to list
            const new_attempt: EnigmaAttempt = {
                id: -1,
                enigma_step_id: selected_step.id,
                user_id: -1,
                attempt: answer,
                created: new Date().toISOString(),
                username: '',
                email: '',
                index: selected_step.index,
                success: res.message == undefined
            };
            enigma_attempts = [...enigma_attempts, new_attempt];
            selected_step_attempts_count++;
            selected_step_last_attempt = new_attempt;
            UpdateTimeRefresh();
            answer = '';

            loading_attempt = false;
            if (res.message)
            {
                enigma_error = res.message;
            }
            else
            {
                enigma.enigma_steps = enigma.enigma_steps; // To trigger update
                selected_step_completed = true;
                enigma_success_message = 'Correct answer!';
                enigma_error = '';
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
            goto(`/login?redirect=/enigma/${enigma_id}`);
        }
    }
    
    function UpdateTimeRefresh()
    {
        if (selected_step.time_refresh != 0 && selected_step_last_attempt != undefined)
        {
            const time = new Date(selected_step_last_attempt?.created);
            const interval = setInterval(() => {
                const now = new Date();
                const diff = now.getTime() - time.getTime();
                const seconds = Math.floor(diff / 1000);
                const time_left = selected_step.time_refresh - seconds;
                if (time_left <= 0)
                {
                    clearInterval(interval);
                    selected_step_timer_message = '';
                }
                else
                {
                    selected_step_timer_message = `- You can try again in ${selected_step.time_refresh - seconds}s`;
                }
            }, 1000);
        }
        else
        {
            selected_step_timer_message = '';
        }
    }

    function SelectStep(enigmaStep: EnigmaStep)
    {
        if (next_step_index < enigmaStep.index && next_step_index != -1) return;
        selected_step = enigmaStep;
        selected_step_completed = HasCompletedStep(enigmaStep);
     
        const attempts = enigma_attempts.filter((attempt) => attempt.enigma_step_id == enigmaStep.id);
        selected_step_attempts_count = attempts.length;
        selected_step_last_attempt = attempts.sort((a, b) => a.created > b.created ? -1 : 1)[0];
    
        answer = '';
        UpdateTimeRefresh();
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
                return goto(`/enigma?message=${res.message}`);
            }
            enigma = res.enigma as Enigma;

            // Enigma_steps if owner or started
            if (enigma.enigma_steps)
            {
                // Get my attempts
                const res2: any = await GetEnigmaMyAttempts(enigma_id, token);
                if (res2.message)
                {
                    return goto(`/login?message=${res.message}`);
                }
                enigma_attempts = res2.enigma_step_attempts as EnigmaAttempt[];

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
    <div class="flex flex-col px-5 bg-base-200 min-h-screen">
        <div class="mt-3 flex lg:flex-row flex-col w-full">
            <div class="flex lg:flex-row flex-col space-x-2 lg:w-3/4 w-full">
                <figure><img class="rounded h-full" src="https://placeimg.com/200/280" alt="Movie"/></figure>
                <div class="flex flex-col space-y-2 lg:w-4/5 w-full">
                    <h1 class="text-2xl font-semibold">{enigma.title} {enigma_completed ? '✅   ' : ''}</h1>
                    <p class="italic">Created the {FormatDate(enigma.created)}</p>
                    <p class="mt-2">{@html FormatDescription(enigma.description)}</p>
                </div>
            </div>
            <div class="divider lg:divider-horizontal divider-vertical"></div>
            <div class="lg:w-1/4 w-full flex flex-col items-center">
                <div class="">
                    <p>Start: <span class="font-semibold">{enigma.start_date}</span></p>
                    <p>End: <span class="font-semibold">{enigma.end_date}</span></p>
                </div>
                <div class="divider divider-vertical"></div>
                <Countdown message={countdown_message} date={countdown_date}/>
            </div>
        </div>
        <div class="divider lg:divider-vertical divider-horizontal"></div>
        <div class="flex lg:flex-row flex-col lg:h-[30rem]">
            <div class="lg:w-[25rem]">
                <p class="text-xl font-semibold">Steps</p>
                <div class="overflow-y-auto space-y-4 pt-3 pb-10 px-5 h-full">
                    {#if enigma.enigma_steps}
                        {#each enigma.enigma_steps as enigmaStep}
                            <EnigmaStepCard on:click={() => {
                                SelectStep(enigmaStep);
                            }} {enigmaStep} blur={next_step_index < enigmaStep.index && next_step_index != -1} details completed={HasCompletedStep(enigmaStep)} />
                        {/each}
                    {/if}
                </div>
            </div>
            <div class="divider lg:divider-horizontal divider-vertical"></div>
            <div class="h-full w-full overflow-y-auto relative px-2">
                {#if selected_step}
                    <p class="font-semibold text-xl">{selected_step.index}/{enigma.enigma_steps.length} - {selected_step.title}</p>
                    <p class="text-lg mt-3 whitespace-pre-line">{@html FormatDescription(selected_step.description) ?? 'No description...'}</p>
                    <div class="divider divider-vertical"></div>
                    <p><span class="font-semibold">Attempt limit</span>: {selected_step.attempt_limit == 0 ? 'No attempt limit' : selected_step.attempt_limit} {selected_step.attempt_limit == 0 ? `(done ${selected_step_attempts_count})` : `(${selected_step.attempt_limit - selected_step_attempts_count} left)`}</p>
                    <p><span class="font-semibold">Time between guess</span>: {selected_step.time_refresh == 0 ? 'No time between guess' : selected_step.time_refresh + 's'} {selected_step_timer_message}</p>
                    {#if selected_step.case_sensitive}
                        <div class="badge badge-outline">Case sensitive</div>
                    {/if}
                    <div class="divider divider-vertical"></div>
                    {#if !selected_step_completed && enigma_on_going}
                        {#if enigma_error}
                            <p class="text-error text-sm font-semibold" transition:slide>{enigma_error}</p>
                        {/if}
                        <div class="form-control">
                            <p class="label">
                                <span class="label-text">Answer</span>
                            </p>
                            <input bind:value={answer} type="text" placeholder="..." class="input input-bordered" />
                            <button class:loading={loading_attempt} on:click={AttemptEnigmaStepForm} class="btn btn-success mt-4">{loading_attempt ? '' : 'Submit'}</button>
                        </div>
                    {:else if enigma_success_message}
                        <p class="text-success text-sm font-semibold">{enigma_success_message}</p>
                    {/if}
                {/if}
            </div>
        </div>
    </div>
{/if}
