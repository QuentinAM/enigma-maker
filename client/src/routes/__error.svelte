<script>
	import { goto } from '$app/navigation';
	import Translation from '$lib/components/Translation.svelte';
</script>

<div class="text-sm breadcrumbs">
	<ul>
		<li><a on:click|preventDefault={() => goto('/')} href="/"><Translation id="home" /></a></li>
		<li>404 not found</li>
	</ul>
</div>
