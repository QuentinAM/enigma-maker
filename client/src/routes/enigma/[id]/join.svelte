<script lang="ts">
	import { goto } from "$app/navigation";
	import { user } from "$lib/utils/store";
	import { LoginToken } from "$lib/utils/user";
	import { onMount } from "svelte";
    import { page } from '$app/stores';
    import { GetEnigma, JoinEnigma } from "$lib/utils/enigma";

    const enigma_id: string = $page.params.id;

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

            const res: any = await GetEnigma(enigma_id)
        }
    });
</script>