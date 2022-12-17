<script lang="ts">
	import { goto } from '$app/navigation';
	import LanguageSelector from './LanguageSelector.svelte';
</script>

<div class="navbar bg-base-100">
	<div class="flex-1">
		<a class="btn btn-ghost normal-case text-xl" href="/">Enigma maker</a>
		<ul class="menu menu-horizontal px-1">
			<li><a href="/enigma" on:click|preventDefault={() => goto('/enigma')}>Enigmas</a></li>
			<li><a href="/dashboard" on:click|preventDefault={() => goto('/dashboard')}>Dashboard</a></li>
		</ul>
	</div>
	<div class="flex-none">
		<a
			class="link link-hover"
			href="https://github.com/QuentinAM/"
			target="_blank">Github <i class="fa-brands fa-github" /></a
		>
		<div class="divider divider-horizontal" />
		<LanguageSelector />
	</div>
</div>
