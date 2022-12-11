<script lang="ts">
    import { FormatDate } from "$lib/utils";
    import type { EnigmaStep } from "$lib/type";

    export let enigmaStep: EnigmaStep;

</script>

<div on:click class="card w-full bg-base-100 shadow-xl shadow-black hover:cursor-pointer hover:outline outline-black hover:bg-base-200">
    <div class="card-body p-5">
        <h2 class="card-title">{enigmaStep.index}{')'} {enigmaStep.title}</h2>
        <p class="italic">Created the {FormatDate(enigmaStep.created)}</p>
        <p class="truncate">{enigmaStep.description ?? 'No description...'}</p>
    </div>
</div>