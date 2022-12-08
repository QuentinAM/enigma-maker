<script lang="ts">
    import { LoginEmailPassword } from '$lib/utils/user';

    export let email: string;
    export let password: string;

    async function Login()
    {
        const res: any = await LoginEmailPassword(email, password);
        if (res.message)
        {
            alert(res.message);
        }
        else
        {
            alert("Login successful!");
        }
    }

</script>

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
                    <input bind:value={email} type="text" placeholder="..." class="input input-bordered" />
                </div>
                <div class="form-control">
                    <p class="label">
                        <span class="label-text">Password</span>
                    </p>
                    <input bind:value={password} type="password" placeholder="..." class="input input-bordered" />
                </div>
                <label class="label">
                    <a href="/recover" class="label-text-alt link link-hover">Forgot password?</a>
                  </label>
                <div class="form-control mt-6">
                    <button on:click={Login} class="btn btn-primary">Login</button>
                </div>
            </div>
        </div>
    </div>
</div>