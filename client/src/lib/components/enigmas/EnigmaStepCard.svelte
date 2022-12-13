<script lang="ts">
    import { FormatDate } from "$lib/utils";
    import type { EnigmaStep } from "$lib/type";

    export let enigmaStep: EnigmaStep;
    export let details: boolean = false;
    export let completed: boolean = false;
    export let blur: boolean = false;

</script>

<div on:click
    class:blur={blur}
    class:hover:cursor-pointer={!blur}
    class:hover:outline={!blur}
    class:hover:bg-base-200={!blur}
    class="card w-full bg-base-100 shadow-xl shadow-black outline-black">
     <div class="card-body p-5">
        <h2 class="card-title">{enigmaStep.index}{')'} {enigmaStep.title} {details && completed ? '✅' : ''}</h2>
        <p class="italic">Created the {FormatDate(enigmaStep.created)}</p>
        <p class="truncate">{enigmaStep.description ?? 'No description...'}</p>
    </div>
</div>