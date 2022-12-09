<script lang="ts">
	import { goto } from "$app/navigation";
	import { user } from "$lib/utils/store";
	import { LoginToken } from "$lib/utils/user";
	import { onMount } from "svelte";

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

            // const res: any = await GetEnigma();
        }
    });
</script>