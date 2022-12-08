<script lang="ts">
	import { goto } from '$app/navigation';
	import Translation from './Translation.svelte';
	import Spinner from '$lib/assets/spinner.png';

	export let name: string;
	export let pictureUrl: string;
	export let season: string;
	export let slug: string;
	export let cardsMintedCount: string = '';
	export let cardsOnSaleCount: string = '';
	export let lowestAsk: string = '';
	export let averageSale: string = '';
	export let maxSupply: string = '';

	const isCommon: boolean = slug.includes('common');
</script>

<div class="card card-side bg-base-100 shadow-xl w-full overflow-x-hidden">
	<a href={`/${slug}/search`} target="_blank"><figure><img src={pictureUrl} loading="lazy" class="lg:w-52 md:w-40 md:h-full w-[10rem]" alt="Movie" /></figure></a>
	<div class="card-body lg:p-4 p-2 relative">
		<h2 class="card-title">
			{name}
			{#if slug.includes("halloween")}
				<div class="badge text-black bg-orange-400 badge-primary">Halloween</div>
			{:else if isCommon}
				<div class="badge badge-primary"><Translation id="common" /></div>
			{:else}
				<div class="badge bg-slate-400 text-black"><Translation id="platinum" /></div>
			{/if}
		</h2>
		<div class="lg:text-lg md:text-md text-xs">
			Saison {season}
			{#if cardsMintedCount}
				{#if slug.includes("halloween")}
					<p>{cardsMintedCount}<span class="text-slate-500">/2175</span> <Translation id="already_obtained" />!</p>
				{:else}
					<p>{cardsMintedCount}<span class="text-slate-500">/{maxSupply}</span> <Translation id="already_obtained" />!</p>
				{/if}
			{:else}
				<img src={Spinner} class="animate-spin h-8 mt-1" alt="Loading..." />
			{/if}

			<div class="bg-base-200 rounded p-3 mt-2">
				<h1 class="font-semibold"><Translation id="market" /> <i class="fa-solid fa-money-bill-trend-up"></i></h1>
				<div><Translation id="on_sale" />: <span class=" font-semibold">{cardsOnSaleCount}</span></div>
				<div><Translation id="lowest_ask" />: <span class=" font-semibold">{lowestAsk} ETH </span></div>
				<div><Translation id="average_sale" />: <span class=" font-semibold">{averageSale} ETH </span></div>
			</div>
			<button class="btn btn-primary absolute bottom-3 right-3" on:click={() => goto(`/${slug}/search`)}><Translation id="view" /></button>
		</div>
	</div>
</div>
