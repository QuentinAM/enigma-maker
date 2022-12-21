<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { user } from '$lib/utils/store';
    import { slide } from "svelte/transition";
    import { LoginEmailPassword, LoginToken } from '$lib/utils/user';
	import { onMount } from 'svelte';

    const redirect = $page.url.searchParams.get('redirect');
    const message = $page.url.searchParams.get('message');

    let email: string = '';
    let password: string = '';
    let error: string = message ?? '';

    async function Login(loginFunction: Promise<any>)
    {
        const res: any = await loginFunction;
        if (res.message)
        {
            if (res.message == 'jwt expired')
            {
                error = 'Your session has expired, please login again';
                localStorage.removeItem('token');
                if ($user)
                {
                    email = $user.email;
                }
            }
            else
            {
                error = res.message;
            }
        }
        else
        {
            goto(redirect ?? '/dashboard');
        }
    }

    function CheckEmailPasswordLogin()
    {
        if (email == '' || password == '')
        {
            error = 'Please fill in all fields';
            return;
        }

        Login(LoginEmailPassword(email, password));
    }

    function handleKeydown(event: any)
    {
        if (event.key == 'Enter')
        {
            CheckEmailPasswordLogin();
        }
	}

    onMount(() =>
    {
        const token: string | null = localStorage.getItem('token');
        if (token && !message)
        {
            Login(LoginToken(token));
        }
        
        if (message == 'jwt expired')
        {
            error = 'Your session has expired, please login again';
            localStorage.removeItem('token');
            if ($user)
            {
                email = $user.email;
            }
        }
    });

</script>

<svelte:window on:keydown={handleKeydown}/>
<div class="min-h-screen bg-base-200 flex justify-center">
	<div class="flex flex-col items-center space-y-4 w-[95%] lg:w-2/3">
        <div class="hero min-h-screen bg-base-200">
            <div class="hero-content flex-col lg:flex-row-reverse">
                <div class="text-center lg:text-left">
                    <h1 class="text-5xl font-bold">Login now!</h1>
                    <a href="/register" on:click|preventDefault={() => goto(`/register${redirect ? `?redirect=${redirect}` : ''}`)} class="link link-hover text-blue-500">No account? Register now !</a>
                </div>
                <div class="card flex-shrink-0 w-full max-w-sm shadow-2xl bg-base-100">
                    <div class="card-body">
                        <div class="form-control">
                            <p class="label">
                            <span class="label-text">Email</span>
                            </p>
                            <input on:change={() => error = ''} bind:value={email} type="text" placeholder="..." class="input input-bordered" />
                        </div>
                        <div class="form-control">
                            <p class="label">
                                <span class="label-text">Password</span>
                            </p>
                            <input on:change={() => error = ''} bind:value={password} type="password" placeholder="..." class="input input-bordered" />
                        </div>
                        <label class="label">
                            <input class="hidden"/>
                            <a href="/recover" class="label-text-alt link link-hover">Forgot password?</a>
                        </label>
                        {#if error}
                            <p class="text-error text-sm font-semibold" transition:slide>{error}</p>
                        {/if}
                        <div class="form-control mt-6">
                            <button on:click={CheckEmailPasswordLogin} class="btn btn-primary">Login</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>