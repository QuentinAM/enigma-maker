<script lang="ts">
    import { goto } from "$app/navigation";
    import Typewriter from 'svelte-typewriter';
</script>


<div class="min-h-screen bg-base-200 flex justify-center">
    <div class="mt-3 text-center">
        <h1 class="text-5xl font-bold">Enigma engine</h1>
        <p>by <a href="https://github.com/QuentinAM" target="_blank" class="link link-hover">QuentinAM</a></p>
        <p>New to Enigma engine? <a on:click|preventDefault={() => goto('/register')} class="link link-hover text-blue-500" href="/register">Create an account</a></p>
    </div>
</div>