<script lang="ts">
	import { goto } from '$app/navigation';
	import LanguageSelector from './LanguageSelector.svelte';
</script>

<div class="navbar bg-base-100">
	<div class="navbar-start">
	  	<div class="dropdown">
			<label tabindex="0" class="btn btn-ghost lg:hidden">
				<input class='hidden'/>
				<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h8m-8 6h16" /></svg>
			</label>
			<ul tabindex="0" class="menu menu-compact dropdown-content mt-3 p-2 shadow bg-base-100 rounded-box w-52">
				<li><a href="/enigma" on:click|preventDefault={() => goto('/enigma')}>Enigma</a></li>
				<li><a href="/dashboard" on:click|preventDefault={() => goto('/dashboard')}>Dashboard</a></li>
			</ul>
	  	</div>
		<a class="btn btn-ghost normal-case text-xl" href="/">Enigma engine</a>
	</div>
	<div class="navbar-center hidden lg:flex">
		<ul class="menu menu-horizontal px-1">
			<li><a href="/enigma" on:click|preventDefault={() => goto('/enigma')}>Enigma</a></li>
			<li><a href="/dashboard" on:click|preventDefault={() => goto('/dashboard')}>Dashboard</a></li>
		</ul>
	</div>
	<div class="navbar-end">
		<div class="flex-none">
			<div class="divider divider-horizontal" />
			<LanguageSelector />
		</div>
	</div>
</div>