<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { user } from '$lib/utils/store';
    import { Register } from '$lib/utils/user';
	import { onMount } from 'svelte';

    const redirect = $page.url.searchParams.get('redirect');

    let email: string = '';
    let username: string = '';
    let password: string = '';
    let password_confirmation: string = '';
    let error: string = '';

    async function RegisterForm()
    {
        const res: any = await Register(email, password, password_confirmation, username);
        if (res.message)
        {
            error = res.message;
        }
        else
        {
            goto(`/login${redirect ? `?redirect=${redirect}` : ''}`);
        }
    }

    function CheckEmailPasswordRegister()
    {
        if (username == '' || email == '' || password == '' || password_confirmation == '')
        {
            error = 'Please fill in all fields';
            return;
        }

        if (!email.match(/^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/))
        {
            error = 'Please enter a valid email';
            return;
        }

        if (password.length < 10)
        {
            error = 'Password must be at least 10 characters long';
            return;
        }

        if (password != password_confirmation)
        {
            error = 'Passwords do not match';
            return;
        }

        RegisterForm();
    }

    function handleKeydown(event: any)
    {
        if (event.key == 'Enter')
        {
            CheckEmailPasswordRegister();
        }
	}

    onMount(() =>
    {
        const token: string | null = localStorage.getItem('token');
        if (token)
        {

        }
    });

</script>

<svelte:window on:keydown={handleKeydown}/>
<div class="min-h-screen bg-base-200 flex justify-center">
	<div class="flex flex-col items-center space-y-4 w-[95%] lg:w-2/3">
        <div class="hero min-h-screen bg-base-200">
            <div class="hero-content flex-col lg:flex-row-reverse">
                <div class="text-center lg:text-left">
                    <h1 class="text-5xl font-bold">Register now!</h1>
                    <a href="/login" on:click|preventDefault={() => goto('/login')} class="link link-hover text-blue-500">Already have an account ? Login now !</a>
                </div>
                <div class="card flex-shrink-0 w-full max-w-sm shadow-2xl bg-base-100">
                    <div class="card-body">
                        <div class="form-control">
                            <p class="label">
                            <span class="label-text">Username</span>
                            </p>
                            <input on:change={() => error = ''} bind:value={username} type="text" placeholder="..." class="input input-bordered" />
                        </div>
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
                        <div class="form-control">
                            <p class="label">
                                <span class="label-text">Password confirmation</span>
                            </p>
                            <input on:change={() => error = ''} bind:value={password_confirmation} type="password" placeholder="..." class="input input-bordered" />
                        </div>
                        {#if error}
                            <p class="text-error text-sm font-semibold">{error}</p>
                        {/if}
                        <div class="form-control mt-6">
                            <button on:click={CheckEmailPasswordRegister} class="btn btn-primary">Register</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>