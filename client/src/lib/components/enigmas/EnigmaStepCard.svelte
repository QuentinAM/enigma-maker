<script lang="ts">
    import { FormatDate } from "$lib/utils";
    import type { EnigmaStep } from "$lib/type";

    export let enigmaStep: EnigmaStep;

</script>

<div class="card w-full bg-base-100 shadow-xl">
    <div class="card-body p-5">
        <h2 class="card-title">{enigmaStep.index}{')'} {enigmaStep.title}</h2>
        <p class="italic">Created the {FormatDate(enigmaStep.created)}</p>
        <p>{enigmaStep.description ?? 'No description...'}</p>
        <div class="divider divider-vertical my-2"></div>
        <div class="flex flex-col space-y-1">
            <p><span class="font-semibold">Solution</span>: {enigmaStep.solution}</p>
            <p><span class="font-semibold">Attempt limit</span>: {enigmaStep.attempt_limit}</p>
            <p><span class="font-semibold">Time between guess</span>: {enigmaStep.time_refresh}</p>
            {#if enigmaStep.case_sensitive}
                <div class="badge badge-outline">Case sensitive</div>
            {/if}
        </div> 
        <div class="card-actions justify-end">
            <button class="btn btn-primary">Edit</button>
        </div>
    </div>
</div>