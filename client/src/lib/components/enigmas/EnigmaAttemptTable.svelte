<script lang="ts">
    import type { EnigmaAttempt } from "$lib/type";
	import { FormatDate } from "$lib/utils";

    export let attempts: EnigmaAttempt[];
</script>

<p class="font-semibold text-xl">Attempts</p>
<div class="overflow-x-auto rounded shadow-black shadow-md">
    <table class="table table-zebra w-full">
        <thead>
            <tr>
                <th>Step</th>
                <th>Email</th>
                <th>Attempt</th>
                <th>Date</th>
                <th>Success</th>
            </tr>
        </thead>
        <tbody>
            {#if attempts}
                {#each attempts as attempt, i}
                    <tr>
                        <th>{attempt.index}</th>
                        <td>{attempt.email}</td>
                        <td>{attempt.attempt}</td>
                        <td>{FormatDate(attempt.created)}</td>
                        <td>{attempt.success ? '✅' : '❌'}</td>
                    </tr>
                {/each}
            {/if}
        </tbody>
    </table>
</div>