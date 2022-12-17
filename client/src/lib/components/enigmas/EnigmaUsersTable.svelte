<script lang="ts">
    import type { EnigmaAssignment } from "$lib/type";
	import { FormatDate } from "$lib/utils";

    export let users: EnigmaAssignment[];
</script>

<p class="font-semibold text-xl">User enroled</p>
<div class="overflow-x-auto rounded shadow-black shadow-md">
    <table class="table table-zebra w-full">
        <thead>
            <tr>
                <th>User</th>
                <th>Step</th>
                <th>Completed</th>
                <th>Date</th>
            </tr>
        </thead>
        <tbody>
            {#if users}
                {#each users as user}
                    <tr>
                        <th>{user.username}</th>
                        <td>{user.current_step_index}</td>
                        <td>{user.completed ? '✅' : '❌'}</td>
                        <td>{FormatDate(user.created)}</td>
                    </tr>
                {/each}
            {/if}
        </tbody>
    </table>
</div>