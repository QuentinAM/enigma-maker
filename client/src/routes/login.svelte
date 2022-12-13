<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
    import { LoginEmailPassword, LoginToken } from '$lib/utils/user';
	import { onMount } from 'svelte';

    const redirect = $page.url.searchParams.get('redirect');

    let email: string = '';
    let password: string = '';
    let error: string = '';

    async function Login(loginFunction: Promise<any>)
    {
        const res: any = await loginFunction;
        if (res.message)
        {
            error = res.message;
        }
        else
        {
            goto(redirect ?? '/dashboard');
        }
    }

    onMount(() =>
    {
        const token: string | null = localStorage.getItem('token');
        if (token)
        {
            Login(LoginToken(token));
        }
    });

</script>

<div class="min-h-screen bg-base-200 flex justify-center">
	<div class="flex flex-col items-center space-y-4 w-[95%] lg:w-2/3">
        <div class="hero min-h-screen bg-base-200">
            <div class="hero-content flex-col lg:flex-row-reverse">
                <div class="text-center lg:text-left">
                    <h1 class="text-5xl font-bold">Login now!</h1>
                    <p class="py-6">Provident cupiditate voluptatem et in. Quaerat fugiat ut assumenda excepturi exercitationem quasi. In deleniti eaque aut repudiandae et a id nisi.</p>
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
                        <p class="text-error text-sm font-semibold">{error}</p>
                        <div class="form-control mt-6">
                            <button on:click={() => Login(LoginEmailPassword(email, password))} class="btn btn-primary">Login</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>