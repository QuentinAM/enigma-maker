<script lang="ts">
	import { language } from '$lib/utils/store';
	import data from '$lib/utils/translation.json';
	import { onMount } from 'svelte';

	export let id: string;
	const dataset: {
		[key: string]: {
			[key: string]: string;
		};
	} = data;

	let word: string;

	const changeWord = () => (word = dataset[$language] ? dataset[$language][id] : '');

	onMount(() => {
		language.subscribe(changeWord);
	});
</script>

{word}
